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