import fs from 'fs';
import path from 'path';
import checkIntents from '../../utils/checkIntents.js';

// File to store bot stats
const STATS_FILE = path.resolve('./src/storage/stats.json');

export default async function(client) {
    await checkIntents(client);

    console.log(`Bot is online as ${client.user.tag} — clientReady fired`);

    // Default stats
    let stats = { sessionNumber: 1, lastStart: new Date().toISOString(), totalUptime: 0 };

    // Try to read existing stats
    if (fs.existsSync(STATS_FILE)) {
        try {
            const raw = fs.readFileSync(STATS_FILE, 'utf8').trim();

            // Only parse if file has content
            if (raw) {
                const parsed = JSON.parse(raw);
                stats.sessionNumber = parsed.sessionNumber ? parsed.sessionNumber + 1 : 1;
                stats.totalUptime = parsed.totalUptime || 0;
            }

            stats.lastStart = new Date().toISOString();
        } catch (err) {
            console.error('Failed to read or parse bot stats file, using default stats:', err);
        }
    } else {
        // File doesn't exist, use defaults
        stats.lastStart = new Date().toISOString();
    }

    // Save stats back to file
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));

    console.log(`Session Number: ${stats.sessionNumber}`);
};