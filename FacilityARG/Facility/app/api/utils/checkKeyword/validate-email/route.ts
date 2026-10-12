import {NextResponse} from 'next/server';
import {validateTerminalEmail} from '@/lib/server/utils/terminal';
import {genericErrors} from '@/lib/server/data/api';

/**
 * POST handler for validating the terminal email.
 * Verifies user input against the expected email without exposing it to the client.
 */
export async function POST(req: Request) {
    try {
        // Parse JSON body from the request
        const body = await req.json();

        // Normalize and validate required fields
        const provided = String(body.provided || '');

        // Reject malformed or missing input early
        if (!provided) {
            return NextResponse.json(
                {ok: false, message: genericErrors.missingData},
                {status: 400}
            );
        }

        // Validate the provided email
        const isValid = validateTerminalEmail(provided);

        // Return validation result without exposing the actual email
        return NextResponse.json(
            {ok: isValid, message: isValid ? 'Correct' : 'Incorrect email'},
            {status: 200}
        );
    } catch (e) {
        console.error('Terminal email validation error:', e);
        // Any unexpected failure is treated as a server error
        return NextResponse.json(
            {ok: false, message: genericErrors.internalServerError},
            {status: 500}
        );
    }
}

export async function GET() {
    // Block GET requests
    return NextResponse.json({error: genericErrors.invalidMethod}, {status: 405});
}

