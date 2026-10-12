/**
 * Fetches the public IP address of the current client using ipify API.
 *
 * @returns A string containing the IP address or 'UNKNOWN' if the fetch fails.
 *
 * Usage: Useful in logging, API validation, or banned IP checks.
 */
export async function fetchUserIP(): Promise<string> {
    try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        return data.ip;
    } catch {
        return 'UNKNOWN';
    }
}

/**
 * Validates if a given string is a plausible IPv4 or IPv6 address.
 *
 * @param ip - The value to validate.
 * @returns Boolean indicating whether the input is a valid IP.
 */
export function isValidIP(ip: unknown): ip is string {
    if (typeof ip !== 'string') return false;
    const ipv4 = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
    const maybeIpv6 = ip.includes(':');
    return ipv4.test(ip) || maybeIpv6;
}

/**
 * Detects the operating system and browser from a user-agent string.
 *
 * @param ua - User-agent string from navigator.userAgent.
 * @returns Object with 'os' and 'browser' properties.
 */
export function detectOsBrowser(ua: string) {
    let os = "Unknown OS";
    if (/windows/i.test(ua)) os = "Windows";
    else if (/mac/i.test(ua)) os = "MacOS";
    else if (/linux/i.test(ua)) os = "Linux";
    else if (/android/i.test(ua)) os = "Android";
    else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";

    let browser = "Unknown Browser";
    if (/chrome/i.test(ua)) browser = "Chrome";
    else if (/firefox/i.test(ua)) browser = "Firefox";
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
    else if (/edg/i.test(ua)) browser = "Edge";

    return {os, browser};
}
