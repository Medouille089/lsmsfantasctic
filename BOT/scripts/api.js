//Api fetch
client.once('ready', async () => {
    console.log(`🔵 Connecté en tant que ${client.user.tag}`);

    const guildId = process.env.GUILD_ID;
    const roleIds = [
        '1060338847231258688', 
        '1060592324998074390',
        '1060338847088652341',
        '1288786723895115786',
        '1060338847088652339',
        '1060338846996385908',
        '1060338846996385907'
    ];

    app.get('/medecins', async (req, res) => {
        try {
            console.log("📡 Récupération des membres du rôle...");
    
            const guild = await client.guilds.fetch(guildId);
            await guild.members.fetch();
    
            const role = guild.roles.cache.get('1060338846996385905'); 
            if (!role) {
                console.log("❌ Rôle introuvable !");
                return res.status(404).json({ error: "Rôle non trouvé" });
            }
    
            console.log(`✅ Rôle trouvé : ${role.name} (${role.id}) avec ${role.members.size} membres`);
    
            const members = role.members.map(member => {
                const memberRoles = member.roles.cache.filter(r => roleIds.includes(r.id));
                
                if (memberRoles.size > 0) {
                    const highestRole = memberRoles.reduce((highest, current) => {
                        return (current.position > highest.position) ? current : highest;
                    });
    
                    return {
                        id: member.id,
                        displayName: member.displayName,
                        highestRole: highestRole.name 
                    };
                } else {
                    return {
                        id: member.id,
                        displayName: member.displayName,
                        highestRole: null 
                    };
                }
            });
    
            res.json(members);
        } catch (error) {
            console.error("❌ Erreur API :", error);
            res.status(500).json({ error: "Erreur interne du serveur" });
        }
    });
    
    app.get('/medecins/:id', async (req, res) => {
        const medecinId = req.params.id;
        try {
            console.log(`📡 Récupération des informations pour le médecin ID ${medecinId}...`);
    
            const guild = await client.guilds.fetch(guildId);
            await guild.members.fetch();
    
            const member = await guild.members.fetch(medecinId);
            if (!member) {
                return res.status(404).json({ error: "Médecin non trouvé" });
            }
    
            const memberRoles = member.roles.cache.filter(r => roleIds.includes(r.id));
    
            const highestRole = memberRoles.size > 0
                ? memberRoles.reduce((highest, current) => (current.position > highest.position ? current : highest))
                : null;
    
            return res.json({
                id: member.id,
                username: member.displayName,
                highestRole: highestRole ? highestRole.name : null
            });
        } catch (error) {
            console.error("❌ Erreur API :", error);
            res.status(500).json({ error: "Erreur interne du serveur" });
        }
    });
    
    app.listen(3000, () => console.log("🚀 Serveur API en écoute sur le port 3000"));
    
});