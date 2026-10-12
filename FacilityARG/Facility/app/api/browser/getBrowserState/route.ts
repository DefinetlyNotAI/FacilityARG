import {createSecureResponse, dbPool} from '@/lib/server/utils';
import {genericErrors} from "@/lib/server/data/api";


export async function GET() {
    try {
        const client = await dbPool.connect();
        const res = await client.query('SELECT browser, clicked FROM button_states;');
        client.release();
        return createSecureResponse(res.rows);
    } catch (error) {
        return createSecureResponse({error: genericErrors.failedToFetch}, 500);
    }
}
