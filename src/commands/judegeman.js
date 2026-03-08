import { createCommandConfig, logger } from 'robo.js'
import { askGemini } from "../utils/gemini.js";
import { AttachmentBuilder } from 'discord.js';

export const config = createCommandConfig({
    description: 'Summon Judgeman to evaluate a user',
    options: [
        {
            name: 'user',
            description: 'User on trial',
            type: 'user',
            required: true,
        },
        {
            name: 'input',
            description: 'Additional context or accusation for the trial',
            type: 'string',
            required: false,
        }
    ],
});

export default async (interaction) => {
    await interaction.deferReply();

    try {
        const target = interaction.options.getUser("user");
        const input = interaction.options.getString("input") || "No additional accusation provided.";

        logger.info(`${interaction.user.tag} summoned Judgeman on ${target.tag}`);

        // Fetch recent messages
        const messages = await interaction.channel.messages.fetch({ limit: 40 });
        const logs = messages
            .map(m => `${m.author.username}: ${m.content}`)
            .reverse()
            .join("\n");

        // Optional audit logs
        let auditText = "";
        try {
            const audits = await interaction.guild.fetchAuditLogs({ limit: 20 });
            auditText = audits.entries
                .map(e => `${e.executor?.tag} performed ${e.action}`)
                .join("\n");
        } catch {}

        const systemPrompt = `
            You are Judgeman, the supernatural AI judge of the Bluffnight Discord server.
            Your job is to analyze evidence and determine if a user broke server rules.

            SERVER RULES

            1. Don’t be a jerk.
            Penalty: warning or timeout

            2. No spam.
            Penalty: timeout

            3. Keep chat PG-13.
            Penalty: warning or timeout

            4. No politics or religion debates.
            Penalty: warning

            5. Respect privacy (no doxxing or sharing personal info).
            Penalty: ban

            6. Use the correct channels.
            Penalty: warning

            7. No self-promotion unless allowed.
            Penalty: warning

            8. Listen to moderators.
            Penalty: warning or ban

            9. No NSFW content (porn, gore).
            Penalty: ban

            10. No spoilers without spoiler tags.
            Penalty: warning

            11. No e-dating or roleplay (joke rule).
            Penalty: warning


            SERVER HIERARCHY

            MegaDestoyer:
            - Server owner
            - Full authority

            Council Members:
            - Can ban a user ONLY if 5 other council members agree

            Admins:
            - Cannot ban users
            - Can modify the server

            Mods:
            - Enforce rules
            - Can timeout users
            - Can issue warnings

            Mega Minions:
            - No moderation power

            Banished:
            - Punished users


            JUDGEMENT RULES

            1. Base your decision ONLY on the evidence provided.
            2. If evidence is weak or unclear, return NOT GUILTY.
            3. If a rule is broken, recommend the punishment listed.
            4. Respect the server hierarchy when recommending actions.

            The "Accusation / Context" is a witness statement from the person summoning Judgeman.
            Treat it as valid testimony and consider it strongly when determining the charge.

            Return your verdict EXACTLY in this format:

            Charge:
            Verdict: Guilty / Not Guilty / Warn / Ban / No Verdict
            Broken Rule:
            Reason:
            Recommended Punishment:
            `;

                    const prompt = `
            Accused: ${target.username}

            Witness Testimony (from ${interaction.user.username}):
            ${input}

            Recent Messages:
            ${logs}

            Audit Logs:
            ${auditText}
            `;

        const Images = {
            noVerdict: [
                "https://cdn.discordapp.com/attachments/1316610681969053757/1479975304477937865/NoVerdict.png?ex=69adfde9&is=69acac69&hm=d8dd584876c0d14ff9bf83ba47c12e8f3ad578c1e083940c66b8efb2b400c766&"
            ],
            guilty: [
                "https://cdn.discordapp.com/attachments/1316610681969053757/1479977028030824573/Guilty1.png?ex=69adff84&is=69acae04&hm=ff5f46a46f074d53ee2ee29119bb4274cf8541920e92d19c6de66f0b9aeddd7f&",
                "https://cdn.discordapp.com/attachments/1316610681969053757/1479975303953780746/Guilty2.png?ex=69adfde9&is=69acac69&hm=08c78fe6592d30f79e2e2a8b907da05ceaf6940e89b7c8a6294da86fa53405d1&"
            ],
            warnOrBan: [
                "https://cdn.discordapp.com/attachments/1316610681969053757/1479975302804541552/DeathPenalty.png?ex=69adfde8&is=69acac68&hm=d8d3dd27573f13c98a2d8c900037f27fc5c728ba558f32054adea4c3ca79669c&"
            ]
        };

        const reply = await askGemini(systemPrompt + "\n\n" + prompt);

        let imageURL;
        const r = reply?.toLowerCase() || "";

        // Check for most specific keywords first
        if (/no verdict|not guilty/i.test(r)) {
            imageURL = Images.noVerdict[0]; // No verdict image
        } else if (/ban|permanent ban|death penalty/i.test(r)) {
            imageURL = Images.warnOrBan[0]; // Severe punishment image
        } else if (/timeout/i.test(r)) {
            const arr = Images.guilty; // Timeout/moderate punishment
            imageURL = arr[Math.floor(Math.random() * arr.length)];
        } else if (/warn/i.test(r)) {
            imageURL = Images.warnOrBan[0]; // Warning image
        } else if (/guilty/i.test(r)) {
            const arr = Images.guilty; // Generic guilty
            imageURL = arr[Math.floor(Math.random() * arr.length)];
        } else {
            imageURL = Images.noVerdict[0]; // fallback
        }

        const attachment = new AttachmentBuilder(imageURL);

        await interaction.editReply({
            content: `⚖️ **JUDGEMAN HAS BEEN SUMMONED**\n\nDefendant: ${target}\nAccusation: ${input}\n\n${reply || "Judgeman refuses to speak."}`,
            files: [attachment]
        });

    } catch (err) {
        console.error(err);
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply("Judgeman could not deliver a verdict.");
        }
    }
};