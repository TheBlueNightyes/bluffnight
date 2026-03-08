import { createCommandConfig, logger } from 'robo.js'

export const config = createCommandConfig({
	description: 'dawg these crazy accusations',
	options: [{
		name: 'user',
		description: '25 - Life.',
		type: 'user',
		required: true
	}]
})

const blackmail = [
    "age is just a number",
    "but he made graduation",
    "we're all getting the H-101 right?",
    "Honestly drake won the beef",
    "seawolf is not a zoophile.. I AM",
    "MHA IS THE BEST!!",
    "deku beats goku!!",
    "sukuna didnt need mahorage to win",
    "hdvortex can suck me.. but not in a gay way.?",
    "realm > assembly",
    "my favorite chord is a-minor",
    "maccaroni town deserved it.",
    "the people and alts voted for major reform",
    "ive been in deeper holes",
	"it was to big to fit 😳"
];

export default async (interaction) => {
	logger.info(`${interaction.user} blackmailed someguy`)
	await interaction.deferReply()
    const user = interaction.options.getUser('user');
    const blackmailResult = blackmail[Math.floor(Math.random() * blackmail.length)];

	if (interaction.user.id === user.id) {
		await interaction.editReply({
			content: 'are you really this lonely?'
		});
	return;
	}

	else if (user.bot) {
		await interaction.editReply({
			content: 'not happening lil bro',
		});
	return;
	}

	interaction.editReply(`"${blackmailResult}"\n- ${user}`);
};