import fs from 'fs';
import path from 'path';
import { EmbedBuilder } from 'discord.js';
import { createCommandConfig, logger } from 'robo.js';

const ECONOMY_FILE = path.resolve('src/storage/economy.json');

function loadEconomyData() {
    if (!fs.existsSync(ECONOMY_FILE)) {
        return {};
    }

    const raw = fs.readFileSync(ECONOMY_FILE, 'utf-8').trim();
    if (!raw) return {};

    try {
        return JSON.parse(raw);
    } catch (err) {
        logger.error('Failed to parse economy.json:', err);
        return {};
    }
}

function saveEconomyData(data) {
    try {
        fs.writeFileSync(ECONOMY_FILE, JSON.stringify(data, null, 2), 'utf-8');
        logger.info('Economy data saved.');
    } catch (err) {
        logger.error('Failed to save economy data:', err);
    }
}

export const config = createCommandConfig({
    description: 'hard day\'s work',
    options: [
        {
            name: 'material',
            description: 'the special',
            type: 'string',
            required: true,
            choices: [
                { name: 'Plutonium', value: 'plutonium' },
                { name: 'Uranium', value: 'uranium' },
                { name: 'Steel', value: 'steel' },
                { name: 'Chromium', value: 'chromium' },
                { name: 'Tungsten', value: 'tungsten' }
            ]
        }
    ]
});

export default (interaction) => {
    const material = interaction.options.getString('material');
    logger.info(`${material} harvested by ${interaction.user}`);

    const data = loadEconomyData();
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;

    if (!data[guildId]) data[guildId] = {};
    if (!data[guildId].users) data[guildId].users = {};
    if (!data[guildId].users[userId]) {
        data[guildId].users[userId] = { 
            materials: {},
            lastCollect: 0,
            inventory: [],
            redeemed: []
        };
    }

    if (!data[guildId].users[userId].materials) {
        data[guildId].users[userId].materials = {};
    }

    if (!data[guildId].users[userId].materials[material]) {
        data[guildId].users[userId].materials[material] = 0;
    }

    const rewards = [
        5, 10, 25, 50
    ];

    const reward = rewards[Math.floor(Math.random() * rewards.length)];

    data[guildId].users[userId].materials[material] += reward;

    saveEconomyData(data);

    const embed = new EmbedBuilder()
        .setTitle('Harvest Complete!')
        .setColor('#00BFFF')
        .setDescription(`${interaction.user}, you harvested **${reward.toLocaleString()}** ${material}!`)
        .setTimestamp();

    interaction.reply({ embeds: [embed] });
};