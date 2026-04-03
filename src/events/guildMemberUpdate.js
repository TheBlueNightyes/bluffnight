const TARGET_GUILD_ID = '1386784456345518160';
const BANISHED_USERS = ['1227523050929393714'];
const BANISHED_ROLE_ID = '1477174612608684042';

let initialized = false;

export default async (oldMember, newMember) => {
    console.log('EVENT FIRED');

    if (!initialized) {
        console.log('Iinitialized');
        initialized = true;
    }

    if (oldMember.partial) await oldMember.fetch();
    if (newMember.partial) await newMember.fetch();

    if (newMember.guild.id !== TARGET_GUILD_ID) return;
    if (!BANISHED_USERS.includes(newMember.id)) return;

    const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
    if (addedRoles.size === 0) return;

    console.log(
        `User ${newMember.user.tag} gained roles: ${
            addedRoles.map(r => `${r.name} (${r.id})`).join(', ')
        }`
    );

    try {
        const botMember = newMember.guild.members.me;
        if (!botMember) return;

        const highestBotRole = botMember.roles.highest;
        const banishedRole = newMember.guild.roles.cache.get(BANISHED_ROLE_ID);

        if (!banishedRole || banishedRole.position >= highestBotRole.position) {
            console.log('❌ Cannot assign banished role due to hierarchy');
            return;
        }

        const rolesToRemove = newMember.roles.cache.filter(role =>
            role.id !== newMember.guild.id &&
            role.id !== BANISHED_ROLE_ID &&
            role.position < highestBotRole.position
        );

        const blockedRoles = newMember.roles.cache.filter(role =>
            role.id !== newMember.guild.id &&
            role.id !== BANISHED_ROLE_ID &&
            role.position >= highestBotRole.position
        );

        if (blockedRoles.size > 0) {
            console.log(
                `⚠️ Cannot remove roles due to hierarchy: ${
                    blockedRoles.map(r => `${r.name} (${r.id})`).join(', ')
                }`
            );
        }

        if (rolesToRemove.size > 0) {
            await newMember.roles.remove(rolesToRemove);
        }

        // Ensure banished role is applied
        if (!newMember.roles.cache.has(BANISHED_ROLE_ID)) {
            await newMember.roles.add(BANISHED_ROLE_ID);
        }

        console.log('✅ Banished role enforced');
    } catch (err) {
        console.error('❌ Failed enforcing roles:', err);
    }
};