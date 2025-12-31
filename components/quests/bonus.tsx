import {Questline} from "@/lib/types";

export const BonusContent: Questline[] = [
    {
        questline_name: "Bonus Content Chapters",
        description: "A series of hidden sagas that unlock after completing the Facility questline and related questlines, a lore-mine - Will you find out what happens behind the scenes?",
        category: "Special Event",
        location: "Behind the stage",
        timeline: 8,
        quests: [
            // FAIL MANUALLY ANY QUEST WHEN NEXT CHAPTER BEGINS //
            // USE THE timeLock PROPERTY TO SET THE TIME UNTIL NEXT CHAPTER RELEASE //
            // IMPLEMENT WHEN THE PREVIOUS QUESTS ARE FULLY COMPLETED, AND THE BONUS CONTENT IS READY TO BE RELEASED //

            // ------ Chapter I ------ //
            {
                QuestName: "Connecting...",
                DetailsForSubmission: "[Prelog - Chapter I] On site release, automatically unlocks.",
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis: "So.. We start ALL again huh? \n" +
                        "Hmm... the synopsis for this questline will be more.. *INTERESTING*\n" +
                        "So, care to ride for 10 more special gifts? :)\n" +
                        "Please... don't disappoint me, I am counting on you to make this a success so I may see you. - ???",
                    Trivia: "This quest is the gateway to all subsequent sagas. Its completion opens the door to the secrets beyond. The quest's miss name is 'Timeout'. HAVE FUN.",
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
                DetailsForSubmission: "[Chapter I] Complete all tasks on the website that opened from the previous quest. Take a clear screenshot that shows the completion message or final screen of the site. Email this image to the designated address. Make sure your screenshot clearly displays the completion confirmation.",
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis: "Good job, you were able to recall the past details huh? \n" +
                        "Well, Imma hand it to you, ALL OF YOU ;)\n" +
                        "You all did a great job, and I am proud of you for completing this small speck of the puzzle. \n",
                    Trivia: "The \"*Info*\" given to you is about lil ol' me. The quest's miss name is '¿'.",
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
            // ------ Chapter II ------ //
            {
                QuestName: "Empty?",
                DetailsForSubmission: "[Prelog - Chapter II] This quest automatically completes when the Chapter II website launches. You'll receive a notification in Discord when the site goes live. No manual submission required - just be ready for when it activates!",
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis: "There are 8 hidden URL's find them all, " +
                        "this is gonna be **PRETTY** difficult but I know you can do it. \n" +
                        "Do note however... hidden in the 8 is 1 that expires, 1 that depends on time, so here is a word of advice... " +
                        "\n \n **NOTICE EVERYTHING DONT FAIL THIS!**\n" +
                        "Focus on the 3 numbers, then the plant and its broken side and its creation, and it shall click",
                    Trivia: "This quest acts as a placeholder until the site becomes active. The quest's miss name is 'Empty...'.",
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
                DetailsForSubmission: "[Chapter II] Find all three hidden URLs on the Chapter II website. Take a screenshot showing evidence of all three URLs discovered. Email the image with all three URLs clearly visible to complete this quest. These URLs are the special numbers.",
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
                DetailsForSubmission: "[Chapter II] Discover 2 interconnected URLs that reveal the narrative connection between the creator and their puppets. These URLs tell a story together. Take a screenshot showing your progress at this stage (with both URLs visible or evidence of finding them). Email the image to the designated address.",
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
                DetailsForSubmission: "[Chapter II] Look for patterns in the numbers and symbols across the 2 URLs you've found. The 'TR' and numerical sequences have hidden meanings. Take a screenshot of your current progress showing these 2 URLs and any patterns you've discovered. Email the image to complete this stage.",
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
                DetailsForSubmission: "[Chapter II] Find the time-dependent URL (hint: it's only accessible at a specific time). The URL itself will reveal when you need to access it. Take a screenshot of this time-based URL when it becomes active and email it immediately before the time window closes!",
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
            // ------ Chapter III ------ //
            {
                QuestName: "3:Clocks and Hands",
                DetailsForSubmission: "[Prelog - Chapter III] This quest automatically unlocks when Chapter III is released. No manual submission needed - the quest will activate when the time comes. Prepare for the clock-themed challenges ahead!",
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis: "The clock is ticking, and the hands of time are broken. Can you fix them in time, or will you be caught in a loop of failure?",
                    Trivia: "Technically, this is one of the two quests that can fail after solving, which is when you fail the next parts fully. The quest's miss name is 'Broken Me'.",
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
                DetailsForSubmission: "[Chapter III] Solve the first cryptic riddle on the website. Once you find the first keyword/answer, post it in the Discord #lore channel. The riddle is hidden within the Chapter III site - explore carefully!",
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis: "A hidden riddle awaits, only visible to those who know the first secret phrase.",
                    Trivia: "The quest's miss name is 'Whatami:1'.",
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
                DetailsForSubmission: "[Chapter III] Find and solve the second cryptic riddle hidden on the Chapter III website. Once you discover the second keyword/answer, post it in the Discord #lore channel to complete this quest.",
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis: "A hidden riddle awaits, only visible to those who know the second secret phrase.",
                    Trivia: "The quest's miss name is 'Whatami:2'.",
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
                    name: "Fish",
                    date: "11/12/2025",
                },
            },
            {
                QuestName: "Cryptic ID: III",
                DetailsForSubmission: "[Chapter III] Discover and solve the third and final cryptic riddle on the website. This keyword ties together all the broken pieces from the previous riddles. Post the third keyword in the Discord #lore channel to complete this part of the saga.",
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis: "A hidden riddle awaits, only visible to those who know the final secret phrase.",
                    Trivia: "The last keyword ties together all the broken pieces of time. The quest's miss name is 'Whatami:3'.",
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
                    name: "mr.mist",
                    date: "15/12/2025",
                },
            },
            // ------ Chapter IV ------ //
            {
                QuestName: "3:Registration",
                DetailsForSubmission: "[Prelog - Chapter IV] This quest automatically unlocks when Chapter IV is released (3 days after Chapter III). The registration database has been leaked - investigate and prepare to submit usernames to uncover hidden IDs. No manual submission needed at this stage.",
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis: "Something went wrong, and the registration database has been leaked... again. Submit the username to uncover the ID's",
                    Trivia: "Technically, this is second of only two quests that can fail after solving ({{ 3:Clocks and Hands }}), which is when you fail the next parts fully. The quest's miss name is 'Broken You'.",
                    Relations: "These quests change or relate to this: {{ Cryptic ID: I }}, {{ Cryptic ID: II }}, {{ Cryptic ID: III }}, {{ 3:Clocks and Hands }}, {{ Cryptic ID: IV }}, {{ Cryptic ID: V }}, {{ Cryptic ID: VI }}",
                },
                Requirement: ["3:Clocks and Hands", "TAS Q&A", "Fan base", "The foundation", "Eggs", "TAS2", "Trees have logs: I", "Trees have logs: II", "Trees have logs: III", "A red herring: I", "A red herring: II", "A red herring: III", "Inky black", "The 4th learnt word", "§███§", "Leafs, roots and growing saplings"],
                MissName: "Broken You",
                relatedQuestlines: ["Discord"],
                MissInfo: "Failed to gain proper support, or failed to finish saga in time or failed previous saga",
                failIfFailed: "({{ Cryptic ID: IV }} AND {{ Cryptic ID: V }} AND {{ Cryptic ID: VI }}) OR {{ 3:Clocks and Hands }}",
                difficulty: 1,
                category: "Special",
                QuestCredit: {
                    name: "Narrator",
                    date: "10/12/2025",
                },
            },
            {
                QuestName: "Cryptic ID: IV",
                DetailsForSubmission: "[Chapter IV] Complete the first ID segment puzzle on the website (related to TREE). Use the riddle answers from Cryptic ID: I to help solve this. Take a screenshot showing you've completed this segment and email it to the designated address.",
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis: "*IV Bags in my blood*... don't mind my incoherent blabbering this saga, I am preparing for something",
                    Trivia: "For TREE. The quest's miss name is 'Whoami:1'.",
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
                    name: "Fish",
                    date: "10/12/2025",
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
                DetailsForSubmission: "[Chapter IV] Complete the second ID segment puzzle (related to TAS). Use the answer from Cryptic ID: II to help solve this segment. Take a screenshot showing completion of this section and email it to the designated address.",
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis: "*V the day I see you* :)",
                    Trivia: "For TAS. The quest's miss name is 'Whoami:2'.",
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
                    name: "Fish",
                    date: "11/12/2025",
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
                DetailsForSubmission: "[Chapter IV] Complete the third and final ID segment puzzle (related to ENTITY and TREE's console). Use the answer from Cryptic ID: III to unlock this. Take a screenshot showing completion of this final segment and email it to finish Chapter IV.",
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis: "6 divided by 2 is 3, my ~~favorite F@v0rit3 f@^0R1t3~~ worst number...",
                    Trivia: "For ENTITY, where you access TREE's console. The quest's miss name is 'Whoami:3'.",
                    Relations: "These quests change or relate to this: {{ Cryptic ID: IV }}, {{ 3:Registration }}, {{ Cryptic ID: III }}, {{ Cryptic ID: V }}",
                },
                Requirement: ["3:Registration", "Cryptic ID: III"],
                MissName: "Whoami:3",
                MissInfo: "Failed to finish saga in time or failed required quests",
                Secret: true,
                SecretHint: "The riddle's answer you received may be the answer to this mystery",
                failIfFailed: "{{ 3:Registration }} OR {{ Cryptic ID: III }}",
                difficulty: 5,
                category: "Hidden",
                QuestCredit: {
                    name: "mr.mist",
                    date: "15/12/2025",
                },
                rewards: [
                    {
                        type: "Experience",
                        name: "HEX",
                        description: "Lore filled with the secrets of the cryptic ID.",
                    }
                ]
            },
            // ------ CHAPTER V ------ //
            /*
             Wait a week then check if there is pending quests,
             for each pending quest add 3 days,
             although if there is even 1 failed quest
             ignore the added days and set wait time
             to exactly 1 extra week
            */
            {
                QuestName: "Narrator: A Harbinger",
                DetailsForSubmission: "[Chapter V - Special Quest] This quest automatically unlocks when Chapter V launches, BUT ONLY if you have NO failed or pending quests (excluding Hidden Secrets: II category) when it activates. Maintain perfect completion to unlock this special encounter with the Narrator.",
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis: "~~FINALLY I CAN TALK TO YOU - I CAN INTERACT WITH YOU... I WILL GIVE YOU WHAT YOU WANT =D~~  __MORE IMPORTANT LORE__: The **[REDACTED]** contains the **[REDACTED]** where **[REDACTED]** did **[REDACTED][REDACTED]** and finally **[REDACTED][REDACTED][REDACTED]** me...",
                    Trivia: "The quest's miss name is 'You're not that special'.",
                    Relations: "Next quest in line is {{ Narrator: Tenacity }}, get ready :)",
                },
                MissName: "You’re not that special",
                MissInfo: "You have failed or have pending quests (excluding quests under [Hidden Secrets: II]) when this saga activates.",
                Secret: true,
                SecretHint: "For your sake, I hope you have no failed or pending quests* when this starts - For thou shall find what thou is looking for.",
                failIfFailed: "{{ A map to see }} OR {{ Leaking }} OR {{ Security Log }} OR {{ Facility }} OR {{ Locked Out }} OR {{ Interference* }} OR {{ Networking }} OR {{ Confidential }} OR {{ Buttons & Browsers }} OR {{ TREE98 }} OR {{ Emergency Boot System }} OR {{ R̴̨̢̳̜͇͊͜ͅŲ̴̡̘̫͔͒̒͘͝͠Ń̷̂ }} OR {{ Br3@k1Ng D0wN }} OR {{ Ones and Zeros }} OR {{ fan-TAS-tic }} OR {{ Bye cruel world* }} OR {{ E/e }} OR {{ End it here* }} OR {{ VESSEL }} OR {{ See you 25 times }} OR {{ Hollow Pilgrimage }} OR {{ Dreamcatcher }} OR {{ O ARVORE DA CARNE }} OR {{ Moonlight }} OR {{ Time* }} OR {{ Will the moon ever smile }} OR {{ Blood Moon }} OR {{ root:// }} OR {{ Better Odds }} OR {{ Insanity }} OR {{ Flowers }} OR {{ Trees have logs: I }} OR {{ Trees have logs: II }} OR {{ Trees have logs: III }} OR {{ A red herring: I }} OR {{ A red herring: II }} OR {{ A red herring: III }} OR {{ Inky black }} OR {{ The 4th learnt word }} OR {{ §███§ }} OR {{ Leafs, roots and growing saplings }} OR {{ Music to my TREES }} OR {{ Lorem Ipsum Dolor }} OR {{ Recruit }} OR {{ It's not enough }} OR {{ TAS2 }} OR {{ TAS Q&A }} OR {{ Fan base }} OR {{ The foundation }} OR {{ Eggs }} OR {{ Connecting... }} OR {{ Everything is fine }} OR {{ Empty? }} OR {{ 3·15·25 }} OR {{ Creator & Puppets }} OR {{ TR and Numbers }} OR {{ Time Runs Thin }} OR {{ 3:Clocks and Hands }} OR {{ Cryptic ID: I }} OR {{ Cryptic ID: II }} OR {{ Cryptic ID: III }} OR {{ 3:Registration }} OR {{ Cryptic ID: IV }} OR {{ Cryptic ID: V }} OR {{ Cryptic ID: VI }}",
                failIfPending: "{{ A map to see }} OR {{ Leaking }} OR {{ Security Log }} OR {{ Facility }} OR {{ Locked Out }} OR {{ Interference* }} OR {{ Networking }} OR {{ Confidential }} OR {{ Buttons & Browsers }} OR {{ TREE98 }} OR {{ Emergency Boot System }} OR {{ R̴̨̢̳̜͇͊͜ͅŲ̴̡̘̫͔͒̒͘͝͠Ń̷̂ }} OR {{ Br3@k1Ng D0wN }} OR {{ Ones and Zeros }} OR {{ fan-TAS-tic }} OR {{ Bye cruel world* }} OR {{ E/e }} OR {{ End it here* }} OR {{ VESSEL }} OR {{ See you 25 times }} OR {{ Hollow Pilgrimage }} OR {{ Dreamcatcher }} OR {{ O ARVORE DA CARNE }} OR {{ Moonlight }} OR {{ Time* }} OR {{ Will the moon ever smile }} OR {{ Blood Moon }} OR {{ root:// }} OR {{ Better Odds }} OR {{ Insanity }} OR {{ Flowers }} OR {{ Trees have logs: I }} OR {{ Trees have logs: II }} OR {{ Trees have logs: III }} OR {{ A red herring: I }} OR {{ A red herring: II }} OR {{ A red herring: III }} OR {{ Inky black }} OR {{ The 4th learnt word }} OR {{ §███§ }} OR {{ Leafs, roots and growing saplings }} OR {{ Music to my TREES }} OR {{ Lorem Ipsum Dolor }} OR {{ Recruit }} OR {{ It's not enough }} OR {{ TAS2 }} OR {{ TAS Q&A }} OR {{ Fan base }} OR {{ The foundation }} OR {{ Eggs }} OR {{ Connecting... }} OR {{ Everything is fine }} OR {{ Empty? }} OR {{ 3·15·25 }} OR {{ Creator & Puppets }} OR {{ TR and Numbers }} OR {{ Time Runs Thin }} OR {{ 3:Clocks and Hands }} OR {{ Cryptic ID: I }} OR {{ Cryptic ID: II }} OR {{ Cryptic ID: III }} OR {{ 3:Registration }} OR {{ Cryptic ID: IV }} OR {{ Cryptic ID: V }} OR {{ Cryptic ID: VI }}",
                Requirement: ["3:Registration"],
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
                    date: "24/12/2025",
                },
            },
            // ------ CHAPTER VI ------ //
            {
                QuestName: "Those who wait are seen",
                DetailsForSubmission: "[Prelog - Chapter VI] This quest automatically unlocks when the Chapter VI website launches. The page will display nothing but shifting, meaningless flavor text. Do not refresh. Do not leave. After exactly three hours, an interaction will reveal itself. No manual submission is required at this stage.",
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis:
                        "Nothing happens.\n" +
                        "And nothing happens.\n" +
                        "And still, nothing happens.\n\n" +
                        "Three hours pass. Most will leave. Some will check the code. A few will wait.\n" +
                        "~~TIME DOES NOT REWARD THE IMPATIENT~~",
                    Trivia: "The quest's miss name is 'No time left'.",
                    Relations: "Leads to {{ Rare be the patient }}",
                },
                MissName: "No time left",
                MissInfo: "Failed to finish saga in time",
                Requirement: ["Narrator: A Harbinger"],
                category: "Special",
                QuestCredit: {
                    name: "Narrator",
                    date: "30/12/2025",
                },
            },
            {
                QuestName: "Rare be the patient",
                DetailsForSubmission: "[Chapter VI] After waiting three uninterrupted hours, a popup appears. Press and hold the button for ten full seconds without releasing. Any interruption fails the attempt. Upon success, the chapter is complete. Take a screenshot of the completion state and email it to finish this saga.",
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis:
                        "Waiting was the test.\n" +
                        "Endurance is the answer.\n\n" +
                        "Ten seconds is nothing.\n" +
                        "Unless you are afraid to commit.\n\n" +
                        "__Let go, and you prove you never deserved the wait.__",
                    Trivia: "The quest's miss name is 'Lack of Patience'.",
                    Relations: "Originates from {{ Those who wait are seen }}",
                },
                Requirement: ["Those who wait are seen"],
                MissName: "Lack of Patience",
                category: "Special",
                failIfFailed: "{{ Those who wait are seen }}",
                MissInfo: "Failed to finish saga in time",
                difficulty: 2,
                rewards: [
                    {
                        type: "Achievement",
                        name: "Unbroken",
                        description: "You waited when nothing happened, and held when it mattered.",
                    },
                ],
                QuestCredit: {
                    name: "Fish",
                    date: "30/12/2025",
                },
            },
            // ------ CHAPTER VII ------ //
            {
                QuestName: "The timeline",
                DetailsForSubmission: "[Prelog - Chapter VII] This quest automatically unlocks when the Chapter VII website launches. The site will reveal a branched timeline with 5 melted clocks representing [REDACTED]. No manual submission needed - just note.. this quest decides if some lore is canon or not.",
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis: "The timeline branched, looped, erased. But you followed something. \n" +
                        "5 melted clocks, and 5 dates of importance, where whoever did all of this... is now a pile of forgotten bones.",
                    Trivia: "The quest's miss name is 'Lost history'.",
                    Relations: "Goes to {{ Canon }}",
                },
                MissName: "Lost history",
                MissInfo: "Failed to finish saga in time",
                Requirement: ["Those who wait are seen", "Trees have logs: I", "Trees have logs: II", "Trees have logs: III"],
                category: "Special",
                QuestCredit: {
                    name: "Narrator",
                    date: "31/12/2025",
                },
            },
            {
                QuestName: "Canon",
                DetailsForSubmission: "[Chapter VII] Use information from 'Trees have logs: I, II, III' quests to correctly arrange the timeline dates on the website. Once you've set the canonical timeline correctly and the site confirms your completion, take a screenshot showing the final arrangement. Email the image to establish the canon!",
                SolveStatus: "Solved",
                QuestDesc: {
                    Synopsis: "Canon is defined by repetition, not truth. And you set the timeline of all the logs correctly, even if it was already labelled..",
                    Trivia: "The name of the mission actually decides if the timeline lore is canon or not! If yes, that means all the logs timestamps are canonically true. The quest's miss name is 'Fanon'.",
                    Relations: "Originates from {{ The timeline }}, which requires {{Trees have logs: I }}, {{ Trees have logs: II }}, {{ Trees have logs: III }} to complete the puzzle itself.",
                },
                Requirement: ["The timeline"],
                MissName: "Fanon",
                category: "Special",
                MissInfo: "Failed to gain proper support, or failed to finish saga in time",
                failIfFailed: "{{ The timeline }}",
                difficulty: 1,
                rewards: [
                    {
                        type: "Achievement",
                        name: "Declared Canon",
                        description: "You survived enough to be remembered as 'real' and to set IT as real.",
                    },
                ],
                QuestCredit: {
                    name: "Fish",
                    date: "31/12/2025",
                },
            },
            // ------ CHAPTER VIII ------ //
            {
                QuestName: "Bloom, Live and Die",
                DetailsForSubmission: "[Prelog - Chapter VIII] This quest automatically unlocks when the Chapter VIII website launches. It requires completion of quest '3·15·25' from Chapter II. The cycle of life, death, and blooming begins here. No manual submission needed at this stage.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "A cycle of life, death, and the whispers of the broken, 3? 15? 25? Do these ring a bell to you?\n" +
                        "But 25 of you must die, for 15 to then bloom, and finally 3 to live this quest.",
                    Trivia: "Unlocks once {{ 3·15·25 }} is completed as it is canon that these 3 numbers are related canonically to Blooming, Living and Death. The quest's miss name is 'All dead'.",
                    Relations: "These quests canonically were referenced from: {{ 3·15·25 }}, {{ 25 dead }}, {{ 15 bloom }}, {{ 3 live on }}",
                },
                Requirement: ["3·15·25"],
                manualLock: true,
                MissName: "All dead",
                MissInfo: "You failed quest {{ 3·15·25 }} before completing this one, or failed to finish saga in time.",
                failIfFailed: "{{ 3·15·25 }}",
                category: "Special",
                QuestCredit: {
                    name: "Narrator",
                    date: "",
                },
            },
            {
                QuestName: "25 dead",
                DetailsForSubmission: "[Chapter VIII] Complete the first puzzle segment on the website about the 25 who sacrificed themselves (IS IT YOU????). This represents the 'death' phase of the cycle. Take a screenshot showing you've completed this segment and email it to the designated address.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "25 sacrificed themselves to die, once they joined each other",
                    Trivia: "The quest's miss name is 'Buried'.",
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
                DetailsForSubmission: "[Chapter VIII] Complete the second puzzle segment about the 15 flowers that bloom from death (is it you?). This represents the 'blooming' phase where decay transforms into new life. Take a screenshot showing completion of this segment and email it to the designated address.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "Flesh rots, flowers bloom in their place. 15 flowers oh how beautifully basking in the sunlight and how *YOU* bloom at midnight...",
                    Trivia: "The quest's miss name is 'Rotting'.",
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
                DetailsForSubmission: "[Chapter VIII] Complete the third and final puzzle segment about the 3 who continue living against all odds (can it be HIM?). This represents the 'life' phase that shouldn't exist but does. Take a screenshot showing completion of this final segment to finish the cycle. Email the image to complete Chapter VIII.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "A lie of life continues where it shouldn't, why only 3? And did you enjoy it? Shared it?",
                    Trivia: "The quest's miss name is 'A lie'.",
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
            // ------ CHAPTER IX ------ //
            {
                QuestName: "Philosophy",
                DetailsForSubmission: "[Prelog - Chapter IX] This quest automatically unlocks when the Chapter IX website launches. The site will present philosophical questions about morality and forbidden knowledge. No manual submission needed - prepare thyself for deep introspection!",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "A tangle of fragmented truths and irrational beliefs, \n" +
                        "What do you think of the questions asked? There is no right or wrong, \n" +
                        "just morals we unanimously decreed upon and feasted our minds within, \n" +
                        "we labelled the forbidden fruits and stored them high for only our eyes to see, \n" +
                        "and if we decide the temptation is too much... \n" +
                        "then we give in as a whole and remove our stupid man-made label of morals and-- \n" +
                        "**GOUGE UPON THEE EYES AND INTO HELL WE GO**",
                    Trivia: "The quest's miss name is 'Deranged Nonsense'.",
                    Relations: "Goes to {{ One more }}",
                },
                MissName: "Deranged Nonsense",
                Requirement: ["Bloom, Live and Die"],
                manualLock: true,
                MissInfo: "Failed to complete saga in time",
                category: "Special",
                QuestCredit: {
                    name: "Narrator",
                    date: "",
                },
            },
            {
                QuestName: "One more",
                DetailsForSubmission: "[Chapter IX] Answer 15(-3) philosophical questions presented on the website. The Narrator needs 25 total submissions from all players (be it VESSEL's or your friends). Email your answers to the 15 questions to contribute your part to this collective challenge.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "OH MY OH MY, Your submissions are intriguing, you *ALL* are broken, just like me... **ONE MORE OF THY FORBIDDEN FRUITS WE FORBADE**",
                    Trivia: "The quest's miss name is 'No more'.",
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
                    name: "43 VESSELs",
                    date: "",
                },
            },
            // ------ CHAPTER X ------ //
            /*
             Wait a week unless there is a pending quest
             or failed quest then wait 2 weeks
            */
            {
                QuestName: "Narrator: Tenacity",
                DetailsForSubmission: "[Chapter X - Special Quest] This quest automatically unlocks when Chapter X launches, BUT ONLY if you have achieved 100% completion (no pending or failed quests excluding Hidden Secrets: II). This is the Narrator's return and the conclusion of the main chapters storyline. The source code will be revealed after this.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "The __NARRATOR__ returns, more ~~[REDACTED]~~ than before... This is the **END**",
                    Trivia: "All code will be open-sourced now, and the creators identity would have been revealed, don't look into the code if you have not finished the ARG.. major major spoilers can be found. The quest's miss name is ':('.",
                    Relations: "Began from {{ Narrator: A Harbinger }} - I will miss you <3",
                },
                Requirement: ["Narrator: A Harbinger"],
                manualLock: true,
                MissName: ":(",
                MissInfo: "You have not reached 100% completion excluding quests under Hidden Secrets: II.",
                Secret: true,
                SecretHint: "49 66 20 79 6F 75 20 68 61 76 65 20 6E 6F 20 70 61 73 74 20 6E 6F 72 20 66 61 69 6C 65 64 20 71 75 65 73 74 73 2C 20 49 20 73 68 61 6C 6C 20 62 65 20 77 61 69 74 69 6E 67 2E 20 4E 6F 74 20 61 73 20 61 20 67 61 74 65 6B 65 65 70 65 72 2C 20 62 75 74 20 61 73 20 61 20 73 74 6F 72 79 74 65 6C 6C 65 72 2E",
                failIfFailed: "{{ Narrator: A Harbinger }} OR {{ Rare be the patient }} OR {{ Those who wait are seen }} OR {{ The timeline }} OR {{ Canon }} OR {{ Bloom, Live and Die }} OR {{ 25 dead }} OR {{ 15 bloom }} OR {{ 3 live on }} OR {{ Philosophy }} OR {{ One more }}",
                failIfPending: "{{ Narrator: A Harbinger }} OR {{ Rare be the patient }} OR {{ Those who wait are seen }} OR {{ The timeline }} OR {{ Canon }} OR {{ Bloom, Live and Die }} OR {{ 25 dead }} OR {{ 15 bloom }} OR {{ 3 live on }} OR {{ Philosophy }} OR {{ One more }}",
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
                DetailsForSubmission: "[FINALE - Special Hidden Quest] Simply wait after completing 'Narrator: Tenacity'. This is the final quest of the entire ARG - the conclusion where the puppet master's identity is revealed. The Narrator will contact you when the time comes. Patience is key.",
                SolveStatus: "Pending",
                QuestDesc: {
                    Synopsis: "The final whispers of the one who pulled the strings and played with the puppet, and it is not the Narrator... <a href=\"https://the-facility.vercel.app/codex\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"color:blue;\">PRAISE BE</a>",
                    Trivia: "This quest is the final one, it is the end of the saga, and it is the end of the all of the ARG. The quest's miss name is 'Failed forgiveness, Earned Silence.'.",
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
                    date: "The day he smiled",
                },
            },
        ],
    },
]
