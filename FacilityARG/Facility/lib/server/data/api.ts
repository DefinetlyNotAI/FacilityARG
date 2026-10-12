import {ItemKey} from "@/lib/saveData";

// Generic error messages used across various API endpoints
export const genericErrors = {
    // Specific authentication errors
    auth: {
        passReqErr: "Password is required but missing",
        incorrectPass: "Incorrect password provided",
    },
    // Invalid CSRF token error
    invalidCsrf: "Invalid/Non-existent CSRF token",
    // Invalid data format error (dynamic message)
    invalidFormat(dataType: string) {
        return `Invalid data format => ${dataType}`;
    },
    // Internal server error
    internalServerError: "Internal server error has occurred. Please try again later and report this issue!",
    // Invalid item or data provided (doesn't match allowed items)
    invalidItem: "Data provided does not match any known items that are allowed to be checked.",
    // Failed cookie signing (Generic)
    cookieSignFailed: "Failed to sign cookie",
    // Missing data in request body
    missingData: "Missing data in request body",
    // Method not allowed
    invalidMethod: "Method requested is not allowed",
    // Server configuration error
    serverConfigErr: "Server configuration error",
    // Failed to fetch from DB or external source
    failedToFetch: "Failed to fetch data from the database or external source",
    // Specific errors for /browser/ endpoints
    browser: {
        alreadyPressed: "Browser button is already pressed",
    },
    // Specific errors for /banned/ endpoints
    ip: {
        addError: "Failed to add IP information",
        delError: "Failed deleting IP from banned list",
    },
    // Specific errors for /chapters/ endpoints
    chapters: {
        toggleError: "Failed to toggle act",
    },
    // HTTP Fail for bonusApi
    HTTPFail: (from: string): string => `${from} failed HTTP`
}

// Known keyword hashes for validation [SHA-256 hashes]
export const knownKeywordHashes: string[] = [
    "6780ebaed4e668c7c00580830401a52bf7717d16b6998d7d3c598f611d7d5f2a",
    "2b390c28565e0b1df45413e4ac55d1286e62e1c4cd80f5ec896b3784e5cd5f74",
    "6a2be74b7b9aa1ce1015a934ec97e1cd9371870b8a8ba1e518abd74a9135fa44",
    "99d115eadab206cb7485d6a34d7154de88f450c221384afac0c159dfbbabf5f5",
    "f4f383ec8075df0c0c4a65c6234aa324aa2dd3d26b8709706a000caaff5323f3",
    "6d505cd17eebeb35154cb4d8b57b4daa9ad7afa8e7b6d5c2ce2db8801f44dd62",
]

// Special tip message for the Wi-Fi panel when incorrect tools are used
export const wifiPanelSpecialTipMessage = "USE WHAT TOOLS WERE IMPOSED ON YOU - [Include curl in the userAgent header]"

// Allowed acts for chapter toggling
export const allowedActs: string[] = [
    'Act_I', 'Act_II', 'Act_III', 'Act_IV', 'Act_V',
    'Act_VI', 'Act_VII', 'Act_VIII', 'Act_IX', 'Act_X'
];

// Secrets to be hashed and compared, only these specific items are allowed
// The record keys must match the ItemKey enum
export const secrets: Record<ItemKey, string> = {
    [ItemKey.portNum]: "15325",
    [ItemKey.ipAddress]: "192.168.42.177",
    [ItemKey.InternalCode]: '1033333013'
};
