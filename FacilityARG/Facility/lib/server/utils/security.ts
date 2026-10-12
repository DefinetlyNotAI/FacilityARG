import {NextRequest} from 'next/server';
import {cookies as savedCookies} from "@/lib/saveData";
import jwt from "jsonwebtoken";
import {createSecureResponse} from "@/lib/server/utils/response";

/**
 * Validates the admin authentication cookie on the server side.
 *
 * Reads the `adminPass` cookie from the incoming Next.js `NextRequest`
 * and verifies its JWT signature using `process.env.JWT_SECRET`.
 * Used exclusively in admin-protected API routes to restrict access.
 *
 * **Use cases:**
 * - Inside `route.ts` handlers (e.g., `/api/banned/all`, `/api/utils/...`)
 *   to ensure that the request is made by an authorized admin.
 *
 * **Returns:**
 * - `null` if the cookie is valid and the request is authorized.
 * - A JSON `Response` object with status 401 (unauthorized),
 *   403 (forbidden), or 500 (server misconfiguration) otherwise.
 *
 * **Throws:**
 * - Never throws; returns an HTTP response directly for API routes.
 */
export function verifyAdmin(req: NextRequest): Response | null {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        return createSecureResponse({error: "Server misconfiguration"}, 500);
    }

    const adminToken = req.cookies.get(savedCookies.adminPass)?.value ?? "";
    if (!adminToken) {
        return createSecureResponse({error: "Unauthorized"}, 401);
    }

    try {
        jwt.verify(adminToken, jwtSecret);
        return null; // Valid
    } catch {
        return createSecureResponse({error: "Forbidden - invalid admin token"}, 403);
    }
}
