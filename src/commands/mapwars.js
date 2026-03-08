import { EmbedBuilder } from 'discord.js';
import { createCommandConfig, logger } from 'robo.js';

export const config = createCommandConfig({
    description: 'for glory!',
    options: [
        {
            name: 'name',
            description: 'this will be engraved in history!',
            type: 'string',
            required: true
        },
        {
            name: 'location',
            description: 'where will u start ur journey',
            type: 'string',
            required: true
        },
        {
            name: 'color',
            description: 'hex color code without the hashtag (#)',
            type: 'string',
            required: true
        },
        {
            name: 'government',
            description: 'how do u govern ur men',
            type: 'string',
            choices: [
                { name: 'kingdom', value: 'kingdom' },
                { name: 'empire', value: 'empire' },
                { name: 'federation', value: 'federation' },
                { name: 'republic', value: 'republic' },
                { name: 'tribal', value: 'tribal' },
                { name: 'theocracy', value: 'theocracy' }
            ],
            required: true
        },
        {
            name: 'economics',
            description: 'how does your economy function',
            type: 'string',
            choices: [
                { name: 'fishing and hunting', value: 'fishing and hunting' },
                { name: 'agricultural', value: 'agricultural' },
                { name: 'nomadic', value: 'nomadic' },
                { name: 'maritime', value: 'maritime' },
                { name: 'commercial', value: 'commercial' }
            ],
            required: true
        },
        {
            name: 'culture',
            description: 'choose your culture',
            type: 'string',
            choices: [
                { name: 'Leffathou', value: 'Leffathou' },
                { name: 'Ciestundu', value: 'Ciestundu' },
                { name: 'Oeczea', value: 'Oeczea' },
                { name: 'Wristhos', value: 'Wristhos' }
            ],
            required: true
        },
        {
            name: 'religion',
            description: 'select a religion',
            type: 'string',
            choices: [
                { name: 'atheist', value: 'atheist' },
                { name: 'aurora faith', value: 'aurora faith' },
                { name: 'isendril faith', value: 'isendril faith' },
                { name: 'seraphic faith', value: 'seraphic faith' },
                { name: 'rivendell faith', value: 'rivendell faith' },
                { name: 'christianity', value: 'christianity' },
                { name: 'islam', value: 'islam' },
                { name: 'buddhism', value: 'buddhism' }
            ],
            required: true
        }
    ]
});

export default async function (interaction) {
    logger.info(`${interaction.user.tag} created a mapwars nation`);

    const name = interaction.options.getString('name');
    const location = interaction.options.getString('location');
    const color = interaction.options.getString('color');
    const government = interaction.options.getString('government');
    const economics = interaction.options.getString('economics');
    const culture = interaction.options.getString('culture');
    const religion = interaction.options.getString('religion');

    const allowedGuildId = '1283954438868041728';
    if (interaction.guild?.id !== allowedGuildId) {
        const errorEmbed = new EmbedBuilder()
            .setTitle('❌ Not Allowed')
            .setDescription('This command can only be used in the main server.')
            .setColor('Red')
            .setTimestamp();

        return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    // Validate color input
    const hexColor = `#${color}`;
    const isValidHex = /^#?[0-9A-F]{6}$/i.test(hexColor);

    const embed = new EmbedBuilder()
        .setTitle(`🏰 ${name}`)
        .setDescription([
            `📍 **Location:** ${location}`,
            `🎨 **Color:** ${isValidHex ? hexColor : '*Invalid Color*'}`,
            `🏛️ **Government:** ${government}`,
            `🌾 **Economics:** ${economics}`,
            `🎭 **Culture:** ${culture}`,
            `🙏 **Religion:** ${religion}`
        ].join('\n'))
        .setColor(isValidHex ? hexColor : '#AAAAAA');
	await interaction.deferReply()

    await interaction.channel.send({ embeds: [embed] });
    await interaction.deleteReply()
}