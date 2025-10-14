import {Questline} from "@/lib/types";

export const Prologue: Questline[] = [
    {
        questline_name: "Prologue",
        timeline: 1,
        category: "Tutorial",
        description: "Begin your descent. The framework awakens. The pieces click into place.",
        location: "Internet",
        quests: [
            {
                QuestName: "Long ago",
                DetailsForSubmission: "The start of it all. The first step. No need to submit anything once it goes online this solves.",
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis: "The journey begins not with a step, but with a signal.",
                    Trivia: "This quest marks the first moment the prologue becomes alive to the world. You get access to the <a href=\"https://discord.gg/rVBFQCTV4F\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"color:blue;\">discord</a> and <a href=\"https://facility-prolog.vercel.app\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"color:blue;\">quest site</a>.",
                },
                difficulty: 1,
                category: "Main",
                rewards: [
                    {
                        type: "Achievement",
                        name: "Seed of Knowing",
                        description: "A cryptic memory fragment detailing the beginning of the End.",
                    },
                ],
                QuestCredit: {
                    name: "Lets keep my name a secret",
                    date: "01/10/2025",
                },
            },
            {
                QuestName: "A map to see",
                DetailsForSubmission: "Auto-complete on map release on the 3th",
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis: "You can’t begin without a map. Or can you?",
                    Trivia: "The map will hint on stuff in the main questlines, It is Canon.",
                },
                Requirement: ["Long ago"],
                difficulty: 2,
                category: "Special",
                rewards: [
                    {
                        type: "Item",
                        name: "Overseer’s Map",
                        description: "A partially corrupted visual layer of known zones.",
                    },
                ],
                QuestCredit: {
                    name: "REDACTED",
                    date: "03/10/2025",
                },
            },
            {
                QuestName: "Leaking",
                DetailsForSubmission: "Auto-complete on email leak release on the 15th",
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis: "The system cracks. Something you weren’t meant to see. Who leaked this?",
                    Trivia: "The leak is canon lore and also part of gameplay.",
                },
                rewards: [
                    {
                        type: "Item",
                        name: "Ṱ̸͙͑͋͆A̸͕͆̏͑͜S̸̢̝̋?̷͈͈̪͋͗",
                        description: "An email? A message? A warning?",
                    },
                ],
                Requirement: ["A map to see"],
                difficulty: 2,
                category: "Special",
                QuestCredit: {
                    name: "REDACTED",
                    date: "15/10/2025",
                },
                timeLock: "00:00:00 15/10/2025"
            },
            {
                QuestName: "Security Log",
                DetailsForSubmission: "Auto-complete when AVI log is released on the 25th",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "The first research log surfaces. History leaves a trace. Will it ever repeat again?",
                    Trivia: "This quest marks the beginning of the research log series, each log revealing more about the underlying mystery.",
                    Relations: "You may find it in more detail in {{ Trees have logs: I }} and is delved into detail in {{ Secrets in the logs of trees: I }}.",
                },
                Requirement: ["Leaking"],
                difficulty: 1,
                category: "Special",
                rewards: [
                    {
                        type: "Item",
                        name: "AVI Research Log: Security Tape",
                        description: "The first log, containing the boot sequence of the unknown construct - Will you ever find the solid log manifestation?",
                    }
                ],
                QuestCredit: {
                    name: "REDACTED",
                    date: "25/10/2025",
                },
                timeLock: "00:00:00 25/10/2025"
            },
            {
                QuestName: "Facility",
                DetailsForSubmission: "Auto-complete when the ARG is officially released on the 3rd",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: 'The <a href="https://the-facility.vercel.app" target="_blank" rel="noopener noreferrer" style="color:blue;">game</a> begins, and something is deeply wrong.',
                    Trivia: "This quest acts as the opening to the actual ARG gameplay sequences - Good luck - All logs in 'home' are not lore accurate due to corruption.",
                    Relations: "Requires {{ Leaking }}",
                },
                Requirement: ["Leaking"],
                difficulty: 3,
                category: "Main",
                rewards: [
                    {
                        type: "Item",
                        name: "Facility Key",
                        description: "Grants access to the first main instance of the interactive experience.",
                    },
                    {
                        type: "Reputation",
                        name: "System Breacher",
                        description: "Awarded for reaching the core of the unknown construct.",
                    },
                    {
                        type: "Item",
                        name: "KEYWORD",
                        amount: 1,
                        description: "Keep this safe... it will be a 'key' part of the story."
                    }
                ],
                QuestCredit: {
                    name: "Once again, lets keep my name a secret",
                    date: "03/11/2025",
                },
                timeLock: "00:00:00 03/11/2025"
            },
        ],
    },
]
