import { createCommandConfig, logger } from 'robo.js'

export const config = createCommandConfig({
	description: '...'
})

export default (interaction) => {
	logger.info(`Biology list used by ${interaction.user.tag}`)
}