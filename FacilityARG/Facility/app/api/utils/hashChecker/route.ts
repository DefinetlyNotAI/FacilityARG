import {NextResponse} from "next/server";
import {createHash} from "crypto";
import {ItemKey} from "@/lib/saveData";
import {genericErrors, secrets} from "@/lib/server/data/api";

const itemHashes: Record<ItemKey, string> = Object.fromEntries(
    Object.entries(secrets).map(([k, v]) => [
        k,
        createHash("sha256").update(v).digest("hex")
    ])
) as Record<ItemKey, string>;

export async function POST(req: Request) {
    try {
        const {stringToCheck, itemToCheck} = await req.json();

        if (stringToCheck === undefined || itemToCheck === undefined) {
            return NextResponse.json({success: false, error: genericErrors.missingData}, {status: 400});
        }

        if (!(itemToCheck in itemHashes)) {
            return NextResponse.json({success: false, error: genericErrors.invalidItem}, {status: 404});
        }

        const inputHash = createHash("sha256").update(stringToCheck).digest("hex");
        const valid = inputHash === itemHashes[itemToCheck as ItemKey];

        return NextResponse.json({success: valid});
    } catch (err) {
        console.error(err);
        return NextResponse.json({success: false, error: genericErrors.internalServerError}, {status: 500});
    }
}
