import {createSecureResponse} from '@/lib/server/utils';
import {wifiPanelSpecialTipMessage} from "@/lib/server/data/api";

export async function GET(req: Request) {
    const userAgent = req.headers.get('user-agent')?.toLowerCase() || '';

    if (userAgent.includes('curl') || userAgent.includes('wget')) {
        return createSecureResponse({keyword2: "fletchling"});
    } else {
        return createSecureResponse(wifiPanelSpecialTipMessage, 403);
    }
}
