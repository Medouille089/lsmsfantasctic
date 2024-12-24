const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType  } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

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

        //Counter
        else if (commandName === 'setcounter') {
            const channel = interaction.options.getChannel('salon');     
            // Vérifie si le salon est valide et de type textuel
            if (!channel) {
                return await interaction.reply({
                    content: 'Aucun salon spécifié.',
                    ephemeral: true
                });
            }
        
            if (channel.type !== ChannelType.GuildText) {
                return await interaction.reply({
                    content: 'Veuillez spécifier un salon textuel valide.',
                    ephemeral: true
                });
            }
        
            // Créer un objet pour stocker l'état du compteur (dans une base de données ou un cache)
            client.counter = client.counter || {}; // Assurer qu'un objet existe pour tous les salons
            client.counter[channel.id] = 1; // Initialise le compteur à 1
               
            await interaction.reply({
                content: `Le compteur a été initialisé dans le salon **${channel.name}**. Commencez à envoyer les nombres successifs.`,
                ephemeral: true
            });
        
            // Écoute les messages dans le salon spécifié
            client.on('messageCreate', async (message) => {
                if (message.channel.id === channel.id && !message.author.bot) {
                    const expectedNumber = client.counter[channel.id];
                               
                    const userNumber = parseInt(message.content, 10);
            
                    // Si le message n'est pas un nombre ou si le nombre n'est pas correct
                    if (isNaN(userNumber) || userNumber !== expectedNumber) {
                        await message.delete();
                        await message.author.send({
                            content: 'Votre message a été supprimé car vous devez suivre les nombres successifs. Veuillez envoyer le chiffre suivant.'
                        });
                    } else {
                        // Si le nombre est correct, met à jour le compteur
                        client.counter[channel.id] += 1;
                    }
                }
            });
        }

        // Jeu de main droite ou main gauche
        else if (commandName === 'handgame') {
            const hands = ['droite', 'gauche'];
            const chosenHand = hands[Math.floor(Math.random() * hands.length)];
            
            const filter = response => {
                return hands.includes(response.content.toLowerCase());
            };
            
            await interaction.reply('Devinez dans quelle main est l\'objet : **droite** ou **gauche** ?');

            const collected = await interaction.channel.awaitMessages({
                filter,
                max: 1,
                time: 7500, // 15 secondes pour répondre
                errors: ['time']
            }).catch(() => {
                return null;
            });

            if (collected) {
                const userGuess = collected.first().content.toLowerCase();
                if (userGuess === chosenHand) {
                    await interaction.followUp(`Bravo ! Vous avez deviné correctement, l'objet était dans la main **${chosenHand}**.`);
                } else {
                    await interaction.followUp(`Dommage ! L'objet était en réalité dans la main **${chosenHand}**.`);
                }
            } else {
                await interaction.followUp('Temps écoulé ! Vous n\'avez pas fait de choix.');
            }
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
    // Jeu du menteur
            else if (commandName === 'liar') {
                if (isLiarGameActive) {
                    return await interaction.reply('⚠️ Une partie de Menteur est déjà en cours.');
                }
    
                isLiarGameActive = true;
                players = []; // Réinitialiser les joueurs
                currentMaster = 'K'; // Commencer avec le Roi
                playerLives = {}; // Réinitialiser les vies des joueurs
                decks = {}; // Réinitialiser les cartes distribuées
    
                await interaction.reply('🎮 Une partie de Menteur a été lancée ! Tapez `/join` pour rejoindre.');
            }
    
            // Rejoindre une partie de menteur
            else if (commandName === 'join') {
                if (!isLiarGameActive) {
                    return await interaction.reply('⚠️ Aucune partie de Menteur n\'est en cours. Tapez `/liar` pour lancer une partie.');
                }
    
                if (players.length >= 4) {
                    return await interaction.reply('⚠️ Il y a déjà 4 joueurs dans la partie.');
                }
    
                players.push(interaction.user);
                playerLives[interaction.user.id] = 3; // Chaque joueur commence avec 3 vies
    
                await interaction.reply(`${interaction.user.username} a rejoint la partie de Menteur !`);
    
                // Si 4 joueurs sont dans la partie, on peut commencer
                if (players.length === 4) {
                    await interaction.reply('Nous avons 4 joueurs ! Tapez `/start` pour démarrer.');
                }
            }
    
            // Démarrer la partie de menteur
            else if (commandName === 'start') {
                if (players.length < 4) {
                    return await interaction.reply('⚠️ Il faut 4 joueurs pour démarrer une partie.');
                }
    
                // Distribuer les cartes (ici, un exemple simple)
                for (let player of players) {
                    decks[player.id] = ['K', 'Q', 'A', 'K', 'Q']; // Chaque joueur reçoit 5 cartes
                }
    
                await interaction.reply('La partie a commencé ! Tapez `/cards` pour poser vos cartes ou `/accuse` pour accuser de mentir.');
            }
    
            // Poser des cartes
            else if (commandName === 'cards') {
                // La logique de poser des cartes
                await interaction.reply('Choisissez les cartes à poser en fonction de la carte maîtresse actuelle.');
            }
    
            // Accuser un mensonge
            else if (commandName === 'accuse') {
                await interaction.reply('Accuser un joueur de mentir.');
            }
        });
    
        // Gérer les messages pour le jeu des devinettes
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

        client.on('interactionCreate', async interaction => {
            if (!interaction.isCommand()) return;
        
            const { commandName } = interaction;
        
            if (commandName === 'tictactoe') {
                await startTicTacToe(interaction, true); // Duel contre le bot
            }
        
            if (commandName === 'tictactoemp') {
                await startTicTacToe(interaction, false); // Duel entre joueurs
            }
        });
        
        async function startTicTacToe(interaction, isBotGame) {
            // Initialisation de la grille et des variables
            const board = Array(9).fill(null);
            let currentPlayer = 'X'; // Joueur "X" commence toujours
            const players = isBotGame ? { X: interaction.user, O: client.user } : { X: interaction.user, O: null };
        
            if (!isBotGame) {
                await interaction.reply('Mentionnez un autre joueur pour commencer le duel.');
                const filter = response => response.mentions.users.size === 1 && response.mentions.users.first().id !== interaction.user.id;
                const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000 }).catch(() => null);
                if (!collected) {
                    await interaction.followUp('Aucun adversaire mentionné. Annulation de la partie.');
                    return;
                }
                players.O = collected.first().mentions.users.first();
            }
        
            await interaction.reply({
                content: `Tic Tac Toe ! ${players.X} joue "X" et ${players.O} joue "O".`,
                components: generateBoardComponents(board),
            });
        
            const collector = interaction.channel.createMessageComponentCollector({ time: 60000 });
        
            collector.on('collect', async buttonInteraction => {
                const player = currentPlayer === 'X' ? players.X : players.O;
                if (buttonInteraction.user.id !== player.id) {
                    await buttonInteraction.reply({ content: 'Ce n\'est pas votre tour !', ephemeral: true });
                    return;
                }
        
                const index = parseInt(buttonInteraction.customId.split('_')[1]);
                if (board[index]) {
                    await buttonInteraction.reply({ content: 'Cette case est déjà prise !', ephemeral: true });
                    return;
                }
        
                board[index] = currentPlayer;
                const winner = checkWinner(board);
                const isDraw = board.every(cell => cell);
        
                if (winner || isDraw) {
                    collector.stop();
                    await buttonInteraction.update({
                        content: winner ? `${player} a gagné !` : 'Match nul !',
                        components: generateBoardComponents(board, true),
                    });
                    return;
                }
        
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        
                if (isBotGame && currentPlayer === 'O') {
                    const botMove = botChooseMove(board);
                    board[botMove] = 'O';
                    const botWinner = checkWinner(board);
                    const botDraw = board.every(cell => cell);
        
                    if (botWinner || botDraw) {
                        collector.stop();
                        await buttonInteraction.update({
                            content: botWinner ? `${players.O} (bot) a gagné !` : 'Match nul !',
                            components: generateBoardComponents(board, true),
                        });
                        return;
                    }
                    currentPlayer = 'X';
                }
        
                await buttonInteraction.update({
                    content: `${players[currentPlayer]} à toi de jouer (${currentPlayer}) !`,
                    components: generateBoardComponents(board),
                });
            });
        }
        
        function generateBoardComponents(board, disabled = false) {
            const rows = [];
            for (let i = 0; i < 3; i++) {
                const row = new ActionRowBuilder();
                for (let j = 0; j < 3; j++) {
                    const index = i * 3 + j;
                    const label = board[index] || '-'; // Valeur par défaut '-'
                    let style = ButtonStyle.Secondary; // Par défaut gris
        
                    // Définir la couleur des boutons en fonction de "X" ou "O"
                    if (board[index] === 'X') {
                        style = ButtonStyle.Danger; // Rouge pour "X"
                    } else if (board[index] === 'O') {
                        style = ButtonStyle.Primary; // Bleu pour "O"
                    }
        
                    row.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`cell_${index}`)
                            .setLabel(label) // Met à jour le label
                            .setStyle(style) // Applique la couleur appropriée
                            .setDisabled(disabled || !!board[index]) // Désactive le bouton si la case est déjà occupée ou si la partie est finie
                    );
                }
                rows.push(row);
            }
            return rows;
        }
        
        
        function checkWinner(board) {
            const winPatterns = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8], // Lignes
                [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colonnes
                [0, 4, 8], [2, 4, 6],           // Diagonales
            ];
            for (const [a, b, c] of winPatterns) {
                if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                    return board[a];
                }
            }
            return null;
        }
        
        function botChooseMove(board) {
            let bestScore = -Infinity;
            let move = -1;
        
            for (let i = 0; i < board.length; i++) {
                if (!board[i]) {
                    board[i] = 'O'; // Simulez un coup du bot
                    const score = minimax(board, 0, false);
                    board[i] = null; // Annulez le coup simulé
                    if (score > bestScore) {
                        bestScore = score;
                        move = i;
                    }
                }
            }
        
            return move;
        }
        
        function minimax(board, depth, isMaximizing) {
            const winner = checkWinner(board);
            if (winner === 'O') return 10 - depth; // Bot gagne
            if (winner === 'X') return depth - 10; // Joueur gagne
            if (board.every(cell => cell)) return 0; // Match nul
        
            if (isMaximizing) {
                let bestScore = -Infinity;
                for (let i = 0; i < board.length; i++) {
                    if (!board[i]) {
                        board[i] = 'O';
                        const score = minimax(board, depth + 1, false);
                        board[i] = null;
                        bestScore = Math.max(score, bestScore);
                    }
                }
                return bestScore;
            } else {
                let bestScore = Infinity;
                for (let i = 0; i < board.length; i++) {
                    if (!board[i]) {
                        board[i] = 'X';
                        const score = minimax(board, depth + 1, true);
                        board[i] = null;
                        bestScore = Math.min(score, bestScore);
                    }
                }
                return bestScore;
            }
        }
    };

