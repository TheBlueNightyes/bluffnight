import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createCommandConfig, logger } from 'robo.js';

export const config = createCommandConfig({
    description: 'too many opps? well here\'s the solution',
    options: [{
        name: 'user',
        description: 'what did bro do?! 😭',
        type: 'user',
        required: true
    }]
});

export default async (interaction) => {
    logger.info(`${interaction.user.tag} is trying to execute someone`);
    await interaction.deferReply();

    const targetUser = interaction.options.getUser('user');

    // Basic checks
    if (targetUser.bot) {
        return interaction.editReply({ content: 'not happening lil bro' });
    }

    if (targetUser.id === interaction.user.id) {
        return interaction.editReply({ content: 'are you really this lonely?' });
    }

    // Create buttons
    const button1 = new ButtonBuilder()
        .setCustomId(`execute-${interaction.user.id}`)
        .setStyle(ButtonStyle.Danger)
        .setLabel('⚔️ Execute');

    const button2 = new ButtonBuilder()
        .setCustomId(`spare-${interaction.user.id}`)
        .setStyle(ButtonStyle.Secondary)
        .setLabel('🙏 Spare');

    const row = new ActionRowBuilder().addComponents(button1, button2);

    const message = await interaction.editReply({
        content: `${interaction.user} wants to publicly execute ${targetUser}`,
        components: [row]
    });

	const collector = message.createMessageComponentCollector({
    	filter: (i) => i.user.id === interaction.user.id,
		time: 15000
	});

	collector.on('collect', async (i) => {
    	const [action] = i.customId.split('-');

    	if (action === 'execute') {
        	await i.update({
            	content: `${interaction.user} wants to publicly execute ${targetUser}\n✅ ${targetUser} has been neutralized.`,
            	components: []
        	});
    	} else if (action === 'spare') {
        	await i.update({
            	content: `${interaction.user} wants to publicly execute ${targetUser}\n❌ ${targetUser} escaped.`,
            	components: []
        	});
    	}

    	collector.stop();
	});

    collector.on('end', collected => {
        if (collected.size === 0) {
            message.edit({
                content: `Nobody made a choice in time. ${targetUser} walks free... for now.`,
                components: []
            });
        }
    });
};