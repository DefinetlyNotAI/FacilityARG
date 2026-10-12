'use client';

import React, {useEffect, useRef, useState} from 'react';
import {formatTime} from "@/lib/client/utils";
import {chIIData, linksChapterII} from "@/lib/client/data/chapters/II";
import {Button} from "@/components/ui/button";
import {useChapterAccess} from "@/hooks";
import {BACKGROUND_AUDIO, usePlayBackgroundAudio} from "@/audio";
import {chapter} from "@/lib/client/data/chapters";


// ---------- Component ----------
export default function ChapterIIPage() {
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const {isCurrentlySolved} = useChapterAccess();
    const audioRef = useRef<HTMLAudioElement>(null);

    usePlayBackgroundAudio(audioRef, BACKGROUND_AUDIO.BONUS.II);

    useEffect(() => {
        const targetDate = new Date(chIIData.root.startDate);
        targetDate.setDate(targetDate.getDate() + 7);

        const interval = setInterval(() => {
            const now = Date.now();
            const distance = targetDate.getTime() - now;

            if (distance <= 0) {
                clearInterval(interval);
                setTimeRemaining(0);
            } else {
                setTimeRemaining(distance);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    if (isCurrentlySolved === null) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white font-mono">{chapter.loading}</div>
            </div>
        );
    }

    if (!isCurrentlySolved) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="text-center space-y-8">
                    <div className="text-white font-mono text-6xl font-bold tracking-wider">
                        {formatTime(timeRemaining)}
                    </div>

                    <div className="space-y-4 text-gray-400 font-mono text-sm max-w-2xl">
                        {chIIData.root.text.countdown.descriptionLines.map((line, i) => (
                            <p key={i}>{line}</p>
                        ))}
                        <p className="text-xs text-gray-600 mt-8">{chIIData.root.text.countdown.note}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <audio ref={audioRef} src={BACKGROUND_AUDIO.BONUS.II} loop preload="auto" style={{display: 'none'}}/>
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <div className="text-green-500 font-mono text-3xl font-bold">
                        {chIIData.root.text.complete.title}
                    </div>
                    <p className="text-gray-400 font-mono">{chIIData.root.text.complete.message}</p>
                    <Button
                        onClick={() => {
                            window.location.href = linksChapterII.timeShallStrikeEXE;
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white font-mono text-lg px-8 py-4"
                    >
                        {chIIData.utcPage.successText.downloadButton}
                    </Button>
                </div>
            </div>
        </>
    );
}
