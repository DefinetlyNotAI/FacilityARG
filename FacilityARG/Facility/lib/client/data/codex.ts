import {Chapter, CodexOverlay} from "@/types";

// Data for main codex page
export const codexTxt: Record<string, string> = {
    title: "The Codex",
    loading: "Loading chapter...",
    footerLine1: "The pattern continues.",
    footerLine2: "The Entity observes.",
    error: "ERROR: CHAPTER DATA CORRUPTED\n\n[UNABLE TO RETRIEVE CONTENT]\n[PATTERN INTERRUPTED]",
    curiosity: "Curiosity satisfied for now?",
};

// Codex Data for components
export const chapters: Chapter[] = [
    {id: 1, title: 'Chapter I', subtitle: 'Entity and the Eldritch', filename: 'Chapter_I_Entity_and_the_Eldritch.txt'},
    {id: 2, title: 'Chapter II', subtitle: 'TAS', filename: 'Chapter_II_TAS.txt'},
    {id: 3, title: 'Chapter III', subtitle: 'The VESSEL', filename: 'Chapter_III_The_VESSEL.txt'},
    {id: 4, title: 'Chapter IV', subtitle: 'The 5 Keywords', filename: 'Chapter_IV_The_5_Keywords.txt'},
    {id: 5, title: 'Chapter V', subtitle: 'Mechanics', filename: 'Chapter_V_Mechanics.txt'},
    {
        id: 6,
        title: 'Chapter VI',
        subtitle: 'Fate, Sacrifice, and Revelation',
        filename: 'Chapter_VI_Fate,_Sacrifice,_and_Revelation.txt'
    },
    {id: 7, title: 'Chapter VII', subtitle: 'The End and Ascension', filename: 'Chapter_VII_The_End_and_Ascension.txt'},
    {id: 8, title: 'Chapter VIII', subtitle: 'Apotheosis', filename: 'Chapter_VIII_Apotheosis.txt'},
];

export const overlays: CodexOverlay[] = [
    {
        id: 'warning-1',
        type: 'warning',
        title: 'WARNING',
        content: 'You are reading forbidden knowledge. The pattern recognizes you now.\n\nYou cannot unread what has been read.\nYou cannot unknow what has been known.',
        triggerLine: 10,
    },
    {
        id: 'glitch-1',
        type: 'glitch',
        title: '█████ TRANSMISSION DETECTED █████',
        content: '[SIGNAL SOURCE: UNKNOWN]\n[ENCRYPTION: NONE]\n[MESSAGE: "WE SEE YOU READING"]\n\n///CONNECTION TERMINATED///',
        triggerLine: 25,
        duration: 8000,
    },
    {
        id: 'revelation-1',
        type: 'revelation',
        title: 'CODEX NOTATION',
        content: 'The TR33 is not a tree. It is a structure.\nA pattern. A recursion.\n\nEvery branch leads back to the root.\nEvery root leads back to the Entity.\n\nYou are tracing the branches now.',
        triggerKeyword: 'TR33',
    },
];

// Keyword information for codex entries (used by the CodexReader component)
export const keywordInfo: Record<string, string> = {
    whispers: "The teeth of the dark - they echo truths unspoken. A fragment of your past.",
    fletchling: "A fragment of innocence; the last to fall. A fragment of your past.",
    dithed: "A word erased from history, yet remembered by the code. A fragment of your past.",
    nullskin: "That which wears nothing, and yet consumes all form. A fragment of your past.",
    echoes: "Residual signals left by HIM. A fragment of your past.",
    tr33: "Corrupted caretaker, was once a TREE",
    tas: "The Interface between the Vessel and the Eldritch.",
    entity: "Future YOU.",
    vessel: "Present YOU.",
    eldritch: "An ancient cosmic force, beyond comprehension. Only partially understood."
};
