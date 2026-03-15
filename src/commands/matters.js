import { createCommandConfig, logger } from 'robo.js';
import { AttachmentBuilder } from 'discord.js';
import path from 'path';

export const config = createCommandConfig({
    description: 'I LOVE U YUJI!!!',
    options: [{
        name: 'question',
        description: 'he decides',
        type: 'string',
        required: true
    }]
});

export default (interaction) => {
    logger.info(`Matters command used by ${interaction.user.tag}`);

    const question = interaction.options.getString('question');
    const images = [
        './src/assets/DoesItMatter.jpg',
        './src/assets/IDontCare.png',
        './src/assets/IDontCareYuji.png',
        './src/assets/ItDoesntMatter.png',
        './src/assets/ItMatters.jpg',
        './src/assets/Leash.jpg'
    ];

    const chosenImage = images[Math.floor(Math.random() * images.length)];
    const attachment = new AttachmentBuilder(path.resolve(chosenImage));

    interaction.reply({ content: `> ${question}`, files: [attachment] });
};