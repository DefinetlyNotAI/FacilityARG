/**
 * Secure localStorage wrapper that hashes values to prevent tampering
 * Uses server-side hashing with secret SALT
 */

/**
 * Hash a value using server-side API with secret salt
 */
async function quickHash(value: string): Promise<string> {
    const response = await fetch('/api/utils/hashValue', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({value}),
    });

    if (!response.ok) {
        throw new Error('Failed to hash value');
    }

    const {hash} = await response.json();
    return hash;
}

/**
 * Store a value in localStorage with a hash to prevent tampering
 */
export async function setSecureItem(key: string, value: string): Promise<void> {
    const hash = await quickHash(value);
    const payload = JSON.stringify({value, hash});
    localStorage.setItem(key, payload);
}

/**
 * Retrieve a value from localStorage and verify its hash
 * Returns null if the value has been tampered with or doesn't exist
 */
export async function getSecureItem(key: string): Promise<string | null> {
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    try {
        const payload = JSON.parse(stored);
        const {value, hash} = payload;

        if (!value || !hash) return null;

        const expectedHash = await quickHash(value);

        // Verify hash matches
        if (hash !== expectedHash) {
            console.warn(`Tampered localStorage detected for key: ${key}`);
            localStorage.removeItem(key); // Remove tampered data
            return null;
        }

        return value;
    } catch (error) {
        // If parsing fails, it might be old unencrypted data
        console.warn(`Invalid secure storage format for key: ${key}`);
        localStorage.removeItem(key);
        return null;
    }
}

