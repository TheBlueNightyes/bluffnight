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

// 🔑 Helper: ensure guild + user entry exist, with defaults
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

const IDEOLOGIES = [
    'democrack',
    'liberal',
    'republican',
    'tribalist',
    'technocrat'
];

export const config = createCommandConfig({
    description: 'Choose or view your ideological alignment.',
    options: [{
        name: 'alignment',
        description: 'Choose your ideology.',
        type: 'string',
        choices: IDEOLOGIES.map(id => ({ name: id, value: id })),
        required: false
    }]
});

export default async (interaction) => {
    const chosen = interaction.options.getString('alignment');
    const data = loadPeopleData();
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;

    // Ensure user entry always exists
    const userEntry = ensureUser(data, guildId, userId);

    if (chosen) {
        userEntry.ideology = chosen;
        savePeopleData(data);

        const embed = new EmbedBuilder()
            .setTitle('🗳️ Ideology Updated')
            .setColor('#00AAFF')
            .setDescription(`You are now a **${chosen}**.`)
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }

    // Group users by ideology
    const users = data[guildId]?.users || {};
    const entries = Object.entries(users).filter(([id, userData]) => userData.ideology);

    if (entries.length === 0) {
        return interaction.reply({
            embeds: [new EmbedBuilder()
                .setTitle('📜 Ideology Alignments')
                .setColor('#00AAFF')
                .setDescription('No alignments recorded yet.')
                .setTimestamp()
            ]
        });
    }

    const grouped = {};
    for (const id of IDEOLOGIES) grouped[id] = [];
    for (const [id, userData] of entries) {
        if (IDEOLOGIES.includes(userData.ideology)) {
            grouped[userData.ideology].push(id);
        }
    }

    let description = '';
    for (const ideology of IDEOLOGIES) {
        const userIds = grouped[ideology];
        if (userIds.length === 0) continue;

        description += `**${ideology}**\n`;

        const names = await Promise.all(userIds.map(async (id, idx) => {
            const member = await interaction.guild.members.fetch(id).catch(() => null);
            const name = member?.user?.username || `Unknown User (${id})`;
            return `\`${idx + 1}.\` ${name}`;
        }));

        description += names.join('\n') + '\n\n';
    }

    const embed = new EmbedBuilder()
        .setTitle('📜 Ideology Alignments')
        .setColor('#00AAFF')
        .setDescription(description.trim())
        .setTimestamp();

    return interaction.reply({ embeds: [embed] });
};