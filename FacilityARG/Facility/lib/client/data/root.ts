import {routes} from "@/lib/saveData";
import {successQuestNames, validRomans} from "@/lib/client/data/chapters";

// Layout.tsx
export const tabTitles: Record<string, string> = {
    [routes.root]: "Hope you have fun",
    [routes.moonlight]: "A night so cold HE forgot to smile",
    [routes.smileking]: ":)",
    [routes.choices]: "So many choices.. None for you.",
    [routes.h0m3]: "HELP ME FIND HOME",
    [routes.theEnd]: "Thank you.. See you soon, may HE be with you, Praise Be",
    [routes.cheater]: "HYPOCRITE",
    [routes.smilekingAuth]: "Authorized Access Only - Smile King Terminal",
    [routes.notFound]: "The doors don't open just because you found them.",
    [routes.scroll]: "Scroll till the end, then turn around, to find your way out.",
    [routes.codex]: "Codex - Library of Ruin",
    [routes.bonus.notYet]: "A door being built",
    [routes.bonus.locked]: "A locked door",
    [routes.bonus.noTime]: "A broken down door, time the perpetrator",
    [routes.whiteroom]: "The Moonlight's room",
    [routes.clickMe]: "click",
    [routes.bonus.chapterIVSpecial.tas]: "TREE ASSISTANCE SYSTEM",
    [routes.bonus.chapterIVSpecial.entity]: "TR33.exe",
    [routes.bonus.chapterIVSpecial.tree]: "Grow little TREE",
    // Dynamically create act titles, these are the success quest names mapped to their roman numeral
    ...validRomans.reduce((acc, roman, index) => {
        acc[routes.bonus.actID(roman)] = successQuestNames[index];
        return acc;
    }, {} as Record<string, string>)
};
export const faviconLoc = "/favicon.ico";

// Page.tsx
export const text = {
    loading: {
        title: "FACILITY OS v3.15.25",
        subtitle: "Initializing secure connection..."
    },
    restrictedAccess: {
        header: "⚠️ RESTRICTED ACCESS TERMINAL ⚠️",
        subheader: "FACILITY 05-B • CLEARANCE LEVEL 5 REQUIRED",
        systemLines: [
            "This terminal requires elevated permissions",
            "Audio access, notifications, camera access, and media permissions needed as well as allowance to download files.",
            "Psychological evaluation protocols active"
        ],
        morality: `All audio tracks used are not my own, nor owned by me. Most audio's are royalty-free and inspired by a nice game.`
    },
    warnings: {
        title: "⚠️ CONTENT WARNINGS ⚠️",
        items: [
            "• Visual and audio disturbances",
            "• Possible flashing lights and rapid imagery",
            "• Content may be psychologically distressing",
            "• Immersive psychological horror experience with audio cues"
        ]
    },
    protocols: {
        title: "FACILITY PROTOCOLS",
        text: "By proceeding, you acknowledge understanding of all safety protocols and consent to psychological evaluation procedures. This experience is designed for mature audiences only. Quit now if you will play with no audio."
    },
    acceptBtn: "ACCEPT TERMS & ENTER FACILITY",
    consoleWarning: {
        header: "CRITICAL WARNING",
        lines: [
            {
                text: "Developer console access STRICTLY PROHIBITED " +
                    "- Unauthorized console usage may destroy the experience " +
                    "- [As in editing, you may still check it out for secrets, just do not type] ",
                class: "text-red-400"
            },
            {
                text: "Sources tab that includes the JS Bundle access is STRICTLY PROHIBITED " +
                    "- Do not even open it, as in by cheating, you are only affecting your own experience",
                class: "text-red-400"
            },
            {
                text: "DO NOT MANUALLY MODIFY COOKIES TO SKIP CERTAIN ASPECTS OF THE FACILITY - NOR SHOULD YOU DELETE COOKIES",
                class: "text-red-400"
            },
            {
                text: "Console usage only permitted when explicitly instructed by the system",
                class: "text-yellow-400"
            },
            {
                text: "THIS IS NOT FOR EPILEPTIC PEOPLE OR PEOPLE THAT ARE WEAK OF HEART",
                class: "text-yellow-400"
            },
            {
                text: "The Facility heavily relies on cookies for SAVE data. Please do not use incognito or delete the cookies or your progress may be reset",
                class: "text-yellow-400"
            },
            {
                text: "TAS is your friend. Use it if you are stuck, but don't rely on it too much",
                class: "text-green-700"
            },
            {
                text: "Use headphones, it is part of the experience, and you won't enjoy the experience without it",
                class: "text-green-700"
            }
        ],
        redirect: "Redirecting to secure terminal in",
        links: {
            discord: {
                href: "https://discord.gg/rVBFQCTV4F",
                label: "Join the Facility Discord - You can't do this without the others.."
            },
            questLog: {
                href: "https://the-facility-questlog.vercel.app",
                label: "VESSEL Quest Log - Hope you don't miss any.. PRAISE BE!"
            }
        }
    }
}
