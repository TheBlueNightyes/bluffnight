import { createCommandConfig, logger } from 'robo.js'

export const config = createCommandConfig({
	description: 'disturb him'
})

export default (interaction) => {
	logger.info(`Ping command used by ${interaction.user}`)

	interaction.reply(`I AM HERE!`)
}
