// Functions
const { EmbedBuilder  } = require('discord.js');
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



    // Get server infos
    else if (commandName === 'infos') {
        const serverInfo = `Nom du serveur : ${interaction.guild.name}\nMembres : ${interaction.guild.memberCount}`;
        await interaction.reply(serverInfo);
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