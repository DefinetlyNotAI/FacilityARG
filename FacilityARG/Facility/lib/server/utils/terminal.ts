// Server-only utilities for terminal validation
import {fakeEmail, keywords} from "@/lib/server/data/terminal";
import {KeywordKey} from "@/types/terminal";

function normalize(input?: unknown) {
    if (typeof input !== 'string') return '';
    // Trim whitespace and normalize to lowercase
    // Note: This preserves special Unicode characters like █
    return input.trim().toLowerCase();
}


/**
 * Validates if the provided keyword matches any of the valid keywords
 * @param provided - The keyword to validate
 * @returns The KeywordKey if valid, null otherwise
 */
export function validateTerminalKeyword(provided: string): KeywordKey | null {
    const normalizedProvided = normalize(provided);

    for (const [key, word] of Object.entries(keywords)) {
        if (normalize(word) === normalizedProvided) {
            return Number(key) as KeywordKey;
        }
    }

    return null;
}

/**
 * Validates if the provided email matches the expected email
 * @param provided - The email to validate
 * @returns true if valid, false otherwise
 */
export function validateTerminalEmail(provided: string): boolean {
    // Trim and compare case-insensitively (preserves special Unicode chars like █)
    const normalizedProvided = provided.trim().toLowerCase();
    const normalizedExpected = fakeEmail.trim().toLowerCase();

    return normalizedProvided === normalizedExpected;
}

/**
 * Checks if a keyword has already been guessed
 * @param keywordKey - The keyword key to check
 * @param guessedKeywords - Array of already guessed keyword keys
 * @returns true if already guessed, false otherwise
 */
export function isKeywordAlreadyGuessed(
    keywordKey: KeywordKey,
    guessedKeywords: KeywordKey[]
): boolean {
    return guessedKeywords.includes(keywordKey);
}

/**
 * Gets the keyword text by key (for server responses)
 * @param keywordKey - The keyword key
 * @returns The keyword string
 */
export function getKeywordByKey(keywordKey: KeywordKey): string {
    return keywords[keywordKey] || '';
}

