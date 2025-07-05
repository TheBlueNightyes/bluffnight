import fs from 'fs';
import path from 'path';
import { EmbedBuilder } from 'discord.js';
import { createCommandConfig, logger } from 'robo.js';

const PEOPLE_FILE = path.resolve('src/storage/people.json');

function loadPeopleData() {
    if (!fs.existsSync(PEOPLE_FILE)) return {};
    const raw = fs.readFileSync(PEOPLE_FILE, 'utf-8').trim();
    if (!raw) return {};

    try {
        return JSON.parse(raw);
    } catch (err) {
        logger.error('Failed to parse people.json:', err);
        return {};
    }
}

function savePeopleData(data) {
    try {
        fs.writeFileSync(PEOPLE_FILE, JSON.stringify(data, null, 2), 'utf-8');
        logger.info('People data saved.');
    } catch (err) {
        logger.error('Failed to save people data:', err);
    }
}

export const config = createCommandConfig({
    description: 'making a list, checking it twice!',
    options: [
        {
            name: 'user',
            description: 'target',
            type: 'user',
            required: true
        },
        {
            name: 'list',
            description: 'naughty or nice? be sure to check twice!',
            type: 'string',
            choices: [
                { name: 'nice list', value: 'nice' },
                { name: 'naughty list', value: 'naughty' }
            ],
            required: true
        }
    ]
});

export default async (interaction) => {
    logger.info(`list updated by ${interaction.user}`);

    const targetUser = interaction.options.getUser('user');
    const selectedList = interaction.options.getString('list');
    const data = loadPeopleData();
    const guildId = interaction.guild.id;
    const userId = targetUser.id;

    // Initialize structure
    if (!data[guildId]) data[guildId] = {};
    if (!data[guildId].users) data[guildId].users = {};
    if (!data[guildId].users[userId]) {
        data[guildId].users[userId] = {
            partner: null,
            list: null,
            redeemedCodes: []
        }
    }

    // Assign user to selected list
    data[guildId].users[userId].list = selectedList;

    // Get lists of users
    const niceList = [];
    const naughtyList = [];

    for (const [id, info] of Object.entries(data[guildId].users)) {
        const tag = await interaction.client.users.fetch(id).then(u => u.tag).catch(() => `Unknown (${id})`);
        if (info.list === 'nice') niceList.push(tag);
        else if (info.list === 'naughty') naughtyList.push(tag);
    }
    savePeopleData(data);

    const embed = new EmbedBuilder()
        .setTitle('🎄 Naughty & Nice List')
        .setColor(selectedList === 'nice' ? 'Green' : 'Red')
        .addFields(
            {
                name: '🎁 Nice List',
                value: niceList.length > 0 ? niceList.join('\n') : 'No one yet...',
                inline: true
            },
            {
                name: '🪓 Naughty List',
                value: naughtyList.length > 0 ? naughtyList.join('\n') : 'No one yet...',
                inline: true
            }
        )
        .setFooter({ text: `Updated by ${interaction.user.tag}` })
        .setTimestamp();

    return interaction.reply({
        content: `${targetUser} was placed on the **${selectedList} list**!`,
        embeds: [embed]
    });
};