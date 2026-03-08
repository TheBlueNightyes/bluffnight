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
    description: 'balance for now',
    options: [{
        name: 'user',
        description: 'is this the irs',
        type: 'user',
        required: false
    }]
});

export default (interaction) => {
    logger.info(`balance checked by ${interaction.user}`);

    const data = loadEconomyData();
    const guildId = interaction.guild.id;
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const userId = targetUser.id;

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

    const formattedCrack = data[guildId].users[userId].crack.toLocaleString();
    const formattedFentanyl = data[guildId].users[userId].fentanyl.toLocaleString();

    const embed = new EmbedBuilder()
        .setTitle('Balance')
        .setColor('#00AAFF')
        .setDescription(
            `**${targetUser}**'s balance is:\n${formattedCrack} Crack\n${formattedFentanyl} Fentanyl`
        )
        .setTimestamp();

    return interaction.reply({ embeds: [embed] });
};