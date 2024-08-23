const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, Client, ClientApplication } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        const date = Date.now();
        await interaction.reply({ content: '', embeds: [CreateEmbed(' ',interaction)],ephemeral:true});
        const lattency = (Date.now() - date)/2;
        await interaction.editReply({ content: '', embeds: [CreateEmbed(`La lattence est de **${lattency}** ms`,interaction)] });
        console.log()
    },
};

function CreateEmbed(desc,interaction){
    const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Pong!')
            .setDescription(desc)
            .setTimestamp()
            .setFooter({ text: 'Ping command',iconURL:interaction.client.user.displayAvatarURL()});
    return embed;
}