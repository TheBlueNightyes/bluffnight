import { createCommandConfig, logger } from 'robo.js'

export const config = createCommandConfig({
	description: 'we know what you did, I can smell you'
})

export default (interaction) => {
	logger.info(`I cant smell you's actions discovered by ${interaction.user}`)
	const crime = [
"https://media.discordapp.net/attachments/1283954439551451241/1322428835211513908/image.png?ex=67c33d13&is=67c1eb93&hm=7c38efca0b8e89b0b288edd144c2c5195b12de9c545f30cb7af26d13474dcb72&=&format=webp&quality=lossless&width=967&height=544"
];

	const result = crime[Math.floor(Math.random() * crime.length)];
	interaction.reply(`${result}`)
}
