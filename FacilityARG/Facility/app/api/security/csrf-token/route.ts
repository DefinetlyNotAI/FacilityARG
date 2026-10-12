import {NextResponse} from 'next/server';
import {randomBytes} from 'crypto';

export async function GET() {
    const token = randomBytes(32).toString('hex');

    // Set the cookie since the frontend needs to read it, do NOT set HttpOnly here
    const res = NextResponse.json({success: true});

    res.cookies.set('csrf-token', token, {
        path: '/',
        httpOnly: false,  // must be readable by JS so client can send it in header
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60, // 1 hour
    });

    return res;
}
