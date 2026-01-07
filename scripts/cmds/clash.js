const axios = require("axios");

const API_URL = "https://messie-flash-api-ia.vercel.app/chat";
const API_KEY = "messie12356osango2025jinWoo";

const activeClashes = new Map();       // threadID
const clashHistories = new Map();      // threadID → []
const scores = new Map();              // threadID → { userID: score }
const clashTimers = new Map();         // threadID → timeout
const countdownIntervals = new Map();  // threadID → interval

const CLASH_DURATION = 2 * 60 * 1000; // 2 minutes

/* ================= UTILITAIRES ================= */

function frame(text) {
  return `╔════════════════════════════╗\n${text}\n╚════════════════════════════╝`;
}

function scorePush(text) {
  const words = text.split(/\s+/);
  const unique = new Set(words.map(w => w.toLowerCase()));
  const emojis = text.match(/[\p{Emoji}]/gu) || [];
  return words.length * 2 + unique.size * 3 + emojis.length * 5;
}

function startCountdown(api, threadID, duration) {
  let remaining = duration;

  const interval = setInterval(() => {
    remaining -= 10000;

    if (remaining === 60000)
      api.sendMessage(frame("⏳ 1 MINUTE RESTANTE ⏳"), threadID);

    if (remaining === 30000)
      api.sendMessage(frame("⚠️ 30 SECONDES ⚠️"), threadID);

    if (remaining <= 0) clearInterval(interval);
  }, 10000);

  countdownIntervals.set(threadID, interval);
}

async function endClash(api, threadID, reason = "FIN DU CLASH") {
  activeClashes.delete(threadID);

  clearTimeout(clashTimers.get(threadID));
  clearInterval(countdownIntervals.get(threadID));

  clashTimers.delete(threadID);
  countdownIntervals.delete(threadID);

  const threadScores = scores.get(threadID) || {};
  let winner = null;
  let best = -1;

  for (const [id, sc] of Object.entries(threadScores)) {
    if (sc > best) {
      best = sc;
      winner = id;
    }
  }

  let text = `🏁 ${reason} 🏁\n\n`;
  for (const [id, sc] of Object.entries(threadScores)) {
    text += `• ${id} : ${Math.floor(sc)} pts\n`;
  }

  text += winner ? `\n👑 GAGNANT : ${winner}` : "\nAUCUN GAGNANT";

  scores.delete(threadID);
  clashHistories.delete(threadID);

  return api.sendMessage(frame(text), threadID);
}

/* ================= IA ================= */

async function getAIResponse(input, threadID, name) {
  const history = clashHistories.get(threadID) || [];
  const last = history.slice(-3).join(" | ");

  const prompt = `
[SYSTEM]
Derniers messages: ${last}
[USER - ${name}]: ${input}
`;

  const res = await axios.post(
    API_URL,
    { prompt, apiKey: API_KEY },
    { timeout: 15000 }
  );

  const reply = res.data?.response || res.data?.reponse || "…";
  history.push(input, reply);
  clashHistories.set(threadID, history);
  return reply;
}

/* ================= MODULE ================= */

module.exports = {
  config: {
    name: "clash",
    author: "Brayan Ð-Grimɱ",
    category: "Fun",
    role: 0,
  },

  onStart: async function ({ api, event, args }) {
    if (!global.GoatBot.config.adminBot.includes(event.senderID))
      return api.sendMessage("❌ Admin seulement", event.threadID);

    const action = args[0]?.toLowerCase();

    if (action === "ouvert") {
      activeClashes.set(event.threadID, true);
      clashHistories.set(event.threadID, []);
      scores.set(event.threadID, {});

      const timer = setTimeout(() => {
        endClash(api, event.threadID, "TEMPS ÉCOULÉ");
      }, CLASH_DURATION);

      clashTimers.set(event.threadID, timer);
      startCountdown(api, event.threadID, CLASH_DURATION);

      return api.sendMessage(
        frame("⚔️ CLASH DÉMARRÉ ⚔️\n⏱️ 2 MINUTES\nTapez 'fin'"),
        event.threadID
      );
    }

    if (action === "fermé") {
      return endClash(api, event.threadID, "CLASH ARRÊTÉ");
    }
  },

  onChat: async function ({ api, event }) {
    if (!activeClashes.has(event.threadID)) return;
    if (!event.body || event.body.startsWith("!")) return;

    if (event.body.toLowerCase() === "fin") {
      return endClash(api, event.threadID, "ARRÊT MANUEL");
    }

    const info = await api.getUserInfo(event.senderID);
    const name = info[event.senderID]?.name || "Inconnu";

    const reply = await getAIResponse(event.body, event.threadID, name);
    const pushScore = scorePush(reply);

    const threadScores = scores.get(event.threadID) || {};
    threadScores[event.senderID] =
      (threadScores[event.senderID] || 0) + pushScore;

    scores.set(event.threadID, threadScores);

    return api.sendMessage(
      frame(reply + `\n\n🔥 SCORE : +${Math.floor(pushScore)}`),
      event.threadID,
      event.messageID
    );
  }
};