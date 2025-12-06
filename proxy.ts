import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const TARGET = process.env.UPSTREAM_URL

export default async function proxy(req: NextRequest) {
    if (!TARGET) {
        return new NextResponse('Missing UPSTREAM_URL', { status: 500 })
    }

    const upstreamUrl = new URL(req.nextUrl.pathname + req.nextUrl.search, TARGET)

    const res = await fetch(upstreamUrl.toString(), {
        method: req.method,
        headers: req.headers,
        body: req.body,
        redirect: 'manual'
    })

    // If upstream returns 404, rewrite to home
    if (res.status === 404) {
        return NextResponse.rewrite(new URL('/', req.url))
    }

    return new NextResponse(res.body, {
        status: res.status,
        headers: res.headers
    })
}
