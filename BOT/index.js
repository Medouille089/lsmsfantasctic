const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();
const express = require('express');
const cors = require('cors');


const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const rest = new REST({ version: '10' }).setToken(token);

const app = express();
app.use(cors());

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
});

// Import des commandes et des permissions [JSON]
const { permissions, commands } = require('./commands.json');

// Script du terminal
const { startTerminal } = require('./scripts/terminal.js');
startTerminal(client, clientId, guildId, token, commands, permissions);

// Création des commandes à partir de 'commands.json'
const commandObjects = commands.map(command => 
    new SlashCommandBuilder()
        .setName(command.name)
        .setDescription(command.description)
);

(async () => {
    try {
        console.log('📤 Enregistrement des commandes...');

        // Enregistre les commandes pour une guilde spécifique
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commandObjects.map(command => command.toJSON()) } 
        );

        console.log('✅ Commandes enregistrées.');
    } catch (error) {
        console.error('❌ Erreur en enregistrant les commandes :', error);
    }
})();

// Script des fonctions
const setupFunctions = require('./scripts/functions.js');
setupFunctions(client);

// Script de la Fiche presence
const setupFichepresence = require('./scripts/fichepresence.js');
setupFichepresence(client);

// Script de l'Api
// const setupApi = require('./scripts/api.js');
// setupApi(client);

process.on("unhandledRejection", (reason, promise) => {
    console.error("💥 Unhandled Rejection:", reason);
});

client.login(token);
process.stdin.resume();
