import {NextResponse} from 'next/server';
import {verifySignedValue} from '@/lib/server/utils/chapters';
import {cookies} from "@/lib/saveData";

/**
 * GET handler for retrieving Chapter IV plaque solve states.
 * Reads a signed cookie, verifies its integrity, and maps unlocked plaque IDs
 * to a standardized status response consumed by the frontend.
 */
export async function GET(req: Request) {
    try {
        // Read raw cookie header from the request
        const raw = req.headers.get('cookie') || '';

        // Extract the cookie value manually
        const m = raw.match(
            new RegExp(`${cookies.chapIV_auth}=([^;]+)`)
        );

        // If cookie is missing, return empty plaque state
        if (!m) {
            return NextResponse.json({plaqueStatuses: []});
        }

        // Decode the cookie value before verification
        const val = decodeURIComponent(m[1]);

        // Verify signature and integrity of the stored data
        const data = verifySignedValue(val);

        // If verification fails or data is invalid, return empty state
        if (!data) {
            return NextResponse.json({plaqueStatuses: []});
        }

        // Extract unlocked plaque IDs from verified payload
        const unlocked: string[] = data.unlocked || [];

        // Map unlocked IDs to solved plaque status objects
        const plaqueStatuses = unlocked.map(id => ({
            id,
            status: 'solved'
        }));

        // Return normalized plaque status list
        return NextResponse.json({plaqueStatuses});
    } catch (e) {
        // Fail closed. Any unexpected error returns no solved plaques.
        return NextResponse.json({plaqueStatuses: []});
    }
}
