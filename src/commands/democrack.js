import { createCommandConfig, logger } from 'robo.js'

export const config = createCommandConfig({
	description: 'WE ARE THE DEMOCRACKS. AND WE. LOVE. CRACK'
})

export default (interaction) => {
	logger.info(`Democrack command used by ${interaction.user}`)

	interaction.reply('https://cdn.discordapp.com/attachments/1316608373424128001/1331823301835882691/cat.gif?ex=6793049b&is=6791b31b&hm=86a776d559c2a7cfb47a72d19c449f65f111bf3e42ad5b67a3aeb2eac6ff31fc&')
}
