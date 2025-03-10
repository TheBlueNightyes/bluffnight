import { createCommandConfig, logger } from 'robo.js'

export const config = createCommandConfig({
    description: 'actually exposing dawgs'
})

const blackmail = [
    '"it was too big to fit 😳"\n- <@819366546140692511>\n> https://discordapp.com/channels/@me/1250975070881452053/1348173866089975950',
    '"U uh want a complementary thigh high pic or smth?"\n- <@1112469181720432753>\n> https://discordapp.com/channels/@me/1348060893870821396/1348409629285023835',
    '"Did not knew how to print money"\n- <@1144841349368127539>\n> https://discordapp.com/channels/1109919953408237731/1109919955094343723/1348508016802005012'
];

export default async (interaction) => {
    logger.info(`${interaction.user} released blackmail`)
    const blackmailResult = blackmail[Math.floor(Math.random() * blackmail.length)];

    interaction.reply(`${blackmailResult}`);
};