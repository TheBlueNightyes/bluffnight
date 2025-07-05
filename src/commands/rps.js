import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } from 'discord.js';
import { createCommandConfig } from 'robo.js';

export const config = createCommandConfig({
    description: 'crashout worthy game',
    options: [
        {
            name: 'user',
            description: 'a worthy opponent...',
            type: 'user',
            required: true,
        },
    ],
});

export default async (interaction) => {
    const challenger = interaction.user;
    const opponent = interaction.options.getUser('user');

    // Prevent self-play
    if (challenger.id === opponent.id) {
        return interaction.reply({
            content: "are you really this lonely?",
            ephemeral: true,
        });
    }

    const choices = ['rock', 'paper', 'scissors'];
    const emojis = {
        rock: '🪨',
        paper: '📄',
        scissors: '✂️',
    };

    const gameState = {
        [challenger.id]: null,
        [opponent.id]: null,
    };

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('rock').setLabel('🪨 Rock').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('paper').setLabel('📄 Paper').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('scissors').setLabel('✂️ Scissors').setStyle(ButtonStyle.Primary)
    );

    const gameMsg = await interaction.reply({
        content: `🎮 ${challenger} has challenged ${opponent} to Rock Paper Scissors!\nClick a button to play.`,
        components: [row],
        fetchReply: true,
    });

    const collector = gameMsg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 30000,
    });

    collector.on('collect', async (i) => {
        const userId = i.user.id;
        const choice = i.customId;

        if (![challenger.id, opponent.id].includes(userId)) {
            return i.reply({ content: 'You are not in this game!', ephemeral: true });
        }

        if (gameState[userId]) {
            return i.reply({ content: 'You already picked!', ephemeral: true });
        }

        gameState[userId] = choice;
        await i.reply({ content: `You chose ${emojis[choice]} ${choice}.`, ephemeral: true });

        // Check if both players have picked
        if (gameState[challenger.id] && gameState[opponent.id]) {
            collector.stop();
        }
    });

    collector.on('end', async () => {
        const p1 = gameState[challenger.id];
        const p2 = gameState[opponent.id];

        if (!p1 || !p2) {
            return interaction.editReply({
                content: '⏱ Game timed out — not all players responded.',
                components: [],
            });
        }

        // Determine winner
        let result;
        if (p1 === p2) result = "It's a tie!";
        else if (
            (p1 === 'rock' && p2 === 'scissors') ||
            (p1 === 'paper' && p2 === 'rock') ||
            (p1 === 'scissors' && p2 === 'paper')
        ) result = `${challenger} wins!`;
        else result = `${opponent} wins!`;

        const resultEmbed = new EmbedBuilder()
            .setTitle('🎮 Rock Paper Scissors Result')
            .addFields(
                { name: `${challenger.username}'s Choice`, value: `${emojis[p1]} ${p1}`, inline: true },
                { name: `${opponent.username}'s Choice`, value: `${emojis[p2]} ${p2}`, inline: true },
                { name: 'Result', value: result, inline: false },
            )
            .setColor('#00AAFF')
            .setTimestamp();

        await interaction.editReply({
            content: 'Game finished!',
            embeds: [resultEmbed],
            components: [],
        });
    });
};