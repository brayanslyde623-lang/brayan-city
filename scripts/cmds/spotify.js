const a = require("axios");
const b = require("fs");
const d = require("path");
const e = d.join(__dirname, "cache");

module.exports = {
  config: {
    name: "spotify",
    aliases: ["sp"],
    version: "3.2",
    author: "Christus",
    countDown: 5,
    role: 0,
    shortDescription: {
      fr: "Rechercher et télécharger une chanson depuis SoundCloud"
    },
    longDescription: {
      fr: "Rechercher et télécharger de l'audio depuis SoundCloud"
    },
    category: "media",
    guide: {
      fr: "{pn} <nom de la chanson>\n\nExemple:\n{pn} dil"
    },
  },

  onStart: async function ({ api: f, args: g, event: h }) {
    if (!g[0]) return f.sendMessage("❌ Veuillez fournir un nom de chanson.", h.threadID, h.messageID);
    f.setMessageReaction("🎶", h.messageID, () => {}, true);

    try {
      const i = g.join(" ");
      const searchAPI = `https://apis-toop.vercel.app/aryan/soundcloud-search?title=${encodeURIComponent(i)}`;
      const searchRes = await a.get(searchAPI);
      const k = searchRes.data.results?.[0];

      if (!k) return f.sendMessage("❌ Aucun résultat trouvé sur SoundCloud.", h.threadID, h.messageID);

      const downloadAPI = `https://apis-toop.vercel.app/aryan/soundcloud?url=${encodeURIComponent(k.url)}`;
      const downloadRes = await a.get(downloadAPI);
      const n = downloadRes.data;

      if (!n?.download_url) return f.sendMessage("❌ Impossible d'obtenir le lien audio.", h.threadID, h.messageID);

      const o = d.join(e, `${k.title}.mp3`);
      const p = await a.get(n.download_url, { responseType: 'stream' });

      p.data.pipe(b.createWriteStream(o)).on("finish", async () => {
        f.sendMessage({
          body: `🎵 𝗧𝗶𝘁𝗿𝗲 : ${n.title}\n\n𝗣𝗿𝗼𝗳𝗶𝘁𝗲 de ta chanson ! ❣️`,
          attachment: b.createReadStream(o)
        }, h.threadID, () => b.unlinkSync(o), h.messageID);

        f.setMessageReaction("✅", h.messageID, () => {}, true);
      });

    } catch (z) {
      console.error("❌ Une erreur inattendue est survenue :", z.message);
      f.sendMessage("❌ Une erreur inattendue est survenue.", h.threadID, h.messageID);
      f.setMessageReaction("❌", h.messageID, () => {}, true);
    }
  }
};
