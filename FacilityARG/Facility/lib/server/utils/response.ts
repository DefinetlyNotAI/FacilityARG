import {NextResponse} from 'next/server';

/**
 * Creates a secure Next.js JSON response with strict headers.
 *
 * @param body - The response body to send as JSON.
 * @param status - HTTP status code (default 200).
 * @returns NextResponse object configured with security headers.
 *
 * Usage: Use in API routes to return a JSON response with secure headers.
 */
export function createSecureResponse(body: any, status = 200) {
    return NextResponse.json(body, {
        status,
        headers: {
            'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
            'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none';",
            'X-Frame-Options': 'DENY',
            'X-Content-Type-Options': 'nosniff',
            'Referrer-Policy': 'no-referrer',
            'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
        },
    });
}
