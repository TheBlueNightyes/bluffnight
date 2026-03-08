import fs from 'fs';
import path from 'path';
import { EmbedBuilder } from 'discord.js';
import { createCommandConfig, logger } from 'robo.js';

const ECONOMY_FILE = path.resolve('src/storage/economy.json');
const HOUSE_FILE = path.resolve('src/storage/house.json');

function loadJSON(filePath) {
    if (!fs.existsSync(filePath)) return {};
    const raw = fs.readFileSync(filePath, 'utf-8').trim();
    if (!raw) return {};
    try {
        return JSON.parse(raw);
    } catch (err) {
        logger.error(`Failed to parse ${filePath}:`, err);
        return {};
    }
}

// Hardcoded categories to match your JSON exactly
const CATEGORY_CHOICES = [
    { name: 'DEMOCRACKIA', value: 'DEMOCRACKIA' },
    { name: 'SUPER EARTH', value: 'SUPER EARTH' },
    { name: 'Downtown', value: 'Downtown' },
    { name: 'BlueNight Avenue', value: 'BlueNight Avenue' },
    { name: 'Sunset Boulevard', value: 'Sunset Boulevard' }
];

export const config = createCommandConfig({
    description: 'Check your house or browse houses',
    options: [
        {
            name: 'category',
            description: 'Browse houses by location',
            type: 'string',
            required: false,
            choices: CATEGORY_CHOICES
        }
    ]
});

export default async (interaction) => {
    const data = loadJSON(ECONOMY_FILE);
    const houses = loadJSON(HOUSE_FILE);
    const selectedCategory = interaction.options.getString('category')?.trim();

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

    const userData = data[guildId].users[userId];
    const embed = new EmbedBuilder()
        .setColor('#00BFFF')
        .setTimestamp();

    // === USER OWNS A HOUSE ===
    if (userData.house) {
        const ownedHouse = Object.entries(houses).find(([category, catHouses]) =>
            Object.keys(catHouses).includes(userData.house)
        );

        if (ownedHouse) {
            const [categoryName, catHouses] = ownedHouse;
            const houseData = catHouses[userData.house];

            embed.setTitle(`${interaction.user.username}'s House`);
            embed.setDescription(`🏠 **${userData.house}** (${categoryName})`);

            const fields = [];
            if (houseData.crack) fields.push({ name: '💎 Crack', value: houseData.crack.toLocaleString(), inline: true });
            if (houseData.fentanyl) fields.push({ name: '💊 Fentanyl', value: houseData.fentanyl.toLocaleString(), inline: true });

            if (fields.length) embed.addFields(fields);
        } else {
            embed.setTitle(`${interaction.user.username}'s House`);
            embed.setDescription(`🏠 **${userData.house}** (Unknown category)`);
        }

    // === USER SELECTS A CATEGORY ===
    } else if (selectedCategory) {
        const categoryHouses = houses[selectedCategory];

        if (!categoryHouses) {
            return interaction.reply({
                content: "⚠️ That category doesn't exist.",
                ephemeral: true
            });
        }

        embed.setTitle(`🏘 Houses in ${selectedCategory}`);
        embed.setDescription('Here are the available houses:');

        // Sort houses alphabetically
        const sortedHouses = Object.entries(categoryHouses).sort(([a], [b]) => a.localeCompare(b));

        for (const [name, info] of sortedHouses) {
            const fields = [];
            fields.push({ name: '💎 Crack', value: info.crack?.toLocaleString() || '0', inline: true });
            fields.push({ name: '💊 Fentanyl', value: info.fentanyl?.toLocaleString() || '0', inline: true });

            embed.addFields({
                name,
                value: fields.map(f => `${f.name}: ${f.value}`).join(' | '),
                inline: false
            });
        }

    // === NO HOUSE & NO CATEGORY ===
    } else {
        embed.setTitle(`${interaction.user.username}'s House`);
        embed.setDescription(
            "You don’t own a house yet.\n\nUse `/house category:<location>` to browse houses."
        );
    }

    return interaction.reply({ embeds: [embed] });
};