import {NextRequest} from 'next/server';
import {createSecureResponse, dbPool} from '@/lib/server/utils';
import {allowedActs, genericErrors} from "@/lib/server/data/api";
import {ActionState} from "@/types";

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const act = url.searchParams.get('act');

        if (!act) {
            return createSecureResponse({error: genericErrors.missingData}, 400);
        }
        if (!allowedActs.includes(act)) {
            return createSecureResponse({error: genericErrors.invalidItem}, 400);
        }

        const client = await dbPool.connect();

        // Map to lowercase column
        const col = act.toLowerCase();
        const q = `SELECT ${col}
                   FROM actions LIMIT 1;`;
        const res = await client.query(q);
        client.release();

        // Default to NotReleased if no row exists
        const state: ActionState =
            res.rowCount === 0
                ? ActionState.NotReleased
                : (res.rows[0][col] as ActionState) ?? ActionState.NotReleased;

        return createSecureResponse({[act]: state});
    } catch (error) {
        return createSecureResponse({error: genericErrors.failedToFetch}, 500);
    }
}
