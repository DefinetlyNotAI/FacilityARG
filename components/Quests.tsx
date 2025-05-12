import {Questline} from "@/lib/types";

export const Data: Questline[] = [
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
                    name: "Shahm Najeeb",
                    date: "",
                },
            },
            {
                QuestName: "Support",
                DetailsForSubmission: "Only if Poll results favorable",
                SolveStatus: "Pending",
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
                    Trivia: "This quest acts as the opening to the actual ARG gameplay sequences - Good luck.",
                    Relations: "Required {{ Support }} and {{ Leaking }}",
                },
                Requirement: ["Support", "Leaking"],
                MissName: "Dead Signal",
                MissInfo: "Fail Support quest",
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
                ],
                QuestCredit: {
                    name: "Shahm Najeeb..?",
                    date: "",
                },
            },
        ],
    },
    {
        questline_name: "The Facility",
        description: "A series of cryptic tasks that unravel the truth buried within the walls of the forgotten network facility, the Main ARG project.",
        category: "Main Story",
        location: "Abandoned Research Facility",
        timeline: 2,
        quests: [
            {
                QuestName: "Locked Out",
                DetailsForSubmission: "Submit a img of proof of completion of the section Wifi Login",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "The first gate stands closed. Crack the system’s first lock.",
                    Relations: "Started from {{ Facility }}"
                },
                Requirement: ["Facility"],
                difficulty: 2,
                category: "Main",
                relatedQuestlines: ["Prologue"],
                timeEstimate: 25,  // TODO Update this
                rewards: [
                    {
                        type: "Item",  // TODO Update this
                        name: "ID Key",
                        description: "A special cookie ID that grants access to the facility's network panel."
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: ""
                }
            },
            {
                QuestName: "Interference*",
                DetailsForSubmission: "Cutscene auto-unlocked with Locked Out",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "TAS is not alone. Something else is here.",
                    Relations: "Cutscene from {{ Locked Out }}"
                },
                Requirement: ["Locked Out"],
                category: "Special",
                rewards: [
                    {
                        type: "Achievement",
                        name: "Echoes of the Signal",
                        description: "You witnessed [REDACTED]."
                    }
                ],
                QuestCredit: {
                    name: "You?",
                    date: ""
                }
            },
            {
                QuestName: "Networking",
                DetailsForSubmission: "Submit a img of proof of completion of the section Wifi panel",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "x",   // TODO Update this
                    Relations: "Continuation of {{ Locked Out }}"
                },
                Requirement: ["Locked Out"],
                difficulty: 3,  // TODO Update this
                category: "Main",
                timeEstimate: 15,  // TODO Update this
                rewards: [
                    {
                        type: "Item",  // TODO Update this if there is a keyword
                        name: "Data Spike",
                        description: "Used to break down basic digital locks."
                    }
                ],
                QuestCredit: {
                    name: "",
                    date: ""
                }
            },
            {
                QuestName: "Confidential",
                DetailsForSubmission: "Submit a img of proof of completion of the section",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "x",  // TODO Update this
                    Relations: "Continuation of {{ Networking }}"
                },
                Requirement: ["Networking"],
                difficulty: 3,  // TODO Update this
                category: "Main",
                timeEstimate: 20,  // TODO Update this
                rewards: [
                    {
                        type: "Skill",  // TODO Update this if there is a keyword
                        name: "Decryption I",
                        description: "Unlocks the ability to access low-security encoded files."
                    }
                ],
                QuestCredit: {
                    name: "",
                    date: ""
                }
            },
            {
                QuestName: "Buttons & Browsers",
                DetailsForSubmission: "Submit a img of proof of completion of the section Buttons",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "It seems this place is global... why is that?.",
                    Trivia: "The whole page is the only page that is global and requires many people to solve together to complete it.",
                    Relations: "Continuation of {{ Confidential }}"
                },
                Requirement: ["Confidential"],
                difficulty: 2,
                category: "Main",
                timeEstimate: 5,  // TODO Update this
                QuestCredit: {
                    name: "",
                    date: ""
                }
            },
            {
                QuestName: "Datamine",
                DetailsForSubmission: "Submit a img of proof of completion of the section file console",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "A barely standing console that you shouldn't be seeing, how many files can you see?.",
                    Relations: "Continuation of {{ Buttons & Browsers }}"
                },
                Requirement: ["Buttons & Browsers"],
                difficulty: 4,  // TODO Update this
                category: "Main",
                timeEstimate: 25,  // TODO Update this
                rewards: [
                    {
                        type: "Item",  // TODO Update this if there is a keyword
                        name: "Encrypted Archive: Delta",
                        description: "A massive data packet. What’s inside is unknown."
                    }
                ],
                QuestCredit: {
                    name: "",
                    date: ""
                }
            },
            {
                QuestName: "R̴̨̢̳̜͇͊͜ͅŲ̴̡̘̫͔͒̒͘͝͠Ń̷̞̯̂̀̎̍͋̽̈́",
                DetailsForSubmission: "Submit a img of proof of completion of the section h0m3",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "Something is watching. Don’t look back. Run. Run. Run.",
                    Relations: "Continuation of {{ Datamine }}"
                },
                Requirement: ["Datamine"],
                difficulty: 5,  // TODO Update this
                category: "Main",
                timeEstimate: 10,  // TODO Update this
                rewards: [
                    {
                        type: "Achievement",  // TODO Update this if there is a keyword
                        name: "Unseen Observer",
                        description: "You encountered the presence... and survived."
                    }
                ],
                QuestCredit: {
                    name: "",
                    date: ""
                }
            },
            {
                QuestName: "Br3@k1Ng D0wN",
                DetailsForSubmission: "Submit a img of proof of completion of the section scroll",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "The interface collapses. Words scramble. Reality blinks.",
                    Relations: "Continuation of {{ R̴̨̢̳̜͇͊͜ͅŲ̴̡̘̫͔͒̒͘͝͠Ń̷̞̯̂̀̎̍͋̽̈́ }}"
                },
                Requirement: ["R̴̨̢̳̜͇͊͜ͅŲ̴̡̘̫͔͒̒͘͝͠Ń̷̞̯̂̀̎̍͋̽̈́"],
                difficulty: 3,  // TODO Update this
                category: "Main",
                timeEstimate: 15,  // TODO Update this
                QuestCredit: {
                    name: "EE",
                    date: "3rd ??? 1525"
                }
            },
            {
                QuestName: "Ones and Zeros",
                DetailsForSubmission: "Submit a img of proof of completion of the section black'n'white",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "A QR and a glob of Black and White pixels, Binary lives here practically.",
                    Relations: "Continuation of {{ Br3@k1Ng D0wN }}"
                },
                Requirement: ["Br3@k1Ng D0wN"],
                difficulty: 4,  // TODO Update this
                category: "Main",
                timeEstimate: 18,  // TODO Update this
                rewards: [
                    {
                        type: "Item",  // TODO Update this if there is a keyword
                        name: "Corrupted Cipher Disk",
                        description: "Decodes a portion of the saga's central puzzle."
                    }
                ],
                QuestCredit: {
                    name: "",
                    date: ""
                }
            },
            {
                QuestName: "fan-TAS-tic",
                DetailsForSubmission: "Submit a img of proof of completion of the section Choice",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "The system offers you a choice. But it doesn't matter.",
                    Relations: "Continuation of {{ Ones and Zeros }}"
                },
                Requirement: ["Ones and Zeros"],
                difficulty: 2,  // TODO Update this
                category: "Main",
                timeEstimate: 8,  // TODO Update this
                QuestCredit: {
                    name: "THISISNOTME",
                    date: ""
                }
            },
            {
                QuestName: "Bye cruel world*",
                DetailsForSubmission: "Cutscene auto-unlocked with fan-TAS-tic",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "The screen goes black. And your best friend gets DELETED KILLED REMOVED DISPOSED OF.",
                    Relations: "Cutscene from {{ fan-TAS-tic }}"
                },
                Requirement: ["fan-TAS-tic"],
                category: "Special",
                QuestCredit: {
                    name: "To TAS",
                    date: "Yesterday"
                },
                relatedQuestlines: ["Fight"],
            },
            {
                QuestName: "E/e",
                DetailsForSubmission: "Submit a img of proof of completion of the section Terminal",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "Your speaking to [REDACTED]. [REDACTED] is not happy.",
                    Relations: "Continuation of {{ fan-TAS-tic }} as well as the cutscene {{ Bye cruel world* }}"
                },
                relatedQuestlines: ["Fight"],
                Requirement: ["Bye cruel world*", "fan-TAS-tic"],
                difficulty: 4,  // TODO Update this
                category: "Main",
                timeEstimate: 12,  // TODO Update this
                rewards: [
                    {
                        type: "Skill",  // TODO Update this to the exe etc
                        name: "Command Injection",
                        description: "Allows the bypassing of scripted events in some questlines."
                    }
                ],
                QuestCredit: {
                    name: "",
                    date: ""
                }
            },
            {
                QuestName: "End it here",
                DetailsForSubmission: "Submit a img of proof of completion of the section THE END",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "There’s no going back. Unless you never left.",
                    Relations: "Occurs after {{ E/e }} from this questline, as well as {{ It saw }} from the fight questline"
                },
                Requirement: ["E/e", "It saw"],
                category: "Main",
                relatedQuestlines: ["Fight", "Prologue"],
                rewards: [
                    {
                        type: "Achievement",  // TODO Update this
                        name: "Facility Purged",
                        description: "You witnessed the full extent of the Facility arc."
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: ""
                }
            }
        ]
    },
    {
        questline_name: "Fight",
        description: "A fragmented confrontation stitched from memory, code, and choice. Face what watches you.",
        category: "Main Story",
        location: "YOUR COMPUTER",
        timeline: 3,
        quests: [
            {
                QuestName: "First launch",
                DetailsForSubmission: "Submit a video of the downloaded EXE running, make sure to wait until it loads fully!!",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "You’ve found the executable. Now open the door.",
                    Trivia: "The EXE actually constructs its dependencies.",
                },
                Requirement: ["Facility"],
                relatedQuestlines: ["Prologue", "The Facility"],
                difficulty: 1,
                category: "Main",
                timeEstimate: 5,  // TODO Update this
                rewards: [
                    {
                        type: "Item",  // TODO Update this as needed
                        name: "Woken Shard",
                        description: "A fractured memory fragment containing a forgotten audio cue.",
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "In between*",
                DetailsForSubmission: "(Cutscene auto unlocked with First launch)",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "A presence between frames. You weren’t supposed to see this.",
                    Trivia: "This cutscene only plays once. Watch closely, Also this scene constructs the game files simultaneously.",
                    Relations: "Cutscene from {{ First launch }}",
                },
                Requirement: ["First launch"],
                category: "Special",
                QuestCredit: {
                    name: "Vessel",
                    date: "Tomorrow",
                },
            },
            {
                QuestName: "I'm blind",
                DetailsForSubmission: "Email me the -blind.log created by completing ending 1",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "You chose to see. And so it took your sight.",
                    Relations: "Continuation of {{ First launch }}",
                },
                Requirement: ["First launch"],
                difficulty: 3,  // TODO Update this
                category: "Main",
                timeEstimate: 10,  // TODO Update this
                rewards: [
                    {
                        type: "Reputation",  // TODO Update this as needed
                        name: "Truthseeker",
                        description: "Marked as one who chose to see the original path.",
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "Don't touch",
                DetailsForSubmission: "Email me the -untouchable.log created by completing ending 2",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "You refused. You never allowed it to infect you.",
                    Trivia: "Ending 2 can only be reached by not getting hit at all.",
                    Relations: "Continuation of {{ First launch }}",
                },
                Requirement: ["First launch"],
                difficulty: 4,  // TODO Update this
                category: "Side",
                timeEstimate: 15,  // TODO Update this
                rewards: [
                    {
                        type: "Skill",  // TODO Update this as needed
                        name: "Passive Resistance",
                        description: "You unlock the ability to resist subtle manipulations in later segments.",
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "It saw",
                DetailsForSubmission: "Email me the e_e.log created by completing ending 3",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "You saw through it, understood all its secrets and uncovered all its logs.",
                    Trivia: "This ending is the most difficult to achieve as well as the most CANON. It requires you to get all the Secret attacks at least once, thus requiring you to fight more than once.",
                    Relations: "Continuation of {{ I'm blind }}, Has cutscene {{ Secrets swallowed whole* }}",
                },
                Requirement: ["I'm blind"],
                difficulty: 5,
                category: "Main",
                timeEstimate: 12,  // TODO Update this
                rewards: [
                    {
                        type: "Item",  // TODO Update this as needed
                        name: "Observed Tag",
                        description: "You are now known. This may affect future quests.",
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "Secrets swallowed whole*",
                DetailsForSubmission: "(Cutscene auto unlocked with It saw)",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "No logs. No witnesses. Just IT in the dark.",
                    Relations: "Cutscene from {{ It saw }}",
                },
                Requirement: ["It saw"],
                Secret: true,
                SecretHint: "It's hungry for knowledge. Or maybe just endings.",
                category: "Special",
                QuestCredit: {
                    name: "Vessel",
                    date: "EVERYDAY",
                },
            },
        ],
    },
    {
        questline_name: "Easter Eggs",
        description: "Whispers between the cracks, secrets buried in byte and breath — where truth isn’t spoken but discovered.",
        category: "Side Content",
        location: "Scattered in the Abandoned Research Facility",
        timeline: 4,
        quests: [
            {
                QuestName: "Moonlight",
                DetailsForSubmission: "Email an image of you within the secret 'moonlight' section.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "A page not found, yet found in fate — wander, refresh, and lose thyself to odds that tease the abyss.",
                    Trivia: "The odds of encountering Moonlight are 1 in 666.",
                    Relations: "These quests change or relate to this: {{ Better Odds }}, {{ Time* }}, {{ Blood Moon }}",
                },
                Secret: true,
                SecretHint: "The devil’s number awaits the damned — wander till the digital stars align.",
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
                DetailsForSubmission: "(None – triggered cutscene unlocked by completing Moonlight)",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "Time unravels in echoes once the moonlight has been touched — a vision unfolds, unasked and irreversible.",
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
                QuestName: "Blood Moon",
                DetailsForSubmission: "Email an image of the Blood Moon with the solved answers visible.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "Refresh the night until crimson weeps — when the tears fall, reach into them.",
                    Relations: "Next easter egg from {{ Moonlight }} as it plays from it in continuation",
                },
                Requirement: ["Moonlight"],
                Secret: true,
                SecretHint: "Refresh until it weeps in red — then touch its sorrow and solve its secrets.",
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
                    Trivia: "Command output is buried behind obfuscation — minimalistic truth in the datamine shell itself.",
                    Relations: "Solved in {{ Datamine }}",
                },
                Requirement: ["Datamine"],
                Secret: true,
                SecretHint: "Invoke the shell, find two truths — one of identity and one of power.",
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
                    Synopsis: "Distort, color, and frame the odds — reveal what hides beneath the number.",
                    Trivia: "After this quest, Moonlight’s odds shift to 1/404.",
                    Relations: "Solved in {{ Ones and Zeros }}",
                },
                Requirement: ["Ones and Zeros"],
                Secret: true,
                SecretHint: "Saturate the void, slice its symmetry — only then will the true number reveal, type it and get redirected.",
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
                    Synopsis: "What’s seen is a lie — inspect, and beneath it, you'll find whispers meant for no one.",
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
            {
                QuestName: "Flowers",
                DetailsForSubmission: "Email an image of the dissected flower at the end of 'End it here'.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "A digital bloom, dismembered by keystroke — from its petals, meaning spills.",
                    Trivia: "The flower asset used is from Undertale and is flowey the flower - YOUR BEST FRIEND - Both the normal and cut sprites are from UT.",
                    Relations: "Solved in {{ End it here }}",
                },
                Requirement: ["End it here"],
                Secret: true,
                SecretHint: "In the very end, type what ends, and the flower will unfold its corpse.",
                difficulty: 1,
                category: "Hidden",
                rewards: [
                    {
                        type: "Item",
                        name: "Wilted Petal",
                        description: "A corrupted bloom — carries residual grief.",
                    },
                    {
                        type: "Achievement",
                        name: "Floracide",
                        description: "You found beauty, then broke it.",
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
        ],
    },
    {
        questline_name: "Secret Files",
        description: "A hidden archive of technical anomalies, false leads, and digital ghosts. Unlocked only after the Prologue is fully completed.",
        category: "Side Content",
        location: "EVERYWHERE AND NOWHERE",
        timeline: 5,
        quests: [
            {
                QuestName: "Trees have logs: I",
                DetailsForSubmission: "Email all the research logs",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "Zip and send the 26 research logs—each one a leaf in the archive.",
                    Trivia: "‘Trees’ is literal and metaphorical—file structure and knowledge roots.",
                    Relations: "These quests change or relate to this: {{ E/e }}, {{ Trees have logs: II }}, {{ Trees have logs: III }}",
                },
                Requirement: ["E/e"],
                difficulty: 1,
                category: "Side",
                QuestCredit: {name: "", date: ""},
            },
            {
                QuestName: "Trees have logs: II",
                DetailsForSubmission: "Email all the fight logs",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "Send the 43 fight logs—the battlefield remembers everything.",
                    Relations: "These quests change or relate to this: {{ Trees have logs: I }}, {{ Trees have logs: III }}, {{ It saw }}",
                },
                Requirement: ["It saw"],
                difficulty: 2,
                category: "Side",
                QuestCredit: {name: "", date: ""},
            },
            {
                QuestName: "Trees have logs: III",
                DetailsForSubmission: "Email all the error logs",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "Zip and send the 666 error logs — corruption is a language too.",
                    Trivia: "The number is intentional. Watch the filenames closely.",
                    Relations: "These quests change or relate to this: {{ Trees have logs: I }}, {{ Trees have logs: II }}, {{ It saw }}",
                },
                Requirement: ["It saw"],
                difficulty: 3,
                category: "Side",
                QuestCredit: {name: "", date: ""},
            },
            {
                QuestName: "A red herring: I",
                DetailsForSubmission: "Email the decompiled code",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "Nothing to see here—unless you *really* read the executable.",
                    Trivia: "A red herring isn’t always a lie. Sometimes it’s bait.",
                    Relations: "These quests change or relate to this: {{ First Launch }}, {{ Trees have logs: II }}, {{ Trees have logs: III }}",
                },
                Requirement: ["First launch"],
                Secret: true,
                SecretHint: "DECOMPILE ME",
                difficulty: 3,
                category: "Hidden",
                timeEstimate: 10,
                rewards: [
                    {
                        type: "Skill",
                        name: "Reverse Engineering",
                        amount: 1,
                    },
                ],
                QuestCredit: {name: "", date: ""},
            },
            {
                QuestName: "A red herring: II",
                DetailsForSubmission: "Email the binary and timestamp of the mp4",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "A single frame holds too much. Extract it.",
                    Trivia: "It’s not the frame. It’s what hides inside its bits, though its bait.",
                    Relations: "These quests change or relate to this: {{ E/e }}, {{ Trees have logs: I }}, {{ Trees have logs: III }}",
                },
                Requirement: ["E/e"],
                Secret: true,
                SecretHint: "An mp4 of a frame of binary",
                difficulty: 2,
                category: "Hidden",
                timeEstimate: 20,  // TODO Update this
                QuestCredit: {name: "", date: ""},
            },
            {
                QuestName: "A red herring: III",
                DetailsForSubmission: "Email the steg message",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "Steg a png. Find the whispering pixels.",
                    Trivia: "Don’t trust the pixels. Trust their silence.",
                    Relations: "These quests change or relate to this: {{ E/e }}, {{ Trees have logs: I }}, {{ Trees have logs: II }}",
                },
                Requirement: ["E/e"],
                Secret: true,
                SecretHint: "'Steg a png' - by steg the png",
                difficulty: 1,
                category: "Hidden",
                timeEstimate: 3,
                rewards: [
                    {
                        type: "Reputation",
                        name: "Steg Respect",
                        description: "... What?",
                    },
                ],
                QuestCredit: {name: "", date: ""},
            },
            {
                QuestName: "Inky black",
                DetailsForSubmission: "Email me the img (shh.png)",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "The ink is black. The paper is white. The words are red. The meaning is lost. (Here goes your sanity as to what this can mean)",
                    Relations: "Originates from {{ First Launch }}",
                },
                Requirement: ["First launch"],
                difficulty: 2,
                category: "Side",
                QuestCredit: {name: "", date: ""},
            },
            {
                QuestName: "Null$k1n",
                DetailsForSubmission: "Email me the decompiled python code",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "Where trees grow and the player fell, snakes slither in source.",
                    Trivia: "I DONT HAVE SKIN - I DONT HAVE EYES - YET I SEE YOU - I KNOW YOU - I AM YOU - I AM ME - I AM NULL",
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
                QuestName: "§☐☐☐§",
                DetailsForSubmission: "Email me the ☐.txt deciphered",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "The glyphs know. You just forgot the language.",
                    Trivia: ":)",
                    Relations: "Originates from {{ First Launch }}",
                },
                Requirement: ["First launch"],
                difficulty: 5,
                category: "Hidden",
                Secret: true,
                SecretHint: "☐☐☐.txt -> :) - by ☐☐☐",
                rewards: [
                    {
                        type: "Achievement",
                        name: "☐☐☐",
                        description: "☐☐☐☐☐☐☐☐☐"
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
                difficulty: 1,
                category: "Side",
                QuestCredit: {name: "", date: ""},
            },
        ],
    },
    {
        questline_name: "Discord",
        description: "Quests related to the Discord server. Hidden until Prologue is 100% complete.",
        category: "Side Content",
        location: "Discord Server",
        timeline: 6,
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
                QuestName: "Its not enough",
                DetailsForSubmission: "Auto unlocks after the first person receives both 'End' roles.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "Joining wasn't enough. You've earned a title that echoes to the end.",
                    Trivia: "Technically all you needed to do was just beat {{ End it here }} and then claim your role in discord.",
                    Relations: "These quests change or relate to this: {{ Recruit }}, {{ End it here }}",
                },
                Requirement: ["Recruit", "End it here"],
                difficulty: 5,
                rewards: [
                    {
                        type: "Reputation",
                        name: "Discord - End bearer",
                        amount: 25,
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
                DetailsForSubmission: "Unlocks after someone submits TAS.tree to #lore.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "The tree grows again, a digital myth rewritten.",
                    Relations: "These quests change or relate to this: {{ Recruit }}, {{ E/e }}",
                },
                Requirement: ["Recruit", "E/e"],
                Secret: true,
                SecretHint: "The tree has already bloomed once. Submit your version from the 3 logs.",
                difficulty: 2,
                rewards: [
                    {
                        type: "Item",
                        name: "Glitched Seed",
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
                    Relations: "Required {{ TAS2 }}",
                },
                Requirement: ["TAS2"],
                Secret: true,
                SecretHint: "Once TAS comes back, ask your questions, and wait for your begging to be heard.",
                difficulty: 3,
                timeEstimate: 15,
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
                    Synopsis: "It’s more than play—it’s passion <3.",
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
                    Synopsis: "MMM Easter eggs, best served on April, my birthday.",
                    Trivia: "This quest can also count as a freebie such as {{ Its not enough }}, all you needed to do was just discover any easter egg and then claim your role in discord..",
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
    {
        questline_name: "Bonus Content Sagas",
        description: "A series of hidden sagas that unlock after completing the Facility questline and related questlines.",
        category: "Special Event",
        location: "The Heavens and Hell",
        timeline: 7,
        quests: [
            // FAIL MANUALLY ANY QUEST WHEN NEXT SAGA BEGINS //

            // —————— Saga I —————— //
            // Release when ready //
            {
                QuestName: "Connecting...",
                DetailsForSubmission: "Follow the site's instructions carefully to reboot it, Email as requested by site.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "The first step in unlocking the hidden bonus content. You must email as requested on the site.",
                    Trivia: "This quest is the gateway to all subsequent sagas. Its completion opens the door to the secrets beyond.",
                },
                MissName: "Timeout",
                MissInfo: "Failed to gain proper support, or failed to finish saga in time",
                Requirement: ["Recruit", "End it here", "Support"],
                failIfFailed: "{{ Support }}",
                difficulty: 1,
                relatedQuestlines: ["The Facility", "Prologue", "Fight"],
                category: "Special",
                rewards: [
                    {
                        type: "Item",
                        name: "Reboot Card",
                        amount: 1,
                        description: "A Card that reboots the first saga's site.",
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "Everything is fine",
                DetailsForSubmission: "Submit an image showing your completion of the site, Make sure the image is clear and contains the completion message.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "Submit an image showing your completion of the site.",
                    Trivia: "Only those who have completed the site can proceed to unlock deeper content.",
                    Relations: "Originates from {{ Connecting... }}",
                },
                Requirement: ["Connecting..."],
                MissName: "¿",
                MissInfo: "Failed to gain proper support, or failed to finish saga in time",
                failIfFailed: "{{ Connecting... }}",
                difficulty: 2,
                category: "Special",
                timeEstimate: 15,
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            // —————— Saga II —————— //
            /*
             Once previous saga ends, this begins exactly
             at 19th of the month once requirements met
            */
            {
                QuestName: "Empty?",
                DetailsForSubmission: "Autocompletes when site launches",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "This is the initial phase of Saga II. The quest automatically started when the site launches, there are 8 hidden URL's find them all, and before one of them expires",
                    Trivia: "This quest acts as a placeholder until the site becomes active.",
                    Relations: "Originates from {{ Recruit }}, Requires {{ It's not enough }}",
                },
                difficulty: 5,  // TODO Update me
                Requirement: ["Recruit", "Its not enough"],
                relatedQuestlines: ["Discord"],
                failIfFailed: "{{ Support }}",
                MissName: "Empty...",
                MissInfo: "Failed to gain proper support, or failed to finish saga in time",
                category: "Special",
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "3·15·25",
                DetailsForSubmission: "Ensure your image contains all three necessary URLs. Each link corresponds to a crucial piece of the stage.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "Submit an image of the current stage with three URLs that display your progress.",
                    Trivia: "This stage challenges your ability to track and document multiple pieces of information.",
                    Relations: "Originates from {{ Empty? }}",
                },
                Requirement: ["Empty?"],
                MissName: "25153",
                MissInfo: "Failed to gain proper support, or failed to finish saga in time",
                failIfFailed: "{{ Empty? }}",
                difficulty: 4,
                category: "Side",
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "Creator & Puppets",
                DetailsForSubmission: "The URLs should be interconnected, revealing a narrative of the creator's influence, Email img of current stage (2 urls)",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "Submit an image with two URLs showing your current stage, which reveals your understanding of the puzzle.",
                    Trivia: "This stage emphasizes the relationship between the creator and their creations, which one are you in this narrative?",
                    Relations: "Originates from {{ Empty? }}",
                },
                Requirement: ["Empty?"],
                MissName: "Stupid Puppet",
                MissInfo: "Failed to gain proper support, or failed to finish saga in time",
                failIfFailed: "{{ Empty? }}",
                difficulty: 4,
                category: "Side",
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "TR and Numbers",
                DetailsForSubmission: "The numbers reveal a hidden meaning—look for patterns and symbols in the URLs, Email img of current stage (2 urls)",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "Submit an image showing two URLs that capture the hidden meaning behind TR and numbers.",
                    Trivia: "This stage requires insight into symbolic numbers and hidden codes.",
                    Relations: "Originates from {{ Empty? }}",
                },
                Requirement: ["Empty?"],
                MissName: "Expired",
                MissInfo: "Failed to gain proper support, or failed to finish saga in time",
                failIfFailed: "{{ Empty? }}",
                difficulty: 4,
                category: "Side",
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "Time Runs Thin",
                DetailsForSubmission: "Email img of current stage (1 url of time)",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "This secret quest requires submission of an image showing the section of the puzzle, aka the URL.",
                    Trivia: "This quest is hidden and can only be unlocked if the 'TR and Numbers' quest is discovered before the deadline.",
                    Relations: "Originates from {{ TR and Numbers }}, Requires {{ Empty? }}",
                },
                Requirement: ["TR and Numbers", "Empty?"],
                MissName: "Timeless",
                MissInfo: "You failed to discover the meaning of 'TR and Numbers' in time.",
                Secret: true,
                SecretHint: "Timing is crucial—submit the image of the exact time before the deadline, get the time from the URL itself, be quick!",
                failIfFailed: "{{ TR and Numbers }} OR {{ Empty? }}",
                difficulty: 5,
                category: "Hidden",
                rewards: [
                    {
                        type: "Achievement",
                        name: "Master of Time",
                        amount: 1,
                        description: "An achievement for mastering the secrets of time within the saga.",
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            // —————— Saga III —————— //
            /*
             Wait a week from previous saga then release
             unless 'TAS2' not yet completed then
             wait extra 2 weeks or until complete
            */
            {
                QuestName: "3:Clocks and Hands",
                DetailsForSubmission: "Auto unlocks after release.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "The clock is ticking, and the hands of time are broken. Can you fix them in time, or will you be caught in a loop of failure?",
                    Relations: "These quests change or relate to this: {{ Cryptic ID: I }}, {{ Cryptic ID: II }}, {{ Cryptic ID: III }}",
                },
                Requirement: ["TAS2"],
                MissName: "Broken Me",
                relatedQuestlines: ["Discord"],
                MissInfo: "Did not complete TAS2 by now.",
                failIfFailed: "({{ Cryptic ID: I }} AND {{ Cryptic ID: II }} AND {{ Cryptic ID: III }}) OR {{ Support }}",  // TODO Implement this -> TAS2 not completed
                difficulty: 1,
                category: "Special",
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "Cryptic ID: I",
                DetailsForSubmission: "Keyword 1 sent to #lore",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "A hidden riddle awaits, only visible to those who know the secret phrase.",
                    Trivia: "The message has been hidden within layers of digital noise.",
                    Relations: "These quests change or relate to this: {{ Cryptic ID: II }}, {{ Cryptic ID: III }}, {{ 3:Clocks and Hands }}",
                },
                Requirement: ["3:Clocks and Hands"],
                MissName: "Whatami:1",
                MissInfo: "Failed to gain proper support, or failed to send keyword in time",
                failIfFailed: "{{ 3:Clocks and Hands }}",
                Secret: true,
                SecretHint: "Grab the key given and send to #lore.",
                difficulty: 1,
                category: "Hidden",
                rewards: [
                    {
                        type: "Item",
                        name: "Timekeeper's Token",
                        amount: 1,
                        description: "A token to unlock further hidden quests.",
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "Cryptic ID: II",
                DetailsForSubmission: "Keyword 2 sent to #lore",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "A hidden riddle awaits, only visible to those who know the secret phrase.",
                    Trivia: "There are whispers of a forgotten god, whose name holds the second keyword.",
                    Relations: "These quests change or relate to this: {{ Cryptic ID: III }}, {{ 3:Clocks and Hands }}, {{ Cryptic ID: I }}",
                },
                Requirement: ["3:Clocks and Hands"],
                MissName: "Whatami:2",
                MissInfo: "Failed to gain proper support, or failed to send keyword in time",
                Secret: true,
                SecretHint: "Grab the key given and send to #lore.",
                failIfFailed: "{{ 3:Clocks and Hands }}",
                difficulty: 1,
                category: "Hidden",
                rewards: [
                    {
                        type: "Item",
                        name: "Timekeeper's Token",
                        amount: 1,
                        description: "A token to unlock further hidden quests.",
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "Cryptic ID: III",
                DetailsForSubmission: "Keyword 3 sent to #lore",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "A hidden riddle awaits, only visible to those who know the secret phrase.",
                    Trivia: "The last keyword ties together all the broken pieces of time.",
                    Relations: "These quests change or relate to this: {{ 3:Clocks and Hands }}, {{ Cryptic ID: I }}, {{ Cryptic ID: II }}",
                },
                Requirement: ["3:Clocks and Hands"],
                MissName: "Whatami:3",
                MissInfo: "Failed to gain proper support, or failed to send keyword in time",
                Secret: true,
                SecretHint: "Grab the key given and send to #lore.",
                failIfFailed: "{{ 3:Clocks and Hands }}",
                difficulty: 1,
                category: "Hidden",
                rewards: [
                    {
                        type: "Item",
                        name: "Timekeeper's Token",
                        amount: 1,
                        description: "A token to unlock further hidden quests.",
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            // —————— Saga IV —————— //
            // Wait a week from previous saga then release //
            {
                QuestName: "3:Registration",
                DetailsForSubmission: "Auto unlocks after release.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "Something went wrong, and the registration database has been leaked... again. Submit the username to uncover the ID",
                    Trivia: "The consequences of failure are severe.",
                    Relations: "These quests change or relate to this: {{ Cryptic ID: I }}, {{ Cryptic ID: II }}, {{ Cryptic ID: III }}, {{ 3:Clocks and Hands }}, {{ Cryptic ID: IV }}, {{ Cryptic ID: V }}, {{ Cryptic ID: VI }}",
                },
                Requirement: ["TAS Q&A", "Fan base", "The foundation", "Eggs", "TAS2", "Trees have logs: I", "Trees have logs: II", "Trees have logs: III", "A red herring: I", "A red herring: II", "A red herring: III", "Inky black", "Null$k1n", "§☐☐☐§", "Leafs, roots and growing saplings"],
                MissName: "Broken You",
                relatedQuestlines: ["Discord"],
                MissInfo: "Failed to gain proper support, or failed to finish saga in time or failed previous saga",
                failIfFailed: "(({{ Cryptic ID: IV }} AND {{ Cryptic ID: V }} AND {{ Cryptic ID: VI }}) OR {{ 3:Clocks and Hands }}) OR {{ Support }}",
                difficulty: 1,
                category: "Special",
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "Cryptic ID: IV",
                DetailsForSubmission: "Email image of completing the ID segment 1",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "The first cryptic ID demands proof of completion, through a puzzle image.",
                    Trivia: "It appears it's the HEX that's the prize.",
                    Relations: "These quests change or relate to this: {{ Cryptic ID: V }}, {{ Cryptic ID: VI }}, {{ 3:Registration }}, {{ Cryptic ID: I }}",
                },
                Requirement: ["3:Registration", "Cryptic ID: I"],
                MissName: "Whoami:1",
                MissInfo: "Failed to finish saga in time or failed required quests",
                Secret: true,
                SecretHint: "The riddle's answer you received may be the answer to this mystery",
                failIfFailed: "{{ 3:Registration }} OR {{ Cryptic ID: I }}",
                difficulty: 2,
                category: "Hidden",
                QuestCredit: {
                    name: "",
                    date: "",
                },
                rewards: [
                    {
                        type: "Experience",
                        name: "HEX",
                        description: "Lore filled with the secrets of the cryptic ID.",
                    }
                ]
            },
            {
                QuestName: "Cryptic ID: V",
                DetailsForSubmission: "Email image of completing the ID segment 2",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "The first cryptic ID demands proof of completion, through a puzzle image.",
                    Trivia: "It appears it's the HEX that's the prize.",
                    Relations: "These quests change or relate to this: {{ Cryptic ID: VI }}, {{ 3:Registration }}, {{ Cryptic ID: II }}, {{ Cryptic ID: IV }}",
                },
                Requirement: ["3:Registration", "Cryptic ID: II"],
                MissName: "Whoami:2",
                MissInfo: "Failed to finish saga in time or failed required quests",
                Secret: true,
                SecretHint: "The riddle's answer you received may be the answer to this mystery",
                failIfFailed: "{{ 3:Registration }} OR {{ Cryptic ID: II }}",
                difficulty: 2,
                category: "Hidden",
                QuestCredit: {
                    name: "",
                    date: "",
                },
                rewards: [
                    {
                        type: "Experience",
                        name: "HEX",
                        description: "Lore filled with the secrets of the cryptic ID.",
                    }
                ]
            },
            {
                QuestName: "Cryptic ID: VI",
                DetailsForSubmission: "Email image of completing the ID segment 3",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "The first cryptic ID demands proof of completion, through a puzzle image.",
                    Trivia: "It appears it's the HEX that's the prize.",
                    Relations: "These quests change or relate to this: {{ Cryptic ID: IV }}, {{ 3:Registration }}, {{ Cryptic ID: III }}, {{ Cryptic ID: V }}",
                },
                Requirement: ["3:Registration", "Cryptic ID: III"],
                MissName: "Whoami:3",
                MissInfo: "Failed to finish saga in time or failed required quests",
                Secret: true,
                SecretHint: "The riddle's answer you received may be the answer to this mystery",
                failIfFailed: "{{ 3:Registration }} OR {{ Cryptic ID: III }}",
                difficulty: 2,
                category: "Hidden",
                QuestCredit: {
                    name: "",
                    date: "",
                },
                rewards: [
                    {
                        type: "Experience",
                        name: "HEX",
                        description: "Lore filled with the secrets of the cryptic ID.",
                    }
                ]
            },
            // —————— SAGA V —————— //
            /*
             Wait a week then check if there is pending quests,
             for each pending quest add 3 days,
             although if there is even 1 failed quest
             ignore the added days and set wait time
             to exactly 1 extra week

             MANUALLY UPDATE TO FAIL IF THERE IS PENDING OR FAILED QUESTS ONCE RELEASED
            */
            {
                QuestName: "Narrator: I",
                DetailsForSubmission: "Autocompletes when site launches.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "... and now all the lore you know is wrong.",
                    Trivia: "This quest autocompletes on site launch if you have no failed quests (except {{ Bribery }}), introduces the [REDACTED], this may be the most Canon lore you will ever get.",
                    Relations: "Next quest in line is {{ Narrator: II }}",
                },
                MissName: "You’re not that special",
                MissInfo: "You have failed or have pending quests (excluding {{ Bribery }}) when this saga activates.",
                Secret: true,
                SecretHint: "For your sake, I hope you have no failed or pending quests when this starts - For thou shall find what thou is looking for.",
                failIfFailed: "{{ Support }}",
                Requirement: ["Support"],
                difficulty: 5,
                category: "Hidden",
                rewards: [
                    {
                        type: "Achievement",
                        name: "Perfectionist",
                        description: "Saw what was hidden, and made [REDACTED] happy.",
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            // —————— SAGA VI —————— //
            // Wait a week from previous saga then release //
            {
                QuestName: "He who lives in clocks",
                DetailsForSubmission: "Autocompletes when site launches.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "He counted every second, yet never reached the end.",
                    Relations: "Goes to {{ 12 coordinators }}",
                },
                difficulty: 5,  // TODO Update me
                MissName: "No time left",
                MissInfo: "Failed to gain proper support, or failed to finish saga in time",
                failIfFailed: "{{ Support }}",
                Requirement: ["Support"],
                category: "Special",
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "12 coordinators",
                DetailsForSubmission: "Email an image showing you completed the site.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "They tried to keep everything together, until one turned inward.",
                    Relations: "Originates from {{ He who lives in clocks }}",
                },
                Requirement: ["He who lives in clocks"],
                MissName: "Fell apart",
                category: "Special",
                failIfFailed: "{{ He who lives in clocks }}",
                MissInfo: "Failed to gain proper support, or failed to finish saga in time",
                difficulty: 4,  // TODO Update this
                rewards: [
                    {
                        type: "Achievement",  // TODO Update this
                        name: "All Pieces Accounted For",
                        description: "You held together the structure where others fractured.",
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            // —————— SAGA VII —————— //
            // Wait a week from previous saga then release //
            {
                QuestName: "The timeline",
                DetailsForSubmission: "Autocompletes when site launches.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "The timeline branched, looped, erased. But you followed something.",
                    Trivia: "Yes, the log metadata that was used to solve the puzzle is lore-canon, and yes if this quest was failed it would be canon that metadata would be fanon if this quest failed.",
                    Relations: "Goes to {{ Canon }}",
                },
                difficulty: 5,  // TODO Update me
                MissName: "Lost history",
                MissInfo: "Failed to gain proper support, or failed to finish saga in time",
                failIfFailed: "{{ Support }}",
                Requirement: ["Support"],
                category: "Special",
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "Canon",
                DetailsForSubmission: "Email an image showing site completion.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "Canon is defined by repetition, not truth.",
                    Trivia: "The name of the mission actually decides if the timeline lore is canon or not!",
                    Relations: "Originates from {{ The timeline }}",
                },
                Requirement: ["The timeline"],
                MissName: "Fanon",
                category: "Special",
                MissInfo: "Failed to gain proper support, or failed to finish saga in time",
                failIfFailed: "{{ The timeline }}",
                difficulty: 3,  // TODO Update this
                rewards: [
                    {  // TODO Update this
                        type: "Achievement",
                        name: "Declared Canon",
                        description: "You survived enough to be remembered as 'real'.",
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            // —————— SAGA VIII —————— //
            // Wait a week from previous saga then release //
            {
                QuestName: "Bloom, Live and Die",
                DetailsForSubmission: "Autocompletes when site launches (requires {{ 3·15·25 }}).",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "A cycle of life, death, and the whispers of the broken, 3? 15? 25?.",
                    Trivia: "Unlocks once {{ 3·15·25 }} is completed as it is canon that these 3 numbers are related canonically to Blooming, Living and Death",
                    Relations: "These quests change or relate to this: {{ 3·15·25 }}, {{ 25 dead }}, {{ 15 bloom }}, {{ 3 live on }}",
                },
                Requirement: ["3·15·25"],
                MissName: "All dead",
                MissInfo: "You failed quest {{ 3·15·25 }} before completing this one or failed to gain proper support, or failed to finish saga in time.",
                failIfFailed: "{{ 3·15·25 }} OR {{ Support }}",
                difficulty: 3,  // TODO Update this
                category: "Special",
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "25 dead",
                DetailsForSubmission: "Email an image showing you completed puzzle segment 1.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "A puzzle piece buried under the weight of death.",  // TODO Update this
                    Relations: "These quests change or relate to this: {{ Bloom, Live and Die }}, {{ 3·15·25 }}",
                },
                Requirement: ["Bloom, Live and Die"],
                MissName: "Buried",
                category: "Side",
                failIfFailed: "{{ Bloom, Live and Die }}",
                MissInfo: "Failed to finish saga in time or failed required quests",
                difficulty: 3,  // TODO Update this
                rewards: [
                    {
                        type: "Item",  // TODO Update this
                        name: "Gravekeeper's Stone",
                        description: "A marker left to remember what’s lost. +1 Lore Insight.",
                    }
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "15 bloom",
                DetailsForSubmission: "Email an image showing you completed puzzle segment 2.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "Flesh rots, flowers bloom in their place.",
                    Relations: "These quests change or relate to this: {{ Bloom, Live and Die }}, {{ 3·15·25 }}",
                },
                Requirement: ["Bloom, Live and Die"],
                MissName: "Rotting",
                category: "Side",
                failIfFailed: "{{ Bloom, Live and Die }}",
                MissInfo: "Failed to finish saga in time or failed required quests",
                difficulty: 3,  // TODO Update this
                rewards: [
                    {
                        type: "Item",  // TODO Update this
                        name: "Blooming Remains",
                        description: "The dead shall bloom once more. Used to unlock hidden lore.",
                    }
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "3 live on",
                DetailsForSubmission: "Email an image showing you completed puzzle segment 3.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "A lie of life continues where it shouldn’t.",
                    Relations: "These quests change or relate to this: {{ Bloom, Live and Die }}, {{ 3·15·25 }}",
                },
                Requirement: ["Bloom, Live and Die"],
                MissName: "A lie",
                MissInfo: "Failed to finish saga in time or failed required quests",
                difficulty: 4,  // TODO Update this
                failIfFailed: "{{ Bloom, Live and Die }}",
                category: "Side",
                rewards: [
                    {
                        type: "Achievement",  // TODO Update this
                        name: "End of Cycle",
                        description: "Broken and rebuilt through each step.",
                    }
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            // —————— SAGA IX —————— //
            // Wait a week from previous saga then release //
            {
                QuestName: "Philosophy",
                DetailsForSubmission: "Autocompletes when site launches.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "A tangle of fragmented truths and irrational beliefs, What do you think of the questions asked?",
                    Relations: "Goes to {{ One more }}",
                },
                MissName: "Deranged Nonsense",
                Requirement: ["Support"],
                MissInfo: "Failed to gain proper support, or failed to complete saga in time",
                failIfFailed: "{{ Support }}",  // TODO Update this
                difficulty: 3,  // TODO Update this
                category: "Special",
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "One more",
                DetailsForSubmission: "Email an image showing you completed the site.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "The last push before the end.",  // TODO Update this
                    Relations: "Originates from {{ Philosophy }}",
                },
                Requirement: ["Philosophy"],
                MissName: "No more",
                failIfFailed: "{{ Philosophy }}",
                category: "Special",
                MissInfo: "Failed to gain proper support, or failed to complete saga in time",
                difficulty: 5,  // TODO Update this
                rewards: [
                    {
                        type: "Achievement",  // TODO Update this
                        name: "Final Thought",
                        description: "You completed the irrational cycle of thought.",
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            // —————— SAGA X —————— //
            /*
             Wait a week unless there is a pending quest
             or failed quest then wait 2 weeks

             MANUALLY UPDATE TO FAIL IF THERE IS PENDING OR FAILED QUESTS ONCE RELEASED
            */
            {
                QuestName: "Narrator: II",
                DetailsForSubmission: "Autocompletes when site launches.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "The narrator returns, more [REDACTED] than before... This is the END",
                    Trivia: "Autocompletes when not all quests have been completed (EXCLUDING {{ Bribery }}).",
                    Relations: "Began from {{ Narrator: I }}",
                },
                Requirement: ["Narrator: I"],
                MissName: ":(",
                MissInfo: "You have not reached 100% completion excluding {{ Bribery }}.",
                Secret: true,
                SecretHint: "496620796f752068617665206e6f2070617374206e6f72206661696c6564207175657374732c2049207368616c6c2062652077616974696e672e204e6f74206173206120676174656b65657065722c2062757420617320612073746f727974656c6c65722e",
                failIfFailed: "{{ Support }}",
                difficulty: 5,
                category: "Hidden",
                rewards: [
                    {
                        type: "Achievement",  // TODO Update this
                        name: "Unfinished Business",
                        description: "The narrator marks you as incomplete.",
                    },
                ],
                QuestCredit: {
                    name: "Narrator",
                    date: "Never",
                },
            }
        ],
    },
];
