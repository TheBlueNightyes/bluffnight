import fs from 'fs';
import path from 'path';
import { EmbedBuilder } from 'discord.js';
import { createCommandConfig, logger } from 'robo.js';

const CODE_FILE = path.resolve('src/storage/codes.json');
const ECONOMY_FILE = path.resolve('src/storage/economy.json');
const PEOPLE_FILE = path.resolve('src/storage/people.json');

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

function saveJSON(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
        logger.error(`Failed to save ${filePath}:`, err);
    }
}

export const config = createCommandConfig({
    description: 'redeem a code for a cool prize!',
    options: [
        {
            name: 'code',
            description: 'hope u got the right one',
            type: 'string',
            required: true
        }
    ]
});

export default async (interaction) => {
    logger.info(`code redemption attempted by ${interaction.user}`);
    
    const user = interaction.user;
    const userId = user.id;
    const guildId = interaction.guild.id;
    const codeInput = interaction.options.getString('code').toUpperCase();
    const now = Date.now();

    const codes = loadJSON(CODE_FILE);
    const economy = loadJSON(ECONOMY_FILE);
    const people = loadJSON(PEOPLE_FILE); // still loaded, but not used for redemption anymore

    const codeData = codes[codeInput];
    if (!codeData) {
        return interaction.reply({
            content: "⚠️ Code doesn't exist!",
            ephemeral: true
        });
    }
    if (codeData.expires) {
        const expiry = Date.parse(codeData.expires);

        if (isNaN(expiry)) {
            logger.error(`Invalid expiration date for code ${codeInput}`);
        } else if (now >= expiry) {
            return interaction.reply({
                content: '⚠️ Code has expired.',
                ephemeral: true
            });
        }
    }

    // ✅ Init economy if needed
    if (!economy[guildId]) economy[guildId] = {};
    if (!economy[guildId].users) economy[guildId].users = {};
    if (!economy[guildId].users[userId]) {
        economy[guildId].users[userId] = { 
            crack: 0, 
            fentanyl: 0, 
            lastCollect: 0, 
            inventory: [], 
            redeemed: [] 
        };
    }

    const userData = economy[guildId].users[userId];

    // Make sure redeemed exists
    if (!Array.isArray(userData.redeemed)) {
        userData.redeemed = [];
    }

    // Prevent double redemption
    if (userData.redeemed.includes(codeInput)) {
        return interaction.reply({
            content: '⚠️ You’ve already redeemed this code.',
            ephemeral: true
        });
    }

    // Add redemption
    userData.redeemed.push(codeInput);

    const crack = codeData.crack || 0;
    const fentanyl = codeData.fentanyl || 0;

    userData.crack += crack;
    userData.fentanyl += fentanyl;

    // Save updates
    saveJSON(ECONOMY_FILE, economy);
    saveJSON(PEOPLE_FILE, people); // still saved in case guild data changed elsewhere

    // ✅ Build rewards + balance conditionally
    const rewards = [];
    if (crack > 0) rewards.push(`+${crack.toLocaleString()} crack`);
    if (fentanyl > 0) rewards.push(`+${fentanyl.toLocaleString()} fentanyl`);

    const balance = [];
    if (userData.crack > 0) balance.push(`${userData.crack.toLocaleString()} Crack`);
    if (userData.fentanyl > 0) balance.push(`${userData.fentanyl.toLocaleString()} Fentanyl`);

    const embed = new EmbedBuilder()
        .setTitle('🎁 Code Redeemed')
        .setColor('#00AAFF')
        .setDescription([
            `You redeemed **${codeInput}** and received:`,
            ...rewards,
            '',
            `💰 **New Balance:**`,
            ...balance
        ].join('\n'))
        .setTimestamp();

    return interaction.reply({ embeds: [embed] });
};