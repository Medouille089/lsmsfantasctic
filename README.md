# L ' A B Y S S - Discord Bot

**L ' A B Y S S** est un bot Discord conçu pour enrichir votre expérience sur Discord avec des fonctionnalités variées telles que des commandes utiles, des jeux, et une gestion optimisée du serveur. Il est construit avec **Node.js** et la librairie **discord.js**.

## 📜 Fonctionnalités

Le bot **L ' A B Y S S** propose plusieurs commandes pratiques pour interagir avec les membres du serveur. Voici quelques-unes des fonctionnalités disponibles :

- **/hello** : Le bot répond avec un message "Hello World!".
- **/heure** : Affiche l'heure actuelle sur le serveur.
- **/infos** : Affiche des informations sur le serveur (nom, nombre de membres).
- **/about** : Affiche des informations sur le bot (créateur, objectifs, technologies utilisées).
- **/help** : Liste toutes les commandes disponibles avec des descriptions.
- **/dm [message]** : Envoie un message privé (DM) à l'utilisateur.

## 📦 Prérequis

Avant d'utiliser le bot, vous devez vous assurer que vous avez installé **Node.js** sur votre machine.

1. [Téléchargez et installez Node.js](https://nodejs.org/) si vous ne l'avez pas déjà.
2. Assurez-vous également que vous avez un compte **Discord** et que vous avez créé un **Bot** via le [Portail de développement Discord](https://discord.com/developers/applications).

## 🔧 Installation

### 1. Clonez le projet

Clonez ce repository sur votre machine locale avec la commande :

```git clone https://github.com/votre-utilisateur/L-ABYSS-bot.git```

### 2. Installez les dépendances

Accédez au dossier du projet et installez les dépendances avec `npm` :

```cd L-ABYSS-bot npm install```

### 3. Configurez votre bot

Dans le dossier du projet, créez un fichier `.env` et ajoutez votre **Token Discord** ainsi que l'**ID du client** :

```DISCORD_TOKEN=your-discord-bot-token CLIENT_ID=your-client-id```

### 4. Démarrez le bot

Une fois la configuration terminée, démarrez le bot avec la commande suivante :

```node index.js```

## 💡 Utilisation

Voici un aperçu de la structure de certaines commandes que vous pouvez utiliser :

- **/hello** : Envoie un message de bienvenue ("Hello World!").
- **/heure** : Affiche l'heure actuelle sur le serveur.
- **/infos** : Affiche des informations sur le serveur.
- **/about** : Affiche des informations sur le bot.
- **/help** : Affiche la liste de toutes les commandes disponibles.
- **/dm [message]** : Envoie un message privé à un utilisateur.

## 🚀 Déploiement

### 1. Hébergement

Pour garder votre bot en ligne 24/7, vous pouvez l'héberger sur des services comme :

- **[Repl.it](https://replit.com/)**
- **[Heroku](https://heroku.com)**
- **[Vercel](https://vercel.com)**
- **[DigitalOcean](https://www.digitalocean.com)**

### 2. Configuration

Suivez les instructions d'hébergement des plateformes ci-dessus pour configurer et déployer le bot sans avoir besoin de laisser votre PC allumé.

## 🔧 Commandes disponibles

Voici une liste des commandes disponibles dans **L ' A B Y S S** :

- `/hello` - Le bot répond "Hello World!".
- `/heure` - Affiche l'heure actuelle.
- `/infos` - Informations sur le serveur.
- `/about` - Informations sur le bot.
- `/help` - Liste des commandes.
- `/dm [message]` - Envoie un message en DM.

## 🛠️ Développement

Si vous souhaitez modifier ou ajouter des fonctionnalités, vous pouvez simplement ouvrir le fichier `index.js` et personnaliser le code. Les commandes sont définies dans le fichier `functions.js`.

## ⚙️ Auteurs

- Développé par **Zyrkof** 👨‍💻
- Basé sur **discord.js**

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus d'informations.
