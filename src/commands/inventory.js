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

export const config = createCommandConfig({
    description: 'loaded'
})

export default async (interaction) => {
    const data = loadEconomyData();
    const guildId = interaction.guild.id;
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

    const userData = data[guildId].users[userId]
    const inventory = userData.inventory || [];
    const embed = new EmbedBuilder()
        .setTitle(`${interaction.user.username}'s Inventory`)
        .setColor('#FFD700')
        .setTimestamp();
    if (inventory.length === 0) {
        embed.setDescription('🧺 Your inventory is empty.');
    } else {
        for (const item of inventory) {
            embed.addFields({
                name: item.name,
                value: `From: ${item.seller}\nDescription: ${item.desc}\nPrice: ${item.price.toLocaleString()} ${item.currency}\nTime: ${new Date(item.boughtAt).toLocaleDateString('en-US')}`,
                inline: false
            });
        }
    }
    return interaction.reply({ embeds: [embed] });
};