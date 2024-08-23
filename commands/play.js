const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const { YTSearcher } = require('ytsearcher');
const sodium = require('libsodium-wrappers');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const he = require('he');
const appTools = require("../appTools");

require('dotenv').config();

const queue = new Map();
module.exports.queue = queue;

const searcher = new YTSearcher({
    key: process.env.YOUTUBE_API_KEY,
    revealKey: true
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays a song from YouTube')
        .addStringOption(option => option.setName('song').setDescription('Le nom de la musique / URL').setRequired(true)),
    async execute(interaction) {
        await sodium.ready;
        const song = interaction.options.getString('song');
        let result = await searcher.search(song, { type: "video" });
        const url = result.first.url;

        if (!ytdl.validateURL(url)) {
            return interaction.reply({ content: 'Veuillez fournir une URL YouTube valide.', ephemeral: true });
        }

        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply({ content: 'Vous devez être dans un canal vocal pour jouer de la musique!', ephemeral: true });
        }

        const serverQueue = queue.get(interaction.guild.id);
        const songInfo = {
            title: he.decode(result.first.title),
            thumbnail: result.first.thumbnails['high'].url,
            url: url,
            timeStamp: result.first.timeStamp,
        };

        if (!serverQueue) {
            const queueConstruct = {
                voiceChannel: voiceChannel,
                connection: null,
                songs: [],
                player: createAudioPlayer(),
                interaction: interaction,
                buttons: null,
                loop: false
            };

            queue.set(interaction.guild.id, queueConstruct);
            queueConstruct.songs.push(songInfo);

            try {
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('prev')
                            .setLabel('⏮')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId('stop')
                            .setLabel('⏹')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('play_pause')
                            .setLabel('⏯')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('loop')
                            .setLabel('🔁')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('next')
                            .setLabel('⏭')
                            .setStyle(ButtonStyle.Secondary)
                    );

                const connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: interaction.guild.id,
                    adapterCreator: interaction.guild.voiceAdapterCreator,
                });
                queueConstruct.buttons = row;
                queueConstruct.connection = connection;
                await interaction.reply(`Started playing: **${songInfo.title}**`);
                await this.play(interaction.guild, queueConstruct.songs[0]);
                const collector = interaction.channel.createMessageComponentCollector();
                collector.on('collect', async i => {
                    const logger = appTools.CreateLogger();
                    logger.info(`Interaction started\n  -User: ${interaction.user.tag} (${interaction.commandName})[${i.customId}]`);

                    switch (i.customId) {
                        case 'prev':
                            await this.prev(interaction.guild);
                            break;
                        case 'stop':
                            await this.stop(interaction.guild);
                            break;
                        case 'play_pause':
                            await this.playPause(interaction.guild);
                            break;
                        case 'loop':
                            await this.loop(interaction.guild);
                            break;
                        case 'next':
                            await this.next(interaction.guild);
                            break;
                    }
                    logger.info(`interaction ended\n  -User: ${interaction.user.tag} (${interaction.commandName})[${i.customId}], took ${Date.now() - date}ms`);
                    await i.deferUpdate();
                });
            } catch (err) {
                console.log(err);
                queue.delete(interaction.guild.id);
                return interaction.reply({ content: 'There was an error connecting to the voice channel!', ephemeral: true });
            }
        } else {
            serverQueue.songs.push(songInfo);
            await this.updateEmbed(interaction.guild)
            await interaction.reply({ content: ` **${songInfo.title}** à été ajouter a la queue`, ephemeral: true });
        }
    },
    async play(guild, song) {
        const serverQueue = queue.get(guild.id);

        if (!song) {
            await this.stop(guild)
            return;
        }

        const cache = 1024 * 1024 * 300;
        const stream = ytdl(song.url, {
            filter: 'audioonly',
            quality: 'highestaudio',
            highWaterMark: cache,
        });
        const resource = createAudioResource(stream);
        serverQueue.player.play(resource);
        serverQueue.connection.subscribe(serverQueue.player);
        await this.updateEmbed(guild)

        serverQueue.player.on(AudioPlayerStatus.Idle, () => {
            if (!serverQueue.loop) {
                serverQueue.songs.shift();
            }
            this.play(guild, serverQueue.songs[0]);
        });

        serverQueue.player.on('error', error => {
            console.error(error);
            serverQueue.songs.shift();
            this.play(guild, serverQueue.songs[0]);
        });
    },
    async prev(guild) {
        const serverQueue = queue.get(guild.id);
        if (serverQueue && serverQueue.songs.length > 1) {
            serverQueue.songs.unshift(serverQueue.songs.pop());
            await this.play(guild, serverQueue.songs[0]);
        }
    },
    async stop(guild) {
        const serverQueue = queue.get(guild.id);
        if (serverQueue) {
            serverQueue.player.stop();
            serverQueue.connection.destroy();
            await serverQueue.interaction.deleteReply();
            queue.delete(guild.id);
        }
    },
    async playPause(guild) {
        const serverQueue = queue.get(guild.id);
        if (serverQueue && serverQueue.player) {
            if (serverQueue.player.state.status === AudioPlayerStatus.Playing) {
                serverQueue.player.pause();
                serverQueue.buttons['components'][2] = new ButtonBuilder()
                    .setCustomId('play_pause')
                    .setLabel('⏯')
                    .setStyle(ButtonStyle.Primary)
            } else if (serverQueue.player.state.status === AudioPlayerStatus.Paused) {
                serverQueue.player.unpause();
                serverQueue.buttons['components'][2] = new ButtonBuilder()
                    .setCustomId('play_pause')
                    .setLabel('⏯')
                    .setStyle(ButtonStyle.Secondary)
            }
            await this.updateEmbed(guild)
        }
    },
    async loop(guild) {
        const serverQueue = queue.get(guild.id);
        if (serverQueue) {
            serverQueue.loop = !serverQueue.loop;
            serverQueue.buttons['components'][3] = serverQueue.loop ? new ButtonBuilder()
                .setCustomId('loop')
                .setLabel('🔁')
                .setStyle(ButtonStyle.Primary)
                :new ButtonBuilder()
                    .setCustomId('loop')
                    .setLabel('🔁')
                    .setStyle(ButtonStyle.Secondary)
            await this.updateEmbed(guild)
        }
    },
    async next(guild) {
        const serverQueue = queue.get(guild.id);
        if (serverQueue) {
            serverQueue.songs.shift();
            await this.play(guild, serverQueue.songs[0]);
        }
    },
    async updateEmbed(guild){
        const serverQueue = queue.get(guild.id);
        const embed = new EmbedBuilder()
            .setColor(0x0000ff)
            .setTitle('Informations de lecture')
            .setDescription(`song actuel : [${serverQueue.songs[0].title}](${serverQueue.songs[0].url})`)
            .addFields({
                name: 'A suivre:',
                value: serverQueue.songs[1] ? serverQueue.songs.slice(1).map(song => song.title).join('\n') : 'Aucun song en file d\'attentes'
            })
            .setThumbnail(serverQueue.songs[0].thumbnail)
            .setTimestamp();

        await serverQueue.interaction.editReply({content:'', embeds: [embed], components: [serverQueue.buttons] });
    }
};
