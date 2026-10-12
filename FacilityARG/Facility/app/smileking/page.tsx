import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import SmilekingClient from './SmilekingClient';
import {undefinedVarErr} from "@/lib/server/data/smileking";
import {cookies as savedCookies, routes} from "@/lib/saveData";
import jwt from 'jsonwebtoken';


export default async function SmilekingPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get(savedCookies.adminPass)?.value || '';

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        // Server misconfiguration: fail closed
        throw new Error(undefinedVarErr);
    }

    if (!token) {
        redirect(routes.smilekingAuth);
    }

    try {
        // Verify token server-side. Payload is not used here beyond validity.
        jwt.verify(token, jwtSecret);
    } catch (e) {
        // invalid or expired -> require auth
        redirect(routes.smilekingAuth);
    }

    // If passed, render client component
    return <SmilekingClient/>;
}
