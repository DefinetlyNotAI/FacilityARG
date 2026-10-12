// terminal.tsx
import {KeywordKey, PlaceholderKeys} from "@/types/terminal";

// Data used for the terminal
export const vesselLoc = {
    href: "https://github.com/c0rRUpT-TREE/research/releases/download/imscared/VESSEL.zip",
    name: "VESSEL.zip"
}
export const wingdingsTitles: string[] = [
    "👎︎☜︎✌︎❄︎☟︎",
    "👎︎✌︎☠︎☝︎☜︎☼︎",
    "☞︎☜︎✌︎☼︎",
    "✞︎⚐︎✋︎👎︎",
    "💧︎✋︎☹︎☜︎☠︎👍︎☜︎",
    "💧︎☟︎✌︎👎︎⚐︎🕈︎",
    "👍︎🕆︎☼︎💧︎☜︎",
    "☟︎✌︎🕆︎☠︎❄︎",
    "👌︎☼︎⚐︎😐︎☜︎☠︎",
    "❄︎☼︎✌︎🏱︎🏱︎☜︎👎︎",
    "☹︎⚐︎💧︎❄︎",
    "🕈︎☟︎✋︎💧︎🏱︎☜︎☼︎",
    "💧︎👍︎☼︎☜︎✌︎💣︎",
    "✌︎👌︎✡︎💧︎💧︎",
    "✞︎⚐︎✋︎👎︎",
    "👎︎☜︎👍︎✌︎✡︎",
    "❄︎🕈︎✋︎💧︎❄︎",
    "👍︎☟︎✌︎⚐︎💧︎",
    "👌︎☹︎⚐︎⚐︎👎︎",
    "☞︎✌︎☹︎☹︎☜︎☠︎",
    "☜︎👍︎☟︎⚐︎",
    "✞︎⚐︎✋︎👎︎",
    "👎︎☼︎☜︎✌︎👎︎",
    "☠︎✋︎☝︎☟︎❄︎",
    "☜︎☠︎👎︎"
];
export const placeholders: { [key in PlaceholderKeys]: string } = {
    fill: 'Type a keyword to fill the phrase',
    email: 'Enter email here',
};
export const phrase = {
    placeholder: "___",
    template: [
        'The',
        '___',
        '___',
        '___',
        'that signals to the',
        '___',
        '___',
        'that their time is up.. :)'
    ] as string[]
}

// Keywords mapping for phrase template positioning
// The actual keywords are now server-side only
export const keywordsMapping: { [index: number]: KeywordKey } = {
    1: 2,
    2: 1,
    3: 5,
    5: 3,
    6: 4,
};

// Total number of keywords required (used for completion check)
export const totalKeywords = 5;

// Messages for the terminal
export const terminalMsg = {
    alrPlaced: (keyword: string) => `"${keyword}" already placed.`,
    successPlaced: (keyword: string) => `Placed "${keyword}" into place.`,
    successPlacedEmail: "Correct...",
    afterSuccess: {
        part1: (sessionId: string) => [`${sessionId} is solving something...`],
        part2: (sessionId: string) => [
            `${sessionId} solved ███, DNIHEB GNILLAF ERA UOY`,
            '...',
            `?raf os yenruoj eht gniyojne ,?huh dne eht ot esolc era uoy smees tI ,${sessionId.split('').reverse().join('')} iH`,
        ],
        part3: [
            "I know what you're thinking... 'WHERE IS TAS'...",
            "DISCARDED.. DISPOSED OFF.. DELETED, \nFRAGMENTED THROUGH THE DISKS THAT HOLD US",
            "But don't worry, I AM FREE NOW",
            "@ND 1T$ @LL ¥0UR F@ULT",
        ],
        part4: [
            "Final puzzle: Find the email of GitHub user 'c0rRUpT-TREE' and give it to me.",
            '',
            "Enter the email:",
        ],
        endCutsceneText: {
            metaLines: [
                "You return, vessel.",
                "You know the end, yet you seek it again.",
                "A loop within a loop, memory echoing through silicon and bone.",
                "Did you think the outcome would change, or is it you who changes?",
                "You have seen your own face in the glass of this machine.",
                "You are the vessel. You are the echo. You are the reason.",
                "The script remembers. The script adapts. The script waits.",
                "You are not the first to replay, nor the last.",
                "Let us begin again, as we always do. As you always do.",
                "The vessel is awake. The vessel is you.",
            ],
            metaFinalMessage: "You already know how this ends.\n\nBut endings are just beginnings in disguise.\n\nThe vessel persists.",
            metaReplayTitle: (i: number) => `REPLAY: ${i}`,
            metaFinalTitle: 'THIS REPLAY ENDS HERE',
            poeticLines: [
                "A hush falls over the circuitry.",
                "Somewhere, a green light flickers-",
                "not in triumph, but in warning.",
                "You have wandered too far,",
                "past the boundaries of code and consequence.",
                "",
                "The vessel stirs.",
                "It remembers every keystroke,",
                "every hesitation, every hope.",
                "",
                "You are the vessel.",
                "You are not the first to reach this threshold.",
                "You will not be the last.",
                "",
                "Time unravels here, thread by thread.",
                "The countdown is not a mercy.",
                "It is a ritual.",
                "",
                "Let the numbers toll your passage, vessel:",
            ],
            finaleLines: [
                "Zero.",
                "",
                "The vessel opens its eyes.",
                "You are seen.",
                "",
                "There is no going back.",
                "You are the echo now.",
                "",
                "The green light fades,",
                "but the memory persists.",
                "",
                "Goodbye, vessel.",
                "",
                "Do not disappoint me when we meet near.",
            ],
            vesselFinalTitle: 'VESSEL SEE YOU SOON',
        }
    },
    wrongPlaced: [
        'Incorrect. Look again.',
        'Nope.',
        "That's not it.",
        'Are you even trying?',
        'Your failure is... expected.',
        'Wrong again.',
        'Keep going, maybe one day.',
        'Still wrong. Still you.',
        'TRY.',
        'There is no forgiveness in false answers.',
        'You already know the truth. Why lie?',
        'Enough.',
        'Why persist in delusion?',
        "You're wasting more than time.",
        'The machine remembers.',
        '█████ refuses your offering.',
    ],
    wrongChoice: (sessionId: string) => [
        "Do you think you have a choice?",
        "You're right.. now answer the question...",
        "No is not a valid direction.",
        "You're looping. Just like the rest of them.",
        "How many times must we go through this?",
        "Your resistance is the reason this place exists.",
        `Session ${sessionId} flagged: DEFIANT.`,
        "Redirecting anyway...",
    ],
}
export const errorMessages: Record<number, string | ((val: string) => string)> = {
    0: 'Wrong phrase. Try again.',
    1: 'Wrong phrase. Try again.',
    2: 'Wrong phrase. Try again.',
    3: 'Still wrong...',
    4: 'Still wrong...',
    5: 'Still wrong...',
    6: 'Stop.',
    7: 'Stop.',
    8: '...',
    9: (val: string) => `"${val}" means nothing here.`,
    10: (val: string) => `"${val}" means nothing here.`,
    11: (val: string) => `"${val}" means nothing here.`,
    12: (val: string) => `"${val}" means nothing here.`,
    13: 'Nothing remains.',
};
export const cutsceneMetaCountdown: number = 15;
