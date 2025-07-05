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
    description: '99% quit before they win big'
})

export default (interaction) => {
    logger.info(`crack harvested by ${interaction.user}`)
    const crack = [
        "5 crack found"
    ];
    const crackStuff = crack[Math.floor(Math.random() * crack.length)];

    // const data = loadEconomyData();
    // const guildId = message.guild.id;
    // const userId = message.author.id;

    // const rewards = [
    //     5, 10, 50, 100, 250, 500, 750, 1_000, 1_500, 2_000,
    //     5_000, 7_500, 10_000, 20_000, 50_000, 75_000,
    //     100_000, 250_000, 500_000, 1_000_000,
    // ];
    // const reward = rewards[Math.floor(Math.random() * rewards.length)];

    // data[guildId].users[userId].crack += reward;
    // saveEconomyData(data);

    // const embed = new EmbedBuilder()
    //     .setTitle('Spin Complete!')
    //     .setColor('#00BFFF')
    //     .setDescription(`${interaction.user}, you won **${reward.toLocaleString()}** Crack!`)
    //     .setTimestamp();

    // interaction.reply({ embeds: [embed] });

    interaction.reply(`${crackStuff}`)
}