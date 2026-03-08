import { createCommandConfig, logger } from 'robo.js';
import { EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';

export const config = createCommandConfig({
    description: 'Fetch and display clan data'
});

export default async (interaction) => {
    logger.info(`Clan command used by ${interaction.user.tag}`);

    await interaction.deferReply();

    try {
        const response = await fetch('http://galaxy.tuxxego.us/clans/get');
        const data = await response.json();

        if (!data.success) {
            return interaction.editReply('❌ Failed to fetch clan data.');
        }

        const clans = data.clans;
        if (!clans || Object.keys(clans).length === 0) {
            return interaction.editReply('❌ No clans found.');
        }

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle('🏛️ Clan List')
            .setTimestamp();

        for (const [clanName, clanInfo] of Object.entries(clans)) {
            embed.addFields({
                name: clanName,
                value: `**Description:** ${clanInfo.description}\n` +
                       `**Owner:** <@${clanInfo.owner}>\n` +
                       `**Members:** ${clanInfo.members.length}\n` +
                       `[Core Message](${clanInfo.coreMessageLink})`,
                inline: false
            });
        }

        interaction.editReply({ embeds: [embed] });

    } catch (error) {
        logger.error('Error fetching clan data:', error);
        interaction.editReply('❌ Error fetching clan data.');
    }
};