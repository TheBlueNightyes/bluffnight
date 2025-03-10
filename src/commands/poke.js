import { createCommandConfig, logger } from 'robo.js'

export const config = createCommandConfig({
	description: 'this is cruel'
})

export default (interaction) => {
	logger.info(`Poked by ${interaction.user}`)
	interaction.reply('wtf man')
}
