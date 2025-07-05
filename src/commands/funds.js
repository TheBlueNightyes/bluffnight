import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { EmbedBuilder } from 'discord.js';
import { createCommandConfig, logger } from 'robo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FUNDS_FILE = path.join(__dirname, '../storage/funds.json');

function loadFundData() {
    if (!fs.existsSync(FUNDS_FILE)) return {};
    const raw = fs.readFileSync(FUNDS_FILE, 'utf-8').trim();
    if (!raw) return {};
    try {
        return JSON.parse(raw);
    } catch (err) {
        logger.error('Failed to parse funds.json:', err);
        return {};
    }
}

export const config = createCommandConfig({
    description: 'we\'re still alive and kicking!',
    options: [{
        name: 'type',
        description: 'choose a fund to view',
        type: 'string',
        choices: [
            { name: 'government', value: 'government' },
            { name: 'democracky defense', value: 'democracky defense' },
            { name: 'space program', value: 'space program' }
        ],
        required: true
    }]
});

function capitalizeWords(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}

export default async (interaction) => {
    const user = interaction.user;
    logger.info(`funds checked by ${user.tag}`);

    const type = interaction.options.getString('type');
    const data = loadFundData();
    const fundData = data[type];

    if (!fundData) {
        return interaction.reply({
            content: `❌ No data found for "${type}".`,
            ephemeral: true
        });
    }

    const formattedCrack = (fundData.crack || 0).toLocaleString();
    const formattedFentanyl = (fundData.fentanyl || 0).toLocaleString();

    const embed = new EmbedBuilder()
        .setTitle(`📊 ${capitalizeWords(type)} Funds`)
        .setColor('#00AAFF')
        .setDescription([
            `💵 **Crack:** ${formattedCrack}`,
            `🧪 **Fentanyl:** ${formattedFentanyl}`
        ].join('\n'))
        .setFooter({ text: `Requested by ${user.tag}` })
        .setTimestamp();

    return interaction.reply({ embeds: [embed] });
};