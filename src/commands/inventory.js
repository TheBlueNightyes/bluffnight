import fs from 'fs';
import path from 'path';
import { EmbedBuilder } from 'discord.js';
import { createCommandConfig, logger } from 'robo.js';

const ECONOMY_FILE = path.resolve('src/storage/economy.json');

function loadEconomyData() {
    if (!fs.existsSync(ECONOMY_FILE)) return {};
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
});

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
            inventory: {
                weapons: [],
                items: []
            },
            redeemed: []
        };
    }

    const userData = data[guildId].users[userId];

    if (Array.isArray(userData.inventory)) {
        userData.inventory = {
            weapons: [],
            items: userData.inventory
        };
    }

    if (!userData.inventory.weapons) userData.inventory.weapons = [];
    if (!userData.inventory.items) userData.inventory.items = [];

    const embed = new EmbedBuilder()
        .setTitle(`${interaction.user.username}'s Inventory`)
        .setColor('#FFD700')
        .setTimestamp();

    const weapons = userData.inventory.weapons;
    const items = userData.inventory.items;

    if (weapons.length === 0 && items.length === 0) {
        embed.setDescription('🧺 Your inventory is empty.');
    } else {
        if (weapons.length > 0) {
            embed.addFields({
                name: '🔫 Weapons',
                value: weapons.map(w => `• ${w}`).join('\n'),
                inline: false
            });
        }

        if (items.length > 0) {
            embed.addFields({
                name: '📦 Items',
                value: items.map(item => {
                    if (typeof item === 'string') return `• ${item}`;
                    return `• ${item.name}\nFrom: ${item.seller || 'Unknown'}\nPrice: ${item.price?.toLocaleString() || 'N/A'} ${item.currency || ''}`;
                }).join('\n\n'),
                inline: false
            });
        }
    }

    return interaction.reply({ embeds: [embed] });
};