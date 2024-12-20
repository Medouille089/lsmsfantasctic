// Functions
const { EmbedBuilder, AttachmentBuilder  } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
// Import des commandes et des permissions [JSON]
const { permissions, commands } = require('../commands.json');

module.exports = (client) => {
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    // Hello World!
    if (commandName === 'hello') {
        await interaction.reply('Hello World!');
    }

    // Get time
    else if (commandName === 'heure') {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const formattedTime = `${hours}h${minutes}`; // Format : HHhMM

        await interaction.reply({
            content: `Il est actuellement ${formattedTime}.`,
            ephemeral: true // Ceci rendra le message éphémère
        });
    }  
    
    else if (commandName === 'cni') {
        try {
            // Vérifier si un utilisateur est mentionné, sinon utiliser l'utilisateur qui a tapé la commande
            const mentionedUser = interaction.options.getUser('utilisateur');  // Utiliser "utilisateur" au lieu de "user"
            
            // Si aucun utilisateur n'est mentionné, renvoyer les infos de l'utilisateur qui a tapé la commande
            if (!mentionedUser) {
                return await interaction.reply({
                    content: "Vous devez mentionner un utilisateur !",
                    ephemeral: true
                });
            }
    
            // Vérifier si l'utilisateur mentionné est @zyrkof
            if (mentionedUser.tag === 'zyrkof') {  // Remplacer "zyrkof#1234" par le tag correct de l'utilisateur
                return await interaction.reply({
                    content: `Mais ${mentionedUser} n'a pas de papier, ni de permis !`,
                });
            }
    
            // Récupérer le membre de l'utilisateur mentionné
            const member = await interaction.guild.members.fetch(mentionedUser.id);
    
            // Récupérer les informations de l'utilisateur
            const avatar = mentionedUser.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 });
            const username = mentionedUser.tag;
            const activity = mentionedUser.presence ? mentionedUser.presence.activities[0]?.name || 'Aucune activité' : 'Aucune activité';
            const bio = mentionedUser.bio || 'Aucune bio définie'; // Remarque : Discord ne permet pas directement de récupérer une bio publique
            const memberSince = member.joinedAt.toLocaleDateString('fr-FR'); // Date formatée en français
            const discordSince = mentionedUser.createdAt.toLocaleDateString('fr-FR'); // Date formatée en français
    
            // Récupérer la couleur du rôle principal de l'utilisateur
            const roleColor = member.roles.highest.color || '#2f3136';  // Si aucune couleur n'est définie, une couleur par défaut (gris foncé) est utilisée
    
            // Récupérer les rôles de l'utilisateur (en excluant le rôle @everyone)
            const roles = member.roles.cache.filter(role => role.name !== '@everyone');
            
            // Créer une mention des rôles avec leur couleur
            const roleMentions = roles.map(role => `<@&${role.id}>`).join(' ') || 'Aucun rôle';
    
            // Créer l'embed avec EmbedBuilder (pour v14+)
            const embed = new EmbedBuilder()
                .setColor(roleColor)  // Utiliser la couleur du rôle principal
                .setTitle(`CNI de ${username}`)
                .setThumbnail(avatar)  // Afficher la photo de profil de l'utilisateur
                .addFields(
                    { name: 'Nom d\'utilisateur', value: username, inline: true },
                    { name: 'Activité', value: activity, inline: true },
                    { name: 'Bio', value: bio, inline: true },
                    { name: 'Membre depuis', value: memberSince, inline: true },
                    { name: 'Discord depuis', value: discordSince, inline: true },
                    { name: 'Rôles', value: roleMentions, inline: false }
                )
                .setFooter({ text: `Demande effectuée par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();
    
            // Répondre avec l'embed contenant les informations de l'utilisateur mentionné
            await interaction.reply({ embeds: [embed] });
    
        } catch (error) {
            console.error('Erreur lors de la récupération des informations:', error);
            await interaction.reply({
                content: 'Une erreur est survenue en récupérant les informations.',
                ephemeral: false // Message non éphémère pour que tout le monde puisse voir l'erreur
            });
        }
    }
    
    
    // Get server infos
    else if (commandName === 'infos') {
        const serverInfo = `Nom du serveur : ${interaction.guild.name}\nMembres : ${interaction.guild.memberCount}`;
        await interaction.reply(serverInfo);
    }

    else if (commandName === 'reset') {
  const { REST, Routes } = require('discord.js');
  const { commands } = require('./commands.json');  // Charger les commandes depuis commands.json
  require('dotenv').config();  // Charger les variables d'environnement depuis le fichier .env

  const token = process.env.TOKEN;  // Token
  const clientId = process.env.CLIENT_ID;  // Client ID
  const guildId = process.env.GUILD_ID;  // Server ID

  const rest = new REST({ version: '10' }).setToken(token);

  // Fonction pour réinitialiser les commandes
  async function resetCommands() {
    try {
      // Supprimer toutes les commandes du serveur spécifique
      console.log('Suppression des anciennes commandes...');
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: [],  // Liste vide pour supprimer toutes les commandes
      });
      console.log('Toutes les commandes ont été supprimées.');

      // Réenregistrer les commandes depuis commands.json
      console.log('Ré-enregistrement des commandes...');
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: commands,  // Utilise les commandes chargées depuis commands.json
      });

      console.log('Commandes réinitialisées avec succès.');

    } catch (error) {
      console.error('Erreur lors de la réinitialisation des commandes:', error);
    }
  }

  try {
    // Réinitialiser les commandes
    await resetCommands();

    // Répondre avec un message pour indiquer que la commande a été réinitialisée
    await interaction.reply({
      content: 'Les commandes ont été réinitialisées avec succès !',
      ephemeral: true,  // Message éphémère pour ne pas encombrer le chat
    });

  } catch (error) {
    console.error('Erreur lors de l\'exécution de la commande /reset:', error);
    await interaction.reply({
      content: 'Il y a eu une erreur lors de la réinitialisation des commandes.',
      ephemeral: true,  // Message éphémère
    });
  }
}

    // Get bot infos
    else if (commandName === 'about') {
        const embed = new EmbedBuilder()
            .setColor('#757CFB')  // Couleur de l'embed
            .setTitle("À propos de L ' A B Y S S")
            .setDescription("**L ' A B Y S S** est un bot intelligent conçu pour enrichir votre expérience Discord. Il apporte des fonctionnalités variées, des réponses instantanées et une gestion optimisée des serveurs. 💡✨")
            .addFields(
                { name: '**Nom du Bot**', value: "*L ' A B Y S S*", inline: true },  // Italique et gras pour mettre en valeur
                { name: '**Créateur**', value: 'Développé par **Zyrkof** 👨‍💻', inline: true },  // Ajout d'emoji pour personnaliser
                { name: '**Objectifs**', value: '💬 Améliorer la modération, divertir et informer', inline: false },  // Emoji pour l'accentuation
                { name: '**Technologie**', value: '⚙️ Utilise **Node.js** et **Discord.js** pour ses fonctionnalités', inline: false }  // Ajout d'emoji et de mise en forme
            )
            .setFooter({ text: "L'ABYSS - Votre assistant sur Discord 🔮" })  // Footer plus coloré avec un emoji
            .setTimestamp();  // Ajouter la date et l'heure
    
        await interaction.reply({ embeds: [embed] });
    }
    
    // Commande 'help'
    else if (commandName === 'help') {
        // Créer un Embed
        const embed = new EmbedBuilder()
        .setColor('#757CFB') // Choisir une couleur
        .setTitle("Liste des Commandes")
        .setDescription("Voici la liste des commandes disponibles :")
        .setFooter({ text: 'L \' A B Y S S' })
        .setTimestamp();

        const categoryMapping = {
        "functions": "⚙️" + "Fonctionnalités",
        "games": "🎮" + "Jeux",
        "moderation": "🔨" + "Modération"
        };

        // Grouper les commandes par catégorie
        const categories = {};

        // Remplir les catégories avec leurs commandes
        commands.forEach(command => {
        const category = categoryMapping[command.category] || command.category; 
        if (!categories[category]) {
            categories[category] = [];
        }
        categories[category].push(command);
        });

        // Ajouter les commandes par catégorie à l'embed
        for (const [category, categoryCommands] of Object.entries(categories)) {
        let commandList = '';
        categoryCommands.forEach(cmd => {
            commandList += `**/${cmd.name}**\n ${cmd.description}\n\n`;
        });
        embed.addFields(
            { name: `**__${category} :__**\n\n`, value: commandList, inline: false } 
        );
        }

        await interaction.reply({ embeds: [embed] });
    }
    
    // Be dm'ed by the bot
    else if (commandName === 'dm') {
        const message = interaction.options.getString('message');
        await interaction.user.send(message);
        await interaction.reply('Message envoyé en DM.');
    }
});
}