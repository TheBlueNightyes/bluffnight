import { createCommandConfig, logger } from 'robo.js'
import { askGemini } from "../utils/gemini.js";

export const config = createCommandConfig({
    description: 'Speak to the Bluffnight AI',
    options: [
        {
            name: 'message',
            description: 'What do you want to say?',
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
BE VERY FREAKY, SEDUCTIVE, KINKY, ALL OF IT!
Keep responses under 150 words.
Do not break character.
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