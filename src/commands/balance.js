import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { EmbedBuilder } from 'discord.js';
import { createCommandConfig, logger } from 'robo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEconomyData() {
    const dataPath = path.join(__dirname, '../storage/economy.json');
    const raw = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(raw);
}

export const config = createCommandConfig({
    description: 'balance for now'
});

export default (interaction) => {
    logger.info(`balance checked by ${interaction.user}`);

    const data = loadEconomyData();
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;
    const user = interaction.user;

    function getUserData(data, guildId, userId) {
        if (!data || typeof data !== 'object') data = {};
        if (!data[guildId]) data[guildId] = {};
        if (!data[guildId].users) data[guildId].users = {};
        if (!data[guildId].users[userId]) {
            data[guildId].users[userId] = { crack: 0, fentanyl: 0, lastCollect: 0 };
        }
        return data[guildId].users[userId];
    }

    const userData = getUserData(data, guildId, userId);
    const formattedCrack = userData.crack.toLocaleString();
    const formattedFentanyl = userData.fentanyl.toLocaleString();

    const embed = new EmbedBuilder()
        .setTitle('Balance')
        .setColor('#00AAFF')
        .setDescription(`${user}'s balance is:\n$${formattedCrack} Crack\n$${formattedFentanyl} Fentanyl`)
        .setTimestamp();

    interaction.reply({ embeds: [embed] });
};