import {createSecureResponse, dbPool} from '@/lib/server/utils';
import {genericErrors} from "@/lib/server/data/api";

export async function GET() {
    try {
        if (dbPool) {
            const client = await dbPool.connect();
            try {
                const q = `SELECT COUNT(*) AS count
                           FROM banned;`;
                const res = await client.query(q);
                const count = res.rows?.[0]?.count ? Number(res.rows[0].count) : 0;
                return createSecureResponse({count});
            } finally {
                client.release();
            }
        }
    } catch (dbErr) {
        return createSecureResponse({error: genericErrors.failedToFetch}, 500);
    }
}
