const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const winston = require('winston');
require('dotenv').config();


function DeleteAllCommands(){
    const { CLIENT_ID, GUILD_ID, DISCORD_TOKEN } = process.env;
    const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
    rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: [] })
        .then(() => console.log('Successfully deleted all guild commands.'))
        .catch(console.error);

// for global commands
    rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] })
        .then(() => console.log('Successfully deleted all application commands.'))
        .catch(console.error);
}


function DeployServerCommands(){

    const { CLIENT_ID, GUILD_ID, DISCORD_TOKEN } = process.env;

    const logger = CreateLogger();
    const commands = [];
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    function loadCommands(dir) {
        const files = fs.readdirSync(dir);

        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stats = fs.lstatSync(fullPath);

            if (stats.isDirectory()) {
                loadCommands(fullPath);
            } else if (file.endsWith('.js')) {
                logger.info(`Reading command data: ${file}`);
                const command = require(fullPath);
                commands.push(command.data.toJSON());
            }
        }
    }

    loadCommands(commandsPath);

    const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

    (async () => {
        try {
            logger.info('Started refreshing application (/) commands.');

            await rest.put(
                Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
                { body: commands },
            );

            logger.info('Successfully reloaded application (/) commands.');
        } catch (error) {
            logger.error(error);
        }
    })();

}

function DeployCommands(){

    const { CLIENT_ID, DISCORD_TOKEN } = process.env;

    const logger = CreateLogger();
    const commands = [];
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    function loadCommands(dir) {
        const files = fs.readdirSync(dir);

        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stats = fs.lstatSync(fullPath);

            if (stats.isDirectory()) {
                loadCommands(fullPath);
            } else if (file.endsWith('.js')) {
                logger.info(`Reading command data: ${file}`);
                const command = require(fullPath);
                commands.push(command.data.toJSON());
            }
        }
    }

    loadCommands(commandsPath);

    const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

    (async () => {
        try {
            logger.info('Started refreshing application (/) commands.');

            await rest.put(
                Routes.applicationCommands(CLIENT_ID),
                { body: commands },
            );

            logger.info('Successfully reloaded application (/) commands.');
        } catch (error) {
            logger.error(error);
        }
    })();

}


function CreateLogger(){

    const logger = winston.createLogger({
        level: 'info',
        format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
        ),
        transports: [
            new winston.transports.File({ filename: 'logs/combined.log', level: 'info' }),
                      
            new winston.transports.File({ filename: 'logs/errors.log', level: 'error' }),
    
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple(),
                    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)

                )
            })
        ]
    });
    return logger;
}

module.exports = { DeployCommands ,CreateLogger ,DeployServerCommands ,DeleteAllCommands };
