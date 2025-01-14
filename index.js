const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
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
            status: 'online',
            activities: [{
                name: "Fiche de présence",
                type: ActivityType.Playing,
            }]
        });

        console.log("🟣 Activité et statut définis avec succès !\n");

        function moulinSlash() {
            const symbols = ['/', '-', '\\', '|'];  // Les symboles qui tournent
            let index = 0; 
            setInterval(() => {
                process.stdout.write(`\r🟢 Bot actif ${symbols[index]}`);
                index = (index + 1) % symbols.length;
            }, 250);
        }

        moulinSlash();
    } catch (error) {
        console.error("Erreur lors de la définition de la présence, de l'activité ou du statut :", error);
    }
});

const schedule = require('node-schedule'); 

client.once('ready', () => {
    const channelId = '1316031773221720108';
    const roleId = '1060338846996385905'; 

    try {
        schedule.scheduleJob('30 13 * * *', async () => {
            const channel = await client.channels.fetch(channelId);
            const currentDate = new Date().toLocaleDateString('fr-FR');
            const messageContent = `**FICHE DE PRESENCE:** ${currentDate}\n\nMerci de bien vouloir indiquer votre disponibilité pour ce soir en cochant ci-dessous : <@&1328663721467449376>\n\n✅ Disponible en début de soirée (avant 23h00)\n☑️ Disponible en fin de soirée (23h00 et plus)\n❌ Absent\n⌛ Ne sait pas encore\n\nMerci\nPS: Vous pouvez cocher ✅ et ☑️ si vous êtes disponible toute la soirée`;

            if (channel && channel.isTextBased()) {
                // Récupérer le dernier message envoyé par le bot
                const lastMessage = (await channel.messages.fetch({ limit: 1 })).first();

                if (lastMessage && lastMessage.author.id === client.user.id) {
                    // Si le dernier message du bot contient "FICHE DE PRESENCE", on le modifie
                    if (lastMessage.content.includes("FICHE DE PRESENCE")) {
                        // Extraire la date du dernier message pour ne pas la répéter
                        const lastMessageDate = lastMessage.content.match(/FICHE DE PRESENCE:\s*(\d{2}\/\d{2}\/\d{4})/);
                        const lastMessageModified = `**FICHE DE PRESENCE:** ${lastMessageDate ? lastMessageDate[1] : currentDate}`; // Utilisation de la date existante si disponible

                        // Modifier l'ancien message (supprimer la description)
                        await lastMessage.edit(lastMessageModified);

                        // Envoyer un nouveau message avec la nouvelle date et la description
                        const newMessage = await channel.send(messageContent);

                        // Ajouter les réactions au nouveau message
                        const reactions = ['✅', '☑️', '❌', '⌛'];
                        for (const reaction of reactions) {
                            await newMessage.react(reaction);
                        }

                        console.log(`🔄 Message modifié et nouveau message envoyé dans le channel ${channel.name}`);
                    }
                } else {
                    // Si aucun message précédent du bot, envoyer un nouveau message
                    const message = await channel.send(messageContent);
                    for (const reaction of ['✅', '☑️', '❌', '⌛']) {
                        await message.react(reaction);
                    }
                    console.log(`🔔 Nouveau message envoyé dans le channel ${channel.name}`);
                }
            } else {
                console.warn('Le channel spécifié est introuvable ou non textuel.');
            }
        });

        console.log('✅ Planification du message quotidien configurée avec succès.');
    } catch (error) {
        console.error('❌ Erreur lors de la configuration de la planification :', error);
    }
});

// Import des commandes et des permissions [JSON]
const { permissions, commands } = require('./commands.json');

// Script du terminal
const { startTerminal } = require('./scripts/terminal.js');
startTerminal(clientId, guildId, token, commands, permissions);

client.login(token);
process.stdin.resume();
