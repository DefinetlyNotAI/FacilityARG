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
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "The journey begins not with a step, but with a signal.",
                    Trivia: "This quest marks the first moment the Hunt prologue becomes alive to the world.",
                },
                difficulty: 1,
                category: "Special",
                rewards: [
                    {
                        type: "Achievement",
                        name: "Seed of Knowing",
                        description: "A cryptic memory fragment detailing the beginning of the End.",
                    },
                ],
                QuestCredit: {
                    name: "Lets keep my name a secret",
                    date: "",
                },
            },
            {
                QuestName: "A map to see",
                DetailsForSubmission: "Auto on map release on the 3th",
                SolveStatus: "Pending",
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
                    date: "",
                },
                // todo: Time lock on the 3rd of the month of release
            },
            {
                QuestName: "Support",
                DetailsForSubmission: "Only if Poll results favorable",
                SolveStatus: "Pending",
                MustRequirement: true,
                QuestDesc: {
                    Synopsis: "The world watches. Do they want this to exist?",
                    Trivia: "The poll reflected how the community first engaged with the project.",
                    Relations: "Required {{ Long ago }}",
                },
                Requirement: ["Long ago"],
                MissName: "Little Lamb",
                MissInfo: "Fail to gain support from the community poll.",
                difficulty: 1,
                category: "Special",
                QuestCredit: {
                    name: "Everyone",
                    date: "",
                },
                // todo: Add timeLock for exactly when "A map to see" is released, ofc ends with leaking
            },
            {
                QuestName: "Leaking",
                DetailsForSubmission: "Auto on email leak release on the 15th",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "The system cracks. Something you weren’t meant to see. Who leaked this?",
                    Trivia: "The leak is canon lore and also part of gameplay.",
                    Relations: "Required {{ Support }}",
                },
                rewards: [
                    {
                        type: "Item",
                        name: "Ṱ̸͙͑͋͆A̸͕͆̏͑͜S̸̢̝̋?̷͈͈̪͋͗",
                        description: "An email? A message? A warning?",
                    },
                ],
                Requirement: ["Support", "A map to see"],
                MissName: "Safe with me",
                MissInfo: "Fail {{ Support }} quest",
                failIfFailed: "{{ Support }}",
                difficulty: 2,
                category: "Special",
                QuestCredit: {
                    name: "REDACTED",
                    date: "",
                },
                // todo: Time lock on the 15th of the month of release
            },
            {
                QuestName: "Security Log",
                DetailsForSubmission: "Auto solved when AVI log is released on the 25th",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "The first research log surfaces. History leaves a trace. Will it ever repeat again?",
                    Trivia: "This quest marks the beginning of the research log series, each log revealing more about the underlying mystery.",
                    Relations: "Needs {{ Support }}. You may find it in more detail in {{ Trees have logs: I }} and is delved into detail in {{ Secrets in the logs of trees: I }}.",
                },
                Requirement: ["Support", "Leaking"],
                MissName: "Chopped Log",
                MissInfo: "Fail to obtain the AVI research log due to a loss of support.",
                failIfFailed: "{{ Support }}",
                difficulty: 1,
                category: "Main",
                rewards: [
                    {
                        type: "Item",
                        name: "AVI Research Log: Security Tape",
                        description: "The first log, containing the boot sequence of the unknown construct - Will you ever find the solid log manifestation?",
                    }
                ],
                QuestCredit: {
                    name: "REDACTED",
                    date: "",
                },
                // todo: Time lock on the 25th of the month of release
            },
            {
                QuestName: "Facility",
                DetailsForSubmission: "Auto when the ARG is officially released on the 3rd",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "The game begins. And something is deeply wrong.",
                    Trivia: "This quest acts as the opening to the actual ARG gameplay sequences - Good luck - All logs in 'home' are not lore accurate due to corruption.",
                    Relations: "Required {{ Support }} and {{ Leaking }}",
                },
                Requirement: ["Support", "Leaking"],
                MissName: "Dead Signal",
                MissInfo: "Fail {{ Support }} quest",
                failIfFailed: "{{ Support }}",
                difficulty: 3,
                category: "Special",
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
                    date: "",
                },
                // todo: Time lock on the 3rd of the month of release
            },
        ],
    },
]
