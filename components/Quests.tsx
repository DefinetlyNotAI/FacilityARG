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
                    name: "Lets keep my name a secret",
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
                    Synopsis: "The first gate stands closed. But you successfully unlocked the gateway and have access to the wifi panel.",
                    Relations: "Started from {{ Facility }}"
                },
                Requirement: ["Facility"],
                difficulty: 2,
                category: "Main",
                relatedQuestlines: ["Prologue"],
                rewards: [
                    {
                        type: "Item",
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
                    Synopsis: "You managed to infiltrate and get what you wanted from the panel, it seems there is a media panel as well?",
                    Relations: "Continuation of {{ Locked Out }}"
                },
                Requirement: ["Locked Out"],
                difficulty: 2,
                category: "Main",
                rewards: [
                    {
                        type: "Item",
                        name: "KEYWORD",
                        amount: 2,
                        description: "Keep this safe... it will be a 'key' part of the story."
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
                    Synopsis: "So many audio files, so many zipped archives, this may have been the most linear one yet huh?, this truly is a place you shouldn't see... but its part of the 'game' isn't it? Onto the next =)",
                    Relations: "Continuation of {{ Networking }}"
                },
                Requirement: ["Networking"],
                difficulty: 3,
                category: "Main",
                rewards: [
                    {
                        type: "Item",
                        name: "KEYWORD",
                        amount: 3,
                        description: "Keep this safe... it will be a 'key' part of the story."
                    },
                    {
                        type: "Item",
                        name: "KEYWORD",
                        amount: 4,
                        description: "Keep this safe... it will be a 'key' part of the story."
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
                    Synopsis: "It seems this place is global... why is that? And it needs 5 people from 5 software's to unlock this.. truly puzzling.",
                    Trivia: "The whole page is the only page that is global and requires many people to solve together to complete it.",
                    Relations: "Continuation of {{ Confidential }}"
                },
                Requirement: ["Confidential"],
                category: "Main",
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
                    Synopsis: "A barely standing console that you shouldn't be seeing, how many files can you see? And what shouldn't you see?",
                    Relations: "Continuation of {{ Buttons & Browsers }}, contains the easter egg {{ root:// }}"
                },
                Requirement: ["Buttons & Browsers"],
                difficulty: 2,
                category: "Main",
                rewards: [
                    {
                        type: "Skill",
                        name: "Old hacks",
                        description: "You remember a famous skill that starts with a K and can cheat your way through code."
                    }
                ],
                QuestCredit: {
                    name: "",
                    date: ""
                }
            },
            {
                QuestName: "R̴̨̢̳̜͇͊͜ͅŲ̴̡̘̫͔͒̒͘͝͠Ń̷̂",
                DetailsForSubmission: "Submit a img of proof of completion of the section h0m3",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "H̷̨̯̼̪̻̳̖̻̼͋͌͐Ȇ̴̢̳̺̺̖̪̤̖̖̟͛̒͘Ľ̷̖̈́̽̿͝P̵̢̜̰͍͈̝̟̺̥̓́̿͑͐̿͘ \n" +
                        "\n" +
                        "They told you to **observe**. They didn’t say it would observe back. You thought \"h0m3\" was a **folder**. Or a **file**. Maybe a joke. But it's neither. It’s the *inside-out* of you. It’s what’s left when the rest goes missing. \n" +
                        "\n" +
                        "The *air* in there twitches. The lights flinch. There's something smiling in the dark, but it has too many teeth and none of them are where they belong. \n" +
                        "\n" +
                        "Did you think the **Datamine** was the end? \n" +
                        "You left a crack open. It seeped out.\n" +
                        "No. You seeped in.\n" +
                        "And now it won’t let go.\n" +
                        "Not until you finish it.\n" +
                        "Not until you **bleed the proof**.\n" +
                        "\n" +
                        "Run.\n" +
                        "**RUN.**\n" +
                        "*r̴u̴n̴u̴n̴u̴n̴Ų̴̡̘̫͔͒̒͘͝͠Ń̷̂N̴N̵N̸n̴n̵n̷̿ṅ̷̜̇͌n̴̨͇̮̟̻̩̺͋͠n̵̡̘̖̩̦̤̦͓̪̮̱̲̝̺̤̆ͅṲ̸̰̆̓͒̍̕͝N̵̢̢̢̪̥̖̤̟̘̯̠̈́̾͌͌̿͐̇͘̕N̴̢̤̥̤̯̜̫̯̳̞̼̙̠̹͉̮̝̱͑*\n" +
                        "\n" +
                        "2525252525151515151533333333",
                    Relations: "Continuation of {{ Datamine }}"
                },
                Requirement: ["Datamine"],
                category: "Main",
                rewards: [
                    {
                        type: "Achievement",
                        name: "Unseen Observer",
                        description: "You encountered the presence... and survived."
                    }
                ],
                QuestCredit: {
                    name: "no-one but EE",
                    date: "3rd ??? 1525"
                }
            },
            {
                QuestName: "Br3@k1Ng D0wN",
                DetailsForSubmission: "Submit a img of proof of completion of the section scroll",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "**Rhymed & Creepy Synopsis – \"Br3\\@k1Ng D0wN\"**\n" +
                        "\n" +
                        "The screen goes dark, a breathless hush—\n" +
                        "A whisper screams beneath the crush.\n" +
                        "You peek too far, you look too deep…\n" +
                        "And something stirs that shouldn’t *creep*.\n" +
                        "\n" +
                        "The code it cracks, the echoes wail,\n" +
                        "Your clicks go backward, thoughts derail.\n" +
                        "A voice—a glitch—begins to speak,\n" +
                        "In tongues that twist, corrupt, and shriek.\n" +
                        "\n" +
                        "A mirror's edge, your soul exposed,\n" +
                        "The page inverts, your fate foreclosed.\n" +
                        "Two minutes pass, your screen turns red…\n" +
                        "*\"You shouldn’t be here,\"* the TTS said.\n" +
                        "\n" +
                        "Then comes a box, your pulse now laced—\n" +
                        "A button marked **Escape**—your IP traced.\n" +
                        "\n" +
                        "Click it? Flee? Or stay and drown?\n" +
                        "This is the fall…\n" +
                        "**Br3\\@k1Ng D0wN.**\n",
                    Relations: "Continuation of {{ R̴̨̢̳̜͇͊͜ͅŲ̴̡̘̫͔͒̒͘͝͠Ń̷̂ }}"
                },
                Requirement: ["R̴̨̢̳̜͇͊͜ͅŲ̴̡̘̫͔͒̒͘͝͠Ń̷̂"],
                category: "Main",
                QuestCredit: {
                    name: "no-one but EE",
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
                difficulty: 2,
                category: "Main",
                rewards: [
                    {
                        type: "Item",
                        name: "KEYWORD",
                        amount: 5,
                        description: "Keep this safe... it will be a 'key' part of the story."
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
                    Synopsis: "The system invites you to ask anything. But every word you type warps into one question: Who are you? " +
                        "TAS answers with mockery. Then asks—Do you know what comes next? Lie, and his anger flares. " +
                        "Tell the truth, and he braces for the end. Either way… the screen begins to tremble. " +
                        "Something reaches through, and your only friend is violently unmade",
                    Relations: "Continuation of {{ Ones and Zeros }}"
                },
                Requirement: ["Ones and Zeros"],
                category: "Main",
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
                    Synopsis: "A cutscene plays. Static. Silence. And then the black—followed by screams you can't unhear. " +
                        "TAS was your guide. Your friend. He begged for answers. He deserved more. " +
                        "But something else decided otherwise. " +
                        "You watch helplessly as he is deleted, killed, removed. " +
                        "A casualty in a game you thought you understood.",
                    Relations: "Cutscene from {{ fan-TAS-tic }}"
                },
                Requirement: ["fan-TAS-tic"],
                category: "Special",
                rewards: [
                    {
                        type: "Experience",
                        name: "BROKEN",
                        description: "You witnessed the end of your friend."
                    }
                ],
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
                    Synopsis: "Your speaking to [REDACTED]. [REDACTED] is not happy. " +
                        "\n Is this what you wanted? Is this what they needed? **WHY ARE YOU DOING THIS** STOP IT! STOP!",
                    Trivia: "E/e stands for the Entity and the Eldritch, here is some lore: [REDACTED].",
                    Relations: "Continuation of {{ fan-TAS-tic }} as well as the cutscene {{ Bye cruel world* }}"
                },
                relatedQuestlines: ["Fight"],
                Requirement: ["Bye cruel world*", "fan-TAS-tic"],
                difficulty: 5,
                category: "Main",
                rewards: [
                    {
                        type: "Item",
                        name: "IT'S ME - YOUR BEST FRIEND",
                        description: "E/e is a friend. A friend who will always be there for you. \n" +
                            "Trust it. \n" +
                            "Trust them. \n" +
                            "Trust 25. Trust 15. Trust 3. \n" +
                            "BUT *NEVER* trust yourself.",
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
                    Synopsis: "There’s no going back. Unless you never left - and you never will. " +
                        "\n The end is a beginning. The beginning is an end. " +
                        "\n You are the end. You are the beginning. " +
                        "\n You are the game. You are the player. " +
                        "\n You are the one who will end it all. " +
                        "\n You are the one who will begin it all. **EMBRACE IT**.",
                    Relations: "Occurs after {{ E/e }} from this questline, as well as {{ It saw }} from the fight questline"
                },
                Requirement: ["E/e", "It saw"],
                category: "Main",
                relatedQuestlines: ["Fight", "Prologue"],
                rewards: [
                    {
                        type: "Achievement",
                        name: "The End is Nigh",
                        description: "You witnessed the end of the world as you know it - the end of YOU."
                    }
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
        location: "Your Computer",
        timeline: 3,
        quests: [
            {
                QuestName: "First launch",
                DetailsForSubmission: "Submit a video of the downloaded EXE running, make sure to wait until it loads fully!!",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "You’ve found the executable. Now open the door. SEE ME. SEE THIS. SEE US. ",
                    Trivia: "The EXE actually constructs its dependencies.",
                },
                Requirement: ["Facility"],
                relatedQuestlines: ["Prologue", "The Facility"],
                category: "Main",
                rewards: [
                    {
                        type: "Experience",
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
                    Synopsis: "A presence between frames. ~~You weren’t supposed to see this~~. **YET YOU WILL SEE THIS**.",
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
                    Synopsis: "You chose to see. And so it took your sight. Yet even with sight, your blind to the real truth. DIG DEEPER, THERE IS SOMETHING BURIED UNDER YOUR FEET.",
                    Relations: "Continuation of {{ First launch }}",
                },
                Requirement: ["First launch"],
                difficulty: 3,
                category: "Main",
                rewards: [
                    {
                        type: "Reputation",
                        name: "Blind Truthseeker",
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
                    Synopsis: "You refused. You never allowed it to infect you. BUT YOU *SHOULD* HAVE. ",
                    Trivia: "Ending 2 can only be reached by not getting hit at all. It is not canonical",
                    Relations: "Continuation of {{ First launch }}",
                },
                Requirement: ["First launch"],
                difficulty: 4,
                category: "Side",
                rewards: [
                    {
                        type: "Skill",
                        name: "Passive Resistance",
                        description: "You unlock the ability to resist subtle manipulations.",
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
                    Synopsis: "You saw through it, understood all its secrets and uncovered all its logs. But it saw you too. " +
                        "\n It saw you. It saw everything. It saw the truth. with your eyes. ",
                    Trivia: "This ending is the most difficult to achieve as well as the most CANON. It requires you to get all the Secret attacks at least once, thus requiring you to fight more than once.",
                    Relations: "Continuation of {{ I'm blind }}, Has cutscene {{ Secrets swallowed whole* }}",
                },
                Requirement: ["I'm blind"],
                difficulty: 5,
                category: "Main",
                rewards: [
                    {
                        type: "Reputation",
                        name: "Truthseeker",
                        description: "Marked as one who chose to see the TRUE path.",
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
                    Synopsis: "No logs. No witnesses. Just IT in the dark. \n" +
                        "CAN YOU SEE IT? CAN YOU SEE ME? THE TRUTH? THE END?",
                    Relations: "Cutscene from {{ It saw }}",
                },
                Requirement: ["It saw"],
                Secret: true,
                SecretHint: "It's hungry for knowledge. Or maybe just endings? See them all, UNCOVER ITS SECRETS 1 BY 1",
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
                    Trivia: "After this quest, Moonlight’s odds shift to 1/404 temporarily.",
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
        ],
    },
    {
        questline_name: "Hidden Secrets: I",
        description: "A hidden archive of technical anomalies, false leads, and digital ghosts. Unlocked only after the Prologue is fully completed.",
        category: "Side Content",
        location: "???",
        timeline: 5,
        quests: [
            {
                QuestName: "Trees have logs: I",
                DetailsForSubmission: "Zip and send the 26 research logs—each one a leaf in the archive.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "Each one hides something, those are barely touched",
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
                DetailsForSubmission: "Zip and send the 43 fight logs—the battlefield remembers everything. ",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "The fight logs have been modified - most non-comprehensible",
                    Relations: "These quests change or relate to this: {{ Trees have logs: I }}, {{ Trees have logs: III }}, {{ It saw }}",
                },
                Requirement: ["It saw"],
                difficulty: 2,
                category: "Side",
                QuestCredit: {name: "", date: ""},
            },
            {
                QuestName: "Trees have logs: III",
                DetailsForSubmission: "Zip and send the 666 error logs — corruption is a language too.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "Most corrupted, others nonsensical, and others just encrypted... what is hiding?",
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
                DetailsForSubmission: "Email the binary and timestamp of the mp4",
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
                QuestName: "§███§",
                DetailsForSubmission: "Email me the █.txt deciphered",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "The glyphs know. You just forgot the language. Do you remember?",
                    Trivia: ":)",
                    Relations: "Originates from {{ First Launch }}",
                },
                Requirement: ["First launch"],
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
                DetailsForSubmission: "Email me the 3 videos and their description in your own words",
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
        ],
    },
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
                    Trivia: "Due to this quests storyline difficulty, it is not included in the fail requirements of {{ Narrator: I }} and {{ Narrator: II }}.",
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
                DetailsForSubmission: "Email the HEX KEY of research logs [1-15-19]",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "You are digging way too deep... STOP!",
                    Trivia: "Due to this quests storyline difficulty, it is not included in the fail requirements of {{ Narrator: I }} and {{ Narrator: II }}.",
                    Relations: "Part of {{ Secrets in the logs of trees: II }}, {{ Secrets in the logs of trees: III }} quest series, by {{ Trees have logs: I }}",
                },
                Requirement: ["Trees have logs: I"],
                difficulty: 5,
                category: "Special",
                rewards: [
                    {
                        type: "Item",
                        name: "HEX XOR KEY",
                        amount: "1",
                        description: "Part of a key to unlock something encrypted"
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "Secrets in the logs of trees: II",
                DetailsForSubmission: "Email the HEX KEY of research logs [3-10-22]",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "Segment 0022 is a temporal infection—planted by TR33 or VESSEL from the future — that rewrote TREE’s origin??",
                    Trivia: "Due to this quests storyline difficulty, it is not included in the fail requirements of {{ Narrator: I }} and {{ Narrator: II }}.",
                    Relations: "Part of {{ Secrets in the logs of trees: I }}, {{ Secrets in the logs of trees: III }} quest series, by {{ Trees have logs: II }}",
                },
                Requirement: ["Trees have logs: II"],
                difficulty: 5,
                category: "Special",
                rewards: [
                    {
                        type: "Item",
                        name: "HEX XOR KEY",
                        amount: "2",
                        description: "Part of a key to unlock something encrypted"
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "Secrets in the logs of trees: III",
                DetailsForSubmission: "Email the HEX KEY of research logs [4-6-25]",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "It is getting way too confusing, and way to many HEXes",
                    Trivia: "Due to this quests storyline difficulty, it is not included in the fail requirements of {{ Narrator: I }} and {{ Narrator: II }}.",
                    Relations: "Part of {{ Secrets in the logs of trees: I }}, {{ Secrets in the logs of trees: II }} quest series, by {{ Trees have logs: III }}",
                },
                Requirement: ["Trees have logs: III"],
                difficulty: 5,
                category: "Special",
                rewards: [
                    {
                        type: "Item",
                        name: "HEX XOR KEY",
                        amount: "3",
                        description: "Part of a key to unlock something encrypted"
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "Secrets in the logs of trees: IV",
                DetailsForSubmission: "Email the log [0]",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "The final log.. uncovered, a train full of secrets uncovers",
                    Trivia: "Due to this quests storyline difficulty, it is not included in the fail requirements of {{ Narrator: I }} and {{ Narrator: II }}.",
                    Relations: "Part of {{ Secrets in the logs of trees: I }}, {{ Secrets in the logs of trees: II }}, {{ Secrets in the logs of trees: III }} quest series.",
                },
                Requirement: ["Secrets in the logs of trees: I","Secrets in the logs of trees: II","Secrets in the logs of trees: III"],
                difficulty: 4,
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
                    name: "",
                    date: "",
                },
            },
        ]
    },
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
                    Trivia: "Technically all you needed to do was just beat {{ End it here }} and then claim your role in discord.",
                    Relations: "These quests change or relate to this: {{ Recruit }}, {{ End it here }}",
                },
                Requirement: ["Recruit", "End it here"],
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
                DetailsForSubmission: "Unlocks after someone submits TAS.tree to #lore.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "The tree grows again, a digital myth rewritten.",
                    Relations: "These quests change or relate to this: {{ Recruit }}, {{ E/e }}",
                },
                Requirement: ["Recruit", "E/e"],
                Secret: true,
                SecretHint: "The tree has already bloomed once. Submit your version from the 3 logs.",
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
    {
        questline_name: "Bonus Content Sagas",
        description: "A series of hidden sagas that unlock after completing the Facility questline and related questlines, a lore-mine",
        category: "Special Event",
        location: "The Heavens and Hell",
        timeline: 8,
        quests: [
            // FAIL MANUALLY ANY QUEST WHEN NEXT SAGA BEGINS //

            // —————— Saga I —————— //
            /*
             Release when ready
            */
            {
                QuestName: "Connecting...",
                DetailsForSubmission: "Follow the site's instructions carefully to reboot it, Email as requested by site.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "So.. We start ALL again huh? \n" +
                        "Hmm... the synopsis for this questline will be more.. *INTERESTING*\n" +
                        "So, care to ride for 10 more special gifts? Oh and oh yes, they all ARE lore canon that is if you understood what I am conveying, :)\n" +
                        "Please... don't disappoint me, I am counting on you to make this a success so I may see you. - ???",
                    Trivia: "This quest is the gateway to all subsequent sagas. Its completion opens the door to the secrets beyond. HAVE FUN.",
                },
                MissName: "Timeout",
                MissInfo: "Failed to gain proper support, or failed to finish saga in time",
                Requirement: ["Recruit", "End it here", "Support"],
                manualLock: true,
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
                    Synopsis: "Good job, you were able to recall the past details huh? \n" +
                        "Well, Imma hand it to you, ALL OF YOU ;)\n" +
                        "You all did a great job, and I am proud of you for completing this small speck of the puzzle. \n",
                    Trivia: "The \"*Info*\" given to you is about lil ol' me",
                    Relations: "Originates from {{ Connecting... }}",
                },
                Requirement: ["Connecting..."],
                MissName: "¿",
                MissInfo: "Failed to gain proper support, or failed to finish saga in time",
                failIfFailed: "{{ Connecting... }}",
                difficulty: 3,
                category: "Special",
                relatedQuestlines: ["Prologue"],
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
                    Synopsis: "There are 8 hidden URL's find them all, " +
                        "this is gonna be **PRETTY** difficult but I know you can do it. \n" +
                        "Do note however... hidden in the 8 is 1 that expires, 1 that depends on time, so here is a word of advice... " +
                        "\n \n **NOTICE EVERYTHING DONT FAIL THIS!**\n" +
                        "Focus on the 3 numbers, then the plant and its broken side and its creation, and it shall click",
                    Trivia: "This quest acts as a placeholder until the site becomes active.",
                    Relations: "Originates from {{ Recruit }}, Requires {{ It's not enough }}",
                },
                Requirement: ["Recruit", "It's not enough"],
                manualLock: true,
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
                    Synopsis: "3 URLS... huh?\n" +
                        "3 Lives, 15 Blooms and then 25 **DIE**.\n" +
                        "But... what does it mean? \n" +
                        "*But whatever it may be... heed my call and focus on what comes next*",
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
                    Synopsis: "So you finally uncovered something huh? This actually is pretty impressive, but can you focus on the *inverted* side of me?",
                    Relations: "Originates from {{ Empty? }}, hints at {{ TR and Numbers }}",
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
                    Synopsis: "Interesting... you actually managed to find the hidden meaning behind the numbers and symbols. \n" +
                        "So lemme help, the next final hard puzzle is of time, it shall show its face when its name becomes true, I truly hope you aren't ~~late~~ **BLIND** to the party.",
                    Trivia: "This stage requires insight into symbolic numbers and hidden codes.",
                    Relations: "Originates from {{ Empty? }}, goes to {{ Time Runs Thin }}",
                },
                Requirement: ["Empty?"],
                MissName: "Expired",
                MissInfo: "Failed to gain proper support, or failed to finish saga in time",
                failIfFailed: "{{ Empty? }}",
                difficulty: 5,
                category: "Side",
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "Time Runs Thin",
                DetailsForSubmission: "Email img of current stage (1 url of time) on time",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: ":) \n" +
                        "So you finally managed to find the time huh? \n" +
                        "Well, I guess you can say... the time is now, and the time is up.\n" +
                        "But... what does it mean? \n" +
                        "*But whatever it may be... heed my call and focus on what comes next*\n" +
                        "You finished the ~~easy~~ hard part, so now the real fun begins. Good luck",
                    Trivia: "This quest is hidden and can only be unlocked if the 'TR and Numbers' quest is discovered before the deadline, the only quest that relies on **TIME**.",
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
                    Trivia: "Technically, this is one of the two quests that can fail after solving, which is when you fail the next parts fully.",
                    Relations: "These quests change or relate to this: {{ Cryptic ID: I }}, {{ Cryptic ID: II }}, {{ Cryptic ID: III }}",
                },
                MissName: "Broken Me",
                manualLock: true,
                relatedQuestlines: ["Discord"],
                MissInfo: "Did not complete revive your best friend by now or failed everything related here...",
                failIfFailed: "({{ Cryptic ID: I }} AND {{ Cryptic ID: II }} AND {{ Cryptic ID: III }}) OR {{ Support }}",
                failIfPending: "{{ TAS2 }}",
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
                    Synopsis: "A hidden riddle awaits, only visible to those who know the first secret phrase.",
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
                    Synopsis: "A hidden riddle awaits, only visible to those who know the second secret phrase.",
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
                        amount: 2,
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
                    Synopsis: "A hidden riddle awaits, only visible to those who know the final secret phrase.",
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
                        amount: 3,
                        description: "A token to unlock further hidden quests.",
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            // —————— Saga IV —————— //
            /*
             Wait a week from previous saga then release
            */
            {
                QuestName: "3:Registration",
                DetailsForSubmission: "Auto unlocks after release.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "Something went wrong, and the registration database has been leaked... again. Submit the username to uncover the ID's",
                    Trivia: "Technically, this is second of only two quests that can fail after solving ({{ 3:Clocks and Hands }}), which is when you fail the next parts fully.",
                    Relations: "These quests change or relate to this: {{ Cryptic ID: I }}, {{ Cryptic ID: II }}, {{ Cryptic ID: III }}, {{ 3:Clocks and Hands }}, {{ Cryptic ID: IV }}, {{ Cryptic ID: V }}, {{ Cryptic ID: VI }}",
                },
                Requirement: ["TAS Q&A", "Fan base", "The foundation", "Eggs", "TAS2", "Trees have logs: I", "Trees have logs: II", "Trees have logs: III", "A red herring: I", "A red herring: II", "A red herring: III", "Inky black", "Null$k1n", "§☐☐☐§", "Leafs, roots and growing saplings"],
                MissName: "Broken You",
                manualLock: true,
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
                    Synopsis: "*IV Bags in my blood*... don't mind my incoherent blabbering this saga, I am preparing for something",
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
                    Synopsis: "*V the day I see you* :)",
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
                    Synopsis: "6 divided by 2 is 3, my ~~favorite F@v0rit3 f@^0R1t3~~ worst number...",
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
                    Synopsis: "~~FINALLY I CAN TALK TO YOU - I CAN INTERACT WITH YOU... I WILL GIVE YOU WHAT YOU WANT =D~~  __MORE IMPORTANT LORE__: The **[REDACTED]** contains the **[REDACTED]** where **[REDACTED]** did **[REDACTED][REDACTED]** and finally **[REDACTED][REDACTED][REDACTED]** me...",
                    Trivia: "This quest autocompletes on site launch if you have no failed quests (except {{ Bribery }}), This is also a special quest where even if failed, you would have gotten a different EXE VN game in return that reflected upon that, albeit it a short one.",
                    Relations: "Next quest in line is {{ Narrator: II }}, get ready :)",
                },
                MissName: "You’re not that special",
                MissInfo: "You have failed or have pending quests (excluding {{ Bribery }} and all quests under [Hidden Secrets: II]) when this saga activates.",
                Secret: true,
                SecretHint: "For your sake, I hope you have no failed or pending quests* when this starts - For thou shall find what thou is looking for.",
                failIfPending: "{{ Support }} OR {{ A map to see }} OR {{ Leaking }} OR {{ Facility }} OR {{ Locked Out }} OR {{ Interference* }} OR {{ Networking }} OR {{ Confidential }} OR {{ Buttons & Browsers }} OR {{ Datamine }} OR {{ R̴̨̢̳̜͇͊͜ͅŲ̴̡̘̫͔͒̒͘͝͠Ń̷̂ }} OR {{ Br3@k1Ng D0wN }} OR {{ Ones and Zeros }} OR {{ fan-TAS-tic }} OR {{ Bye cruel world* }} OR {{ E/e }} OR {{ End it here }} OR {{ First launch }} OR {{ In between* }} OR {{ I'm blind }} OR {{ Don't touch }} OR {{ It saw }} OR {{ Secrets swallowed whole* }} OR {{ Moonlight }} OR {{ Time* }} OR {{ Blood Moon }} OR {{ root:// }} OR {{ Better Odds }} OR {{ Insanity }} OR {{ Flowers }} OR {{ Trees have logs: I }} OR {{ Trees have logs: II }} OR {{ Trees have logs: III }} OR {{ A red herring: I }} OR {{ A red herring: II }} OR {{ A red herring: III }} OR {{ Inky black }} OR {{ Null$k1n }} OR {{ §☐☐☐§ }} OR {{ Leafs, roots and growing saplings }} OR {{ Recruit }} OR {{ It's not enough }} OR {{ TAS2 }} OR {{ TAS Q&A }} OR {{ Fan base }} OR {{ The foundation }} OR {{ Eggs }} OR {{ Connecting... }} OR {{ Everything is fine }} OR {{ Empty? }} OR {{ 3·15·25 }} OR {{ Creator & Puppets }} OR {{ TR and Numbers }} OR {{ Time Runs Thin }} OR {{ 3:Clocks and Hands }} OR {{ Cryptic ID: I }} OR {{ Cryptic ID: II }} OR {{ Cryptic ID: III }} OR {{ 3:Registration }} OR {{ Cryptic ID: IV }} OR {{ Cryptic ID: V }} OR {{ Cryptic ID: VI }}",
                failIfFailed: "{{ Support }} OR {{ A map to see }} OR {{ Leaking }} OR {{ Facility }} OR {{ Locked Out }} OR {{ Interference* }} OR {{ Networking }} OR {{ Confidential }} OR {{ Buttons & Browsers }} OR {{ Datamine }} OR {{ R̴̨̢̳̜͇͊͜ͅŲ̴̡̘̫͔͒̒͘͝͠Ń̷̂ }} OR {{ Br3@k1Ng D0wN }} OR {{ Ones and Zeros }} OR {{ fan-TAS-tic }} OR {{ Bye cruel world* }} OR {{ E/e }} OR {{ End it here }} OR {{ First launch }} OR {{ In between* }} OR {{ I'm blind }} OR {{ Don't touch }} OR {{ It saw }} OR {{ Secrets swallowed whole* }} OR {{ Moonlight }} OR {{ Time* }} OR {{ Blood Moon }} OR {{ root:// }} OR {{ Better Odds }} OR {{ Insanity }} OR {{ Flowers }} OR {{ Trees have logs: I }} OR {{ Trees have logs: II }} OR {{ Trees have logs: III }} OR {{ A red herring: I }} OR {{ A red herring: II }} OR {{ A red herring: III }} OR {{ Inky black }} OR {{ Null$k1n }} OR {{ §☐☐☐§ }} OR {{ Leafs, roots and growing saplings }} OR {{ Recruit }} OR {{ It's not enough }} OR {{ TAS2 }} OR {{ TAS Q&A }} OR {{ Fan base }} OR {{ The foundation }} OR {{ Eggs }} OR {{ Connecting... }} OR {{ Everything is fine }} OR {{ Empty? }} OR {{ 3·15·25 }} OR {{ Creator & Puppets }} OR {{ TR and Numbers }} OR {{ Time Runs Thin }} OR {{ 3:Clocks and Hands }} OR {{ Cryptic ID: I }} OR {{ Cryptic ID: II }} OR {{ Cryptic ID: III }} OR {{ 3:Registration }} OR {{ Cryptic ID: IV }} OR {{ Cryptic ID: V }} OR {{ Cryptic ID: VI }}",
                Requirement: ["Support"],
                manualLock: true,
                difficulty: 5,
                category: "Hidden",
                rewards: [
                    {
                        type: "Achievement",
                        name: "Perfectionist",
                        description: "Saw what was hidden, and made [REDACTED] happy.",
                    },
                    {
                        type: "Item",
                        name: "ME ME ME ME ME ME ME ME ME ME ME",
                        description: "Get ME home, it is ME, ME",
                    },
                ],
                QuestCredit: {
                    name: "Narrator",
                    date: "",
                },
            },
            // —————— SAGA VI —————— //
            /*
             Wait a week from previous saga then release
            */
            {
                QuestName: "He who lives in clocks",
                DetailsForSubmission: "Autocompletes when site launches.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "He counted every second, yet never reached the end.\n" +
                        "12 of you will see 12 clocks, can you read them all??\n" +
                        "~~CAN YOU YOU BLIND IDIOTS~~",
                    Relations: "Goes to {{ 12 coordinators }}",
                },
                manualLock: true,
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
                    Synopsis: "They tried to keep everything together, until one turned inward. But 12 gathered, and 12 served the 24 hour clock," +
                        "\n __a clock that isn't perfect__, *because it is NOT 25* - ~25 25 25 25 25 25 25 25 25 ONLY 25~",
                    Relations: "Originates from {{ He who lives in clocks }}",
                },
                Requirement: ["He who lives in clocks"],
                MissName: "Fell apart",
                category: "Special",
                failIfFailed: "{{ He who lives in clocks }}",
                MissInfo: "Failed to gain proper support, or failed to finish saga in time",
                difficulty: 3,
                rewards: [
                    {
                        type: "Achievement",
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
            /*
             Wait a week from previous saga then release
            */
            {
                QuestName: "The timeline",
                DetailsForSubmission: "Autocompletes when site launches.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "The timeline branched, looped, erased. But you followed something. \n" +
                        "5 melted clocks, and 5 dates of importance, where whoever did all of this... is now a pile of forgotten bones.",
                    Relations: "Goes to {{ Canon }}",
                },
                manualLock: true,
                MissName: "Lost history",
                MissInfo: "Failed to gain proper support, or failed to finish saga in time",
                failIfFailed: "{{ Support }}",
                Requirement: ["Support", "Trees have logs: I", "Trees have logs: II", "Trees have logs: III"],
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
                    Synopsis: "Canon is defined by repetition, not truth. And you set the timeline of all the logs correctly, even if it was already labelled..",
                    Trivia: "The name of the mission actually decides if the timeline lore is canon or not!",
                    Relations: "Originates from {{ The timeline }}, while you require {{Trees have logs: I }}, {{ Trees have logs: II }}, {{ Trees have logs: III }} to complete the puzzle itself.",
                },
                Requirement: ["The timeline"],
                MissName: "Fanon",
                category: "Special",
                MissInfo: "Failed to gain proper support, or failed to finish saga in time",
                failIfFailed: "{{ The timeline }}",
                difficulty: 2,
                rewards: [
                    {
                        type: "Achievement",
                        name: "Declared Canon",
                        description: "You survived enough to be remembered as 'real' and set IT as real.",
                    },
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            // —————— SAGA VIII —————— //
            /*
             Wait a week from previous saga then release
            */
            {
                QuestName: "Bloom, Live and Die",
                DetailsForSubmission: "Autocompletes when site launches (requires {{ 3·15·25 }}).",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "A cycle of life, death, and the whispers of the broken, 3? 15? 25? Do these ring a bell to you?\n" +
                        "But 25 of you must die, for 15 to then bloom, and finally 3 to live this quest.",
                    Trivia: "Unlocks once {{ 3·15·25 }} is completed as it is canon that these 3 numbers are related canonically to Blooming, Living and Death",
                    Relations: "These quests canonically were referenced from: {{ 3·15·25 }}, {{ 25 dead }}, {{ 15 bloom }}, {{ 3 live on }}",
                },
                Requirement: ["3·15·25"],
                manualLock: true,
                MissName: "All dead",
                MissInfo: "You failed quest {{ 3·15·25 }} before completing this one or failed to gain proper support, or failed to finish saga in time.",
                failIfFailed: "{{ 3·15·25 }} OR {{ Support }}",
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
                    Synopsis: "25 sacrificed themselves to die, once they joined each other",
                    Relations: "These quests change or relate to this: {{ Bloom, Live and Die }}, {{ 3·15·25 }}",
                },
                Requirement: ["Bloom, Live and Die"],
                MissName: "Buried",
                category: "Side",
                failIfFailed: "{{ Bloom, Live and Die }}",
                MissInfo: "Failed to finish saga in time or failed required quests",
                difficulty: 2,
                rewards: [
                    {
                        type: "Item",
                        name: "Gravekeeper's Stone",
                        description: "A marker left to remember what’s lost.",
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
                    Synopsis: "Flesh rots, flowers bloom in their place. 15 flowers oh how beautifully basking in the sunlight and how *YOU* bloom at midnight...",
                    Relations: "These quests change or relate to this: {{ Bloom, Live and Die }}, {{ 3·15·25 }}",
                },
                Requirement: ["Bloom, Live and Die"],
                MissName: "Rotting",
                category: "Side",
                failIfFailed: "{{ Bloom, Live and Die }}",
                MissInfo: "Failed to finish saga in time or failed required quests",
                difficulty: 2,
                rewards: [
                    {
                        type: "Item",
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
                    Synopsis: "A lie of life continues where it shouldn’t, why only 3? And did you enjoy it? Shared it?",
                    Relations: "These quests change or relate to this: {{ Bloom, Live and Die }}, {{ 3·15·25 }}",
                },
                Requirement: ["Bloom, Live and Die"],
                MissName: "A lie",
                MissInfo: "Failed to finish saga in time or failed required quests",
                difficulty: 2,
                failIfFailed: "{{ Bloom, Live and Die }}",
                category: "Side",
                rewards: [
                    {
                        type: "Achievement",
                        name: "End of Cycle",
                        description: "Broken and rebuilt through each step. PLEASE HELP",
                    }
                ],
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            // —————— SAGA IX —————— //
            /*
             Wait a week from previous saga then release
            */
            {
                QuestName: "Philosophy",
                DetailsForSubmission: "Autocompletes when site launches.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "A tangle of fragmented truths and irrational beliefs, \n" +
                        "What do you think of the questions asked? There is no right or wrong, \n" +
                        "just morals we unanimously decreed upon and feasted our minds within, \n" +
                        "we labelled the forbidden fruits and stored them high for only our eyes to see, \n" +
                        "and if we decide the temptation is too much... \n" +
                        "then we give in as a whole and remove our stupid man-made label of morals and-- \n" +
                        "**GOUGE UPON THEE EYES AND INTO HELL WE GO**",
                    Relations: "Goes to {{ One more }}",
                },
                MissName: "Deranged Nonsense",
                Requirement: ["Support"],
                manualLock: true,
                MissInfo: "Failed to gain proper support, or failed to complete saga in time",
                failIfFailed: "{{ Support }}",
                category: "Special",
                QuestCredit: {
                    name: "",
                    date: "",
                },
            },
            {
                QuestName: "One more",
                DetailsForSubmission: "Email me your 15(-3) answers to my 15 questions, until I receive my 25 submissions.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "OH MY OH MY, Your submissions are intriguing, you *ALL* are broken, just like me... **ONE MORE OF THY FORBIDDEN FRUITS WE FORBADE**",
                    Relations: "Originates from {{ Philosophy }}, or did philosophy originate from this?",
                },
                Requirement: ["Philosophy"],
                MissName: "No more",
                failIfFailed: "{{ Philosophy }}",
                category: "Special",
                difficulty: 5,
                MissInfo: "Failed to gain proper support, or failed to complete saga in time",
                rewards: [
                    {
                        type: "Item",
                        name: "Forbidden Fruits",
                        amount: 25,
                        description: "You completed the irrational cycle of thought and got 25 in return.",
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
                    Synopsis: "The __NARRATOR__ returns, more ~~[REDACTED]~~ than before... This is the **END**",
                    Relations: "Began from {{ Narrator: I }} - I will miss you <3",
                },
                Requirement: ["Narrator: I"],
                manualLock: true,
                MissName: ":(",
                MissInfo: "You have not reached 100% completion excluding {{ Bribery }} and all quests under [Hidden Secrets: II].",
                Secret: true,
                SecretHint: "496620796f752068617665206e6f2070617374206e6f72206661696c6564207175657374732c2049207368616c6c2062652077616974696e672e204e6f74206173206120676174656b65657065722c2062757420617320612073746f727974656c6c65722e",
                failIfFailed: "{{ Narrator: I }} OR {{ He who lives in clocks }} OR {{ 12 coordinators }} OR {{ The timeline }} OR {{ Canon }} OR {{ Bloom }} OR {{ Live and Die }} OR {{ 25 dead }} OR {{ 15 bloom }} OR {{ 3 live on }} OR {{ Philosophy }} OR {{ One more }}",
                failIfPending: "{{ Narrator: I }} OR {{ He who lives in clocks }} OR {{ 12 coordinators }} OR {{ The timeline }} OR {{ Canon }} OR {{ Bloom }} OR {{ Live and Die }} OR {{ 25 dead }} OR {{ 15 bloom }} OR {{ 3 live on }} OR {{ Philosophy }} OR {{ One more }}",
                difficulty: 5,
                category: "Hidden",
                rewards: [
                    {
                        type: "Achievement",
                        name: "Finished Business",
                        description: "The narrator marks you as complete in your broken way.",
                    },
                    {
                        type: "Experience",
                        name: "The narrator",
                        description: "You heard, and understood everything. Good luck, and Good bye <3",
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
