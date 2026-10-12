import {NextResponse} from 'next/server';
import {makeSignedValue, validateKeyword} from '@/lib/server/utils/chapters';
import {cookies} from "@/lib/saveData";
import {PlaqueId} from "@/types";

/**
 * POST handler for validating a Chapter IV plaque phrase.
 * Verifies user input against the expected keyword and issues
 * a signed HttpOnly cookie to persist the unlocked plaque state.
 */
export async function POST(req: Request) {
    try {
        // Parse JSON body from the request
        const body = await req.json();

        // Normalize and validate required fields
        const plaqueId = String(body.plaqueId || '');
        const provided = String(body.provided || '');

        // Reject malformed or missing input early
        if (!plaqueId || !provided) {
            return NextResponse.json(
                {ok: false, message: 'Invalid input'},
                {status: 400}
            );
        }

        // Validate the provided phrase for the given plaque
        const ok = validateKeyword(plaqueId as PlaqueId, provided);

        // Incorrect phrases do not error, they simply fail validation
        if (!ok) {
            return NextResponse.json(
                {ok: false, message: 'Incorrect phrase'},
                {status: 200}
            );
        }

        // Construct signed cookie payload
        // unlocked: list of solved plaque IDs
        // t: timestamp for potential replay or expiry logic
        const payload = {
            unlocked: [plaqueId],
            t: Date.now()
        };

        // Sign the payload to prevent tampering
        const signed = makeSignedValue(payload);

        // Create success response
        const res = NextResponse.json({ok: true});

        // Attach HttpOnly authentication cookie
        res.cookies.set({
            name: cookies.chapIV_auth,
            value: signed,
            httpOnly: true,
            path: '/',
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24
        });

        return res;
    } catch (e) {
        // Any unexpected failure is treated as a server error
        return NextResponse.json(
            {ok: false, message: 'Server error'},
            {status: 500}
        );
    }
}
