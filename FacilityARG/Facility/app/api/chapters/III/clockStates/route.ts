import {NextResponse} from 'next/server';
import {chapterIIIData} from '@/lib/server/data/chapters';

export async function GET() {
    try {
        const now = new Date();
        const startDate = new Date(chapterIIIData.startDate);

        const clocks = chapterIIIData.clocks.map(clock => {
            // Compute reveal date
            const revealDate = new Date(startDate);
            revealDate.setDate(startDate.getDate() + clock.revealDay);
            revealDate.setUTCHours(15, 30, 0, 0);
            const timeRemaining = revealDate.getTime() - now.getTime();
            const isRevealed = timeRemaining <= 0;

            // Base response for a clock (do not include secret fields unless revealed)
            const clockResponse: any = {
                id: clock.id,
                revealDay: clock.revealDay,
                revealDate: revealDate.toISOString(),
                isRevealed,
                timeRemaining: Math.max(0, timeRemaining),
            };

            if (isRevealed) {
                clockResponse.symbol = clock.symbol;
                clockResponse.keyword = clock.keyword;
            }

            return clockResponse;
        });

        return NextResponse.json({
            serverTime: now.toISOString(),
            easterEgg: "Shadysallows - U made me do extra work smh :P",
            clocks,
        });
    } catch (err) {
        return NextResponse.json({error: 'Failed to compute clock states'}, {status: 500});
    }
}
