const TARGET_GUILD_ID = '1386784456345518160';
const BANISHED_USERS = ['1227523050929393714'];
const BANISHED_ROLE_ID = '1477174612608684042';

export default async (oldMember, newMember) => {
    if (newMember.guild.id !== TARGET_GUILD_ID) return;
    if (!BANISHED_USERS.includes(newMember.id)) return;

    // Check which roles were added
    const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));

    if (addedRoles.size === 0) return; // No new roles added, nothing to do

    console.log(`User ${newMember.user.tag} gained roles: ${addedRoles.map(r => r.name).join(', ')}`);

    try {
        const botMember = newMember.guild.members.me;

        // Remove any roles that aren't the guild default or the banished role
        const rolesToRemove = newMember.roles.cache.filter(role =>
            role.id !== newMember.guild.id &&
            role.id !== BANISHED_ROLE_ID &&
            role.position < botMember.roles.highest.position
        );

        if (rolesToRemove.size > 0) {
            await newMember.roles.remove(rolesToRemove);
        }

        // Ensure the banished role is assigned
        if (!newMember.roles.cache.has(BANISHED_ROLE_ID)) {
            await newMember.roles.add(BANISHED_ROLE_ID);
        }

        console.log('✅ Banished role enforced');
    } catch (err) {
        console.error('❌ Failed enforcing roles:', err);
    }
};