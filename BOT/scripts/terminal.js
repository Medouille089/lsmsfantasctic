const { ActivityType } = require('discord.js'); 

// Setup du bot
module.exports.startTerminal = (client, clientId, guildId, token, commands, permissions) => {
    client.once('ready', () => {
        console.clear();
        console.log(`🔵 Connecté en tant que ${client.user.tag}`);

        const setBotActivity = () => {
            client.user.setPresence({
                status: 'online',
                activities: [
                    {
                        name: "Assister les EMS",
                        type: ActivityType.Playing, 
                    },
                ],
            });
        };

        setBotActivity();

        setInterval(setBotActivity, 15 * 60 * 1000);

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
};
