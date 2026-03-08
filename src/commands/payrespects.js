import fs from 'fs';
import path from 'path';
import { createCommandConfig, logger } from 'robo.js';

const MISC_FILE = path.resolve('src/storage/misc.json');

function loadMiscData() {
    if (!fs.existsSync(MISC_FILE)) return {};
    const raw = fs.readFileSync(MISC_FILE, 'utf-8').trim();
    if (!raw) return {};
    try {
        return JSON.parse(raw);
    } catch (err) {
        logger.error('Failed to parse misc.json:', err);
        return {};
    }
}

function saveMiscData(data) {
    try {
        fs.writeFileSync(MISC_FILE, JSON.stringify(data, null, 2), 'utf-8');
        logger.info('Misc data saved.');
    } catch (err) {
        logger.error('Failed to save misc data:', err);
    }
}

export const config = createCommandConfig({
    description: 'F to pay respects.',
    options: [
        {
            name: 'respect',
            description: 'Choose who you want to pay respects to.',
            type: 'string',
            choices: [
                { name: 'macaroni town', value: 'macaroni town' },
                { name: 'carcer city', value: 'carcer city' },
                { name: 'bing bong', value: 'bing bong' }
            ],
            required: true
        }
    ]
});

const miscData = loadMiscData();
const counters = {
    'macaroni town': miscData.macaroniRespected || 0,
    'carcer city': miscData.carcerRespected || 0,
    'bing bong': miscData.bingBongRespected || 0
};

export default (interaction) => {
    const respecting = interaction.options.getString('respect').toLowerCase();
    const userTag = interaction.user.tag || interaction.user.username;

    if (counters[respecting] === undefined) {
        interaction.reply(`Invalid option selected.`);
        return;
    }

    counters[respecting]++;
    logger.info(`${userTag} paid respects to ${respecting}`);

    interaction.reply(`${interaction.user} paid respects to ${respecting}\n> total: ${counters[respecting]}`);

    saveMiscData({
        macaroniRespected: counters['macaroni town'],
        carcerRespected: counters['carcer city'],
        bingBongRespected: counters['bing bong']
    });
};