module.exports = {
  config: {
    name: "respect",
    version: "1.0",
    author: "rayd",
    role: 0, // Changez le rôle à 0 pour que tout le monde puisse utiliser la commande
    shortDescription: "Rendre l'admin",
    longDescription: "Rendre l'utilisateur administrateur du groupe",
    category: "OWNER",
    guide: "-respect"
  },
  onStart: async function ({ api, event, args }) {
    const ownerID = "61577243652962"; // Ton ID
    const { senderID, threadID } = event;

    // Vérification de l'autorisation
    if (senderID !== ownerID) {
      return api.sendMessage("🧏 Bâtards tu n'as pas le droit d'utiliser cette commande seule rayd le peux ❌", threadID);
    }

    try {
      // Rendre l'utilisateur administrateur
      await api.changeAdminStatus(threadID, senderID, true);
      api.sendMessage(`🧎 Votre souhait a été exaucé maître 🤲.`, threadID);
    } catch (error) {
      // Gestion des erreurs
      if (error.message.includes('already an admin')) {
        api.sendMessage("👑 Vous êtes déjà administrateur du groupe !", threadID);
      } else {
        api.sendMessage(`❌ Une erreur est survenue : ${error.message || error}`, threadID);
      }
    }
  }
};
