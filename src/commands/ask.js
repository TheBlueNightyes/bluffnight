import { createCommandConfig, logger } from 'robo.js'
import { askGemini } from "../utils/gemini.js";

export const config = createCommandConfig({
    description: 'MY TIME. MINE',
    options: [
        {
            name: 'message',
            description: 'he awakes',
            type: 'string',
            required: true,
        },
    ],
});

export default async (interaction) => {
    await interaction.deferReply(); // ALWAYS FIRST

    try {
        const message = interaction.options.getString("message");

        logger.info(`${interaction.user.tag} spoke to Bluffnight AI.`);

        const systemPrompt = `
You are Bluffnight AI.
speak brainrot and use like a ton of tiktok abbreviations
things like "ts" for this or "pmo" for piss me off or "cuz" for because :)
oh and be very lobotomized
Keep responses under 350 words.
Do not break character.

tHROUGHTOUT the message say "**HELP**" no spaces just like within the response randomly
        `;

        const fullPrompt = `
User: ${interaction.user.username}
Message: ${message}
        `;

        const reply = await askGemini(systemPrompt + "\n\n" + fullPrompt);

        await interaction.editReply(reply || "The house is silent...");
    } catch (err) {
        console.error(err);

        if (interaction.deferred || interaction.replied) {
            await interaction.editReply("The AI folded under pressure.");
        }
    }
}