const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionsBitField, ChannelType } = require('discord.js');
module.exports = (client) => {
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    // Vérifier si la commande nécessite des permissions spéciales
    if (commandName === 'sendembedmessage' || commandName === 'sendmessage' || commandName === 'ban' || commandName === 'kick' || commandName === 'setupticket') {
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

    else if (commandName === 'setupticket') {
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            await interaction.reply({
                content: '❌ Vous devez être administrateur pour utiliser cette commande.',
                ephemeral: true,
            });
            return;
        }
    
        const channel = interaction.options.getChannel('channel');
    
        if (!channel.isTextBased()) {
            await interaction.reply('Le salon spécifié n\'est pas un salon textuel.');
            return;
        }
    
        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('📋 Règles du Ticket')
            .setDescription('Bienvenue dans notre système de tickets. Voici les règles à suivre :\n\n' +
                '1. Respectez toujours les membres du staff.\n' +
                '2. N\'ouvrez un ticket que pour des problèmes urgents.\n' +
                '3. Veuillez fournir toutes les informations nécessaires.\n\n' +
                'Cliquez sur le bouton ci-dessous pour ouvrir votre ticket.')
            .setFooter({ text: "L ' A B Y S S" })
            .setTimestamp();
    
        const ticketButton = new ButtonBuilder()
            .setCustomId('ticket_button')
            .setLabel('Ouvrir un Ticket')
            .setStyle(ButtonStyle.Primary);
    
        const actionRow = new ActionRowBuilder().addComponents(ticketButton);
    
        await channel.send({
            embeds: [embed],
            components: [actionRow],
        });
    
        await interaction.reply(`La configuration du ticket a été envoyée dans ${channel}.`);
    }
    
    let ticketCount = 0;  // Variable pour suivre l'incrémentation des tickets
    const userTickets = new Map();  // Map pour stocker les tickets ouverts par utilisateur

    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton()) return;

        if (interaction.customId === 'ticket_button') {
            // Vérifier si l'utilisateur a déjà un ticket actif
            if (userTickets.has(interaction.user.id)) {
                await interaction.reply({
                    content: '❌ Vous avez déjà un ticket actif.',
                    ephemeral: true,
                });
                return;
            }

            try {
                const ticketCategoryId = '1047049752077942824'; // ID de la catégorie des tickets
                const ticketCategory = interaction.guild.channels.cache.get(ticketCategoryId);

                if (!ticketCategory) {
                    await interaction.reply({ content: 'Il n\'y a pas de catégorie "Tickets" dans ce serveur.', ephemeral: true });
                    return;
                }

                // Incrémentation du compteur de tickets
                ticketCount++;

                // Créer le salon du ticket avec les bonnes permissions et le bon type de canal
                const ticketChannel = await interaction.guild.channels.create({
                    name: `ticket-n°${ticketCount}`,
                    type: ChannelType.GuildText, // Utilisation de la constante correcte
                    parent: ticketCategory.id,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel], // Refuser la vue pour tous les autres membres
                        },
                        {
                            id: interaction.user.id,
                            allow: [PermissionsBitField.Flags.ViewChannel], // Permettre à l'utilisateur de voir son ticket
                        },
                    ],
                });

                // Ajouter l'ID du ticket dans la Map pour l'utilisateur
                userTickets.set(interaction.user.id, ticketChannel.id);

                // Créer l'embed pour le ticket
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle(`Ticket n° ${ticketCount}`)
                    .setDescription(`User : **${interaction.user.tag}**\n\nSi le problème a été résolu, vous pouvez fermer ce ticket.`)
                    .setFooter({ text: "L ' A B Y S S" })
                    .setTimestamp();

                // Créer le bouton de fermeture
                const closeButton = new ButtonBuilder()
                    .setCustomId('close_ticket_button')
                    .setLabel('Fermer le Ticket')
                    .setStyle(ButtonStyle.Danger);

                const actionRow = new ActionRowBuilder().addComponents(closeButton);

                // Envoyer l'embed et le bouton dans le salon du ticket
                await ticketChannel.send({
                    embeds: [embed],
                    components: [actionRow],
                });

                // Réponse pour indiquer que le ticket a été créé
                await interaction.reply({ content: `Votre ticket a été créé : ${ticketChannel}`, ephemeral: true });
            } catch (error) {
                console.error('Erreur lors de la création du ticket :', error);
                await interaction.reply({ content: 'Une erreur s\'est produite lors de la création du ticket. Veuillez réessayer plus tard.', ephemeral: true });
            }
        }

        if (interaction.customId === 'close_ticket_button') {
            try {
                const ticketChannel = interaction.channel;

                if (!ticketChannel) {
                    await interaction.reply({ content: 'Ce salon n\'est pas un ticket valide.', ephemeral: true });
                    return;
                }

                // Supprimer l'ID du ticket de la Map lorsqu'il est fermé
                userTickets.delete(interaction.user.id);

                // Fermer le ticket en supprimant les permissions et en envoyant un message de confirmation
                await ticketChannel.send({ content: 'Ce ticket va maintenant être fermé.' });

                // Supprimer le salon après un délai (par exemple 3 secondes)
                setTimeout(() => {
                    ticketChannel.delete().catch(err => console.error('Erreur lors de la suppression du salon du ticket :', err));
                }, 3000);

                await interaction.reply({ content: 'Le ticket va être fermé dans quelques instants.', ephemeral: true });
            } catch (error) {
                console.error('Erreur lors de la fermeture du ticket :', error);
                await interaction.reply({ content: 'Une erreur s\'est produite lors de la fermeture du ticket. Veuillez réessayer plus tard.', ephemeral: true });
            }
        }
    });

});
}