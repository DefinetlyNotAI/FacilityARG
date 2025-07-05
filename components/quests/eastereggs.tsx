import {Questline} from "@/lib/types";

export const EasterEggs: Questline[] = [
    {
        questline_name: "Easter Eggs",
        description: "Whispers between the cracks, secrets buried in byte and breath - where truth isn’t spoken but discovered.",
        category: "Side Content",
        location: "Scattered in the Abandoned Research Facility",
        timeline: 4,
        quests: [
            {
                QuestName: "See you 25 times",
                DetailsForSubmission: "Email an image of you completing the tree counter of HOME on the bottom right after unlocking the counter first.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "The facility just needed proof you are the true vessel to open up to you, welcome back [REDACTED]",
                    Trivia: "Some refreshes change/add stuff to the page, thus more info is provided, although not lore-worthy - example is TAS speaking to you.",
                    Relations: "These quests change or relate to this: {{ Facility }}",
                },
                difficulty: 1,
                Secret: true,
                SecretHint: "To see the count rise, let the world blink anew - each time you return, the number will too.",                Requirement: ["Facility"],
                category: "Hidden",
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "Dreamcatcher",
                DetailsForSubmission: "Download all 8 unique images encountered at [REDACTED], zip them, and email them.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "In the realm of dreams, images flicker and fade. In here its a fever dream of nightmares, conjured up by the TREE in it's last hours.",
                    Trivia: "Each visit to /dream shows one of 8 random images (1/8 per image). Collecting all requires luck and patience.",
                },
                Requirement: ["Facility"],
                Secret: true,
                SecretHint: "Return to the DREAM again and again. Seek the place where DREAM are caught — its name is the PATH you must walk.",
                difficulty: 3,
                category: "Hidden",
                rewards: [
                    {
                        type: "Item",
                        name: "Dreamcatcher",
                        amount: 8,
                        description: "Snippets of dreams caught.",
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "Moonlight",
                DetailsForSubmission: "Email an image of you within the secret 'moonlight' section.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "A page not found, yet found in fate - wander, refresh, and lose thyself to odds that tease the abyss.",
                    Trivia: "The odds of encountering Moonlight are 1 in 666.",
                    Relations: "These quests change or relate to this: {{ Better Odds }}, {{ Time* }}, {{ Blood Moon }}",
                },
                Secret: true,
                SecretHint: "The devil’s number awaits the damned - wander and get lost till the digital stars align - For when you get lost, the moonlight prophecy is told.",
                difficulty: 2,
                Requirement: ["Facility"],
                category: "Hidden",
                rewards: [
                    {
                        type: "Achievement",
                        name: "Moon-Touched",
                        description: "Found what was never meant to be seen.",
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "Time*",
                DetailsForSubmission: "(None – triggered cutscene unlocked by completing Moonlight -  TIP: You can delete the cookie for the cutscene itself if needed if you didn't get the first time!)",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "Time unravels in echoes once the moonlight has been touched - a vision unfolds, unasked and irreversible.",
                    Trivia: "If you get the cutscene WITH the secret {{ Blood Moon }} effect (a 1/443,556 if you count both odds, but is 1/666 after the first 1/666 chance), the cutscene will be way different.",
                    Relations: "Cutscene from {{ Moonlight }}",
                },
                Requirement: ["Moonlight"],
                Secret: true,
                SecretHint: "Auto-triggered by the above quest.",
                category: "Hidden",
                QuestCredit: {
                    name: "???",
                    date: "¿¿¿",
                },
            },
            {
                QuestName: "Will the moon ever smile",
                DetailsForSubmission: "Discover all 5 secret texts as well as the 6th secret smile text in moonlight, email a video of the secret texts being seenSecretHint: ",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "Double clicking is how you actually get the secret text, then by random 1 of 5 texts are selected, if all are seen the next one will be the secret text.",
                    Trivia: "Only occurs if not in a {{ Blood Moon }} state, and the odds of getting the secret text are 1/5 per each, and you need to see all 5 texts first before the last secret 6th.",
                    Relations: "Next easter egg from {{ Moonlight }} as it plays inside the moonlight.",
                },
                Requirement: ["Moonlight"],
                difficulty: 2,
                Secret: true,
                SecretHint: "Double tap the unknown - only then will a secret voice speak, but which one will you hear?",
                category: "Hidden",
                rewards: [
                    {
                        type: "Achievement",
                        name: "Smile of the Moon",
                        description: "Smile at the moon, and it smiles back, did you hear that?",
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "Blood Moon",
                DetailsForSubmission: "Email an image of the Blood Moon with the solved answers visible. TIP: Refresh in the 'Entry' page until favicon bleeds red.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "Refresh the night until crimson weeps - when the tears fall, reach into them.",
                    Trivia: "The chance to get this is a 1/666, if you refresh from the entry page - this way you don't get kicked to being lost - although purely getting it is a 1/443,556 chance.",
                    Relations: "Next easter egg from {{ Moonlight }} as it plays from it in continuation",
                },
                Requirement: ["Moonlight"],
                Secret: true,
                SecretHint: "Refresh until it weeps in red - then touch its sorrow and solve its secrets.",
                difficulty: 3,
                category: "Hidden",
                rewards: [
                    {
                        type: "Achievement",
                        name: "Crimson Moon",
                        description: "Caught the moon in its moment of sorrow.",
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "root://",
                DetailsForSubmission: "Email two images, each showing output of one of the secret commands.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "Two keys lie buried: one of power, one of identity. Use your tools, find their echoes.",
                    Trivia: "Command output is buried behind obfuscation - minimalistic truth in the datamine shell itself.",
                    Relations: "Solved in {{ Datamine }}",
                },
                Requirement: ["Datamine"],
                Secret: true,
                SecretHint: "Invoke the shell, find two truths - one of identity and one of power.",
                difficulty: 2,
                category: "Hidden",
                rewards: [
                    {
                        type: "Achievement",
                        name: "3Who's",
                        description: "WhoAreYou? WhoAreWe? WhoAreThey?",
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "Better Odds",
                DetailsForSubmission: "Email a video showing the 404 redirect triggered from Ones and Zeros.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "Distort, color, and frame the odds - reveal what hides beneath the number.",
                    Trivia: "After this quest, Moonlight’s odds shift to 1/404 temporarily.",
                    Relations: "Solved in {{ Ones and Zeros }}",
                },
                Requirement: ["Ones and Zeros"],
                Secret: true,
                SecretHint: "Saturate the void, slice its symmetry - only then will the true number reveal, type it and get redirected.",
                difficulty: 4,
                category: "Hidden",
                rewards: [
                    {
                        type: "Experience",
                        name: "Cognitive Fracture",
                        description: "A moment of clarity in the chaos of the unknown.",
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "Insanity",
                DetailsForSubmission: "Email an image showing the HTML comments at the end of 'End it here'.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "What’s seen is a lie - inspect, and beneath it, you'll find whispers meant for no one.",
                    Trivia: "The comments are a remnant of previous 'YOU', aka vessels, just do note the comments aren't canon cause [REDACTED] may have changed them ;).",
                    Relations: "Solved in {{ End it here }}",
                },
                Requirement: ["End it here"],
                Secret: true,
                SecretHint: "When the world ends, 'inspect' the void and read what remains of 'you'.",
                difficulty: 1,
                category: "Hidden",
                rewards: [
                    {
                        type: "Experience",
                        name: "Comment Fragment",
                        description: "A leftover whisper of an uncompiled soul.",
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
        ],
    },
]
