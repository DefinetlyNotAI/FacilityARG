import {routes} from "@/lib/saveData";
import Cookies from "js-cookie";

/**
 * Ensures the presence of a CSRF token cookie on the client side.
 *
 * This function checks whether a CSRF token ("csrf-token") exists in browser cookies.
 * If missing, it calls the `/api/security/csrfToken` endpoint, which sets the token
 * in the response cookies. Afterward, it re-reads the token to confirm presence.
 *
 * **Use cases:**
 * - Any client-side API call requiring an anti-CSRF token in headers.
 * - Called in `useEffect` before protected POST/PUT/DELETE requests.
 *
 * **Returns:**
 * - A `Promise<string>` resolving with the CSRF token value.
 *
 * **Throws:**
 * - An `Error` if fetching the token fails or the token cannot be set.
 */
export async function ensureCsrfToken(): Promise<string> {
    let token = Cookies.get("csrf-token");
    if (!token) {
        // call your CSRF endpoint
        const res = await fetch(routes.api.security.csrfToken);
        if (!res.ok) throw new Error("Failed to fetch CSRF token");
        await res.json(); // token is set as cookie by the server
        token = Cookies.get("csrf-token");
        if (!token) throw new Error("CSRF token not set");
    }
    return token;
}
