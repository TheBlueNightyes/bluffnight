import { createCommandConfig, logger } from 'robo.js'

export const config = createCommandConfig({
	description: 'omg FOMO!!'
})

const chars = [
	'Á̷̡̨̦̳̺͕͈̖̬͎͍̞̩',
	'B̴̡̨̛̛͈̭͎̞͍̞̩́',
	'Ć̷̡̧̦̳̺͕͈̖̬͎͍̞̩',
	'D̴̡̨̛̛͈̭͎̞͍̞̩́',
	'É̷̡̧̦̳̺͕͈̖̬͎͍̞̩',
	'F̵̢̨̡̡̛̛͈̭͎̞͍̞̩́',
	'Ǵ̴̡̨̛̛͈̭͎̞͍̞̩',
	'H̷̡̧̦̳̺͕͈̖̬͎͍̞̩́',
	'Í̵̡̨̛̛͈̭͎̞͍̞̩',
	'J̷̡̧̦̳̺͕͈̖̬͎͍̞̩́',
	'Ḱ̵̢̨̡̡̛̛͈̭͎̞͍̞̩',
	'Ĺ̴̡̨̛̛͈̭͎̞͍̞̩',
	'Ḿ̸̡̧̦̳̺͕͈̖̬͎͍̞̩',
	'Ń̵̡̨̛̛͈̭͎̞͍̞̩',
	'Ó̷̡̧̦̳̺͕͈̖̬͎͍̞̩',
	'Ṕ̵̢̨̡̡̛̛͈̭͎̞͍̞̩',
	'Q̴̡̨̛̛͈̭͎̞͍̞̩́',
	'Ŕ̷̡̧̦̳̺͕͈̖̬͎͍̞̩',
	'Ś̴̡̨̛̛͈̭͎̞͍̞̩',
	'Ț̷̡̧̳̺͕͈̖̬͎͍̞̩́',
	'Ứ̵̡̨̛͈̭͎̞͍̞̩',
	'V̷̡̧̦̳̺͕͈̖̬͎͍̞̩́',
	'Ẃ̵̢̨̡̡̛̛͈̭͎̞͍̞̩',
	'X̴̡̨̛̛͈̭͎̞͍̞̩́',
	'Ý̷̡̧̦̳̺͕͈̖̬͎͍̞̩',
	'Ź̵̡̨̛̛͈̭͎̞͍̞̩',
	'0̵̢̨̡̡̛̛͈̭͎̞͍̞̩́',
	'1̷̡̨̦̳̺͕͈̖̬͎͍̞̩́',
	'2̴̡̨̛̛͈̭͎̞͍̞̩́',
	'3̷̡̧̦̳̺͕͈̖̬͎͍̞̩́',
	'4̴̡̨̛̛͈̭͎̞͍̞̩́',
	'5̷̡̧̦̳̺͕͈̖̬͎͍̞̩́',
	'6̵̢̨̡̡̛̛͈̭͎̞͍̞̩́',
	'7̴̡̨̛̛͈̭͎̞͍̞̩́',
	'8̷̡̧̦̳̺͕͈̖̬͎͍̞̩́',
	'9̵̡̨̛̛͈̭͎̞͍̞̩́'
]

export default async (interaction) => {
	logger.info(`67 command used by ${interaction.user}`)

	const length = Math.floor(Math.random() * 50) + 20

	let result = ''
	for (let i = 0; i < length; i++) {
		result += chars[Math.floor(Math.random() * chars.length)]
	}

	await interaction.reply(`67!! ${result}`)
}