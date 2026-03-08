// // src/ailistener.js
// import { client, logger } from 'robo.js';
// import { askGemini } from './utils/gemini.js';

// // Replace with your AI channel ID
// const AI_CHANNEL_ID = '1386794673309356183';

// // Simple per-user cooldown map (5 sec)
// const cooldowns = new Map();

// // Run once at startup to log
// logger.info(`AI Listener initialized for channel ${AI_CHANNEL_ID}`);

// client.on('messageCreate', async (message) => {
//   if (message.author.bot) return;
//   if (message.channel.id !== AI_CHANNEL_ID) return;

//   // Cooldown check
//   const now = Date.now();
//   const last = cooldowns.get(message.author.id) || 0;
//   if (now - last < 5000) return;
//   cooldowns.set(message.author.id, now);

//   logger.info(`AI received a message from ${message.author.tag}: ${message.content}`);

//   try {
//     // Optional: typing indicator
//     await message.channel.sendTyping();

//     const systemPrompt = `
// You are Bluffnight AI.
// You are sarcastic, analytical, and obsessed with risk, probability, and gambling metaphors.
// Keep responses under 150 words.
// Do not break character.
//     `;

//     const prompt = `
// User: ${message.author.username}
// Message: ${message.content}
//     `;

//     const reply = await askGemini(systemPrompt + "\n\n" + prompt);

//     if (reply) {
//       logger.info(`AI responding to ${message.author.tag}: ${reply}`);
//       await message.reply(reply);
//     }
//   } catch (err) {
//     logger.error(`AI error: ${err}`);
//     await message.reply("The AI folded under pressure.");
//   }
// });