const { SlashCommandBuilder } = require('@discordjs/builders');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stops playing music and leaves the voice channel'),
    async execute(interaction) {
        const connection = getVoiceConnection(interaction.guild.id);
        if (!connection) {
            return interaction.reply({ content: 'No song is currently playing.', ephemeral: true });
        }

        connection.destroy();
        interaction.reply({ content: 'Stopped the music and left the voice channel.' });
    },
};
