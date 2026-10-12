import {NextResponse} from 'next/server';
import {makeSignedValue, validateStageAnswer, verifySignedValue} from '@/lib/server/utils/chapters';
import {cookies} from "@/lib/saveData";

/**
 * POST handler for validating a specific stage answer of a Chapter IV plaque.
 * On success, the plaque is added to the unlocked list stored in a signed
 * HttpOnly cookie, preserving any previously unlocked plaques.
 */
export async function POST(req: Request) {
    try {
        // Parse request body
        const body = await req.json();

        // Normalize inputs
        const plaqueId = String(body.plaqueId || '');
        const stageIndex = Number(body.stageIndex);
        const provided = String(body.provided || '');

        console.log('[validate-stage] Request:', {plaqueId, stageIndex, provided});

        // Reject invalid or missing input
        if (!plaqueId || isNaN(stageIndex) || !provided) {
            console.log('[validate-stage] Invalid input');
            return NextResponse.json(
                {ok: false, message: 'Invalid input'},
                {status: 400}
            );
        }

        // Validate the provided answer for the given plaque stage
        const ok = validateStageAnswer(
            stageIndex,
            provided
        );

        console.log('[validate-stage] Validation result:', ok);

        // Incorrect answers are handled as a normal failure, not an error
        if (!ok) {
            return NextResponse.json(
                {ok: false, message: 'Incorrect answer'},
                {status: 200}
            );
        }

        // Read existing authentication cookie, if present
        const raw = req.headers.get('cookie') || '';

        // Naive cookie extraction and verification
        // This route is server-only, so NextRequest cookies are not used
        const existing = (() => {
            try {
                const m = raw.match(
                    new RegExp(`${cookies.chapIV_auth}=([^;]+)`)
                );
                if (!m) return null;
                const val = decodeURIComponent(m[1]);
                return verifySignedValue(val);
            } catch {
                return null;
            }
        })();

        // Merge previously unlocked plaques with the newly solved one
        const prev = existing?.unlocked || [];
        const unlocked = Array.from(new Set([...prev, plaqueId]));

        // Create updated signed payload
        const payload = {
            unlocked,
            t: Date.now()
        };
        const signed = makeSignedValue(payload);

        // Return success response
        const res = NextResponse.json({ok: true});

        // Update HttpOnly auth cookie with extended unlock state
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
        // Any unexpected failure results in a server error
        console.error('[validate-stage] Error:', e);
        return NextResponse.json(
            {ok: false, message: 'Server error'},
            {status: 500}
        );
    }
}
