import {NextRequest} from 'next/server';
import {createSecureResponse, dbPool, isValidIP, verifyAdmin} from '@/lib/server/utils';
import {genericErrors} from "@/lib/server/data/api";


export async function POST(req: NextRequest) {
    const authError = verifyAdmin(req);
    if (authError) return authError;

    // Parse body
    let body: any;
    try {
        body = await req.json();
    } catch {
        return createSecureResponse({error: genericErrors.invalidFormat("JSON body")}, 400);
    }

    const ip = body?.ip;
    if (!isValidIP(ip)) {
        return createSecureResponse({error: genericErrors.invalidFormat("IP address")}, 400);
    }

    const normalized = String(ip).trim();

    let dbClient: any = null;
    try {
        if (dbPool) {
            dbClient = await dbPool.connect();
            try {
                const delRes = await dbClient.query(
                    `DELETE
                     FROM banned
                     WHERE ip = $1
                     RETURNING id;`,
                    [normalized]
                );

                const dbRemovedCount = delRes?.rowCount ?? (Array.isArray(delRes?.rows) ? delRes.rows.length : 0);
                if (dbRemovedCount > 0) {
                    return createSecureResponse({success: true, removed: true, removedCount: dbRemovedCount});
                }
            } finally {
                dbClient.release();
                dbClient = null;
            }
        }
    } catch (dbErr) {
        try {
            dbClient?.release?.();
        } catch {
        }
        return createSecureResponse({error: genericErrors.ip.delError}, 500);
    }
}
