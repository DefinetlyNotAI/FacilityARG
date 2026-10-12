import {NextRequest} from 'next/server';
import {genericErrors} from "@/lib/server/data/api";
import {createSecureResponse, dbPool} from '@/lib/server/utils';

export async function POST(req: NextRequest) {
    try {
        const csrfTokenFromCookie = req.cookies.get('csrf-token')?.value;
        const csrfTokenFromHeader = req.headers.get('x-csrf-token');
        const ignoreAlreadyPressed = req.headers.get('ignore-already-pressed') === 'true';

        if (!csrfTokenFromCookie || !csrfTokenFromHeader || csrfTokenFromCookie !== csrfTokenFromHeader) {
            return createSecureResponse({error: genericErrors.invalidCsrf}, 403);
        }

        const {browser} = await req.json();

        if (!browser) {
            return createSecureResponse({error: genericErrors.missingData}, 400);
        }

        const client = await dbPool.connect();

        // Check if already clicked
        const result = await client.query(
            'SELECT clicked FROM button_states WHERE browser = $1;',
            [browser]
        );

        if (result.rowCount === 0) {
            client.release();
            return createSecureResponse({error: genericErrors.invalidItem}, 404);
        }

        const currentState = result.rows[0].clicked;

        if (!ignoreAlreadyPressed && currentState) {
            client.release();
            return createSecureResponse({error: genericErrors.browser.alreadyPressed}, 409);
        }

        // If strict, set to true; if flexible, toggle
        const newClickedState = ignoreAlreadyPressed ? !currentState : true;

        await client.query(
            'UPDATE button_states SET clicked = $1 WHERE browser = $2;',
            [newClickedState, browser]
        );

        client.release();
        return createSecureResponse({success: true, clicked: newClickedState});
    } catch (error) {
        return createSecureResponse({error: genericErrors.internalServerError}, 500);
    }
}
