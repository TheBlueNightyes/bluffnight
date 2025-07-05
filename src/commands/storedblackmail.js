import { createCommandConfig, logger } from 'robo.js'

export const config = createCommandConfig({
    description: 'actually exposing dawgs'
})

const blackmail = [
    '"it was too big to fit 😳"\n- <@819366546140692511>\n> https://discordapp.com/channels/@me/1250975070881452053/1348173866089975950',
    '"U uh want a complementary thigh high pic or smth?"\n- <@1112469181720432753>\n> https://discordapp.com/channels/@me/1348060893870821396/1348409629285023835',
    '"Did not knew how to print money"\n- <@1144841349368127539>\n> https://discordapp.com/channels/1109919953408237731/1109919955094343723/1348508016802005012',
    '"Trump is my goat"\n- <@772242751428231210>\n https://discordapp.com/channels/@me/1328136016749531157/1379129545096957965',
    '"<@1379129662193537065> if you were not a chill guy with no oops I’d ask you to murder him"\n- <@772242751428231210>\n https://discordapp.com/channels/@me/1328136016749531157/1379129662193537065',
    '"kill all the muslims they suck throughout all time and space"\n- <@1257403023236403311>\n https://discordapp.com/channels/1109919953408237731/1191091521714389032/1349825615506837588'
];

export default async (interaction) => {
    logger.info(`${interaction.user} released blackmail`)
    const blackmailResult = blackmail[Math.floor(Math.random() * blackmail.length)];

    interaction.reply(`${blackmailResult}`);
};