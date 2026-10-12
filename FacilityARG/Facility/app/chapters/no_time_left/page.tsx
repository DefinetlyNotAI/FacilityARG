'use client';
import React, {Suspense, useEffect, useRef} from 'react';
import styles from '@/styles/NoTimeLeft.module.css';
import {useRouter, useSearchParams} from 'next/navigation';
import {chapterMessages} from '@/lib/client/data/chapters';
import {BACKGROUND_AUDIO, playSafeSFX, SFX_AUDIO, usePlayBackgroundAudio} from '@/audio';
import {cookies, routes} from '@/lib/saveData';
import Cookies from 'js-cookie';
import {usePreloadActStates} from "@/hooks";

const chapterStyles: Record<string, string> = {
    I: styles.textWhite,
    II: styles.textWhite,
    VI: styles.textWhite,
    VIII: styles.textWhite,
    VII: styles.textRed,
    IX: styles.textBlood,
};

function NoTimeLeftInner() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const roman = searchParams.get('chapter')?.toLowerCase() ?? null;
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (!Cookies.get(cookies.end)) router.replace(routes.bonus.locked);
    }, [router]);

    usePlayBackgroundAudio(audioRef, BACKGROUND_AUDIO.BONUS.NO_TIME);
    if (!roman) return null;

    const ready = usePreloadActStates(roman);

    useEffect(() => {
        playSafeSFX(audioRef, SFX_AUDIO.ERROR, true);
    }, []);

    if (!ready || !chapterMessages[roman.toUpperCase()]) return null;

    return (
        <>
            <audio
                ref={audioRef}
                src={BACKGROUND_AUDIO.BONUS.NO_TIME}
                loop
                preload="auto"
                style={{display: 'none'}}
            />
            <div className={styles.container}>
                <p className={chapterStyles[roman.toUpperCase()]}>
                    {chapterMessages[roman.toUpperCase()]}
                </p>
            </div>
        </>
    );
}

export default function NoTimeLeft() {
    return (
        <Suspense fallback={<div/>}>
            <NoTimeLeftInner/>
        </Suspense>
    );
}
