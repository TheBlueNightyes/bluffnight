import { EmbedBuilder, PermissionsBitField } from 'discord.js';
import { createCommandConfig, logger } from 'robo.js';

export const config = createCommandConfig({
    description: 'literal torture',
    options: [
        {
            name: 'user',
            description: 'ts wild',
            type: 'user',
            required: true,
        }
    ],
});

export default async (interaction) => {
    await interaction.deferReply();

    const targetUser = interaction.options.getUser('user');
    const guild = interaction.guild;

    if (interaction.user.id === targetUser.id) {
        return interaction.editReply({
            content: '❌ You can’t pass the potato to yourself!',
        });
    }

    const member = await guild.members.fetch(targetUser.id);
    const potatoRole = guild.roles.cache.find(role => role.name === 'Potato');

    if (!potatoRole) {
        return interaction.editReply({
            content: '❌ Could not find a role named **"Potato"**. Please create one first.',
        });
    }

    const botMember = await guild.members.fetchMe();
    const canManage = botMember.permissions.has(PermissionsBitField.Flags.ManageRoles);

    if (!canManage) {
        return interaction.editReply({
            content: '❌ I need the **Manage Roles** permission to assign the potato.',
        });
    }

    // Remove from any current potato holders
    try {
        const current = guild.members.cache.filter(m => m.roles.cache.has(potatoRole.id));
        for (const m of current.values()) {
            await m.roles.remove(potatoRole);
        }
    } catch (err) {
        logger.error('Failed to clear previous potato holders:', err);
        return interaction.editReply({
            content: '❌ Could not remove potato from previous holder.',
        });
    }

    // Give it to the new player
    try {
        await member.roles.add(potatoRole);
    } catch (err) {
        logger.error('Failed to give potato role:', err);
        return interaction.editReply({
            content: `❌ Couldn't give the role to ${targetUser}.`,
        });
    }

    // Announce new potato holder
    const embed = new EmbedBuilder()
        .setTitle('🔥 Hot Potato!')
        .setDescription(`🥔 The hot potato has been passed to ${targetUser}!\nThey have **30 seconds** before it explodes!`)
        .setColor('#FFA500')
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });

    // Set explosion timer (30 seconds)
    setTimeout(async () => {
        try {
            const updated = await guild.members.fetch(targetUser.id);
            if (updated.roles.cache.has(potatoRole.id)) {
                await updated.roles.remove(potatoRole);

                const boomEmbed = new EmbedBuilder()
                    .setTitle('💥 BOOM!')
                    .setDescription(`💀 ${targetUser} held the potato too long... it exploded!`)
                    .setColor('#FF0000')
                    .setTimestamp();

                const channel = await interaction.channel.fetch();
                await channel.send({ embeds: [boomEmbed] });
            }
        } catch (err) {
            logger.error('Error during potato explosion:', err);
        }
    }, 30 * 1000); // 30 seconds
};