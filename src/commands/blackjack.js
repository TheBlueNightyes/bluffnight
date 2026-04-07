import fs from 'fs';
import path from 'path';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType } from 'discord.js';
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
    description: 'gamblers luck, right?',
    options: [{
        name: 'amount',
        description: 'ALL IN',
        type: 'integer',
        required: true,
    }]
});

export default async (interaction) => {
    logger.info(`blackjack played by ${interaction.user}`);

    const data = loadEconomyData();
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;
    const betAmount = interaction.options.getInteger('amount');

    function getUserData(data, guildId, userId) {
        if (!data || typeof data !== 'object') data = {};
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
        return data[guildId].users[userId];
    }

    function drawCard() {
        const cards = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11]; 
        return cards[Math.floor(Math.random() * cards.length)];
    }

    function handTotal(hand) {
        let total = hand.reduce((sum, card) => sum + card, 0);
        let aces = hand.filter(card => card === 11).length;
        while (total > 21 && aces > 0) {
            total -= 10;
            aces--;
        }
        return total;
    }

    const userData = getUserData(data, guildId, userId);

    if (betAmount <= 0) {
        return interaction.reply("❌ Please enter a valid amount to bet.");
    }

    if (betAmount > userData.crack) {
        return interaction.reply("❌ You don't have enough balance to make that bet.");
    }

    userData.crack -= betAmount;

    const userHand = [drawCard(), drawCard()];
    const dealerHand = [drawCard(), drawCard()];

    const embed = new EmbedBuilder()
        .setTitle('🃏 Blackjack')
        .setDescription(`Your hand: ${userHand.join(', ')} (Total: ${handTotal(userHand)})\nDealer shows: ${dealerHand[0]}\n\nChoose an action:`)
        .setColor('#0099ff');

    const hitButton = new ButtonBuilder()
        .setCustomId('hit_' + userId)
        .setLabel('Hit')
        .setStyle(ButtonStyle.Primary);

    const standButton = new ButtonBuilder()
        .setCustomId('stand_' + userId)
        .setLabel('Stand')
        .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(hitButton, standButton);

    const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

    const gameState = {
        userHand,
        dealerHand,
        userId
    };

    const collector = msg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 60000,
        filter: i => i.user.id === userId
    });

    collector.on('collect', async i => {
        if (i.user.id !== userId) return;

        const userTotal = handTotal(gameState.userHand);

        if (i.customId.startsWith('hit_')) {
            gameState.userHand.push(drawCard());
            const newTotal = handTotal(gameState.userHand);

            if (newTotal > 21) {
                // Busted
                const bustEmbed = EmbedBuilder.from(embed)
                    .setDescription(`Your hand: ${gameState.userHand.join(', ')} (Total: ${newTotal})\nDealer shows: ${gameState.dealerHand[0]}\n\n💥 You busted! ${betAmount} lost. ${userData.crack} left`)
                    .setColor('#FF0000');
                
                await i.update({ embeds: [bustEmbed], components: [] });
                saveEconomyData(data);
                collector.stop('finished');

            } else if (newTotal === 21) {
                // Hit 21 → auto-stand
                await handleStand(i);

            } else {
                // Still under 21
                const midEmbed = EmbedBuilder.from(embed)
                    .setDescription(`Your hand: ${gameState.userHand.join(', ')} (Total: ${newTotal})\nDealer shows: ${gameState.dealerHand[0]}\n\nChoose an action:`);

                await i.update({ embeds: [midEmbed], components: [row] });
            }

            saveEconomyData(data);

        } else if (i.customId.startsWith('stand_')) {
            // Player clicked stand
            await handleStand(i);
        }
    });

    // Helper function for standing (dealer plays)
    async function handleStand(i) {
        let dealerTotal = handTotal(gameState.dealerHand);

        while (dealerTotal < 17) {
            gameState.dealerHand.push(drawCard());
            dealerTotal = handTotal(gameState.dealerHand);
        }

        const userTotal = handTotal(gameState.userHand);
        let resultMessage;
        let embedColor;

        if (userTotal > 21) {
            resultMessage = `💥 You busted! ${betAmount} lost. ${userData.crack} left`;
            embedColor = '#FF0000';
        } else if (dealerTotal > 21 || userTotal > dealerTotal) {
            userData.crack += betAmount * 2;
            resultMessage = `🎉 You win! ${betAmount} won! ${userData.crack} left`;
            embedColor = '#00cc99';
        } else if (userTotal < dealerTotal) {
            resultMessage = `😞 You lose. ${betAmount} lost. ${userData.crack} left`;
            embedColor = '#FF0000';
        } else {
            userData.crack += betAmount; // Refund on tie
            resultMessage = `🤝 It's a tie! ${betAmount} returned. ${userData.crack} left`;
            embedColor = '#00cc99';
        }

        saveEconomyData(data);

        const finalEmbed = new EmbedBuilder()
            .setTitle('🃏 Blackjack - Results')
            .setDescription(`Your hand: ${gameState.userHand.join(', ')} (Total: ${userTotal})\nDealer hand: ${gameState.dealerHand.join(', ')} (Total: ${dealerTotal})\n\n${resultMessage}`)
            .setColor(embedColor);

        await i.update({ embeds: [finalEmbed], components: [] });
    }

    collector.on('end', async (_, reason) => {
        if (reason !== 'finished') {
            const timeoutEmbed = EmbedBuilder.from(embed).setFooter({ text: 'Game timed out.' });
            saveEconomyData(data);
            await msg.edit({ embeds: [timeoutEmbed], components: [] });
        }
    });
}
