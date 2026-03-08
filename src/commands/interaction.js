import fs from 'fs';
import path from 'path';
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

function ensureUser(data, guildId, userId) {
    if (!data[guildId]) data[guildId] = {};
    if (!data[guildId].users) data[guildId].users = {};
    if (!data[guildId].users[userId]) {
        data[guildId].users[userId] = {
            partner: null,
            list: null,
            ideology: null
        };
    }
    return data[guildId].users[userId];
}

const VALUES = {
    hug: 1,
    kiss: 3,
    date: 5,
    dance: 2
};

export const config = createCommandConfig({
    description: 'experience',
    options: [
        {
            name: 'interaction',
            description: 'wholesome',
            type: 'string',
            choices: [
                { name: 'hug', value: 'hug' },
                { name: 'kiss', value: 'kiss' },
                { name: 'date', value: 'date' },
                { name: 'dance', value: 'dance' }
            ],
            required: true
        },
        {
            name: 'user',
            description: 'target',
            type: 'user',
            required: true
        }
    ]
});

export default async (interaction) => {
    logger.info(`interaction used by ${interaction.user}`);
    const target = interaction.options.getUser('user');
    const type = interaction.options.getString('interaction');

    const messages = {
        hug: `${interaction.user} hugged ${target}!`,
        kiss: `${interaction.user} kissed ${target}! 💋`,
        date: `${interaction.user} went on a date with ${target}! 🍷🍽️`,
        dance: `${interaction.user} danced with ${target}! 💃🕺`
    };

    // Always reply first
    const baseMessage = messages[type] || `${interaction.user} interacted with ${target}`;

    // Marriage points logic
    const data = loadPeopleData();
    const guildId = interaction.guild.id;

    const initiator = ensureUser(data, guildId, interaction.user.id);
    const receiver = ensureUser(data, guildId, target.id);

    // Check if initiator is married to the target
    if (
        initiator.partner &&
        initiator.partner.id === target.id &&
        receiver.partner &&
        receiver.partner.id === interaction.user.id
    ) {
        const value = VALUES[type] || 1;

        initiator.partner.points = (initiator.partner.points || 0) + value;
        receiver.partner.points = (receiver.partner.points || 0) + value;

        savePeopleData(data);

        logger.info(
            `Marriage points increased by ${value} for ${interaction.user.id} and ${target.id}`
        );

        return interaction.reply(
            `${baseMessage}\n> +${value} marriage point${value > 1 ? 's' : ''}`
        );
    }
};
