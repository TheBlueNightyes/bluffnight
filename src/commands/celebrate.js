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
    description: 'HAPPY BIRTHDAYY!!!! MY DAY!!!'
})

export default (interaction) => {
    logger.info(`${interaction.user} celebrated bluffnight's birthday!`)
    const data = loadEconomyData();
    const guildId = interaction.guild.id
    const userId = interaction.user.id;

    if (!data[guildId]) data[guildId] = {};
    if (!data[guildId].users) data[guildId].users = {};
    if (!data[guildId].users[userId]) {
        data[guildId].users[userId] = { 
            crack: 0, 
            fentanyl: 0, 
            lastCollect: 0, 
            inventory: [], 
            redeemed: [] 
        };
    }

    const rewards = [
        50_000, 75_000, 100_000, 250_000, 500_000, 1_000_000,
    ];
    const reward = rewards[Math.floor(Math.random() * rewards.length)];

    data[guildId].users[userId].crack += reward;
    saveEconomyData(data);

    const embed = new EmbedBuilder()
        .setTitle('bluffnight is happy u celebrated!! enjoy the gifts!')
        .setColor('#00BFFF')
        .setDescription(`${interaction.user}, bluffnight gave u **${reward.toLocaleString()}** Crack!`)
        .setTimestamp();

    interaction.reply({ embeds: [embed] });
}