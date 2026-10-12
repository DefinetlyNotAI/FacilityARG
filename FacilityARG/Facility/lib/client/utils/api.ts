import Cookies from "js-cookie";
import {AddMeResponse, BonusAct, BonusResponse, CheckMeResponse} from "@/types";
import {routes} from "@/lib/saveData";
import {fetchUserIP, isValidIP} from "@/lib/client/utils/net";
import {genericErrors} from "@/lib/server/data/api";

/**
 * Provides CRUD utilities for interacting with /api/banned endpoints.
 * Handles IP validation, CSRF token extraction, and standard API fetch logic.
 * Returns normalized JSON data or throws typed errors for clarity.
 */
// Internal helper for CSRF token retrieval.
function getCsrfToken(): string {
    const token = Cookies.get("csrf-token") || Cookies.get("csrfToken");
    if (!token) throw new Error("CSRF token missing");
    return token;
}

export const bannedApi = {
    /**
     * Returns all banned IPs.
     * Fetches from `/api/banned/all` and normalizes the response to string[].
     */
    async getAll(): Promise<string[]> {
        const res = await fetch(routes.api.banned.all, {credentials: "include"});
        if (!res.ok) throw new Error(`Failed to fetch banned list (${res.status})`);
        const json = await res.json();
        if (Array.isArray(json)) return json;
        if (json.ips) return json.ips;
        if (json.list) return json.list;
        if (json.items) return json.items;
        return Object.keys(json);
    },

    /**
     * Checks if a given IP (or the current user IP) is banned.
     * Returns the structured API response { success, banned, ... }.
     */
    async checkMe(ip?: string): Promise<CheckMeResponse> {
        const targetIp = ip ?? await fetchUserIP();
        if (!isValidIP(targetIp)) throw new Error("Invalid IP provided to checkMe");
        const res = await fetch(routes.api.banned.checkMe, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ip: targetIp}),
            credentials: "include"
        });
        if (!res.ok) throw new Error(`Failed to check IP (${res.status})`);
        return res.json();
    },

    /**
     * Adds an IP to the banned list.
     * Requires CSRF token and valid IP.
     * Returns server confirmation JSON.
     */
    async addMe(ip: string, reason?: string): Promise<AddMeResponse> {
        if (!isValidIP(ip)) throw new Error("Invalid IP provided");
        const csrf = getCsrfToken();
        const res = await fetch(routes.api.banned.addMe, {
            method: "POST",
            credentials: "include",
            headers: {"Content-Type": "application/json", "X-CSRF-Token": csrf},
            body: JSON.stringify({ip, reason})
        });
        if (!res.ok) throw new Error(`Failed to add banned IP (${res.status})`);
        return res.json();
    },

    /**
     * Removes an IP from the banned list (admin-only).
     * Requires CSRF token.
     * Returns { success, removed, error }.
     */
    async remove(ip: string): Promise<{ success: boolean; removed?: boolean; error?: string }> {
        if (!isValidIP(ip)) throw new Error("Invalid IP provided");
        const csrf = getCsrfToken();
        const res = await fetch(routes.api.banned.remove, {
            method: "POST",
            credentials: "include",
            headers: {"Content-Type": "application/json", "X-CSRF-Token": csrf},
            body: JSON.stringify({ip})
        });
        if (!res.ok) throw new Error(`Failed to remove banned IP (${res.status})`);
        return res.json();
    },

    /**
     * Returns only the count of banned IPs as a number.
     */
    async count(): Promise<number> {
        const res = await fetch(routes.api.banned.count, {credentials: "include"});
        if (!res.ok) throw new Error(`Failed to fetch banned count (${res.status})`);
        const json = await res.json();
        return json.count ?? (Array.isArray(json) ? json.length : 0);
    }
};

/**
 * Interacts with /api/bonus (acts and chapters).
 * Handles CSRF token, and provides high-level CRUD functions for admin.
 * Returns JSON responses matching BonusResponse shape.
 */
export const bonusApi = {
    /**
     * Toggles an act's state. Admin-only endpoint.
     * Returns the updated BonusResponse object.
     */
    async changeToOpp(act: BonusAct): Promise<BonusResponse> {
        const csrf = (await import("js-cookie")).default.get("csrf-token") ?? "";
        const headers: Record<string, string> = {"Content-Type": "application/json"};
        if (csrf) headers["X-CSRF-Token"] = csrf;

        const res = await fetch(routes.api.chapters.changeToNextState, {
            method: "POST",
            credentials: "include",
            headers,
            body: JSON.stringify({act})
        });
        if (!res.ok) throw new Error(genericErrors.HTTPFail("bonus.changeToOpp"));
        return res.json();
    },

    /**
     * Fetches all acts for the bonus system.
     */
    async getAll(): Promise<BonusResponse> {
        const res = await fetch(routes.api.chapters.getAll, {credentials: "include"});
        if (!res.ok) throw new Error(genericErrors.HTTPFail("bonus.getAll"));
        return res.json();
    },

    /**
     * Fetches one act using its Roman numeral identifier.
     */
    async getOne(roman: string): Promise<BonusResponse> {
        const act = `Act_${roman.toUpperCase()}` as BonusAct;
        const url = new URL(routes.api.chapters.getOne, window.location.origin);
        url.searchParams.append("act", act);
        const res = await fetch(url.toString(), {credentials: "include"});
        if (!res.ok) throw new Error(genericErrors.HTTPFail("bonus.getOne"));
        return res.json();
    }
};

/**
 * Securely verifies whether a provided keyword is correct for a specific puzzle or act.
 * Sends keyword and number to the server-side API endpoint, which validates it internally.
 * Returns true if the keyword matches, false otherwise.
 */
export const checkKeyword = async (keyword: string, number: number): Promise<boolean> => {
    const res = await fetch(routes.api.utils.checkKeyword._, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({keyword, number})
    });
    const data = await res.json();
    return !!data.match;
};

/**
 * Handles cookie signing through server-side API.
 * Takes raw cookie data, posts to /api/utils/signCookie.
 * Returns { success, error? } to signal signing result.
 */
export async function signCookie(data: string): Promise<{ success: boolean; error?: string }> {
    try {
        const res = await fetch(routes.api.utils.signCookie, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({data})
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return {success: false, error: err.error || genericErrors.cookieSignFailed};
        }
        return {success: true};
    } catch (e) {
        return {success: false, error: (e as Error).message};
    }
}
