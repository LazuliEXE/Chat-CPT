# Chat CPT

Ce projet est un bot Discord développé en JavaScript utilisant la bibliothèque [discord.js](https://discord.js.org/). Le bot inclut des fonctionnalités de base telles qu'une commande ping, un système de gestion des erreurs pour capturer et gérer les exceptions, et autre.

## Fonctionnalités

- **Commande `/ping`** : Répond avec "Pong!" pour vérifier si le bot est en ligne.
- **Gestion des erreurs** : Capture les erreurs dans les commandes et les promesses non gérées, envoie des notifications d'erreur dans un canal Discord spécifié.
- **Commande `!trigger-error`** : Déclenche intentionnellement une erreur pour tester le système de gestion des erreurs.

## Prérequis

- [Node.js version 16.6.0 ou supérieure](https://nodejs.org/fr)
- Un compte Discord et un serveur où le bot peut être ajouté
- Un token Discord pour votre bot

## Installation

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/LazuliEXE/Chat-CPT.git
   cd Chat-CPT
   ```
2. Créez et configurez une nouvelle application sur [le portail développeur de discord](https://discord.com/developers/applications)

3. Remplaçer les informations présente dans le fichier .env avec les vôtres

## Utilisation

1. Lancez le bot :
   ```bash
   node index.js
   ```

## Contribuer
Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request si vous avez des idées d'améliorations ou de nouvelles fonctionnalités.

## License
Ce projet est sous licence MIT. Voir le fichier [LICENSE](https://github.com/LazuliEXE/Chat-CPT/blob/main/LICENSE.md) pour plus d'informations.
