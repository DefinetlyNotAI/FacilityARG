import {NextResponse} from 'next/server';
import {getKeywordByKey, isKeywordAlreadyGuessed, validateTerminalKeyword} from '@/lib/server/utils/terminal';
import {KeywordKey} from '@/types/terminal';
import {genericErrors} from '@/lib/server/data/api';

/**
 * POST handler for validating a terminal keyword.
 * Verifies user input against the expected keywords without exposing them to the client.
 */
export async function POST(req: Request) {
    try {
        // Parse JSON body from the request
        const body = await req.json();

        // Normalize and validate required fields
        const provided = String(body.provided || '');
        const guessedKeywords: KeywordKey[] = Array.isArray(body.guessedKeywords)
            ? body.guessedKeywords
            : [];

        // Reject malformed or missing input early
        if (!provided) {
            return NextResponse.json(
                {ok: false, message: genericErrors.missingData},
                {status: 400}
            );
        }

        // Validate the provided keyword
        const keywordKey = validateTerminalKeyword(provided);

        // Incorrect keywords do not error, they simply fail validation
        if (keywordKey === null) {
            return NextResponse.json(
                {ok: false, message: 'Incorrect keyword'},
                {status: 200}
            );
        }

        // Check if the keyword has already been guessed
        const alreadyGuessed = isKeywordAlreadyGuessed(keywordKey, guessedKeywords);

        if (alreadyGuessed) {
            return NextResponse.json(
                {
                    ok: true,
                    alreadyGuessed: true,
                    keywordKey,
                    keyword: getKeywordByKey(keywordKey)
                },
                {status: 200}
            );
        }

        // Success: return the keyword key and the keyword itself
        return NextResponse.json(
            {
                ok: true,
                alreadyGuessed: false,
                keywordKey,
                keyword: getKeywordByKey(keywordKey)
            },
            {status: 200}
        );
    } catch (e) {
        console.error('Terminal keyword validation error:', e);
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

