const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
require('dotenv').config();

class Colors {
    static Reset = "\x1b[0m"
    static Bright = "\x1b[1m"
    static Dim = "\x1b[2m"
    static Underscore = "\x1b[4m"
    static Blink = "\x1b[5m"
    static Reverse = "\x1b[7m"
    static Hidden = "\x1b[8m"
    
    static FgBlack = "\x1b[30m"
    static FgRed = "\x1b[31m"
    static FgGreen = "\x1b[32m"
    static FgYellow = "\x1b[33m"
    static FgBlue = "\x1b[34m"
    static FgMagenta = "\x1b[35m"
    static FgCyan = "\x1b[36m"
    static FgWhite = "\x1b[37m"
    static FgGray = "\x1b[90m"
    
    static BgBlack = "\x1b[40m"
    static BgRed = "\x1b[41m"
    static BgGreen = "\x1b[42m"
    static BgYellow = "\x1b[43m"
    static BgBlue = "\x1b[44m"
    static BgMagenta = "\x1b[45m"
    static BgCyan = "\x1b[46m"
    static BgWhite = "\x1b[47m"
    static BgGray = "\x1b[100m"
}

class Logger {
    constructor(){
        this.levels = {
            info: {
                value: 'info',
                color: Colors.FgGreen,
                path: null
            },
            warn:  {
                value: 'warning',
                color: Colors.FgYellow,
                path: './logs/warn.log'
            },
            error: {
                value: 'error',
                color: Colors.FgRed,
                path: './logs/error.log'
            },
        };
    };

    SaveToLogFolder(path,data){
        let readData = [];

        if (fs.existsSync(path)) {
            const fileData = fs.readFileSync(path);
            readData = JSON.parse(fileData);
        }

        readData.push(data);

        fs.writeFileSync(path, JSON.stringify(readData, null, 2));
    }

    log(level,message,data = {}){
        const timestamp = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
        const logMessage = {
            timestamp,
            level: this.levels[level].value,
            message,
            data
        }
        console.log(timestamp,this.levels[level].color,this.levels[level].value,Colors.Reset,message + JSON.stringify(data))

        const path = this.levels[level].path;

        if(path){
            this.SaveToLogFolder(path,logMessage);
        }
        this.SaveToLogFolder("./logs/combined.log",logMessage);
    }

    info(message,data = {}){
        this.log("info",message,data);
    }
    warn(message,data = {}){
        this.log("warn",message,data);
    }
    error(message,data = {}){
        this.log("error",message,data);
    }
    
}

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

    const logger = new Logger();
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
                logger.info(`Reading command data,`,{path:fullPath});
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
    const logger = new Logger
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
                logger.info(`Reading command data,`,{path:fullPath});
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

function SaveInteraction(path,dataToSave){
    let data = [];

    if (fs.existsSync(path)) {
        const fileData = fs.readFileSync(path);
        data = JSON.parse(fileData);
    }

    data.push(dataToSave);

    fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

async function loadRoleReactInteraction(client){
    if (fs.existsSync('data/roleReact.json')) {
        const fileData = fs.readFileSync('data/roleReact.json');
        data =  JSON.parse(fileData);
    }else{
        return
    }
    for (const roleReaction of data) {

        const channel = await client.channels.fetch(roleReaction.channelId);

        const filter = i => i.customId === roleReaction.customId;
        const roleCollector = channel.createMessageComponentCollector({filter});

        roleCollector.on('collect', async i => {

            i.deferUpdate()
            for (const roleId of roleReaction.roles){
                const role = channel.guild.roles.cache.get(roleId);
                
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
    }

}

module.exports = { DeployCommands ,DeployServerCommands ,DeleteAllCommands,SaveInteraction,loadRoleReactInteraction,Logger };
