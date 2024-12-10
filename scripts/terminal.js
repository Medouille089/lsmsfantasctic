// Script du terminal
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const readline = require('readline');

async function startTerminal(clientId, guildId, token, commands, permissions) {
    const rest = new REST({ version: '10' }).setToken(token);

    try {
        console.clear();
        process.stdout.write('\x1Bc');
        console.log('🔴 Démarrage de l\'enregistrement des commandes slash...');

        const showProgress = async (message, task) => {
            const totalSteps = 20;
            let progress = 0;
            const interval = setInterval(() => {
                progress++;
                const percentage = Math.round((progress / totalSteps) * 100);
                readline.cursorTo(process.stdout, 0);
                process.stdout.write(`${message} [${'='.repeat(progress)}${' '.repeat(totalSteps - progress)}] ${percentage}%`);
            }, 50);

            await task();

            clearInterval(interval);
            readline.cursorTo(process.stdout, 0);
            process.stdout.write(`${message} [${'='.repeat(totalSteps)}] 100% Terminé !\n`);
        };

        await showProgress('🟠 Chargement des commandes', async () => {
            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { 
                    body: commands,
                    permissions: permissions,
                }
            );
        });

        console.log(`🟢 Commandes slash enregistrées avec succès.\n`);
        console.log('🟢 Le bot est en ligne !');
    } catch (error) {
        console.error(error);
    }
}

module.exports = { startTerminal };
