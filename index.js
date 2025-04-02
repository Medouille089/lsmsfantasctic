const { Client, GatewayIntentBits, ActivityType, Events, REST, Routes, SlashCommandBuilder } = require('discord.js');
const schedule = require('node-schedule');
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

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

const rest = new REST({ version: '10' }).setToken(token);

client.once('ready', () => {
    console.clear();
    console.log(`🔵 Connecté en tant que ${client.user.tag}`);

    client.user.setPresence({
        status: 'online',
        activities: [
            {
                name: "Checker les présences",
                type: ActivityType.Playing,
            },
        ],
    });

    console.log("🟣 Activité et statut définis avec succès !\n");

    const moulinSlash = () => {
        const symbols = ['/', '-', '\\', '|'];
        let index = 0;
        setInterval(() => {
            process.stdout.write(`\r🟢 Bot actif ${symbols[index]}`);
            index = (index + 1) % symbols.length;
        }, 250);
    };

    moulinSlash();
});

// Fiche de présence
client.once('ready', () => {
    const channelId = '1226973819470610563'; 
    const roleId = '1060338846996385905'; 

    try {
        // Planification quotidienne
        schedule.scheduleJob('00 13 * * *', async () => {
            const channel = await client.channels.fetch(channelId);
            const currentDate = new Date().toLocaleDateString('fr-FR');
            const newMessageContent = `**FICHE DE PRESENCE:** ${currentDate}\n\nMerci de bien vouloir indiquer votre disponibilité pour ce soir en cochant ci-dessous : <@&${roleId}>\n\n✅ Disponible en début de soirée (avant 23h00)\n☑️ Disponible en fin de soirée (23h00 et plus)\n❌ Absent\n⌛ Ne sait pas encore\n\nMerci\nPS: Vous pouvez cocher ✅ et ☑️ si vous êtes disponible toute la soirée`;

            if (channel && channel.isTextBased()) {
                const lastMessage = (await channel.messages.fetch({ limit: 1 })).first();

                if (lastMessage && lastMessage.author.id === client.user.id && lastMessage.content.includes("FICHE DE PRESENCE")) {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1); 
                    
                    const yesterdayFormatted = `${('0' + yesterday.getDate()).slice(-2)}/${('0' + (yesterday.getMonth() + 1)).slice(-2)}/${yesterday.getFullYear()}`;
                    
                    await lastMessage.edit(`**FICHE DE PRESENCE:** ${yesterdayFormatted}`);
                    console.log(`✏️ Message précédent mis à jour avec la date d'hier : ${yesterdayFormatted}`);
                }
                

                const newMessage = await channel.send(newMessageContent);

                for (const reaction of ['✅', '☑️', '❌', '⌛']) {
                    await newMessage.react(reaction);
                }

                console.log(`🔔 Nouveau message envoyé dans le channel ${channel.name}`);
            } else {
                console.warn('❌ Le channel spécifié est introuvable ou non textuel.');
            }
        });

        console.log('✅ Planification du message quotidien configurée avec succès.');
    } catch (error) {
        console.error('❌ Erreur lors de la configuration de la planification :', error);
    }
});


client.on(Events.MessageCreate, async (message) => {
    if (message.content === '!delete') {
        try {
            if (!message.member.permissions.has('ManageMessages')) {
                return message.reply("❌ Vous n'avez pas les permissions nécessaires pour utiliser cette commande.").then((msg) => {
                    setTimeout(() => msg.delete(), 5000);
                });
            }

            const fetchedMessages = await message.channel.messages.fetch({ limit: 10 });
            const botMessage = fetchedMessages.find((msg) => msg.author.id === client.user.id);

            if (botMessage) {
                await botMessage.delete();
                await message.reply("✅ Dernier message envoyé par le bot supprimé avec succès.").then((msg) => {
                    setTimeout(() => msg.delete(), 5000);
                });
            } else {
                await message.reply("❌ Aucun message envoyé par le bot trouvé dans ce salon.").then((msg) => {
                    setTimeout(() => msg.delete(), 5000);
                });
            }
        } catch (error) {
            console.error('Erreur lors de la suppression du message :', error);
            await message.reply("❌ Une erreur est survenue lors de la tentative de suppression.").then((msg) => {
                setTimeout(() => msg.delete(), 5000);
            });
        }
    }
});

client.once('ready', async () => {
    console.log(`🔵 Connecté en tant que ${client.user.tag}`);

    const guildId = process.env.GUILD_ID;
    const roleIds = [
        '1060338847231258688', 
        '1060592324998074390',
        '1060338847088652341',
        '1288786723895115786',
        '1060338847088652339',
        '1060338846996385908',
        '1060338846996385907'
    ];

    app.get('/medecins', async (req, res) => {
        try {
            console.log("📡 Récupération des membres du rôle...");
    
            const guild = await client.guilds.fetch(guildId);
            await guild.members.fetch();
    
            const role = guild.roles.cache.get('1060338846996385905'); 
            if (!role) {
                console.log("❌ Rôle introuvable !");
                return res.status(404).json({ error: "Rôle non trouvé" });
            }
    
            console.log(`✅ Rôle trouvé : ${role.name} (${role.id}) avec ${role.members.size} membres`);
    
            const members = role.members.map(member => {
                const memberRoles = member.roles.cache.filter(r => roleIds.includes(r.id));
                
                if (memberRoles.size > 0) {
                    const highestRole = memberRoles.reduce((highest, current) => {
                        return (current.position > highest.position) ? current : highest;
                    });
    
                    return {
                        id: member.id,
                        displayName: member.displayName,
                        highestRole: highestRole.name 
                    };
                } else {
                    return {
                        id: member.id,
                        displayName: member.displayName,
                        highestRole: null 
                    };
                }
            });
    
            res.json(members);
        } catch (error) {
            console.error("❌ Erreur API :", error);
            res.status(500).json({ error: "Erreur interne du serveur" });
        }
    });
    
    app.get('/medecins/:id', async (req, res) => {
        const medecinId = req.params.id;
        try {
            console.log(`📡 Récupération des informations pour le médecin ID ${medecinId}...`);
    
            const guild = await client.guilds.fetch(guildId);
            await guild.members.fetch();
    
            const member = await guild.members.fetch(medecinId);
            if (!member) {
                return res.status(404).json({ error: "Médecin non trouvé" });
            }
    
            const memberRoles = member.roles.cache.filter(r => roleIds.includes(r.id));
    
            const highestRole = memberRoles.size > 0
                ? memberRoles.reduce((highest, current) => (current.position > highest.position ? current : highest))
                : null;
    
            return res.json({
                id: member.id,
                username: member.displayName,
                highestRole: highestRole ? highestRole.name : null
            });
        } catch (error) {
            console.error("❌ Erreur API :", error);
            res.status(500).json({ error: "Erreur interne du serveur" });
        }
    });
    
    app.listen(3000, () => console.log("🚀 Serveur API en écoute sur le port 3000"));
    
});



client.login(token);
process.stdin.resume();
