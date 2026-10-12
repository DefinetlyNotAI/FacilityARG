// Add POST /api/banned/addMe - adds an IP to the banned table
import {createSecureResponse, dbPool} from '@/lib/server/utils';
import {genericErrors} from '@/lib/server/data/api';

export async function POST(req: Request) {
    let client: any;
    try {
        // --- CSRF Validation ---
        const csrfTokenFromCookie = (req as any).cookies?.get("csrf-token")?.value;
        const csrfTokenFromHeader = req.headers.get("x-csrf-token");
        if (!csrfTokenFromCookie || !csrfTokenFromHeader || csrfTokenFromHeader !== csrfTokenFromCookie) {
            return createSecureResponse({error: genericErrors.invalidCsrf}, 403);
        }

        const body = await req.json().catch(() => null);
        const ip = body?.ip;
        const reason = body?.reason ?? null;

        if (!ip) {
            return createSecureResponse({error: genericErrors.missingData}, 400);
        }

        client = await dbPool.connect();
        // Insert or update reason if ip already exists. Return the row.
        const insertQ = `INSERT INTO banned (ip, reason)
                         VALUES ($1, $2)
                         ON CONFLICT (ip) DO UPDATE SET reason = COALESCE(EXCLUDED.reason, banned.reason)
                         RETURNING id, ip, reason, created_at;`;
        const r = await client.query(insertQ, [ip, reason]);

        return createSecureResponse({banned: true, entry: r.rows[0]});
    } catch (error) {
        return createSecureResponse({error: genericErrors.ip.addError}, 500);
    } finally {
        client?.release?.();
    }
}
