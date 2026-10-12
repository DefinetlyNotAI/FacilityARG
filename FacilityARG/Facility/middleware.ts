import {NextRequest, NextResponse} from 'next/server';

// Do not add admin-pass cookie to the list, as it is not signed but hashed,
// thus would fail the custom verification.
const cookiesList = [
    'accepted', 'Scroll_unlocked', 'Wifi_Unlocked', 'wifi_passed', 'Corrupt',
    'wifi_login', 'Media_Unlocked', 'Button_Unlocked', 'File_Unlocked',
    'corrupting', 'No_corruption', 'BnW_unlocked', 'Choice_Unlocked',
    'terminal_unlocked', 'End?', 'End', 'tree98_cutscene_seen', 'tree98_logged_in',
    'moonlight_time_cutscene_played', 'themoon',
    'Interference_cutscene_seen', 'KILLTAS_cutscene_seen', 'TREE', "THP_Play", "3h15m25thUTC_passDone"
];

const validRomans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

const SECRET = process.env.COOKIE_SECRET || 'Unsecure';

async function sign(data: string): Promise<string> {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        enc.encode(SECRET),
        {name: 'HMAC', hash: 'SHA-256'},
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, enc.encode(data));
    return Buffer.from(signature).toString('hex');
}

async function verifyRelevantCookies(request: NextRequest): Promise<boolean> {
    const relevant = cookiesList.map(name => request.cookies.get(name)).filter(Boolean);

    for (const cookie of relevant) {
        if (!cookie) continue;
        //console.debug(`[verifyRelevantCookies] Verifying cookie: ${cookie.name} = ${cookie.value}`);

        const raw = cookie?.value || '';
        const lastDot = raw.lastIndexOf('.');
        if (lastDot === -1) {
            console.warn(`[verifyRelevantCookies] Cookie ${cookie.name} missing signature, invalid`);
            return false;
        }

        const value = raw.slice(0, lastDot);
        const signature = raw.slice(lastDot + 1);

        const expectedSignature = await sign(`${cookie.name}=${value}`);
        //console.debug(`[verifyRelevantCookies] Expected signature: ${expectedSignature} vs Actual signature: ${signature}`);

        if (signature !== expectedSignature) {
            console.warn(`[verifyRelevantCookies] Signature mismatch on cookie ${cookie.name}, invalid`);
            return false;
        }
    }

    //console.debug('[verifyRelevantCookies] All relevant cookies verified successfully');
    return true;
}


export async function middleware(request: NextRequest) {
    const {pathname} = request.nextUrl;
    const accepted = request.cookies.get('accepted')?.value;
    const end = request.cookies.get('End');
    const corrupting = request.cookies.get('corrupting');
    const noCorruption = request.cookies.get('No_corruption');
    const corrupt = request.cookies.get('Corrupt');
    const endQ = request.cookies.get('End?');
    const response = NextResponse.next();

    // If run by a script, skip the middleware by uncommenting this line
    // return response;

    // Skip static + API routes
    if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
        return response;
    }

    if (pathname.startsWith('/chapters/')) {
        const parts = pathname.split('/');
        const chID = parts[2]; // e.g., 'i'

        if (chID) {
            const upper = chID.toUpperCase();

            // redirect only if uppercase is valid and the path is lowercase
            if (chID !== upper && validRomans.includes(upper)) {
                const url = request.nextUrl.clone();
                url.pathname = `/chapters/${upper}`;
                return NextResponse.redirect(url, 301); // 301 perma redirect
            }
        }
    }

    // If cheating via cookies, redirect to /CHEATER
    if (pathname !== '/CHEATER') {
        const isValid = await verifyRelevantCookies(request);

        if (!isValid) {
            return NextResponse.redirect(new URL('/CHEATER', request.url));
        }
    }

    // Redirection logic (no refresh loops)
    if (
        pathname !== '/smileking' &&
        pathname !== '/smileking-auth' &&
        pathname !== '/CHEATER' &&
        !pathname.match(
            /^(\/styles\/|\/public\/|.*\.(?:js|css|png|jpg|jpeg|gif|svg|ico|webp|mp3|mp4|m4a|woff2?|ttf|eot|map|txt))$/
        )
    ) {
        if (!accepted && pathname !== '/') {
            // console.debug('[middleware] Redirecting to / due to missing accepted cookie');
            return NextResponse.redirect(new URL('/', request.url));
        } else if (corrupting && pathname !== '/h0m3') {
            // console.debug('[middleware] Redirecting to /h0m3 due to Corrupting cookie');
            return NextResponse.redirect(new URL('/h0m3', request.url));
        }
    }

    // Security headers (optional)
    try {
        response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
        response.headers.set(
            'Content-Security-Policy',
            `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.ipify.org; img-src 'self' data:;`
        )
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('Referrer-Policy', 'no-referrer');
        response.headers.set('Permissions-Policy', 'geolocation=(), microphone=()');
    } catch (err) {
        // console.error(`[middleware.ts] Failed to set security headers:`, err);
    }

    // === Begin Conflict Resolution ===
    if (noCorruption) {
        if (corrupt) {
            // console.debug('[middleware] Conflict: Corrupt + No_corruption -> deleting Corrupt');
            response.cookies.delete('Corrupt');
        }
        if (corrupting) {
            // console.debug('[middleware] Conflict: corrupting + No_corruption -> deleting corrupting');
            response.cookies.delete('corrupting');
        }
    }

    if (endQ && end) {
        // console.debug('[middleware] Conflict: End? + End -> deleting End?');
        response.cookies.delete('End?');
    }
    // === End Conflict Resolution ===

    return response;
}

export const config = {
    matcher: '/:path*',
}
