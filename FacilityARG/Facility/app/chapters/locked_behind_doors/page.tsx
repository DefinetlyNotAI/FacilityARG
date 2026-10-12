'use client';

import styles from '@/styles/ChapterBonusSpecial.module.css';
import {bonusErrorText} from "@/lib/client/data/chapters";
import React, {useEffect, useRef} from "react";
import {BACKGROUND_AUDIO, playSafeSFX, SFX_AUDIO, usePlayBackgroundAudio} from "@/audio";
import {useRouter} from "next/navigation";
import Cookies from "js-cookie";
import {cookies, routes} from "@/lib/saveData";

// Use when user is missing "End" cookie and tries to access the chapters
export default function LockedBehindDoors() {
    const audioRef = useRef<HTMLAudioElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (Cookies.get(cookies.end)) {
            router.replace(routes.notFound);
        }
    }, [router]);

    // Initialize background audio
    usePlayBackgroundAudio(audioRef, BACKGROUND_AUDIO.BONUS.LOCKED)

    useEffect(() => {
        playSafeSFX(audioRef, SFX_AUDIO.ERROR, true);
    }, [router])

    return (
        <>
            <audio
                ref={audioRef}
                src={BACKGROUND_AUDIO.BONUS.LOCKED}
                loop={true}
                preload="auto"
                style={{display: "none"}}/>
            <div className={styles.container}>
                <p className={styles.text}>
                    {bonusErrorText.lockedBehindDoors}
                </p>
            </div>
        </>
    );
}
