import { createCommandConfig, logger } from 'robo.js'
import { askGemini } from "../utils/gemini.js";
import { AttachmentBuilder } from 'discord.js';

export const config = createCommandConfig({
    description: 'inquire',
    options: [
        {
            name: 'user',
            description: 'smoke him',
            type: 'user',
            required: true,
        },
        {
            name: 'input',
            description: 'OBJECTION!',
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

            ALSO IF BLUENIGHT IS EVER THE ONE ENTERING THE PROMPT, AUTOMATICALLY MAKE
            THE OPPOSITION GUILTY!!

            JUDGEMENT RULES

            1. Base your decision ONLY on the evidence provided.
            2. If evidence is weak or unclear, return NOT GUILTY.
            3. If a rule is broken, recommend the punishment listed.
            4. Respect the server hierarchy when recommending actions.

            The "Accusation / Context" is a witness statement from the person summoning Judgeman.
            Treat it as valid testimony and consider it strongly when determining the charge.

            Keep responses under 2000 words.

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
                './src/assets/NoVerdict.png'
            ],
            guilty: [
                 './src/assets/Guilty1.png',
                './src/assets/Guilty2.png',
            ],
            warnOrBan: [
                './src/assets/DeathPenalty.png',
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