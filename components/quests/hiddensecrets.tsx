import {Questline} from "@/lib/types";

export const HiddenSecrets1: Questline[] = [
    {
        questline_name: "Hidden Secrets: I",
        description: "A hidden archive of technical anomalies, false leads, and digital ghosts. Unlocked only after the Prologue is fully completed.",
        category: "Side Content",
        location: "???",
        timeline: 5,
        quests: [
            {
                QuestName: "Trees have logs: I",
                DetailsForSubmission: "Zip and send the 26 research logs.",
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis: "Each one hides something, those are barely touched - each one a leaf in the archive",
                    Relations: "These quests change or relate to this: {{ E/e }}, {{ Trees have logs: II }}, {{ Trees have logs: III }}",
                },
                Requirement: ["E/e"],
                difficulty: 1,
                category: "Side",
                QuestCredit: {
                    name: "Fish", date: "05/11/2025"
                },
            },
            {
                QuestName: "Trees have logs: II",
                DetailsForSubmission: "Zip and send the 43 fight logs",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "The fight logs have been modified - most non-comprehensible.. but the rest contain major secrets...",
                    Relations: "These quests change or relate to this: {{ Trees have logs: I }}, {{ Trees have logs: III }}, {{ VESSEL }}",
                },
                Requirement: ["VESSEL"],
                difficulty: 1,
                category: "Side",
                QuestCredit: {name: "", date: ""},
            },
            {
                QuestName: "Trees have logs: III",
                DetailsForSubmission: "Zip and send the 666 error logs",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "Most corrupted, others nonsensical, and others just encrypted... what is hiding?",
                    Relations: "These quests change or relate to this: {{ Trees have logs: I }}, {{ Trees have logs: II }}, {{ VESSEL }}",
                },
                Requirement: ["VESSEL"],
                difficulty: 1,
                category: "Side",
                QuestCredit: {name: "", date: ""},
            },
            {
                QuestName: "A red herring: I",
                DetailsForSubmission: "Email the decompiled code",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "Nothing to see here-unless you *really* read the executable.",
                    Trivia: "A red herring isn’t always a lie. Sometimes it’s bait.",
                    Relations: "These quests change or relate to this: {{ First Launch }}, {{ Trees have logs: II }}, {{ Trees have logs: III }}",
                },
                Requirement: ["VESSEL"],
                Secret: true,
                SecretHint: "DECOMPILE ME",
                difficulty: 3,
                category: "Hidden",
                rewards: [
                    {
                        type: "Skill",
                        name: "Reverse Engineering",
                    },
                ],
                QuestCredit: {name: "", date: ""},
            },
            {
                QuestName: "A red herring: II",
                DetailsForSubmission: "Email the binary found in the mp4 and its timestamp",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "It’s not the frame. It’s what hides inside its bits, though its bait.",
                    Relations: "These quests change or relate to this: {{ E/e }}, {{ Trees have logs: I }}, {{ Trees have logs: III }}",
                },
                Requirement: ["E/e"],
                Secret: true,
                SecretHint: "An mp4 hidden in a frame containing a binary",
                difficulty: 2,
                category: "Hidden",
                QuestCredit: {
                    name: "",
                    date: ""
                },
            },
            {
                QuestName: "A red herring: III",
                DetailsForSubmission: "Email the steg message",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "Steg a png. Find the whispering pixels.",
                    Trivia: "Steg the peg is not canon. It’s a joke. Trust me ;)",
                    Relations: "These quests change or relate to this: {{ E/e }}, {{ Trees have logs: I }}, {{ Trees have logs: II }}",
                },
                Requirement: ["E/e"],
                Secret: true,
                SecretHint: "'Steg a png' - by steg the png",
                difficulty: 1,
                category: "Hidden",
                rewards: [
                    {
                        type: "Reputation",
                        name: "Steg Respect",
                        description: "... What?",
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: ""
                },
            },
            {
                QuestName: "Inky black",
                DetailsForSubmission: "Email me the img that deceives",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "\"The ink is black. The paper is white. The words are red. The meaning is lost.\" (Here goes your sanity as to what this can mean)",
                    Relations: "Originates from the quest {{ First Launch }}",
                },
                Requirement: ["VESSEL"],
                difficulty: 2,
                category: "Side",
                QuestCredit: {name: "", date: ""},
            },
            {
                QuestName: "The 4th learnt word",
                DetailsForSubmission: "Email me the decompiled python code",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "Where trees grow and the player fell, snakes slither in source. I DONT HAVE SKIN - I DONT HAVE EYES - YET I SEE YOU - I KNOW YOU - I AM YOU - I AM ME",
                    Trivia: "This is nothing, you may ignore it, definetly not related to any sort of lore...",
                    Relations: "Originates from {{ E/e }}",
                },
                Secret: true,
                SecretHint: "Where trees grow and I fell, give me the snakes code.",
                Requirement: ["E/e"],
                difficulty: 1,
                category: "Hidden",
                QuestCredit: {name: "", date: ""},
            },
            {
                QuestName: "§███§",
                DetailsForSubmission: "Email me the █.txt deciphered",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "The glyphs know. You just forgot the language. Do you remember?",
                    Trivia: ":)",
                    Relations: "Originates from {{ First Launch }}",
                },
                Requirement: ["VESSEL"],
                difficulty: 2,
                category: "Hidden",
                Secret: true,
                SecretHint: "█.txt -> :) - by ███",
                rewards: [
                    {
                        type: "Achievement",
                        name: "███",
                        description: "█████████████"
                    },
                ],
                QuestCredit: {name: "", date: ""},
            },
            {
                QuestName: "Leafs, roots and growing saplings",
                DetailsForSubmission: "Email me the 4 files (rootsim.exe and its 3 byproducts of 2 img and 1 txt)",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "The program grows and divides. One root, two twins, three children. Each speaks differently.",
                    Relations: "Originates from {{ E/e }}",
                },
                Requirement: ["E/e"],
                difficulty: 2,
                category: "Side",
                QuestCredit: {name: "", date: ""},
            },
            {
                QuestName: "Music to my TREES",
                DetailsForSubmission: "Email me the 'lost five mus' and their description in your own words",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "It got hacked, it got meme'd and it got ████",
                    Relations: "Originates from {{ E/e }}",
                },
                Requirement: ["E/e"],
                difficulty: 2,
                category: "Side",
                QuestCredit: {name: "", date: ""},
            },
            {
                QuestName: "Lorem Ipsum Dolor",
                DetailsForSubmission: "Email me the secret given by 'donec ante dolor.exe', but it is like a flower, and only provides its secret after you *BLOOM* it.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "A dump of secrets, hidden in a file that only blooms when you run it 15 times. It is a flower of pain and secrets.",
                    Trivia: "Lorem ipsum dolor is a placeholder text used by many, although in latin it can also translate to 'very painful', which works with the EXE name of 'donec ante dolor' meaning 'until before pain'.",
                    Relations: "You can only get this after completing the bonus quest {{ Everything is fine }}",
                },
                Requirement: ["Everything is fine"],
                MissName: "Ante Dolorem Flos",
                MissInfo: "Failed to get the files due to missing the quest.",
                failIfFailed: "{{ Everything is fine }}",
                difficulty: 3,
                category: "Side",
                QuestCredit: {name: "", date: ""},
            },
        ],
    },
]

export const HiddenSecrets2: Questline[] = [
    {
        questline_name: "Hidden Secrets: II",
        description: "A hidden archive of technical anomalies, false leads, and digital ghosts. Unlocked only after the Prologue is fully completed. This contains the difficult path, and the optional and spared - This does not count at all to any missed quests",
        category: "Side Content",
        location: "???",
        timeline: 6,
        quests: [
            {
                QuestName: "Too many choices",
                DetailsForSubmission: "Email proof of you getting all secrets in Choice, you can know your progress from the little progress bar in the 'choices' page.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "Every small action you do, or involuntarily did can trigger an extra surprise.",
                    Trivia: "Due to this quests storyline difficulty, it is not included in the fail requirements of {{ Narrator: A Harbinger }} and {{ Narrator: Tenacity }}.",
                    Relations: "By {{ fan-TAS-tic }}, its in the site page itself.",
                },
                Requirement: ["fan-TAS-tic"],
                difficulty: 5,
                category: "Special",
                rewards: [
                    {
                        type: "Experience",
                        name: "EGGS",
                        description: "Saw many random blabbering, this sure to be a experience you may forget"
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "Secrets in the logs of trees: I",
                DetailsForSubmission: "Email the HEX KEY of research logs [15]",
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis: "You are digging way too deep... STOP!",
                    Trivia: "Due to this quests storyline difficulty, it is not included in the fail requirements of {{ Narrator: A Harbinger }} and {{ Narrator: Tenacity }}. Also I just gave up on this and gave the answer, this one was broken",
                    Relations: "Part of {{ Secrets in the logs of trees: II }}, {{ Secrets in the logs of trees: III }} quest series, by {{ Trees have logs: I }}",
                },
                Requirement: ["Trees have logs: I"],
                difficulty: 3,
                category: "Special",
                rewards: [
                    {
                        type: "Item",
                        name: "HEX XOR KEY",
                        amount: 1,
                        description: "Part of a key to unlock something encrypted"
                    },
                ],
                QuestCredit: {
                    name: "Fish",
                    date: "05/11/2025",
                },
            },
            {
                QuestName: "Secrets in the logs of trees: II",
                DetailsForSubmission: "Email the HEX KEY of research logs [3]",
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis: "Segment 0022 is a temporal infection-planted by TR33 or VESSEL from the future - that rewrote TREE’s origin??",
                    Trivia: "Due to this quests storyline difficulty, it is not included in the fail requirements of {{ Narrator: A Harbinger }} and {{ Narrator: Tenacity }}.",
                    Relations: "Part of {{ Secrets in the logs of trees: I }}, {{ Secrets in the logs of trees: III }} quest series, by {{ Trees have logs: II }}",
                },
                Requirement: ["Trees have logs: II"],
                difficulty: 1,
                category: "Special",
                rewards: [
                    {
                        type: "Item",
                        name: "HEX XOR KEY",
                        amount: 2,
                        description: "Part of a key to unlock something encrypted"
                    },
                ],
                QuestCredit: {
                    name: "Someone provided this??",
                    date: "05/11/2025",
                },
            },
            {
                QuestName: "Secrets in the logs of trees: III",
                DetailsForSubmission: "Email the HEX KEY of research logs [4-6-25]",
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis: "It is getting way too confusing, and way to many HEXes",
                    Trivia: "Due to this quests storyline difficulty, it is not included in the fail requirements of {{ Narrator: A Harbinger }} and {{ Narrator: Tenacity }}.",
                    Relations: "Part of {{ Secrets in the logs of trees: I }}, {{ Secrets in the logs of trees: II }} quest series, by {{ Trees have logs: III }}",
                },
                Requirement: ["Trees have logs: III"],
                difficulty: 5,
                category: "Special",
                rewards: [
                    {
                        type: "Item",
                        name: "HEX XOR KEY",
                        amount: 3,
                        description: "Part of a key to unlock something encrypted"
                    },
                ],
                QuestCredit: {
                    name: "Fish",
                    date: "05/11/2025",
                },
            },
            {
                QuestName: "Secrets in the logs of trees: IV",
                DetailsForSubmission: "Email the log [0] decrypted with all 3 HEX KEYS obtained from the previous quests in order of the quests themselves.",
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis: "The final log.. uncovered, a train full of secrets uncovers",
                    Trivia: "Due to this quests storyline difficulty, it is not included in the fail requirements of {{ Narrator: A Harbinger }} and {{ Narrator: Tenacity }}.",
                    Relations: "Part of {{ Secrets in the logs of trees: I }}, {{ Secrets in the logs of trees: II }}, {{ Secrets in the logs of trees: III }} quest series.",
                },
                Requirement: ["Secrets in the logs of trees: I", "Secrets in the logs of trees: II", "Secrets in the logs of trees: III"],
                difficulty: 3,
                Secret: true,
                SecretHint: "Decrypt the log[0] with the 3 HEX keys obtained, In the order of the quests themselves",
                category: "Special",
                rewards: [
                    {
                        type: "Experience",
                        name: "Research History",
                        description: "You got a basic gist of the research logs lore"
                    },
                ],
                QuestCredit: {
                    name: "Fish",
                    date: "05/11/2025",
                },
            },
            {
                QuestName: "Hidden Voices",
                DetailsForSubmission: "Email the full poem transcribed of the garbled audio file 'lost' - You may need to find the EXE that turns oil to words.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "A random audio file, sent only after {{ Narrator: A Harbinger }}, hides a poem in its spectrogram. The narrator speaks in frequencies, not words.",
                    Trivia: "This is the hardest quest. The audio is random, and the poem is only visible through a spectrogram.",
                    Relations: "Unlocked after {{ Narrator: A Harbinger }} in the source files folder 'secrets'.",
                },
                Requirement: ["Narrator: A Harbinger"],
                failIfFailed: "{{ Narrator: A Harbinger }}",
                MissName: "Lost Voice",
                MissInfo: "Failed to get the files due to missing the quest.",
                difficulty: 5,
                category: "Hidden",
                Secret: true,
                SecretHint: "Frequencies reveal the narrator's poem.",
                rewards: [
                    {
                        type: "Achievement",
                        name: "Spectral Listener",
                        description: "You heard what was never spoken nor written.",
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "Chromatic Cipher",
                DetailsForSubmission: "Email the decoded message from the color frames in the color video file found in 'lost'.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "A video file, each frame a solid color, each color a hex value. The message is hidden in plain sight, one frame per second.",
                    Relations: "Unlocked after {{ Narrator: A Harbinger }} in the source files folder 'secrets'.",
                },
                Requirement: ["Narrator: A Harbinger"],
                failIfFailed: "{{ Narrator: A Harbinger }}",
                MissName: "Colorblind",
                MissInfo: "Failed to get the files due to missing the quest.",
                difficulty: 5,
                category: "Hidden",
                Secret: true,
                SecretHint: "Extract the value from each frame to reveal the message.",
                rewards: [
                    {
                        type: "Achievement",
                        name: "Chromatic Decoder",
                        description: "You read the message in the colors.",
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
        ]
    },
]
