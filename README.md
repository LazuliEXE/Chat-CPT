# Chat CPT

Ce projet est un bot Discord développé en JavaScript utilisant la bibliothèque [discord.js](https://discord.js.org/). Le bot inclut des fonctionnalités de base telles qu'une commande ping, un système de gestion des erreurs pour capturer et gérer les exceptions, et autre.

## Fonctionnalités

- **Commande `/ping`** : Répond avec la lattence du bot
- **Commande `/dice`** : Permet de faire rouler un dé de taille défini
- **Commande `/purge`** : Permet de purger un salon
- **Commande `/userInfo`** : Répond avec les informations d'un utilisateur

## Prérequis

- [Node.js version 16.11.0 ou supérieure](https://nodejs.org/fr)
- Un compte Discord et un serveur où le bot peut être ajouté
- Un token Discord pour votre bot

## Installation

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/LazuliEXE/Chat-CPT.git
   cd Chat-CPT
   ```
2. Créez et configurez une nouvelle application sur [le portail développeur de discord](https://discord.com/developers/applications)

3. Créez un fichier .env dans la racine du projet et mettez y le code suivant et remplacez les informations par les vôtres
```env
DISCORD_TOKEN=TOKEN_BOT
CLIENT_ID=CLIENT_ID_BOT
GUILD_ID=TEST_SERVER_ID_BOT
```


## Utilisation

1. Lancez le bot :
   ```bash
   node index.js
   ```
## Modifications
1. Ajouter une commande:
   Créez un fichier dans le répertoire commands et ajoutez-y le code suivant :
   
   ```js
   const { SlashCommandBuilder } = require('@discordjs/builders');
   const { EmbedBuilder, Client, ClientApplication } = require('discord.js');

   module.exports = {
       data: new SlashCommandBuilder()
           .setName('NOM DE LA COMMANDE')
           .setDescription('DESCRIPTION DE LA COMMANDE'),
       async execute(interaction) {
       //Logique de la commande
       },
   };
   ```
Pour plus d'informations rendez-vous sur [la documentation de discord.js](https://discordjs.guide/creating-your-bot/command-handling.html#executing-commands)

## Contribuer
Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request si vous avez des idées d'améliorations ou de nouvelles fonctionnalités.

## License
Ce projet est sous licence MIT. Voir le fichier [LICENSE](https://github.com/LazuliEXE/Chat-CPT/blob/main/LICENSE.md) pour plus d'informations.
