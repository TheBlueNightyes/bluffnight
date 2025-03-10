import { ActivityType } from 'discord.js'

export default async (client) => {
	client.user?.setActivity({
		name: 'you..',
		type: ActivityType.Watching
	})
}
