// Shared puzzle utilities: deterministic PRNG and helpers
// Keep pure, deterministic and client-side only.
import {ContainerClassArgs, FragmentsMap, FsNode} from "@/types";
import {cookies} from "@/lib/saveData";

export function seedFromString(str: string) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619) >>> 0;
    return h;
}

function mulberry32(a: number) {
    return function () {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}

export function seededShuffle<T>(arr: T[], seedStr: string) {
    const seed = seedFromString(seedStr || '');
    const rnd = mulberry32(seed);
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1));
        const tmp = copy[i];
        copy[i] = copy[j];
        copy[j] = tmp;
    }
    return copy;
}

// Chapter IV client-side JSON cookie utilities (only used in Entity and WhiteRoom)
export function getJsonCookie(name: string): any | null {
    try {
        const match = document.cookie.split(';').map(s => s.trim()).find(c => c.startsWith(name + '='));
        if (!match) return null;
        return JSON.parse(decodeURIComponent(match.split('=')[1] || ''));
    } catch (e) {
        return null;
    }
}

export function setJsonCookie(name: string, obj: any, days = 365) {
    try {
        const v = encodeURIComponent(JSON.stringify(obj));
        const d = new Date();
        d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${v}; path=/; expires=${d.toUTCString()}; SameSite=Lax`;
    } catch (e) {
    }
}

export function markCompleted(currentStage: 'Entity' | 'TAS') {
    try {
        const cur = getJsonCookie(cookies.chIV_progress) || {};
        cur[currentStage] = Math.max(Number(cur[currentStage] || 0), 2);
        setJsonCookie(cookies.chIV_progress, cur, 365);
    } catch (e) {
    }
}

// == Entity puzzle utils ==

// compute fake sha256 hex from input
export async function computeFakeHash(s: string) {
    try {
        if (typeof window !== 'undefined' && (window.crypto as any)?.subtle) {
            const enc = new TextEncoder();
            const buf: ArrayBuffer = (await window.crypto.subtle.digest('SHA-256', enc.encode(s)));
            return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
        }
    } catch (e) {
    }
    // fallback
    let h = 0;
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i);
    return (h >>> 0).toString(16).padStart(64, '0');
}

// traverse fs tree by path
export function getFsNode(root: FsNode | null, path: string): FsNode | null {
    if (!root) return null;
    const parts = path.split('/').filter(Boolean);
    let cur: FsNode = root;
    for (const p of parts) {
        const next = (cur.dirs || []).find((d: FsNode) => d.name === p);
        if (!next) return null;
        cur = next;
    }
    return cur;
}

// check if a file exists in the filesystem
export function fileExists(root: FsNode | null, path: string): boolean {
    if (!root) return false;

    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return false;

    const filename = parts[parts.length - 1];
    const dirPath = parts.slice(0, -1).join('/');

    const dirNode: FsNode | null = dirPath ? getFsNode(root, '/' + dirPath) : root;
    if (!dirNode) return false;

    return (dirNode.files || []).includes(filename);
}

// UI render
export const getContainerClasses = ({
                                        styles, glitchActive, fragmentsCollected
                                    }: ContainerClassArgs): string => {
    const classes: string[] = [styles.container];

    if (glitchActive) classes.push(styles.glitchActive);
    if (fragmentsCollected >= 3) classes.push(styles.corruption3);
    if (fragmentsCollected >= 5) classes.push(styles.corruption5);
    if (fragmentsCollected >= 7) classes.push(styles.corruption7);

    return classes.join(' ');
};

// Serializer and Deserializer function for useLocalStorageState hook
export const serializeFragments = (value: FragmentsMap) => JSON.stringify({fragments: value});
export const deserializeFragments = (raw: string): FragmentsMap => {
    try {
        const data = JSON.parse(raw);
        return data.fragments || {};
    } catch {
        return {};
    }
};

/**
 * Converts milliseconds into a human-readable time format.
 *
 * @param milliseconds - Time duration in milliseconds.
 * @returns Formatted string like 'Xd Xh Xm Xs'.
 */
export function formatTime(milliseconds: number) {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

/**
 * Checks a string against a hashed reference (calls server api).
 *
 * @param itemToCheck - Key identifying the hashed item.
 * @param stringToCheck - String to validate against hash.
 * @returns Object with success boolean and optional error message.
 */
export async function checkPass(itemToCheck: string, stringToCheck: string) {
    try {
        const res = await fetch('/api/utils/hashChecker', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({itemToCheck, stringToCheck})
        });
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            return {success: false, error: errData.error ?? "Server error"};
        }
        return await res.json();
    } catch {
        return {success: false, error: "Network error"};
    }
}
