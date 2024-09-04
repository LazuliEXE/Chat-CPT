const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, Client, ClientApplication, PermissionFlagsBits} = require('discord.js');
const appTools = require('../appTools.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('supprime un nombre définit de message')
        .addIntegerOption(option => option.setName('quantité').setDescription('quantité de messages à supprimer').setRequired(true).setMaxValue(100))
        .addBooleanOption(option => option.setName('visible').setDescription('rendre la suppression visible par les utilisateurs').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        const quantity = interaction.options.getInteger('quantité')
        const visible = interaction.options.getBoolean('visible') || false;
        await interaction.channel.bulkDelete(quantity)
            .then(deleted => {
                interaction.reply({embeds: [CreateEmbed(`${deleted.size} messages ont été supprimés`,interaction)],ephemeral:!visible})
                })
            .catch(error =>{
                logger = new appTools.Logger
                logger.error(error)
                interaction.reply({embeds: [CreateEmbed(''+error,interaction)],ephemeral:true,})
            })
    },
};

function CreateEmbed(desc,interaction){
    const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Purge')
        .setDescription(desc)
        .setTimestamp()
        .setFooter({ text: 'Purge command',iconURL:interaction.client.user.displayAvatarURL()    });
    return embed;
}