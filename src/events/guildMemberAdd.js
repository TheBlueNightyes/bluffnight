const TARGET_GUILD_ID = '1386784456345518160';
const BANISHED_USERS = ['1227523050929393714'];
const BANISHED_ROLE_ID = '1477174612608684042';

export default async (event) => {
    console.log('RAW EVENT:', event);

    const member = event?.member ?? event;

    if (!member || !member.guild) {
        console.log('No valid member object');
        return;
    }

    console.log('User:', member.user?.tag);
    console.log('User ID:', member.id);

    if (member.guild.id !== TARGET_GUILD_ID) return;

    if (BANISHED_USERS.includes(member.id)) {
        try {
            const botMember = member.guild.members.me;

            const rolesToRemove = member.roles.cache.filter(role =>
                role.id !== member.guild.id &&
                role.id !== BANISHED_ROLE_ID &&
                role.position < botMember.roles.highest.position
            );

            if (rolesToRemove.size > 0) {
                try {
                    await member.roles.remove(rolesToRemove);
                } catch (err) {
                    console.error('❌ Failed removing roles:', err);
                }
            }

            await member.roles.add(BANISHED_ROLE_ID);
            console.log('✅ Role assigned');
        } catch (err) {
            console.error('❌ Role failed:', err);
        }
    }
};