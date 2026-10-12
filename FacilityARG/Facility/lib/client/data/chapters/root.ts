// All texts used in bonus chapters for errors or messages
export const bonusErrorText = {
    lockedBehindDoors: "You stumbled across a door, it seems it needs a key you don't have yet, you feel you need to complete your actual journey before attempting this...",
    notYetChild: "Is this by pure luck? Or is it impulse? Either way, not yet, too early, no light yet, the door is being constructed.. irrespective of your key.",
    noTimeLeft: {
        I_II: "It is too late..",
        VI_VIII: "Time is up... clocks have failed... it is saddening... even after my warning",
        VII: "IT IS NOT CANON",
        IX: "Asked of 25... I needed 25... I asked for 15... I needed 15... Skip 3... but no.. NO.. NONE WERE COMPLETED... 5 of life, 5 of death, 5 of time.. No RIGHT, NO WRONG, ONLY TRUTH... You sinners.."
    }
}

export const chapterMessages: Record<string, string> = {
    I: bonusErrorText.noTimeLeft.I_II,
    II: bonusErrorText.noTimeLeft.I_II,
    VI: bonusErrorText.noTimeLeft.VI_VIII,
    VIII: bonusErrorText.noTimeLeft.VI_VIII,
    VII: bonusErrorText.noTimeLeft.VII,
    IX: bonusErrorText.noTimeLeft.IX,
};

export const validRomansNoTimeLeft: string[] = ['i', 'ii', 'vi', 'vii', 'viii', 'ix'];

export const failQuestNames: string[] = [
    "Timeout",
    "Empty...",
    "Broken Me",
    "Broken You",
    "You’re not that special",
    "No time left",
    "Lost history",
    "All dead",
    "Deranged Nonsense",
    ":("
];

export const rootChapterText = {
    pageTitle: "unbirth • bonus chapters",
    pageSubtitle: "Will HE who sees all be satisfied?",
    unknownLabel: "???",
    loadingLabel: "...",
    failDefault: "Fail",
    actLabel: (roman: string): string => `Act ${roman.toUpperCase()}`.replace("_", " "),
};


// Other text that is shared between chapters
export const chapter = {
    // Used for all chapters while loading (I planned to have this be a expanded record, but eh)
    loading: "Loading...",
}
