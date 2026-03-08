import { createCommandConfig, logger } from 'robo.js'

export const config = createCommandConfig({
    description: 'not used for rigging elections'
})

export default (interaction) => {
    logger.info(`election being rigged by ${interaction.user}`)

    interaction.reply(`lemme think about it`)
}