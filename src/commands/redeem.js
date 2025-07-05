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
    logger.info(`code redeemed by ${interaction.user}`);
    
    const user = interaction.user;
    const userId = user.id;
    const guildId = interaction.guild.id;
    const codeInput = interaction.options.getString('code').toUpperCase();

    const codes = loadJSON(CODE_FILE);
    const economy = loadJSON(ECONOMY_FILE);
    const people = loadJSON(PEOPLE_FILE);

    const codeData = codes[codeInput];
    if (!codeData) {
        return interaction.reply({
            content: '❌ That code doesn’t exist.',
            ephemeral: true
        });
    }

    // Init people.json structure
    if (!data[guildId]) data[guildId] = {};
    if (!data[guildId].users) data[guildId].users = {};
    if (!data[guildId].users[userId]) {
        data[guildId].users[userId] = {
            partner: null,
            list: null,
            redeemedCodes: []
        }
    }

    const userPeopleData = people[guildId].users[userId];
    if (!Array.isArray(userPeopleData.redeemedCodes)) {
        userPeopleData.redeemedCodes = [];
    }

    if (userPeopleData.redeemedCodes.includes(codeInput)) {
        return interaction.reply({
            content: '⚠️ You’ve already redeemed this code.',
            ephemeral: true
        });
    }

    // Init economy if needed
    if (!economy[guildId]) economy[guildId] = {};
    if (!economy[guildId].users) economy[guildId].users = {};
    if (!economy[guildId].users[userId]) {
        economy[guildId].users[userId] = {
            crack: 0,
            fentanyl: 0,
            lastCollect: null
        };
    }

    const userData = economy[guildId].users[userId];
    const crack = codeData.crack || 0;
    const fentanyl = codeData.fentanyl || 0;

    userData.crack += crack;
    userData.fentanyl += fentanyl;

    userPeopleData.redeemedCodes.push(codeInput);

    saveJSON(ECONOMY_FILE, economy);
    saveJSON(PEOPLE_FILE, people);

    const embed = new EmbedBuilder()
        .setTitle('🎁 Code Redeemed')
        .setColor('#00AAFF')
        .setDescription([
            `You redeemed **${codeInput}** and received:`,
            `+${crack.toLocaleString()} Crack`,
            `+${fentanyl.toLocaleString()} Fentanyl`,
            '',
            `💰 **New Balance:**`,
            `${userData.crack.toLocaleString()} Crack`,
            `${userData.fentanyl.toLocaleString()} Fentanyl`
        ].join('\n'))
        .setTimestamp();

    return interaction.reply({ embeds: [embed] });
};