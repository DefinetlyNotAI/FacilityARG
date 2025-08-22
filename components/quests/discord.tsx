import {Questline} from "@/lib/types";

export const Discord: Questline[] = [
    {
        questline_name: "Discord",
        description: "Quests related to the Discord server. Hidden until Prologue is 100% complete.",
        category: "Side Content",
        location: "Discord Server",
        timeline: 7,
        quests: [
            {
                QuestName: "Recruit",
                DetailsForSubmission: "Auto unlocks after first person joins the Discord.",
                SolveStatus: "Pending",
                Requirement: ["Support"],
                QuestDesc: {
                    Synopsis: "Someone has to take the first step. The Discord must be born.",
                },
                difficulty: 1,
                rewards: [
                    {
                        type: "Achievement",
                        name: "Pathfinder",
                        description: "Unlocked for initiating the community presence.",
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "It's not enough",
                DetailsForSubmission: "Auto unlocks after the first person receives both 'End' roles.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "Joining wasn't enough. You've earned a title that echoes to the end.",
                    Trivia: "Technically all you needed to do was just beat {{ End it here* }} and then claim your role in discord.",
                    Relations: "These quests change or relate to this: {{ Recruit }}, {{ End it here* }}",
                },
                Requirement: ["Recruit", "End it here*"],
                difficulty: 5,
                rewards: [
                    {
                        type: "Reputation",
                        name: "End bearer",
                        description: "Respected for bearing the weight of the end.",
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "TAS2",
                DetailsForSubmission: "Unlocks after someone resurrects TAS. *[Error Log HINT is a good start point]*",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "The tree grows again, a digital myth rewritten.",
                    Trivia: "The logs used to submit TAS.tree are fight logs *3, 15 and 25* - stated by Error_Log_3 (with the .hint filetype).",
                    Relations: "These quests change or relate to this: {{ Recruit }}, {{ E/e }}",
                },
                Requirement: ["Recruit", "E/e"],
                Secret: true,
                SecretHint: "The tree has already bloomed once. Submit your file version from the 3 tree logs in ascending code order.",
                difficulty: 4,
                rewards: [
                    {
                        type: "Item",
                        name: "Glitched Seed",
                        amount: 3,
                        description: "The code of TAS.tree... or at least a fragment of it.",
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "TAS Q&A",
                MissName: "Questionless",
                MissInfo: "No questions were submitted before the Q&A deadline.",
                DetailsForSubmission: "Auto unlocks after the Q&A time limit is reached.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "Ask nothing, and you’ll receive only echoes, Ask everything, and you'll receive lies.",
                    Trivia: "Don't worry, the Q&A answers are truthful and canonical unless said otherwise",
                    Relations: "Required {{ TAS2 }}",
                },
                Requirement: ["TAS2"],
                Secret: true,
                SecretHint: "Once TAS comes back, ask your questions, and wait for your begging to be heard.",
                difficulty: 1,
                rewards: [
                    {
                        type: "Experience",
                        name: "Answers",
                        description: "One lucky question intrigued TAS, and that got answered",
                    },
                ],
                QuestCredit: {
                    name: "TAS",
                    date: "-1413751475",
                },
            },
            {
                QuestName: "Fan base",
                DetailsForSubmission: "Auto unlocks after first person receives the 'Fan' role.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "It’s more than play-it’s passion <3.",
                    Relations: "Requires {{ Recruit }}",
                },
                Requirement: ["Recruit"],
                difficulty: 1,
                rewards: [
                    {
                        type: "Reputation",
                        name: "Recognized Fandom",
                        amount: 10,
                        description: "Acknowledged by the community as a fan.",
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "Bribery",
                DetailsForSubmission: "Auto unlocks after first person receives the 'Investor' role.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "Sometimes the fastest route to respect is lined with gold - Thanks for your support and money.",
                    Relations: "Requires {{ Recruit }}",
                },
                Requirement: ["Recruit"],
                difficulty: 2,
                rewards: [
                    {
                        type: "Item",
                        name: "Suspicious Coin",
                        description: "Found under the welcome mat. Still warm.",
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "The foundation",
                DetailsForSubmission: "Auto unlocks after 100 people have received the 'Foundation' role.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "One hundred hands form the base of a monument. This is only the beginning.",
                    Relations: "Requires {{ Recruit }}",
                },
                Requirement: ["Recruit"],
                difficulty: 3,
                rewards: [
                    {
                        type: "Achievement",
                        name: "Hundred Pillars",
                        description: "You're part of the original hundred.",
                    },
                ],
                QuestCredit: {
                    name: "All of us together",
                    date: "100",
                },
            },
            {
                QuestName: "Eggs",
                DetailsForSubmission: "Auto unlocks after first person gets the 🥚 role through an Easter egg submission.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "MMM Easter eggs, best served on April.",
                    Trivia: "This quest can also count as a freebie such as {{ It's not enough }}, all you needed to do was just discover any easter egg and then claim your role in discord..",
                    Relations: "Requires {{ Recruit }}, and any quest from Easter eggs",
                },
                relatedQuestlines: ["Easter eggs"],
                Requirement: ["Recruit"],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
        ],
    },
]
