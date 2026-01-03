const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    version: "5.2",
    author: "rayd",
    countDown: 2,
    role: 0,
    shortDescription: { en: "Explore all bot commands" },
    category: "info",
    guide: { en: "help <command> — get command info, -ai for smart suggestions" }
  },
  onStart: async function ({ message, args, event, usersData }) {
    try {
      if (args[0] && args[0].toLowerCase() === "-ai") {
        const keyword = args[1] ? args[1].toLowerCase() : "";
        const allCmds = Array.from(commands.keys());
        const suggestions = allCmds
          .map(cmd => ({ cmd, match: Math.max(40, 100 - Math.abs(cmd.length - keyword.length) * 10) }))
          .filter(c => c.cmd.includes(keyword))
          .sort((a, b) => b.match - a.match)
          .slice(0, 10);
        if (!suggestions.length) {
          return message.reply("❌ No suggestions found 😔");
        }
        const body = "🤖 AI Suggestions 📚\n" + suggestions.map(s => `• ${s.cmd} (${s.match}% match 👍)`).join("\n");
        return message.reply(body);
      }

      if (!args || args.length === 0) {
        let body = "**🚀🌟🔥 B O T   C O M M A N D S 🔥🌟🚀**\n\n";
        const categories = {};
        for (let [name, cmd] of commands) {
          const cat = cmd.config.category || "Misc";
          if (!categories[cat]) categories[cat] = [];
          categories[cat].push(name);
        }
        for (const cat of Object.keys(categories).sort()) {
          const list = categories[cat].sort().map(c => `• ${c}`).join(" ");
          body += `⭐️ ${cat} 📂\n${list || "No commands 😔"}\n\n`;
        }
        body += `📊 Total Commands: ${commands.size} 🎉\n`;
        body += `🔧 Command Info: .help <command> 📚\n`;
        body += `🔍 Search: .help -s <keyword> 🔎\n`;
        body += `🤖 AI Suggest: .help -ai <command> 🤔\n`;
        return message.reply(body);
      }

      const query = args[0].toLowerCase();
      const command = commands.get(query) || commands.get(aliases.get(query));
      if (!command) {
        return message.reply(`❌ Command "${query}" not found 😔`);
      }
      const cfg = command.config || {};
      const roleMap = { 0: "All Users 👥", 1: "Group Admins 👑", 2: "Bot Admins 🤖" };
      const aliasesList = Array.isArray(cfg.aliases) && cfg.aliases.length ? cfg.aliases.join(", ") : "None 😔";
      const desc = cfg.longDescription ? cfg.longDescription.en : cfg.shortDescription ? cfg.shortDescription.en : "No description 😔";
      const usage = cfg.guide ? cfg.guide.en : cfg.name;
      const card = [
        `**🌈🔥 C O M M A N D : ${cfg.name} 🔥🌈**`,
        `📝 Description: ${desc} 📚`,
        `📂 Category: ${cfg.category || "Misc"} 📂`,
        `🔤 Aliases: ${aliasesList} 📚`,
        `🛡️ Role: ${roleMap[cfg.role] || "Unknown"} | ⏱️ Cooldown: ${cfg.countDown || 1}s 🕒`,
        `🚀 Version: ${cfg.version || "1.0"} | 👨‍💻 Author: rayd 😊`,
        `💡 Usage: .${usage} 📚`,
        `🔧 Options: .help ${cfg.name.toLowerCase()} [-u | -i | -a] 🤔`
      ].join("\n");
      return message.reply(card);
    } catch (err) {
      console.error("HELP CMD ERROR:", err);
      return message.reply(`⚠️ Error: ${err.message || err} 😔`);
    }
  }
};
