module.exports = (client) => {
let numberOfGuesses = 0; // Nombre de tentatives
let startTime = 0; // Timer à 0
let isGuessGameActive = false; // Aucune game active de base
let targetNumber = 0; // Aucun targetNumber définit

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    // Random number
    if (commandName === 'random') {
        const randomNum = Math.floor(Math.random() * 100) + 1;
        await interaction.reply(`Le nombre aléatoire est : **${randomNum}**`);
    }

    // Pile ou face
    else if (commandName === 'pileouface') {
        const result = Math.random() < 0.5 ? 'Pile' : 'Face';
        await interaction.reply(`🪙 Le résultat est : **${result}** !`);
    } 

    // Guess the number
    else if (commandName === 'guess') {
        if (isGuessGameActive) {
            return await interaction.reply('⚠️ Le jeu est déjà en cours. Devinez le nombre ou arrêtez le jeu avec `/stop`.');
        }

        isGuessGameActive = true;
        numberOfGuesses = 0; // Réinitialisation des tentatives
        startTime = Date.now(); // Démarrer le minuteur
        targetNumber = Math.floor(Math.random() * 100) + 1; // Nombre aléatoire entre 1 et 100

        await interaction.reply('🎮 Un nouveau jeu a commencé ! Devine un nombre entre 1 et 100. Tape un nombre pour jouer ou `stop` pour arrêter le jeu.');
    }
});
// Événement messageCreate pour gérer les devinettes
client.on('messageCreate', async (message) => {
    if (message.author.bot || !isGuessGameActive) return;

    const guessedNumber = parseInt(message.content, 10);

    if (!isNaN(guessedNumber)) {
        numberOfGuesses++; // Incrémentation des tentatives

        // Calcul du temps écoulé
        const timeElapsed = (Date.now() - startTime) / 1000; // Temps en secondes

        if (guessedNumber === targetNumber) {
            isGuessGameActive = false; // Terminer le jeu
            await message.reply(`🎉 Bravo, ${message.author} ! Tu as deviné le nombre **${targetNumber}** en **${numberOfGuesses}** tentatives et en **${timeElapsed.toFixed(1)}** secondes !`);
        } else if (guessedNumber < targetNumber) {
            await message.reply('🔼 Plus grand !');
        } else {
            await message.reply('🔽 Plus petit !');
        }
    } else if (message.content.toLowerCase() === 'stop') {
        isGuessGameActive = false; // Désactiver le jeu
        await message.reply('⏹️ Le jeu a été arrêté. Merci d\'avoir joué !');
    }
});
}