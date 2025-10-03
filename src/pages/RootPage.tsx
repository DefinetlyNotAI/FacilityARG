import { useEffect, useState, useRef } from 'react';
import { BoxCard } from '../components/BoxCard';
import { ExternalLink } from 'lucide-react';
import {getAllBoxes, getUnlockedBoxes} from "../../utils/lib.ts";

export function RootPage() {
    const [serverTime, setServerTime] = useState<Date>(new Date());
    const audioRef = useRef<HTMLAudioElement>(null);

    const boxes = getAllBoxes();
    const unlockedCount = getUnlockedBoxes(serverTime).length;

    useEffect(() => {
        document.title = 'Remember to SMILE';

        if (audioRef.current) {
            audioRef.current.loop = true;
            audioRef.current.play().catch(() => {});
        }
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setServerTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const progressPercentage = boxes.length > 0 ? (unlockedCount / boxes.length) * 100 : 0;

    return (
        <div className="min-h-screen bg-black text-red-100 p-8">
            <audio ref={audioRef} src="/mus/contempt.mp3" />

            <div className="max-w-6xl mx-auto space-y-8">
                <div className="space-y-3">
                    <h2 className="text-sm text-red-300 tracking-widest uppercase">
                        Seed to TREE, awaiting a VESSEL to be
                    </h2>
                    <div className="w-full bg-neutral-900 rounded-full h-6 border-2 border-red-950 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-red-950 to-red-800 transition-all duration-1000 flex items-center justify-center"
                            style={{ width: `${progressPercentage}%` }}
                        >
                            {progressPercentage > 0 && (
                                <span className="text-xs font-bold text-red-100">
                  {unlockedCount} / {boxes.length}
                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 justify-center">
                    <a
                        href="https://the-facility-questlog.vercel.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-red-950 hover:bg-red-900 text-red-100 px-6 py-3 rounded-lg border-2 border-red-900 hover:border-red-700 transition-all flex items-center gap-2 font-bold tracking-wide"
                    >
                        Quest Log
                        <ExternalLink className="w-4 h-4" />
                    </a>
                    <a
                        href="https://discord.gg/rVBFQCTV4F"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-red-950 hover:bg-red-900 text-red-100 px-6 py-3 rounded-lg border-2 border-red-900 hover:border-red-700 transition-all flex items-center gap-2 font-bold tracking-wide"
                    >
                        Discord
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {boxes.map((box) => {
                        const isUnlocked = new Date(box.etaDate) <= serverTime;
                        return (
                            <BoxCard
                                key={box.id}
                                id={box.id}
                                name={box.name}
                                splashText={box.splashText}
                                etaDate={box.etaDate}
                                isUnlocked={isUnlocked}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
