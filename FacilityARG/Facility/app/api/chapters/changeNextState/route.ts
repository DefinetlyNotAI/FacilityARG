import {NextRequest} from "next/server";
import {createSecureResponse, dbPool, verifyAdmin} from '@/lib/server/utils';
import {allowedActs, genericErrors} from "@/lib/server/data/api";
import {ActionState} from "@/types";

export async function POST(req: NextRequest) {
    const authError = verifyAdmin(req);
    if (authError) return authError;

    let client;
    try {
        // --- CSRF Validation ---
        const csrfTokenFromCookie = req.cookies.get("csrf-token")?.value;
        const csrfTokenFromHeader = req.headers.get("x-csrf-token");

        if (!csrfTokenFromCookie || !csrfTokenFromHeader || csrfTokenFromHeader !== csrfTokenFromCookie) {
            return createSecureResponse({error: genericErrors.invalidCsrf}, 403);
        }

        // --- Parse Body ---
        const body = await req.json().catch(() => {
            throw new Error(genericErrors.invalidFormat("JSON body"));
        });

        const act = body?.act;
        if (!act) {
            return createSecureResponse({error: genericErrors.missingData}, 400);
        }
        if (!allowedActs.includes(act)) {
            return createSecureResponse({error: genericErrors.invalidItem}, 400);
        }

        // --- Map act to lowercase column name ---
        const col = act.toLowerCase();

        // --- Connect to Database ---
        client = await dbPool.connect();

        // --- Ensure Row Exists ---
        let sel = await client.query(`SELECT ${col}
                                      FROM actions LIMIT 1;`);
        if (sel.rowCount === 0) {
            const cols = allowedActs.map(a => a.toLowerCase()).join(", ");
            const values = allowedActs.map(() => `'${ActionState.NotReleased}'`).join(", ");
            await client.query(`INSERT INTO actions (${cols})
                                VALUES (${values});`);
            sel = await client.query(`SELECT ${col}
                                      FROM actions LIMIT 1;`);
        }

        const currentState: ActionState = (sel.rows[0][col] as ActionState) ?? ActionState.NotReleased;
        const nextState = getNextState(currentState);

        // --- Update ---
        await client.query(`UPDATE actions
                            SET ${col} = $1;`, [nextState]);

        // --- Verify Update ---
        // const verify = await client.query(`SELECT ${col} FROM actions LIMIT 1;`);

        return createSecureResponse({[act]: nextState});
    } catch (error) {
        return createSecureResponse({error: genericErrors.chapters.toggleError}, 500);
    } finally {
        client?.release();
    }
}

function getNextState(current: ActionState): ActionState {
    switch (current) {
        case ActionState.NotReleased:
            return ActionState.Released;
        case ActionState.Released:
            return ActionState.Failed;
        case ActionState.Failed:
            return ActionState.Succeeded;
        case ActionState.Succeeded:
            return ActionState.NotReleased;
        default:
            return ActionState.NotReleased;
    }
}
