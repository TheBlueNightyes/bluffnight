import { createCommandConfig } from 'robo.js';
import { askGemini } from '../utils/gemini.js';

export const config = createCommandConfig({
    description: 'the ULTIMATE test',
    options: [{ name: 'user', description: 'Your opponent', type: 'user', required: true }]
});

export default async (interaction) => {
    const targetUser = interaction.options.getUser('user');

    if (targetUser.bot || targetUser.id === interaction.user.id) {
        return interaction.reply({ content: "Invalid challenge target!", ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    // Create DM channels
    let p1Channel, p2Channel;
    try {
        p1Channel = await interaction.user.createDM();
        p2Channel = await targetUser.createDM();
    } catch {
        return interaction.editReply("Couldn't create DMs. Make sure both players have DMs open!");
    }

    await interaction.editReply(`Challenge sent to ${targetUser.username}! Check your DMs.`);

    await p1Channel.send("You have been challenged! Reply with your move (Rock, Paper, Anything...) within 60 seconds.");
    await p2Channel.send(`${interaction.user.username} challenged you! Reply with your move (Rock, Paper, Anything...) within 60 seconds.`);

const p1Response = await p1Channel.awaitMessages({
  filter: m => m.author.id === interaction.user.id,
  max: 1,
  time: 60000,
  errors: ['time']
}).catch(() => null);

const p2Response = await p2Channel.awaitMessages({
  filter: m => m.author.id === targetUser.id,
  max: 1,
  time: 60000,
  errors: ['time']
}).catch(() => null);

if (!p1Response || !p2Response) {
    return interaction.channel.send('One or both players did not submit a move in time.');
}

const player1Message = p1Response.first();
const player2Message = p2Response.first();

const player1Choice = player1Message.content.trim();
const player2Choice = player2Message.content.trim();

// ✅ React to both messages
try { await player1Message.react('✅'); } catch {}
try { await player2Message.react('✅'); } catch {}

    // React with ✅ in DMs
    p1Response.first().react('✅');
    p2Response.first().react('✅');

    // Ask AI
    const result = await askGemini(`
Player 1 (${interaction.user.username}) chose: ${player1Choice}
Player 2 (${targetUser.username}) chose: ${player2Choice}
Decide who wins, explain dramatically.
    `);

    interaction.channel.send(result || 'The AI folds and declares no winner!');
};