const { Client, GatewayIntentBits, Events, ActivityType, REST, Routes, EmbedBuilder  } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

require('dotenv').config();  // Charger les variables d'environnement depuis le fichier .env

const token = process.env.TOKEN;  // Token
const clientId = process.env.CLIENT_ID;  // Client ID
const guildId = process.env.GUILD_ID;  // Server ID

// Activité du bot
client.once('ready', () => {
    try {
        console.log(`\n🔵 Connecté en tant que ${client.user.tag}`);

        // Définir la présence du bot avec l'activité et le statut
        client.user.setPresence({
            status: 'idle', // Peut être 'online', 'idle' (Inactif), 'dnd' (Do Not Disturb), 'invisible'
            activities: [{
                name: "Surveiller L ' A B Y S S",
                type: ActivityType.Playing,  // Type d'activité (Playing, Watching, Listening, Streaming)
            }]
        });

        console.log("🟣 Activité et statut définis avec succès !\n");
        function moulinSlash() {
            const symbols = ['/', '-', '\\', '|'];  // Les symboles qui tournent
            let index = 0; // L'index pour suivre la position du symbole
            setInterval(() => {
              process.stdout.write(`\r🟢 Bot actif ${symbols[index]}`);  // Affiche le symbole à la même position
              index = (index + 1) % symbols.length;  // Passe au symbole suivant (cycle)
            }, 250);  // Change de symbole toutes les 250 ms (ajuster la vitesse)
          }
          
          // Appel de la fonction
          moulinSlash();
    } catch (error) {
        console.error("Erreur lors de la définition de la présence, de l'activité ou du statut :", error);
    }
});

// Import des commandes et des permissions [JSON]
const { permissions, commands } = require('./commands.json');

// Script du terminal
const { startTerminal } = require('./scripts/terminal.js');
startTerminal(clientId, guildId, token, commands, permissions);

// Script de l'Anti-spam
const setupAntiSpam = require('./scripts/antispam.js');
setupAntiSpam(client);

// Scripts de Modération
const setupModeration = require('./scripts/moderation.js');
setupModeration(client);

// Scripts des Jeux
const setupGames = require('./scripts/games.js');
setupGames(client);

// Scripts de Fonctionnalités
const setupFunctions = require('./scripts/functions.js');
setupFunctions(client);

client.login(token);
process.stdin.resume();
