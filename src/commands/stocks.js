import fs from 'fs';
import path from 'path';
import { EmbedBuilder } from 'discord.js';
import { createCommandConfig } from 'robo.js';
import { generateStockChart } from '../systems/stockChart.js';

const STOCKS_FILE = path.resolve('src/storage/stocks.json');
const ECONOMY_FILE = path.resolve('src/storage/economy.json');

function loadJSON(file) {
    if (!fs.existsSync(file)) return {};
    const raw = fs.readFileSync(file, 'utf-8').trim();
    return raw ? JSON.parse(raw) : {};
}

function saveJSON(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function createResponder(interaction) {
    let replied = false;

    return async (payload) => {
        if (replied) return;
        replied = true;

        return interaction.reply(payload);
    };
}

export const config = createCommandConfig({
    description: 'stocks ig',
    options: [
        {
            name: 'mode',
            description: 'can be used to see cool stuff',
            type: 'string',
            required: true,
            choices: [
                { name: 'view', value: 'view' },
                { name: 'buy', value: 'buy' },
                { name: 'sell', value: 'sell' },
                { name: 'portfolio', value: 'portfolio' }
            ]
        },
        {
            name: 'stock',
            description: 'somewhat important',
            type: 'string',
            required: false
        },
        {
            name: 'amount',
            description: 'money to burn',
            type: 'integer',
            required: false
        }
    ]
});

export default async (interaction) => {
    const respond = createResponder(interaction);

    const mode = interaction.options.getString('mode');
    const stockId = interaction.options.getString('stock')?.toUpperCase();
    const amount = interaction.options.getInteger('amount');

    const guildId = interaction.guild.id;
    const userId = interaction.user.id;

    const stocks = loadJSON(STOCKS_FILE);
    const economy = loadJSON(ECONOMY_FILE);

    if (!economy[guildId]) economy[guildId] = {};
    if (!economy[guildId].users) economy[guildId].users = {};
    if (!economy[guildId].users[userId]) {
        economy[guildId].users[userId] = {
            crack: 0,
            fentanyl: 0,
            lastCollect: 0,
            inventory: [],
            redeemed: [],
            stocks: {}
        };
    }

    const user = economy[guildId].users[userId];

    if (mode === 'view') {
        const stockArray = Object.entries(stocks).map(([id, stock]) => {
            const history = stock.history || [];
            const oldPrice = history.length > 1
                ? history[history.length - 2]
                : stock.price;

            const change = ((stock.price - oldPrice) / oldPrice) * 100;

            return { id, ...stock, change };
        });

        stockArray.sort((a, b) => b.change - a.change);

        if (stockId) {
            const stock = stocks[stockId];
            if (!stock) return respond({ content: 'Stock not found.', ephemeral: true });

            const history = stock.history || [];

            const holding = user.stocks?.[stockId] || { shares: 0, avgPrice: 0 };

            const shares = holding.shares;
            const avgPrice = holding.avgPrice;

            const profit = (stock.price * shares) - (avgPrice * shares);

            const profitEmoji =
                profit > 0 ? '📈' :
                profit < 0 ? '📉' : '➖';

            const embed = new EmbedBuilder()
                .setTitle(`📈 ${stock.name}`)
                .setColor(0x00b0f4)
                .addFields(
                    { name: 'Price', value: `${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} crack`, inline: true },
                    { name: 'Trend', value: `${stock.trend}`, inline: true },

                    { name: '📦 Your Shares', value: `${shares.toLocaleString()}`, inline: true },
                    { name: '💰 Avg Buy Price', value: `${avgPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} crack`, inline: true },
                    { name: '📊 Profit / Loss', value: `${profitEmoji} ${profit.toLocaleString()} crack`, inline: true }
                );

            const chartBuffer = generateStockChart(history);

            return respond({
                embeds: [embed.setImage('attachment://chart.png')],
                files: [{ attachment: chartBuffer, name: 'chart.png' }]
            });
        }

        const description = stockArray.map((stock, index) => {
            const emoji =
                stock.change > 0 ? '📈' :
                stock.change < 0 ? '📉' : '➖';

            return `**${index + 1}. ${stock.name}** ${emoji} ${stock.price.toFixed(2)} crack • ${stock.change.toFixed(2)}%`;
        }).join('\n\n');

        return respond({
            embeds: [
                new EmbedBuilder()
                    .setTitle('📊 Stock Market')
                    .setDescription(description)
                    .setColor(0x00b0f4)
            ]
        });
    }

    if (mode === 'buy') {
        if (!stockId || !amount) {
            return respond({ content: 'Usage: /stocks buy <stock> <amount>', ephemeral: true });
        }

        const stock = stocks[stockId];
        if (!stock) return respond({ content: 'Stock not found.', ephemeral: true });

        const cost = stock.price * amount;

        if ((user.crack ?? 0) < cost) {
            return respond({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Insufficient Funds')
                        .setColor('#FF5555')
                        .setDescription(`Not enough crack.`)
                ],
                ephemeral: true
            });
        }

        const prePrice = stock.price;

        user.crack -= cost;

        if (!user.stocks) user.stocks = {};
        if (!user.stocks[stockId]) {
            user.stocks[stockId] = { shares: 0, avgPrice: 0 };
        }

        const holding = user.stocks[stockId];

        const totalCost =
            (holding.avgPrice * holding.shares) + (prePrice * amount);

        holding.shares += amount;
        holding.avgPrice = totalCost / holding.shares;

        const rawImpact = Math.log10(amount + 1) * 0.01;
        const finalImpact = Math.min(rawImpact, 0.08);

        stock.price *= (1 + finalImpact);
        stock.price = Math.max(1, Math.min(stock.price, 1_000_000));
        stock.price = Number(stock.price.toFixed(2));

        saveJSON(ECONOMY_FILE, economy);

        return respond({
            embeds: [
                new EmbedBuilder()
                    .setTitle('📈 Stock Purchase')
                    .setColor('#00ff99')
                    .addFields(
                        { name: 'Stock', value: `${stockId}`, inline: true },
                        { name: 'Shares Bought', value: `${amount.toLocaleString()}`, inline: true },
                        { name: 'Price Per Share', value: `${prePrice.toFixed(2)} crack`, inline: true },

                        { name: 'Total Spent', value: `${cost.toLocaleString()} crack`, inline: true },
                        { name: 'New Balance', value: `${user.crack.toLocaleString()} crack`, inline: true }
                    )
            ]
        });
    }

    if (mode === 'sell') {
        if (!stockId || !amount) {
            return respond({ content: 'Usage: /stocks sell <stock> <amount>', ephemeral: true });
        }

        const stock = stocks[stockId];
        if (!stock) return respond({ content: 'Stock not found.', ephemeral: true });

        const holding = user.stocks[stockId];
        if (!holding || holding.shares < amount) {
            return respond({ content: 'Not enough shares.', ephemeral: true });
        }

        const prePrice = stock.price;

        const costBasis = holding.avgPrice * amount;
        const marketValue = prePrice * amount;

        const profit = marketValue - costBasis;

        const profitEmoji =
            profit > 0 ? '📈' :
            profit < 0 ? '📉' : '➖';

        const revenue = marketValue;

        const rawImpact = Math.log10(amount + 1) * 0.01;
        const finalImpact = Math.min(rawImpact, 0.08);

        stock.price *= (1 - finalImpact);
        stock.price = Math.max(1, Math.min(stock.price, 1_000_000));
        stock.price = Number(stock.price.toFixed(2));

        holding.shares -= amount;

        if (holding.shares === 0) {
            delete user.stocks[stockId];
        }

        user.crack += revenue;
        saveJSON(ECONOMY_FILE, economy);

        return respond({
            embeds: [
                new EmbedBuilder()
                    .setTitle('📉 Stock Sale')
                    .setColor('#ff5555')
                    .addFields(
                        { name: 'Stock', value: `${stockId}`, inline: true },
                        { name: 'Shares Sold', value: `${amount.toLocaleString()}`, inline: true },
                        { name: 'Price Per Share', value: `${prePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} crack`, inline: true },

                        { name: 'Total Earned', value: `${revenue.toLocaleString()} crack`, inline: true },
                        { name: 'Profit / Loss', value: `${profitEmoji} ${profit.toLocaleString()} crack`, inline: true },

                        { name: 'New Balance', value: `${user.crack.toLocaleString()} crack`, inline: true }
                    )
            ]
        });
    }

    if (mode === 'portfolio') {
        const holdings = user.stocks || {};

        const entries = Object.entries(holdings).map(([id, holding]) => {
            const stock = stocks[id];
            if (!stock) return null;

            const totalSharesInMarket = stock.totalShares || 0;

            const value = holding.shares * stock.price;
            const profit = (stock.price - holding.avgPrice) * holding.shares;

            return {
                name: stock.name,
                id,
                shares: holding.shares,
                avgPrice: holding.avgPrice,
                value,
                profit,
                totalSharesInMarket
            };
        })
        .filter(Boolean);

        entries.sort((a, b) => b.profit - a.profit);

        let totalValue = 0;

        const lines = entries.map((s, index) => {
            totalValue += s.value;

            const profitEmoji =
                s.profit > 0 ? "📈" :
                s.profit < 0 ? "📉" : "➖";

            const maxBar = 20;

            const topProfit = entries[0]?.profit || 1;

            const ratio = topProfit !== 0 ? s.profit / topProfit : 0;

            const barFill = Math.max(1, Math.round(Math.abs(ratio) * maxBar));
            const bar = "█".repeat(barFill) + "░".repeat(maxBar - barFill);

            return `**${index + 1}. ${s.name}**
            📈 ${s.shares.toLocaleString()} shares @ ${s.avgPrice.toFixed(2)} crack
            💰 Value: ${s.value.toLocaleString()} crack
            ${profitEmoji} ${s.profit.toLocaleString()} crack
            ${bar}`;
        });

        const userPortfolio = interaction.user.username

        return respond({
            embeds: [
                new EmbedBuilder()
                    .setColor(0x00b0f4)
                    .setDescription(
                        lines.length ? lines.join('\n\n') : "No investments yet."
                    )
                    .addFields({
                        name: "Total Portfolio Value",
                        value: `${Math.round(totalValue).toLocaleString()} crack`,
                        inline: true
                    })
                    .setAuthor({ 
                        name: `${userPortfolio}'s Portfolio`, 
                        iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
                    })
                    .setTimestamp()
            ]
        });
    }
};