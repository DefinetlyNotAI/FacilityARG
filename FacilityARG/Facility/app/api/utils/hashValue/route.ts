import {NextRequest, NextResponse} from 'next/server';
import crypto from 'crypto';
import {genericErrors} from "@/lib/server/data/api";

const SALT = process.env.SALT || '';

/**
 * API: POST /api/utils/hashValue - hashes a value server-side with salt
 * Used to create tamper-proof localStorage values
 */
export async function POST(req: NextRequest) {
    try {
        const {value} = await req.json();

        if (typeof value !== 'string') {
            return NextResponse.json(
                {error: genericErrors.invalidFormat("value must be of type 'string'")},
                {status: 400}
            );
        }

        // Hash the value with salt server-side
        const hash = crypto
            .createHash('sha256')
            .update(SALT + value)
            .digest('hex');

        return NextResponse.json({hash});
    } catch (error) {
        return NextResponse.json(
            {error: genericErrors.internalServerError},
            {status: 400}
        );
    }
}
