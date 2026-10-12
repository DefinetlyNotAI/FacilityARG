// Description: TypeScript types for API responses related to bonus acts

// Allowed acts
export type BonusAct =
    | "Act_I"
    | "Act_II"
    | "Act_III"
    | "Act_IV"
    | "Act_V"
    | "Act_VI"
    | "Act_VII"
    | "Act_VIII"
    | "Act_IX"
    | "Act_X";

// Possible states for each act
export enum ActionState {
    NotReleased = "not_released",
    Released = "released",
    Failed = "failed",
    Succeeded = "succeeded",
}

// Each act maps to its current state
export type BonusResponse = Record<BonusAct, ActionState>;

// Allowed plaque statuses
export type AllowedPlaqueStatus = 'active' | 'succeeded' | 'failed'

// Types for banned endpoints
export type BannedEntry = {
    id: number;
    ip: string;
    reason: string | null;
    created_at: string;
};


export type CheckMeResponse = {
    banned: boolean;
    entry?: BannedEntry;
    error?: string;
};

export type AddMeResponse = {
    banned: true;
    entry: BannedEntry;
    error?: string;
};