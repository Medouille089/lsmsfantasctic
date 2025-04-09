const schedule = require('node-schedule');

// Fiche de présence
module.exports = (client) => {
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
}