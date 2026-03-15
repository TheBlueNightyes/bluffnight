import { createCommandConfig, logger } from 'robo.js'

export const config = createCommandConfig({
	description: 'I LOVE U YUJI!!!',
    options: [{
		name: 'question',
		description: 'he decides',
		type: 'string',
		required: true
	}]
})

export default (interaction) => {
    logger.info(`Matters command used by ${interaction.user.tag}`);
    const question = interaction.options.getString('question');
	const image = [
		'./src/assets/DoesItMatter.jpg',
        './src/assets/IDontCare.png',
		'./src/assets/IDontCareYuji.png',
        './src/assets/ItDoesntMatter.png',
        './src/assets/ItMatters.jpg',
        './src/assets/Leash.jpg'
	];

	const chosenImage = image[Math.floor(Math.random() * image.length)];
	interaction.reply(`> ${question}\n${chosenImage}`)
}