// Server-only chapter IV secrets and validation helpers
import {PlaqueId} from "@/types";

export const PUZZLES: Record<PlaqueId, string> = {
    TAS: "your own reflection in the clock's glass",
    Entity: "the void where names dissolve",
    TREE: "looped time bearing false tree fruit",
};

export const TASAnswers = [
    'entropy',        // Stage 0
    '00111',          // Stage 1 - Switches
    'consensus',      // Stage 2 - Assembly
    '53633',          // Stage 3 - Signal/Numpad
    'consensus',      // Stage 4 - Grid bits / Word of day
    '',               // Stage 5 - Unused
    'consensus',      // Stage 6 - Merge
]