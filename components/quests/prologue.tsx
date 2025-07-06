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
                DetailsForSubmission: "Auto unlocks when sites are published",
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
                QuestName: "Support",
                DetailsForSubmission: "Only if Poll results favorable",
                SolveStatus: "Failed",
                MustRequirement: true,
                QuestDesc: {
                    Synopsis: "The world watches. Do they want this to exist?",
                    Trivia: "The poll will reflect how the community first engaged with the project.",
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
            },
            {
                QuestName: "A map to see",
                DetailsForSubmission: "Auto on map release on June 15",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "You can’t begin without a map. Or can you?",
                    Trivia: "The map will hint on stuff in the main questlines, It is Canon.",
                    Relations: "Required {{ Support }}",
                },
                Requirement: ["Support"],
                MissName: "Go blind",
                MissInfo: "Fail {{ Support }} quest",
                failIfFailed: "{{ Support }}",
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
                    date: "15th June 2025",
                },
            },
            {
                QuestName: "Leaking",
                DetailsForSubmission: "Auto on email leak release on June 30",
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
                    date: "30th June 2025",
                },
            },
            {
                QuestName: "Facility",
                DetailsForSubmission: "Auto on game release on July 7",
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
            },
        ],
    },
]
