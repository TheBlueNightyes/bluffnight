import { createCommandConfig, logger } from 'robo.js'

export const config = createCommandConfig({
	description: 'play with the devil'
})

const result = [
    "🪙 Heads",
    "🪙 Tails"
    ];

export default (interaction) => {
	logger.info(`Coin flipped by ${interaction.user}`)
    const side = result[Math.floor(Math.random() * result.length)];
	interaction.reply(`${side}`);
};
