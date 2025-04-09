const { Events, InteractionType, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');

module.exports = (client) => {
    // Gestion des interactions
    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isChatInputCommand()) return;

        if (interaction.commandName === 'lspd') {
            const modal = new ModalBuilder()
                .setCustomId('lspd_form')
                .setTitle('Contrat LSPD');

            const field1 = new TextInputBuilder()
                .setCustomId('field1')
                .setLabel("Matricule")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const field2 = new TextInputBuilder()
                .setCustomId('field2')
                .setLabel("Raison")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const field3 = new TextInputBuilder()
                .setCustomId('field3')
                .setLabel("Prix")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const modalRows = [
                new ActionRowBuilder().addComponents(field1),
                new ActionRowBuilder().addComponents(field2),
                new ActionRowBuilder().addComponents(field3),
            ];

            modal.addComponents(modalRows);

            await interaction.showModal(modal);
        }

        if (interaction.commandName === 'totallspd') {
            const targetChannelId = '1181990833617125446';
            const targetChannel = await client.channels.fetch(targetChannelId);

            const now = new Date();
            const dayOfWeek = now.getDay();
            const diffToMonday = (dayOfWeek + 6) % 7;
            now.setDate(now.getDate() - diffToMonday);

            const snowflakeDate = Math.floor(now.getTime() / 1000);

            const messages = await targetChannel.messages.fetch({ after: snowflakeDate });

            let totalPrice = 0;
            messages.forEach(msg => {
                if (msg.embeds.length > 0) {
                    const embed = msg.embeds[0];
                    const priceField = embed.fields.find(field => field.name === "**Prix**");
                    if (priceField) {
                        const price = parseFloat(priceField.value.replace('$', '').replace('**', ''));
                        if (!isNaN(price)) {
                            totalPrice += price;
                        }
                    }
                }
            });

            await interaction.reply({ content: `Le total des prix des contrats LSPD depuis ce lundi est de **${totalPrice}$**.` });
        }
    });

    // Gestion de la soumission du formulaire
    client.on(Events.InteractionCreate, async interaction => {
        if (interaction.type !== InteractionType.ModalSubmit) return;

        if (interaction.customId === 'lspd_form') {
            const matricule = interaction.fields.getTextInputValue('field1');
            const raison = interaction.fields.getTextInputValue('field2');
            const prix = interaction.fields.getTextInputValue('field3');

            const now = new Date();
            const formattedDate = now.toLocaleDateString('fr-FR') + ' à ' + now.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
            });

            const embed = new EmbedBuilder()
                .setTitle('👮 Contrat LSPD')
                .setColor(0xFFFFFF)
                .addFields(
                    { name: "**Date**", value: formattedDate },
                    { name: "**Matricule**", value: matricule },
                    { name: "**Raison**", value: raison },
                    { name: "**Prix**", value: `**${prix}$**` }
                )
                .setFooter({
                    text: `${interaction.member?.displayName || interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp();

            try {
                const targetChannelId = '1181990833617125446';
                const targetChannel = await client.channels.fetch(targetChannelId);
                await targetChannel.send({ embeds: [embed] });

                await interaction.reply({ content: 'Contrat LSPD soumis avec succès !', ephemeral: true });
            } catch (error) {
                console.error("❌ Erreur lors de l'envoi du contrat :", error);
            }
        }
    });
}
