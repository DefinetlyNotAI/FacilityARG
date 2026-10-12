// Storage Management for Chapter IV Puzzles
import {localStorageKeys} from '@/lib/saveData';

/**
 * Returns an existing session ID from localStorage or creates a new one.
 *
 * @returns A string session ID.
 *
 * Usage: Track a client session across pages without requiring login.
 */
export function getOrCreateSessionId() {
    let storedId = localStorage.getItem(localStorageKeys.sessionId);
    if (!storedId) {
        storedId = `SID-${Math.random().toString(36).slice(2, 9)}`;
        localStorage.setItem(localStorageKeys.sessionId, storedId);
    }
    return storedId;
}

/**
 * Returns a key-value map of all document cookies (client-side).
 *
 * @returns Object mapping cookie names to values.
 */
export function getCookiesMap(): Record<string, string> {
    return document.cookie.split(';').reduce((acc, cookie) => {
        const [rawKey, ...rest] = cookie.trim().split('=');
        const key = decodeURIComponent(rawKey);
        acc[key] = rest.join('=');
        return acc;
    }, {} as Record<string, string>);
}


/**
 * Generates a random filename string of given length.
 *
 * @param length
 */
export function getRandomFilename(length = 8) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
