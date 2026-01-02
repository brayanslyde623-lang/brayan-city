module.exports = {
  config: {
    name: "respect",
    version: "1.0",
    author: "rayd",
    role: 2,
    shortDescription: "Rendre l'admin",
    longDescription: "Rendre l'utilisateur administrateur du groupe",
    category: "OWNER",
    guide: "-respect"
  },
  onStart: async function ({ api, event, args }) {
    const BOT_ADMINS = ["61577243652962"];
    const senderID = event.senderID;
    if (!BOT_ADMINS.includes(senderID)) {
      return api.sendMessage("🧏 Bâtards tu n'as pas le droit d'utiliser cette commande seule mon maître Rayd le peux ❌.", event.threadID);
    }

    const threadID = event.threadID;

    try {
      await api.changeAdminStatus(threadID, senderID, true);
      return api.sendMessage(`✅ Vous avez été rendu administrateur du groupe.`, event.threadID);
    } catch (error) {
      return api.sendMessage(`❌ Une erreur est survenue : ${error.message || error}`, event.threadID);
    }
  }
};
