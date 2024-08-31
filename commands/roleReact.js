const { SlashCommandBuilder, RoleSelectMenuBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('@discordjs/builders');
const { EmbedBuilder, Client, ClientApplication, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rolereact')
        .setDescription('Permet aux utilisateurs de choisir un rôle.')
        .addChannelOption(option => option.setName('channel').setDescription('permet de choisir le channel dans lequel le méssage du role react est envoyé').setRequired(true))
        .addBooleanOption(option => option.setName('multiple').setDescription('Permet de choisir si l\'utilisateur peut choisir plusieurs rôles').setRequired(false)),
    async execute(interaction) {

        const channel = interaction.options.getChannel('channel')
        const multiple = interaction.options.getBoolean('multiple') || false;
        let publicMessage = null

        embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(`Sélectionnez les rôles a afficher dans le role react`)
        .setDescription('Vous avez une minute pour sélectionner les rôles a afficher')
        .setTimestamp()
        .setFooter({ text: 'rôle react',iconURL:interaction.client.user.displayAvatarURL()});

        const row = new ActionRowBuilder()
            .addComponents(
                new RoleSelectMenuBuilder()
                    .setCustomId('roles')
                    .setPlaceholder('Sélectionnez des options')
                    .setMinValues(2)
                    .setMaxValues(10),
            )
        
        const message = await interaction.reply({ content: '', embeds: [embed], components: [row]})

        // Supprimer le message après 60 secondes
        //setTimeout(async () => {
        //    try {
        //        await message.delete();
        //    } catch (error) {
        //        logger.error(error)
        //    }
        //}, 60000); // 60000 ms = 1 minute

        const filter = i => i.customId === 'roles' && i.member.id === interaction.member.id;
        const roleCollector = interaction.channel.createMessageComponentCollector({filter});
        roleCollector.on('collect', async i => {
            const roles = i.values
            let replyRow
            let count = 0
            if(multiple){
                embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(`Sélectionnez des rôles`)
                    .setDescription('Vous pouvez sélectionner plusieurs rôles')
                    .setTimestamp()
                    .setFooter({ text: 'Sélection de rôle',iconURL:interaction.client.user.displayAvatarURL()});
                replyRow = new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('rôles')
                            .setPlaceholder('Sélectionnez un rôle')
                            .addOptions(
                                i.values.map(value => {
                                    const role = interaction.guild.roles.cache.get(value);
                                    count++
                                    return new StringSelectMenuOptionBuilder()
                                        .setLabel(role.name)
                                        .setValue(role.id);
                                })
                            )
                            .setMinValues(0)
                            .setMaxValues(count),
                )  
            }else{
                embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(`Sélectionnez un rôle`)
                    .setDescription('Vous pouvez sélectionner un seul rôle')
                    .setTimestamp()
                    .setFooter({ text: 'Sélection de rôle',iconURL:interaction.client.user.displayAvatarURL()}); 
                replyRow = new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('rôles')
                            .setPlaceholder('Sélectionnez un rôle')
                            .addOptions(
                                i.values.map(value => {
                                    const role = interaction.guild.roles.cache.get(value);
                                    return new StringSelectMenuOptionBuilder()
                                        .setLabel(role.name)
                                        .setValue(role.id);
                                })
                            )
                )   
            }


            if(publicMessage){
                publicMessage.edit({ content: '', embeds: [embed],components:[replyRow]})
                    .catch( error => {
                        publicMessage = channel.send({ content: '', embeds: [embed],components:[replyRow]})
                        console.error
                    }
                    )
            }else{
                publicMessage = await channel.send({ content: '', embeds: [embed],components:[replyRow]})
            }
            await i.deferUpdate()

            const filter = i => i.customId === 'rôles';
            const roleCollector = channel.createMessageComponentCollector({filter});
            roleCollector.on('collect', async i => {
                i.deferUpdate()

                for (const roleId of roles){
                    const role = interaction.guild.roles.cache.get(roleId);
                    
                    if(!role){
                        console.error('pas de role');
                        continue;
                    }
                    if(i.values.includes(role.id)){
                        if (!i.member.roles.cache.has(role.id)) {
                            await i.member.roles.add(role);
                        }
                    }else{
                        if (i.member.roles.cache.has(role.id)) {
                            await i.member.roles.remove(role);
                        }
                    }
                }
            })
        });
    },
};
