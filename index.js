const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const appTools = require('./appTools.js')
require('dotenv').config();

//refresh the list of commands


//appTools.DeleteAllCommands()
//appTools.DeployCommands()
appTools.DeployServerCommands()

const logger = appTools.CreateLogger()


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    client.commands.set(command.data.name, command);
}

client.once('ready', () => {
    logger.info(`Logged in as ${client.user.tag}!`);
    appTools.loadRoleReactInteraction(client)
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        const date = Date.now();
        logger.info(`interaction started, User: ${interaction.user.tag} (${interaction.commandName})`);
        await command.execute(interaction);
        logger.info(`interaction ended, User: ${interaction.user.tag} (${interaction.commandName}), took ${Date.now() - date}ms`);
    } catch (error) {
        logger.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

//Gestion des erreurs
client.on('error', (error) => {
    logger.error('Une erreur s\'est produite :', error);
    console.log(error);
});

// Gestion des erreurs de promesse non gérée
process.on('unhandledRejection', error => {
    logger.error('Rejet de promesse non géré :', error);
    console.log(error);
    
});

client.login(process.env.DISCORD_TOKEN);
