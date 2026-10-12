import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import HomeClient from './HomeClient';
import {cookies as savedCookies, routes} from '@/lib/saveData';

export default async function HomePage() {
    const cookieStore = await cookies();

    // Check cookies server-side
    const corrupt = cookieStore.get(savedCookies.corrupt)?.value;
    const end = cookieStore.get(savedCookies.end)?.value;

    // Handle redirects server-side
    if (corrupt) {
        redirect(routes.h0m3);
    }

    return <HomeClient/>;
}
