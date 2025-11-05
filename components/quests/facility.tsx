import {Questline} from "@/lib/types";

export const Facility: Questline[] = [
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
                SolveStatus: "Solved",
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
                    name: "Fish",
                    date: "04/11/2025"
                }
            },
            {
                QuestName: "Interference*",
                DetailsForSubmission: "Cutscene auto-unlocked with Locked Out",
                SolveStatus: "Solved",
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
                    date: "04/11/2025"
                }
            },
            {
                QuestName: "Networking",
                DetailsForSubmission: "Submit a img of proof of completion of the section Wifi panel",
                SolveStatus: "Solved",
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
                    name: "Fish",
                    date: "04/11/2025"
                }
            },
            {
                QuestName: "Confidential",
                DetailsForSubmission: "Submit a img of proof of completion of the section Media panel",
                SolveStatus: "Solved",
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
                    name: "Fish",
                    date: "04/11/2025"
                }
            },
            {
                QuestName: "Buttons & Browsers",
                DetailsForSubmission: "Submit a img of proof of completion of the section Buttons",
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis: "It seems this place is global... why is that? And it needs 5 people from 5 software's to unlock this.. truly puzzling.",
                    Trivia: "The whole page is the only* page that is global and requires many people to solve together to complete it.",
                    Relations: "Continuation of {{ Confidential }}"
                },
                Requirement: ["Confidential"],
                category: "Main",
                QuestCredit: {
                    name: "Fish",
                    date: "04/11/2025"
                }
            },
            {
                QuestName: "TREE98",
                DetailsForSubmission: "Submit a img of proof of completion of TREE98, either showing its aftermath or just you in the Emergency Boot System (EBS) console.",
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis: "You glimpsed the old system, a tree of files and echoes of TREE. Only visitable once.",
                    Trivia: "TREE98 is a reference to the old Windows 98 system. This is canon to be what TREE is, a interface used - although the terminal you accessed had the lowest level of access, so you couldn't do much...",
                    Relations: "Occurs before {{ Emergency Boot System }} - acting as a pre-requisite to it."
                },
                Requirement: ["Buttons & Browsers"],
                difficulty: 1,
                category: "Main",
                rewards: [
                    {
                        type: "Experience",
                        name: "TREE",
                        description: "You got to see TREE... before you destroyed it to access to its Emergency Boot System (EBS)."
                    }
                ],
                QuestCredit: {
                    name: "Fish",
                    date: "04/11/2025"
                }
            },
            {
                QuestName: "Emergency Boot System",
                DetailsForSubmission: "Submit a img of proof of completion of the section file console",
                SolveStatus: "Solved",
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
                        description: "You remember a famous skill that can be used to cheat your way through code."
                    }
                ],
                QuestCredit: {
                    name: "Fish",
                    date: "04/11/2025"
                }
            },
            {
                QuestName: "R̴̨̢̳̜͇͊͜ͅŲ̴̡̘̫͔͒̒͘͝͠Ń̷̂",
                DetailsForSubmission: "Submit a img of proof of completion of the section h0m3",
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis: "H̷̨̯̼̪̻̳̖̻̼͋͌͐Ȇ̴̢̳̺̺̖̪̤̖̖̟͛̒͘Ľ̷̖̈́̽̿͝P̵̢̜̰͍͈̝̟̺̥̓́̿͑͐̿͘ \n" +
                        "\n" +
                        "They told you to **observe**. They didn’t say it would observe back. You thought \"h0m3\" was a **folder**. Or a **file**. Maybe a joke. But it's neither. It’s the *inside-out* of you. It’s what’s left when the rest goes missing. \n" +
                        "\n" +
                        "The *air* in there twitches. The lights flinch. There's something smiling in the dark, but it has too many teeth and none of them are where they belong. \n" +
                        "\n" +
                        "Did you think the **'TREE EBS'** was the end? \n" +
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
                    Relations: "Continuation of {{ Emergency Boot System }}"
                },
                Requirement: ["Emergency Boot System"],
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
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis: "**\"Br3\\@k1Ng D0wN\"**\n" +
                        "\n" +
                        "The screen goes dark, a breathless hush-\n" +
                        "A whisper screams beneath the crush.\n" +
                        "You peek too far, you look too deep…\n" +
                        "And something stirs that shouldn’t *creep*.\n" +
                        "\n" +
                        "The code it cracks, the echoes wail,\n" +
                        "Your clicks go backward, thoughts derail.\n" +
                        "A voice-a glitch-begins to speak,\n" +
                        "In tongues that twist, corrupt, and shriek.\n" +
                        "\n" +
                        "A mirror's edge, your soul exposed,\n" +
                        "The page inverts, your fate foreclosed.\n" +
                        "Two minutes pass, your screen turns red…\n" +
                        "*\"You shouldn’t be here,\"* the TTS said.\n" +
                        "\n" +
                        "Then comes a box, your pulse now laced-\n" +
                        "A button marked **Escape**-your IP traced.\n" +
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
                SolveStatus: "Solved",
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
                    name: "Fish",
                    date: "05/11/2025"
                }
            },
            {
                QuestName: "fan-TAS-tic",
                DetailsForSubmission: "Submit a img of proof of completion of the section Choice",
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis: "The system invites you to ask anything. But every word you type warps into one question: Who are you? " +
                        "TAS answers with mockery. Then asks-Do you know what comes next? Lie, and his anger flares. " +
                        "Tell the truth, and he braces for the end. Either way… the screen begins to tremble. " +
                        "Something reaches through, and your only friend is violently unmade",
                    Relations: "Continuation of {{ Ones and Zeros }}"
                },
                Requirement: ["Ones and Zeros"],
                category: "Main",
                QuestCredit: {
                    name: "THISISNOTME",
                    date: "05/11/2025"
                }
            },
            {
                QuestName: "Bye cruel world*",
                DetailsForSubmission: "Cutscene auto-unlocked with fan-TAS-tic",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "A cutscene plays. Static. Silence. And then the black-followed by screams you can't unhear. " +
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
            },
            {
                QuestName: "E/e",
                DetailsForSubmission: "Submit a img of proof of completion of the section Terminal",
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis: "Your speaking to [REDACTED]. [REDACTED] is not happy. " +
                        "\n Is this what you wanted? Is this what they needed? **WHY ARE YOU DOING THIS** STOP IT! STOP!",
                    Trivia: "E/e stands for the Entity and the Eldritch, here is some lore: [REDACTED].",
                    Relations: "Continuation of {{ fan-TAS-tic }} as well as the cutscene {{ Bye cruel world* }}"
                },
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
                    name: "Fish",
                    date: "05/11/2025"
                }
            },
            {
                QuestName: "VESSEL",
                DetailsForSubmission: "Submit a img of proof of completion of the section VESSEL",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "The finale?",
                    Relations: "Occurs after {{ E/e }} from this questline, this quest is a pre-requisite to {{ End it here }} from this questline as it provides keyword 6, to complete you need to have finished {{ Trees have logs: I }} and {{ Trees have logs: II }}"
                },
                Requirement: ["E/e"],
                category: "Main",
                relatedQuestlines: ["Hidden Secrets: I"],
                difficulty: 5,
                rewards: [
                    {
                        type: "Item",
                        name: "KEYWORD",
                        amount: 6,
                        description: "You have collected the 6 keys... see you at the end."
                    }
                ],
                QuestCredit: {
                    name: "Fish",
                    date: "05/11/2025"
                }
            },
            {
                QuestName: "End it here*",
                DetailsForSubmission: "Auto-unlocked when you submit VESSEL.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "There’s no going back. Unless you never left - and you never will. " +
                        "\n The end is a beginning. The beginning is an end. " +
                        "\n You are the end. You are the beginning. " +
                        "\n You are the game. You are the player. " +
                        "\n You are the one who will end it all. " +
                        "\n You are the one who will begin it all. **EMBRACE IT**.",
                    Relations: "Occurs after {{ VESSEL }} from this questline."
                },
                Requirement: ["VESSEL"],
                category: "Main",
                relatedQuestlines: ["Prologue"],
                rewards: [
                    {
                        type: "Achievement",
                        name: "The End is Nigh",
                        description: "You witnessed the end of the world as you know it - the end of YOU."
                    }
                ],
                QuestCredit: {
                    name: "All the VESSEL's",
                    date: ""
                }
            }
        ]
    },
]
