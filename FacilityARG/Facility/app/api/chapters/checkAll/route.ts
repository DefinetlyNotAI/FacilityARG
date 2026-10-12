import {createSecureResponse, dbPool} from '@/lib/server/utils';
import {allowedActs, genericErrors} from "@/lib/server/data/api";
import {ActionState} from "@/types";

export async function GET() {
    try {
        const client = await dbPool.connect();

        // Map all allowedActs to lowercase for querying
        const cols = allowedActs.map(act => act.toLowerCase()).join(', ');
        const res = await client.query(`
            SELECT ${cols} 
            FROM actions 
            LIMIT 1;
        `);
        client.release();

        // Default row with all acts set to NotReleased
        const defaultRow: Record<string, ActionState> = allowedActs.reduce((acc, act) => {
            acc[act] = ActionState.NotReleased;
            return acc;
        }, {} as Record<string, ActionState>);

        if (res.rowCount === 0) {
            return createSecureResponse(defaultRow);
        }

        // Map each act to its current ActionState (fallback to NotReleased)
        const row = res.rows[0];
        const result: Record<string, ActionState> = allowedActs.reduce((acc, act) => {
            const col = act.toLowerCase(); // match DB column
            acc[act] = (row[col] as ActionState) ?? ActionState.NotReleased;
            return acc;
        }, {} as Record<string, ActionState>);

        return createSecureResponse(result);
    } catch (error) {
        return createSecureResponse({error: genericErrors.failedToFetch}, 500);
    }
}
