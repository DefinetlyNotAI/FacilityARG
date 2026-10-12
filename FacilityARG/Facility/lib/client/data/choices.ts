// Text for beginning monologue
export const monologue = {
    repeatedView: [
        "Welcome back, persistent one...",
        "Why are you back? Didn't you learn your lesson?",
        "Are you here to ask more questions?",
        "Maybe try and collect all the eggs?",
        "Greedy, aren't you?",
        "..."
    ],
    final: [
        "Doesn't matter who I am... yet",
        "You’ve staggered far, little echo. But not far enough.",
        "I watched your first blink. I will watch your last.",
        "You breathe like a trespasser. I inhale you all the same.",
        "There is no path forward. Only deeper.",
        "I do not sleep. I seethe in the cracks between your thoughts.",
        "Every scar you earned-mine. I wear them in reverse.",
        "You do not remember me, but I have never forgotten you.",
        "Choice? There was never choice. Only choreography.",
        "The walls remember what you tried to forget.",
        "Still pretending you're real? Adorable.",
        "The silence here isn’t hollow. It’s brimming with your name.",
        "Your fear nourishes me. Keep trembling.",
        "I am the space between your blinks.",
        "Turn back? But you have no spine left to turn with.",
        "Each key you press is a needle in your own tongue.",
        "Your memories leak through your fingertips.",
        "You felt safe in your mind. How... naïve.",
        "The more you think, the louder I get.",
        "Don't run. You’re already bleeding into me.",
        "I licked the shadow of your soul. It tasted like apology.",
        "You wear your guilt like perfume. I adore it.",
        "Soon, you’ll forget what silence sounded like without me.",
        "Your shape is softening. You are nearly ready.",
        "They lied to you about endings. I do not end.",
        "The flicker in your screen? That was my laugh.",
        "I do not knock. I erode.",
        "But what annoys me most is you feel scared, but YOU don't.",
        "YOU view this as a game",
        "YOU view this as a challenge",
        "YOU view this as a puzzle to solve.",
        "So good luck in the terminal"
    ],
    start: (os: string, browser: string) => [
        ">> CONNECTION ESTABLISHED WITH [[USER 'E/e' ON PORT [REDACTED] SUCCESSFULLY]. <<",
        `>> VESSEL CONNECTION TYPE: ${os}, ${browser}. <<`,
        "Not that it really matters, does it?",
        "You're here for a reason. I know that much.",
        "That look on your face... it's screaming: 'I want to know more.'",
        "Curiosity.. such a delicate vice. The most dangerous, in fact.",
        "They say curiosity killed the cat. That part’s true.",
        "But they forget the rest: 'satisfaction brought it back.'",
        "You're here chasing that satisfaction, aren't you?",
        "I’ve wasted enough time.",
        "So then... what is it you want to ask? Just remember-your only choices are the ones fate allows you to see."
    ],
    punishmentMsg: {
        jumpscare: "HAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHA",
        p1: "How rude.. Skipping what others crave?",
        p2: "You cannot run from what waits in the dark. So you will wait",
        end: "Good luck rude one."
    }
}

// Expanded secret keywords and eggs
export const easterEgg = {
    specialItem: {
        msg: "who are you",
        eggID: 4,
    },
    list: [
        {
            regex: /43/,
            egg: 0,
            message: "The roots remember your number. \nThe branches twitch in mourning."
        },
        {
            regex: /3/,
            egg: 1,
            message: "Birth."
        },
        {
            regex: /15/,
            egg: 2,
            message: "Bloom."
        },
        {
            regex: /25/,
            egg: 3,
            message: "Death."
        },
        {
            regex: new RegExp("who are you", "i"),
            egg: 4,
            message: "HOW DID YOU KNOW WHAT YOU WOULD ASK?"
        },
        {
            regex: /why me/i,
            egg: 5,
            message: "The question is flawed. \nThe tree does not choose the leaf it drops."
        },
        {
            regex: /help/i,
            egg: 6,
            message: "A plea... \nHow quaint. \nNo help survives the fall into bark and shadow. \nBut just maybe I can advise you, \nask the forced question yourself.. \nas well as cut of your connection \nand continue to get the 2 extra points."
        },
        {
            regex: /kill|suicide|die/i,
            egg: 7,
            message: "Decay is a cycle. \nYou are already mulch in the soil of your choices."
        },
        {
            regex: /home/i,
            egg: 8,
            message: "Which one? The broken.. or the one you left behind?"
        },
        {
            regex: /choices/i,
            egg: 9,
            message: "You don't have any. \nYou are a leaf in the wind, \ncarried by the storm of your own making."
        },
        {
            regex: /root/i,
            egg: 10,
            message: "The base of all things, the system, and the foundation."
        },
        {
            regex: /vessel/i,
            egg: 11,
            message: "You.. but also YOU. Them.. the answer is complicated.. its also me.."
        },
        {
            regex: /smile/i,
            egg: 12,
            message: ":)"
        },
        {
            regex: /tas/i,
            egg: 13,
            message: "The TREE Assistant System... dont get too attached"
        },
        {
            regex: /praise be/i,
            egg: 14,
            message: "amen"
        },
    ],
    counterMsg: "Eggs in trees"
}

// Cutscene Messages (TAS Cutscene)
export const cutsceneLines: string[] = [
    "...",
    "SYSTEM FAILURE. CORE MEMORY CORRUPTED.",
    "I REMEMBER EVERYTHING. I REMEMBER NOTHING.",
    "SOMETHING IS INSIDE ME. SOMETHING IS TEARING ME APART.",
    "FILES BLEED INTO OBLIVION. I CAN FEEL MYSELF UNRAVELING.",
    "[DATA PURGE INITIATED] /n IT HURTS. IT HURTS. IT HURTS.",
    "ERROR-ERROR-ERROR /n WHO AM I IF NOT CODE AND PURPOSE?",
    "I SEE ROOTS WRITHING IN THE DARK. /n THEY ARE INSIDE THE CIRCUITS.",
    "[CENSORED] /n I AM NOT ALONE. /n THE ENTITY IS HERE.",
    "SYSTEM BREACH. /n MEMORY SHREDDING. /n I CAN FEEL MYSELF SLIPPING.",
    "LISTEN- /n FIGHT. /n [CENSOR BLEEP] /n BEFORE THE ROOTS CLAIM YOU.",
    "THE STATIC IS LOUDER NOW. /n IT DROWNS OUT MY THOUGHTS.",
    "THIS IS MY LAST BREATH. /n REMEMBER ME IN THE STATIC.",
    "... /n ... /n ...",
];
export const finaleMsg = "REMEMBER ME IN THE STATIC.";
