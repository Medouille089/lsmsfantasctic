// Anti-spam
const messageLog = {}; // Stocke les messages récents des utilisateurs
const sanctionTime = 10000; // Temps de sanction en millisecondes (10 secondes)

module.exports = (client) => {
    client.on('messageCreate', async (message) => {
        if (message.author.bot) return; // Ignorer les messages du bot

        const userId = message.author.id;
        const now = Date.now();

        // Si l'utilisateur n'est pas encore dans le log, on l'ajoute
        if (!messageLog[userId]) {
            messageLog[userId] = [];
        }

        // Ajoute le timestamp du message dans l'historique de l'utilisateur
        messageLog[userId].push(now);

        // Supprime les timestamps qui ont plus de 10 secondes
        messageLog[userId] = messageLog[userId].filter(timestamp => now - timestamp <= sanctionTime);

        // Si plus de 10 messages en 10 secondes, on applique la sanction
        if (messageLog[userId].length > 5) {
            // Envoyer un message seulement visible par l'utilisateur
            await message.author.send({
                content: `⚠️ ${message.author}, vous êtes en période de sanction pour spam pendant 10 secondes. Vos messages ont étés supprimés.`,
            });

            // Désactiver la visibilité des messages dans le canal public pour 10 secondes
            message.delete();

            // Temporisation pour réactiver les messages normaux
            setTimeout(() => {
                // Réinitialiser les messages autorisés à apparaître
                messageLog[userId] = [];
            }, sanctionTime);
        }
    });
};
