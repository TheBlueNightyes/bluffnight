import { EmbedBuilder } from 'discord.js';
import { createCommandConfig, logger } from 'robo.js'

export const config = createCommandConfig({
    description: 'this ones hot.',
    options: [{
        name: 'allignment',
        description: 'where does your allegiance fall?',
        type: 'string',
        choices: [
            { name: 'democrack', value: 'democrack' },
            { name: 'liberal', value: 'liberal' },
            { name: 'republican', value: 'republican' },
            { name: 'tribalist', value: 'tribalist' },
            { name: 'technocrat', value: 'technocrat' }
        ],
        required: true
    }]
})

export default (interaction) => {
    logger.info(`${interaction.user} has alligned`)

    const embed = new EmbedBuilder()
        .setTitle('allignment')
        .setColor('#00AAFF')
        .setDescription(`democrack: liberal: republican: tribalist: technocrat:`)
        .setTimestamp();

    interaction.reply({ embeds: [embed] });
}