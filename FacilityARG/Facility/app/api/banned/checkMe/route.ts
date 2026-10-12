// POST /api/banned/checkMe - Check if user IP is banned; accepts { ip?: string }
import {createSecureResponse, dbPool} from '@/lib/server/utils';
import {genericErrors} from "@/lib/server/data/api";

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => null);
        const ip = body?.ip;

        if (!ip) return createSecureResponse({error: genericErrors.missingData}, 400);

        const client = await dbPool.connect();
        const q = `SELECT id, ip, reason, created_at
                   FROM banned
                   WHERE ip = $1
                   LIMIT 1;`;
        const res = await client.query(q, [ip]);
        client.release();

        if (res.rowCount === 0) return createSecureResponse({banned: false});
        return createSecureResponse({banned: true, entry: res.rows[0]});
    } catch (error) {
        return createSecureResponse({error: genericErrors.failedToFetch}, 500);
    }
}
