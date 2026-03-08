import { ActivityType } from 'discord.js'

export default async function(client) {
    if (client.user) {
        await client.user.setActivity({
            name: 'you...',
            type: ActivityType.Watching
        })
    }

    console.log(`Activity set for ${client.user?.tag}`)
}