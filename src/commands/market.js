import fs from 'fs';
import path from 'path';
import { EmbedBuilder } from 'discord.js';
import { createCommandConfig, logger } from 'robo.js';

const ECONOMY_FILE = path.resolve('src/storage/economy.json');
const MARKET_FILE = path.resolve('src/storage/market.json');

function loadJSON(file) {
    if (!fs.existsSync(file)) return {};
    const raw = fs.readFileSync(file, 'utf-8').trim();
    if (!raw) return {};
    try {
        return JSON.parse(raw);
    } catch (err) {
        logger.error(`Failed to parse ${file}:`, err);
        return {};
    }
}

function saveJSON(file, data) {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
        logger.info(`Saved ${file}`);
    } catch (err) {
        logger.error(`Failed to save ${file}:`, err);
    }
}

function getUserData(econData, guildId, userId) {
    if (!econData[guildId]) econData[guildId] = { users: {} };

    if (!econData[guildId].users[userId]) {
        econData[guildId].users[userId] = {
            crack: 0,
            fentanyl: 0,
            lastCollect: 0,
            inventory: {
                weapons: [],
                items: []
            }
        };
    }

    const userData = econData[guildId].users[userId];

    if (Array.isArray(userData.inventory)) {
        userData.inventory = {
            weapons: [],
            items: userData.inventory
        };
    }

    if (!userData.inventory) userData.inventory = {};
    if (!userData.inventory.weapons) userData.inventory.weapons = [];
    if (!userData.inventory.items) userData.inventory.items = [];

    if (typeof userData.crack !== 'number') userData.crack = 0;
    if (typeof userData.fentanyl !== 'number') userData.fentanyl = 0;
    if (typeof userData.lastCollect !== 'number') userData.lastCollect = 0;

    return userData;
}

export const config = createCommandConfig({
    description: 'the markets r up',
    options: [
        {
            name: 'type',
            description: 'bit of everything',
            type: 'string',
            choices: [
                { name: 'sell', value: 'sell' },
                { name: 'view', value: 'view' },
                { name: 'buy', value: 'buy' }
            ],
            required: true
        },
        {
            name: 'name',
            description: 'marketable',
            type: 'string',
            required: false
        },
        {
            name: 'price',
            description: 'oof',
            type: 'integer',
            required: false
        },
        {
            name: 'currency',
            description: 'few few few',
            type: 'string',
            choices: [
                { name: 'crack', value: 'crack' },
                { name: 'fentanyl', value: 'fentanyl' }
            ],
            required: false
        },
        {
            name: 'description',
            description: 'moronic',
            type: 'string',
            required: false
        }
    ]
});

export default async (interaction) => {
    const type = interaction.options.getString('type');
    const name = interaction.options.getString('name');
    const price = interaction.options.getInteger('price');
    const desc = interaction.options.getString('description');
    const currency = interaction.options.getString('currency') || 'crack';

    const market = loadJSON(MARKET_FILE);
    const economy = loadJSON(ECONOMY_FILE);
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;
    const userTag = interaction.user.tag;
    const userData = getUserData(economy, guildId, userId);

    logger.info(`market:${type} used by ${userTag}`);

    if (type === 'sell') {
        if (!name || !price || !desc) {
            return interaction.reply('❌ You must provide `name`, `price`, and `description` to sell an item.');
        }

        if (!['crack', 'fentanyl'].includes(currency)) {
            return interaction.reply('❌ Invalid currency type. Choose either `crack` or `fentanyl`.');
        }

        if (!Array.isArray(market.listings)) market.listings = [];

        market.listings.push({
            seller: userTag,
            name,
            price,
            currency,
            desc
        });

        saveJSON(MARKET_FILE, market);
        return interaction.reply(`🛒 Listed **${name}** for ${price} ${currency}.`);
    }

    if (type === 'view') {
        if (!market.listings || market.listings.length === 0) {
            return interaction.reply('📭 The market is currently empty.');
        }

        const embed = new EmbedBuilder()
            .setTitle('🛒 Market Listings')
            .setColor('#00AAFF')
            .setTimestamp();

        for (const item of market.listings) {
            embed.addFields({
                name: `${item.name} — ${item.price.toLocaleString()} ${item.currency}`,
                value: `- ${item.desc}\n- ${item.seller}`,
                inline: false
            });
        }
        return interaction.reply({ embeds: [embed] });
    }

    if (type === 'buy') {
        if (!name) {
            return interaction.reply('❌ You must specify the `name` of the item you want to buy.');
        }

        if (!Array.isArray(market.listings)) market.listings = [];

        const index = market.listings.findIndex(i => i.name.toLowerCase() === name.toLowerCase());
        if (index === -1) {
            return interaction.reply(`❌ No item found with name "${name}".`);
        }

        const item = market.listings[index];
        const currencyKey = item.currency || 'crack';

        if (userData[currencyKey] < item.price) {
            return interaction.reply(`💸 You don’t have enough ${currencyKey} to buy this.`);
        }

        userData.inventory.items.push({
            name: item.name,
            seller: item.seller,
            desc: item.desc,
            price: item.price,
            currency: currencyKey,
            boughtAt: Date.now()
        });

        userData[currencyKey] -= item.price;
        market.listings.splice(index, 1);

        saveJSON(MARKET_FILE, market);
        saveJSON(ECONOMY_FILE, economy);

        return interaction.reply(`✅ You bought **${item.name}** from ${item.seller} for ${item.price} ${currencyKey}!`);
    }

    return interaction.reply('❌ Invalid action.');
};