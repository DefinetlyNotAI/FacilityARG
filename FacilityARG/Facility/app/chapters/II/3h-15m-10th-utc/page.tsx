'use client';

import React, {useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import Cookies from 'js-cookie';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import Image from 'next/image';
import {checkPass, signCookie} from "@/lib/client/utils";
import {chIIData, linksChapterII} from "@/lib/client/data/chapters/II";
import {cookies, ItemKey, routes} from '@/lib/saveData';
import {useChapter2Access} from "@/hooks";
import {BACKGROUND_AUDIO, usePlayBackgroundAudio} from "@/audio";

export default function ChapterIITimedPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [isPasswordVerified, setIsPasswordVerified] = useState(false);
    const [isInTimeWindow, setIsInTimeWindow] = useState(false);
    const [error, setError] = useState('');
    const audioRef = useRef<HTMLAudioElement>(null);

    usePlayBackgroundAudio(audioRef, BACKGROUND_AUDIO.BONUS.II);
    useChapter2Access()

    useEffect(() => {
        if (!Cookies.get(cookies.end)) {
            router.replace(routes.bonus.locked);
        }
    }, [router]);

    useEffect(() => {
        const savedPassword = Cookies.get(cookies.chII_passDone);
        if (savedPassword?.includes('true')) {
            setIsPasswordVerified(true);
        }
    }, []);

    useEffect(() => {
        const checkTimeWindow = () => {
            const now = new Date();
            const utcHours = now.getUTCHours();
            const utcMinutes = now.getUTCMinutes();
            const utcDay = now.getUTCDate();

            const isCorrectHour = utcHours === chIIData.utcPage.timeWindow.hour;
            const isCorrectMinuteRange = utcMinutes >= chIIData.utcPage.timeWindow.minuteStart && utcMinutes < chIIData.utcPage.timeWindow.minuteEnd;
            const isCorrectDay = utcDay === chIIData.utcPage.timeWindow.day;

            setIsInTimeWindow(isCorrectHour && isCorrectMinuteRange && isCorrectDay);
        };

        checkTimeWindow();
        const interval = setInterval(checkTimeWindow, 1000);
        return () => clearInterval(interval);
    }, []);

    const handlePasswordSubmit = async () => {
        try {
            const res = await checkPass(String(ItemKey.InternalCode), password);
            if (res.success) {
                await signCookie(`${cookies.chII_passDone}=true`);
                setIsPasswordVerified(true);
                setError("");
            } else {
                setError(chIIData.utcPage.accessText.error);
            }
        } catch (err) {
            console.error(err);
            setError("Something went wrong");
        }
    };

    if (!isPasswordVerified) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="max-w-md w-full space-y-6 bg-gray-900 border border-gray-800 p-8">
                    <div className="text-center space-y-4">
                        <h1 className="text-white font-mono text-2xl">{chIIData.utcPage.accessText.title}</h1>
                        <p className="text-gray-400 font-mono text-sm">{chIIData.utcPage.accessText.description}</p>
                    </div>

                    <div className="space-y-4">
                        <Input
                            type="text"
                            value={password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                            className="font-mono bg-black border-gray-700 text-white"
                            placeholder={chIIData.utcPage.accessText.inputPlaceholder}
                            maxLength={10}
                        />

                        {error && (
                            <p className="text-red-500 font-mono text-sm text-center">{error}</p>
                        )}

                        <Button disabled={!password} onClick={handlePasswordSubmit}>
                            {chIIData.utcPage.accessText.submit}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!isInTimeWindow) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="max-w-2xl w-full space-y-8">
                    <div className="relative w-full aspect-square bg-gray-900 border border-red-900">
                        <Image
                            src={linksChapterII.images[chIIData.utcPage.images.meltedClock as keyof typeof linksChapterII.images]}
                            alt="Melted Clock"
                            fill
                            className="object-contain opacity-50"
                        />
                    </div>

                    <div className="text-center">
                        <p className="text-red-500 font-mono text-2xl font-bold glitch">
                            {chIIData.utcPage.timeWindowText.tooLateEarly}
                        </p>
                        <p className="text-red-400 font-mono text-lg mt-4">
                            {chIIData.utcPage.timeWindowText.message}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <audio ref={audioRef} src={BACKGROUND_AUDIO.BONUS.II} loop preload="auto" style={{display: 'none'}}/>
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="text-center space-y-8">
                    <div className="text-green-500 font-mono text-6xl space-x-4">
                        {chIIData.utcPage.successText.emojis.map((e, i) => (
                            <span key={i}>{e}</span>
                        ))}
                    </div>

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
