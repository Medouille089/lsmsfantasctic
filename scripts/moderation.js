const { EmbedBuilder } = require('discord.js');
module.exports = (client) => {
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    // Vérifier si la commande nécessite des permissions spéciales
    if (commandName === 'sendembedmessage' || commandName === 'sendmessage' || commandName === 'ban' || commandName === 'kick') {
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            await interaction.reply({
                content: '❌ Vous devez être administrateur pour utiliser cette commande.',
                ephemeral: true,
            });
            return;
        }
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    // Kick {user}
    if (commandName === 'kick') {
        const member = interaction.options.getUser('utilisateur');
        const memberToKick = interaction.guild.members.cache.get(member.id);

        if (memberToKick.kickable) {
            await memberToKick.kick();
            await interaction.reply(`${member.username} a été expulsé.`);
        } else {
            await interaction.reply('Cet utilisateur ne peut pas être expulsé.');
        }
    }

    // Ban {user}
    else if (commandName === 'ban') {
        const member = interaction.options.getUser('utilisateur');
        const memberToBan = interaction.guild.members.cache.get(member.id);

        if (memberToBan.bannable) {
            await memberToBan.ban();
            await interaction.reply(`${member.username} a été banni.`);
        } else {
            await interaction.reply('Cet utilisateur ne peut pas être banni.');
        }
    } 

    // Send embed message
    else if (commandName === 'sendembedmessage') {
        // Vérifier si l'utilisateur a les permissions d'administrateur
        if (!interaction.member.permissions.has('Administrator')) {
            await interaction.reply({
                content: '❌ Vous devez être administrateur pour utiliser cette commande.',
                ephemeral: true,
            });
            return;
        }

        const channel = interaction.options.getChannel('channel');
        const title = interaction.options.getString('title'); 
        const colorInput = interaction.options.getString('color');
        const message = interaction.options.getString('message');

        if (channel.isTextBased()) {
            // Vérifier si la couleur est valide (doit commencer par # et avoir 6 caractères hexadécimaux)
            const color = /^#[0-9A-F]{6}$/i.test(colorInput) ? colorInput : '#0099ff'; // Couleur par défaut si la couleur est invalide

            // Créer l'embed avec le titre, la couleur et le message
            const embed = new EmbedBuilder()
                .setColor(parseInt(color.replace('#', ''), 16)) // Convertir la couleur en hexadécimal
                .setTitle(title || 'Titre par défaut') // Titre par défaut si aucun titre n'est donné
                .setDescription(message) // Le message avec les sauts de ligne
                .setFooter({ text: "L ' A B Y S S" }) // Footer avec texte
                .setTimestamp(); // Ajouter le timestamp
            

            // Envoyer l'embed dans le salon spécifié
            await channel.send({ embeds: [embed] });
            await interaction.reply(`Message envoyé dans ${channel}.`);
        } else {
            await interaction.reply('Le salon spécifié n\'est pas un salon textuel.');
        }
    }

    // Send message
    else if (commandName === 'sendmessage') {
        // Vérifier si l'utilisateur a les permissions d'administrateur
        if (!interaction.member.permissions.has('Administrator')) {
            await interaction.reply({
                content: '❌ Vous devez être administrateur pour utiliser cette commande.',
                ephemeral: true,
            });
            return;
        }

        const channel = interaction.options.getChannel('channel');
        const messageContent = interaction.options.getString('message');

        if (channel.isTextBased()) {
            await channel.send(messageContent);
            await interaction.reply(`Message envoyé dans ${channel}.`);
        } else {
            await interaction.reply('Le salon spécifié n\'est pas un salon textuel.');
        }
    }
});
}