import {Questline} from "@/lib/types";

export const Fight: Questline[] = [
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
]
