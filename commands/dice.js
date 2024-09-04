const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, Client, ClientApplication, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
const appTools = require("../appTools");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dice')
        .setDescription('fait rouler un dé')
        .addIntegerOption(option => option.setName('valeur').setDescription('nombre de faces').setMinValue(1).setRequired(false)),

    async execute(interaction) {
        const value = interaction.options.getInteger('valeur') || 6;

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('reroll')
                    .setLabel('relancer le dé')
                    .setStyle(ButtonStyle.Primary),
            )

        await interaction.reply({ content: '', embeds: [CreateEmbed(interaction,value)], components: [row] });
        const filter = i => i.customId === 'reroll';
        const collector = interaction.channel.createMessageComponentCollector({filter});
        collector.on('collect', async i => {
            const date = Date.now()
            const logger = new appTools.Logger()
            logger.info(`Interaction started\n  -User: ${interaction.user.tag} (${interaction.commandName})[${i.customId}]`);
            await interaction.editReply({ content: '', embeds: [CreateEmbed(interaction,value)], components: [row] });
            await i.deferUpdate();
            logger.info(`interaction ended\n  -User: ${interaction.user.tag} (${interaction.commandName})[${i.customId}], took ${Date.now() - date}ms`);
        })
    },
};

function CreateEmbed(interaction,value){
    embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(`le dé roule et tombe sur ${Math.floor(Math.random() * value)+1}`)
        .setTimestamp()
        .setFooter({ text: 'dice command',iconURL:interaction.client.user.displayAvatarURL()});
    return embed;
}