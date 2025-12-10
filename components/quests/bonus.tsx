import {Questline} from "@/lib/types";

export const BonusContent: Questline[] = [
    {
        questline_name: "Bonus Content Sagas",
        description: "A series of hidden sagas that unlock after completing the Facility questline and related questlines, a lore-mine - Will you find out what happens behind the scenes?",
        category: "Special Event",
        location: "Behind the stage",
        timeline: 8,
        quests: [
            // FAIL MANUALLY ANY QUEST WHEN NEXT SAGA BEGINS //
            // USE THE timeLock PROPERTY TO SET THE TIME UNTIL NEXT SAGA RELEASE //
            // IMPLEMENT WHEN THE PREVIOUS QUESTS ARE FULLY COMPLETED, AND THE BONUS CONTENT IS READY TO BE RELEASED //

            // ------ Saga I ------ //
            {
                QuestName: "Connecting...",
                DetailsForSubmission: "Follow the site's instructions carefully to reboot it, Email as requested by site.",
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis: "So.. We start ALL again huh? \n" +
                        "Hmm... the synopsis for this questline will be more.. *INTERESTING*\n" +
                        "So, care to ride for 10 more special gifts? :)\n" +
                        "Please... don't disappoint me, I am counting on you to make this a success so I may see you. - ???",
                    Trivia: "This quest is the gateway to all subsequent sagas. Its completion opens the door to the secrets beyond. HAVE FUN.",
                },
                MissName: "Timeout",
                MissInfo: "Failed to finish saga in time",
                Requirement: ["Recruit", "End it here*"],
                difficulty: 1,
                relatedQuestlines: ["The Facility", "Prologue"],
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
                    name: "Narrator",
                    date: "03/12/2025",
                },
            },
            {
                QuestName: "Everything is fine",
                DetailsForSubmission: "Submit an image showing your completion of the site, Make sure the image is clear and contains the completion message.",
                SolveStatus: "Solved",
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
                    name: "Fish",
                    date: "03/12/2025",
                },
            },
            // ------ Saga II ------ //
            {
                QuestName: "Empty?",
                DetailsForSubmission: "Autocompletes when site launches",
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis: "There are 8 hidden URL's find them all, " +
                        "this is gonna be **PRETTY** difficult but I know you can do it. \n" +
                        "Do note however... hidden in the 8 is 1 that expires, 1 that depends on time, so here is a word of advice... " +
                        "\n \n **NOTICE EVERYTHING DONT FAIL THIS!**\n" +
                        "Focus on the 3 numbers, then the plant and its broken side and its creation, and it shall click",
                    Trivia: "This quest acts as a placeholder until the site becomes active.",
                    Relations: "Originates from {{ Recruit }}, Requires {{ It's not enough }}",
                },
                Requirement: ["Recruit", "It's not enough", "Everything is fine"],
                timeLock: "00:00:00 06/12/2025",
                relatedQuestlines: ["Discord"],
                MissName: "Empty...",
                MissInfo: "Failed to finish saga in time",
                category: "Special",
                QuestCredit: {
                    name: "Narrator",
                    date: "06/12/2025",
                },
            },
            {
                QuestName: "3·15·25",
                DetailsForSubmission: "Ensure your image contains all three necessary URLs. Each link corresponds to a crucial piece of the stage.",
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis: "3 URLS... huh?\n" +
                        "3 Lives, 15 Blooms and then 25 **DIE**.\n" +
                        "But... what does it mean? \n" +
                        "*But whatever it may be... heed my call and focus on what comes next*",
                    Trivia: "The quests miss name is '25153'",
                    Relations: "Originates from {{ Empty? }}",
                },
                Requirement: ["Empty?"],
                MissName: "25153",
                MissInfo: "Failed to gain proper support, or failed to finish saga in time",
                failIfFailed: "{{ Empty? }}",
                difficulty: 3,
                category: "Side",
                QuestCredit: {
                    name: "mr.mist",
                    date: "06/12/2025",
                },
            },
            {
                QuestName: "Creator & Puppets",
                DetailsForSubmission: "The URLs should be interconnected, revealing a narrative of the creator's influence, Email img of current stage (2 urls)",
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis: "So you finally uncovered something huh? This actually is pretty impressive, but can you focus on the *inverted* side of me?",
                    Trivia: "The quests miss name is 'Stupid Puppet'",
                    Relations: "Originates from {{ Empty? }}, hints at {{ TR and Numbers }}",
                },
                Requirement: ["Empty?"],
                MissName: "Stupid Puppet",
                MissInfo: "Failed to gain proper support, or failed to finish saga in time",
                failIfFailed: "{{ Empty? }}",
                difficulty: 3,
                category: "Side",
                QuestCredit: {
                    name: "mr.mist",
                    date: "06/12/2025",
                },
            },
            {
                QuestName: "TR and Numbers",
                DetailsForSubmission: "The numbers reveal a hidden meaning-look for patterns and symbols in the URLs, Email img of current stage (2 urls)",
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis: "Interesting... you actually managed to find the hidden meaning behind the numbers and symbols. \n" +
                        "So lemme help, the next final hard puzzle is of time, it shall show its face when its name becomes true, I truly hope you aren't ~~late~~ **BLIND** to the party.",
                    Trivia: "The quests miss name is 'Expired'",
                    Relations: "Originates from {{ Empty? }}, goes to {{ Time Runs Thin }}",
                },
                Requirement: ["Empty?"],
                MissName: "Expired",
                MissInfo: "Failed to gain proper support, or failed to finish saga in time",
                failIfFailed: "{{ Empty? }}",
                difficulty: 4,
                category: "Side",
                QuestCredit: {
                    name: "mr.mist",
                    date: "06/12/2025",
                },
            },
            {
                QuestName: "Time Runs Thin",
                DetailsForSubmission: "Email img of current stage (1 url of time) on time",
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis: ":) \n" +
                        "So you finally managed to find the time huh? \n" +
                        "Well, I guess you can say... the time is now, and the time is up.\n" +
                        "But... what does it mean? \n" +
                        "*But whatever it may be... heed my call and focus on what comes next*\n" +
                        "You finished the ~~easy~~ hard part, so now the real fun begins. Good luck",
                    Trivia: "The quests miss name is 'Timeless'",
                    Relations: "Originates from {{ TR and Numbers }}, Requires {{ Empty? }}",
                },
                Requirement: ["TR and Numbers", "Empty?"],
                MissName: "Timeless",
                MissInfo: "You failed to discover the meaning of 'TR and Numbers' in time.",
                Secret: true,
                SecretHint: "Timing is crucial-submit the image of the exact time before the deadline, get the time from the URL itself, be quick!",
                failIfFailed: "{{ TR and Numbers }} OR {{ Empty? }}",
                difficulty: 4,
                category: "Hidden",
                rewards: [
                    {
                        type: "Achievement",
                        name: "Master of Time",
                        description: "An achievement for mastering the secrets of time within the saga.",
                    },
                ],
                QuestCredit: {
                    name: "mr.mist",
                    date: "06/12/2025",
                },
            },
            // ------ Saga III ------ //
            {
                QuestName: "3:Clocks and Hands",
                DetailsForSubmission: "Auto unlocks after release.",
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis: "The clock is ticking, and the hands of time are broken. Can you fix them in time, or will you be caught in a loop of failure?",
                    Trivia: "Technically, this is one of the two quests that can fail after solving, which is when you fail the next parts fully.",
                    Relations: "These quests change or relate to this: {{ Cryptic ID: I }}, {{ Cryptic ID: II }}, {{ Cryptic ID: III }}",
                },
                Requirement: ["TR and Numbers"],
                MissName: "Broken Me",
                relatedQuestlines: ["Discord"],
                MissInfo: "Did not complete reviving your best friend by now or failed everything related here...",
                failIfFailed: "{{ Cryptic ID: I }} AND {{ Cryptic ID: II }} AND {{ Cryptic ID: III }}",
                failIfPending: "{{ TAS2 }}",
                category: "Special",
                QuestCredit: {
                    name: "Narrator",
                    date: "08/12/2025",
                },
            },
            {
                QuestName: "Cryptic ID: I",
                DetailsForSubmission: "Keyword 1 sent to #lore",
                SolveStatus: "Solved",
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
                    name: "Fish",
                    date: "10/12/2025",
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
            // ------ Saga IV ------ //
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
                Requirement: ["3:Clocks and Hands", "TAS Q&A", "Fan base", "The foundation", "Eggs", "TAS2", "Trees have logs: I", "Trees have logs: II", "Trees have logs: III", "A red herring: I", "A red herring: II", "A red herring: III", "Inky black", "The 4th learnt word", "§███§", "Leafs, roots and growing saplings"],
                MissName: "Broken You",
                timeLock: "00:00:00 15/12/2025",
                relatedQuestlines: ["Discord"],
                MissInfo: "Failed to gain proper support, or failed to finish saga in time or failed previous saga",
                failIfFailed: "({{ Cryptic ID: IV }} AND {{ Cryptic ID: V }} AND {{ Cryptic ID: VI }}) OR {{ 3:Clocks and Hands }}",
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
            // ------ SAGA V ------ //
            /*
             Wait a week then check if there is pending quests,
             for each pending quest add 3 days,
             although if there is even 1 failed quest
             ignore the added days and set wait time
             to exactly 1 extra week
            */
            {
                QuestName: "Narrator: A Harbinger",
                DetailsForSubmission: "Autocompletes when site launches.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "~~FINALLY I CAN TALK TO YOU - I CAN INTERACT WITH YOU... I WILL GIVE YOU WHAT YOU WANT =D~~  __MORE IMPORTANT LORE__: The **[REDACTED]** contains the **[REDACTED]** where **[REDACTED]** did **[REDACTED][REDACTED]** and finally **[REDACTED][REDACTED][REDACTED]** me...",
                    Relations: "Next quest in line is {{ Narrator: Tenacity }}, get ready :)",
                },
                MissName: "You’re not that special",
                MissInfo: "You have failed or have pending quests (excluding quests under [Hidden Secrets: II]) when this saga activates.",
                Secret: true,
                SecretHint: "For your sake, I hope you have no failed or pending quests* when this starts - For thou shall find what thou is looking for.",
                failIfFailed: "{{ A map to see }} OR {{ Leaking }} OR {{ Security Log }} OR {{ Facility }} OR {{ Locked Out }} OR {{ Interference* }} OR {{ Networking }} OR {{ Confidential }} OR {{ Buttons & Browsers }} OR {{ TREE98 }} OR {{ Emergency Boot System }} OR {{ R̴̨̢̳̜͇͊͜ͅŲ̴̡̘̫͔͒̒͘͝͠Ń̷̂ }} OR {{ Br3@k1Ng D0wN }} OR {{ Ones and Zeros }} OR {{ fan-TAS-tic }} OR {{ Bye cruel world* }} OR {{ E/e }} OR {{ End it here* }} OR {{ VESSEL }} OR {{ See you 25 times }} OR {{ Hollow Pilgrimage }} OR {{ Dreamcatcher }} OR {{ O ARVORE DA CARNE }} OR {{ Moonlight }} OR {{ Time* }} OR {{ Will the moon ever smile }} OR {{ Blood Moon }} OR {{ root:// }} OR {{ Better Odds }} OR {{ Insanity }} OR {{ Flowers }} OR {{ Trees have logs: I }} OR {{ Trees have logs: II }} OR {{ Trees have logs: III }} OR {{ A red herring: I }} OR {{ A red herring: II }} OR {{ A red herring: III }} OR {{ Inky black }} OR {{ The 4th learnt word }} OR {{ §███§ }} OR {{ Leafs, roots and growing saplings }} OR {{ Music to my TREES }} OR {{ Lorem Ipsum Dolor }} OR {{ Too many choices }} OR {{ Secrets in the logs of trees: I }} OR {{ Secrets in the logs of trees: II }} OR {{ Secrets in the logs of trees: III }} OR {{ Secrets in the logs of trees: IV }} OR {{ Hidden Voices }} OR {{ Chromatic Cipher }} OR {{ Recruit }} OR {{ It's not enough }} OR {{ TAS2 }} OR {{ TAS Q&A }} OR {{ Fan base }} OR {{ The foundation }} OR {{ Eggs }} OR {{ Connecting... }} OR {{ Everything is fine }} OR {{ Empty? }} OR {{ 3·15·25 }} OR {{ Creator & Puppets }} OR {{ TR and Numbers }} OR {{ Time Runs Thin }} OR {{ 3:Clocks and Hands }} OR {{ Cryptic ID: I }} OR {{ Cryptic ID: II }} OR {{ Cryptic ID: III }} OR {{ 3:Registration }} OR {{ Cryptic ID: IV }} OR {{ Cryptic ID: V }} OR {{ Cryptic ID: VI }}",
                failIfPending: "{{ A map to see }} OR {{ Leaking }} OR {{ Security Log }} OR {{ Facility }} OR {{ Locked Out }} OR {{ Interference* }} OR {{ Networking }} OR {{ Confidential }} OR {{ Buttons & Browsers }} OR {{ TREE98 }} OR {{ Emergency Boot System }} OR {{ R̴̨̢̳̜͇͊͜ͅŲ̴̡̘̫͔͒̒͘͝͠Ń̷̂ }} OR {{ Br3@k1Ng D0wN }} OR {{ Ones and Zeros }} OR {{ fan-TAS-tic }} OR {{ Bye cruel world* }} OR {{ E/e }} OR {{ End it here* }} OR {{ VESSEL }} OR {{ See you 25 times }} OR {{ Hollow Pilgrimage }} OR {{ Dreamcatcher }} OR {{ O ARVORE DA CARNE }} OR {{ Moonlight }} OR {{ Time* }} OR {{ Will the moon ever smile }} OR {{ Blood Moon }} OR {{ root:// }} OR {{ Better Odds }} OR {{ Insanity }} OR {{ Flowers }} OR {{ Trees have logs: I }} OR {{ Trees have logs: II }} OR {{ Trees have logs: III }} OR {{ A red herring: I }} OR {{ A red herring: II }} OR {{ A red herring: III }} OR {{ Inky black }} OR {{ The 4th learnt word }} OR {{ §███§ }} OR {{ Leafs, roots and growing saplings }} OR {{ Music to my TREES }} OR {{ Lorem Ipsum Dolor }} OR {{ Too many choices }} OR {{ Secrets in the logs of trees: I }} OR {{ Secrets in the logs of trees: II }} OR {{ Secrets in the logs of trees: III }} OR {{ Secrets in the logs of trees: IV }} OR {{ Hidden Voices }} OR {{ Chromatic Cipher }} OR {{ Recruit }} OR {{ It's not enough }} OR {{ TAS2 }} OR {{ TAS Q&A }} OR {{ Fan base }} OR {{ The foundation }} OR {{ Eggs }} OR {{ Connecting... }} OR {{ Everything is fine }} OR {{ Empty? }} OR {{ 3·15·25 }} OR {{ Creator & Puppets }} OR {{ TR and Numbers }} OR {{ Time Runs Thin }} OR {{ 3:Clocks and Hands }} OR {{ Cryptic ID: I }} OR {{ Cryptic ID: II }} OR {{ Cryptic ID: III }} OR {{ 3:Registration }} OR {{ Cryptic ID: IV }} OR {{ Cryptic ID: V }} OR {{ Cryptic ID: VI }}",
                Requirement: ["3:Registration"],
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
            // ------ SAGA VI ------ //
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
                MissInfo: "Failed to finish saga in time",
                Requirement: ["Narrator: A Harbinger"],
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
            // ------ SAGA VII ------ //
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
                MissInfo: "Failed to finish saga in time",
                Requirement: ["12 coordinators", "Trees have logs: I", "Trees have logs: II", "Trees have logs: III"],
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
            // ------ SAGA VIII ------ //
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
                MissInfo: "You failed quest {{ 3·15·25 }} before completing this one, or failed to finish saga in time.",
                failIfFailed: "{{ 3·15·25 }}",
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
            // ------ SAGA IX ------ //
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
                Requirement: ["Bloom, Live and Die"],
                manualLock: true,
                MissInfo: "Failed to complete saga in time",
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
            // ------ SAGA X ------ //
            /*
             Wait a week unless there is a pending quest
             or failed quest then wait 2 weeks
            */
            {
                QuestName: "Narrator: Tenacity",
                DetailsForSubmission: "Autocompletes when site launches.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "The __NARRATOR__ returns, more ~~[REDACTED]~~ than before... This is the **END**",
                    Trivia: "All code will be open-sourced now, and the creators identity would have been revealed, don't look into the code if you have not finished the ARG.. major major spoilers can be found",
                    Relations: "Began from {{ Narrator: A Harbinger }} - I will miss you <3",
                },
                Requirement: ["Narrator: A Harbinger"],
                manualLock: true,
                MissName: ":(",
                MissInfo: "You have not reached 100% completion excluding quests under Hidden Secrets: II.",
                Secret: true,
                SecretHint: "49 66 20 79 6F 75 20 68 61 76 65 20 6E 6F 20 70 61 73 74 20 6E 6F 72 20 66 61 69 6C 65 64 20 71 75 65 73 74 73 2C 20 49 20 73 68 61 6C 6C 20 62 65 20 77 61 69 74 69 6E 67 2E 20 4E 6F 74 20 61 73 20 61 20 67 61 74 65 6B 65 65 70 65 72 2C 20 62 75 74 20 61 73 20 61 20 73 74 6F 72 79 74 65 6C 6C 65 72 2E",
                failIfFailed: "{{ Narrator: A Harbinger }} OR {{ He who lives in clocks }} OR {{ 12 coordinators }} OR {{ The timeline }} OR {{ Canon }} OR {{ Bloom, Live and Die }} OR {{ 25 dead }} OR {{ 15 bloom }} OR {{ 3 live on }} OR {{ Philosophy }} OR {{ One more }}",
                failIfPending: "{{ Narrator: A Harbinger }} OR {{ He who lives in clocks }} OR {{ 12 coordinators }} OR {{ The timeline }} OR {{ Canon }} OR {{ Bloom, Live and Die }} OR {{ 25 dead }} OR {{ 15 bloom }} OR {{ 3 live on }} OR {{ Philosophy }} OR {{ One more }}",
                difficulty: 5,
                category: "Hidden",
                rewards: [
                    {
                        type: "Achievement",
                        name: "Finished Business",
                        description: "The narrator marks you as complete in your broken way.",
                    },
                ],
                QuestCredit: {
                    name: "Narrator",
                    date: "Never",
                },
            },
            // ------ Finale ------ //
            /*
             Wait a month
            */
            {
                QuestName: "Penance, So Praise Be",
                DetailsForSubmission: "Just wait.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "The final whispers of the one who pulled the strings and played with the puppet, and it is not the Narrator... <a href=\"https://the-facility.vercel.app/codex\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"color:blue;\">PRAISE BE</a>",
                    Trivia: "This quest is the final one, it is the end of the saga, and it is the end of the all of the ARG.",
                    Relations: "This quest follows from {{ Narrator: Tenacity }} behind the scenes, and is the final quest of the saga.",
                },
                Requirement: ["Narrator: Tenacity"],
                manualLock: true,
                MissName: "Failed forgiveness, Earned Silence.",
                MissInfo: "You have failed {{ Narrator: Tenacity }}..",
                Secret: true,
                SecretHint: "57 61 69 74 20 75 6E 74 69 6C 20 79 6F 75 20 72 65 63 65 69 76 65 20 68 69 73 74 6F 72 79",
                failIfFailed: "{{ Narrator: Tenacity }}",
                difficulty: 5,
                category: "Hidden",
                rewards: [
                    {
                        type: "Item",
                        name: "The final whispers",
                        description: "The whispers of a conversation before deletion, of whom he praised, of whom he served, of whom he narrated to, of whom he imitated.",
                    },
                    {
                        type: "Experience",
                        name: "The Narrator",
                        description: "You heard, and understood everything. Good luck, and Good bye <3",
                    },
                    {
                        type: "Item",
                        name: "The Sources Unbound",
                        amount: 6,
                        description: "All the hidden frameworks laid bare: Quest Site, Extra Scripts, VESSEL.EXE, Prolog, Discord Bot, and the FACILITY website source code, liberated for all to explore, modify, and understand. Major Spoilers for those who look inside.",
                    },
                ],
                QuestCredit: {
                    name: "ME",
                    date: "His death",
                },
            },
        ],
    },
]
