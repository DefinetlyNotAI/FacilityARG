import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function proxy(req: NextRequest) {
    const res = await fetch(req);
    if (res.status === 404) {
        return NextResponse.rewrite(new URL('/', req.url));
    }

    return res;
}