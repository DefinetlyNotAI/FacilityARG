'use client';

import React, {useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import Cookies from 'js-cookie';
import {cookies} from '@/lib/saveData';
import styles from '@/styles/WordOfTheDay.module.css';
import {BACKGROUND_AUDIO, usePlayBackgroundAudio} from "@/audio";
import {KEYWORDS, LOADING_MESSAGES, NARRATIVE_LINES} from "@/lib/client/data/wordOfTheDay";

export default function WordOfTheDay() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [alreadyCompleted, setAlreadyCompleted] = useState(false);
    const [showChoiceButtons, setShowChoiceButtons] = useState(false);
    const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [narrativeLines, setNarrativeLines] = useState<string[]>([]);
    const [isShowingNarrative, setIsShowingNarrative] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    usePlayBackgroundAudio(audioRef, BACKGROUND_AUDIO.WORD_OF_THE_DAY);

    useEffect(() => {
        setMounted(true);

        // Check if already completed
        const keywordCookie = Cookies.get(cookies.keywordOfTheDay);
        if (keywordCookie) {
            setAlreadyCompleted(true);
            return;
        }

        // Check if they have the end cookie
        const endCookie = Cookies.get(cookies.end);
        if (!endCookie) {
            router.replace('/');
            return;
        }

        // Show choice buttons after a freeze pause (5 seconds)
        setTimeout(() => {
            setShowChoiceButtons(true);
        }, 5000);
    }, [router]);

    const handleChoiceClick = async (choice: string) => {
        if (selectedChoice) return;

        setSelectedChoice(choice);
        setLoadingMessage(LOADING_MESSAGES[choice] || "processing...");

        // Show loading message for 1 second
        setTimeout(() => {
            setLoadingMessage('');
            setShowChoiceButtons(false);
            setIsShowingNarrative(true);

            // Start showing narrative lines
            showNarrativeSequence();
        }, 1000);
    };

    const showNarrativeSequence = async () => {
        const lines: string[] = [];
        setNarrativeLines(lines);

        for (let i = 0; i < NARRATIVE_LINES.length; i++) {
            const {text, pause, autoClear} = NARRATIVE_LINES[i];

            // Clear all previous lines if autoClear is true
            if (autoClear) {
                setNarrativeLines([text]);
            } else {
                // Add the line
                setNarrativeLines(prev => [...prev, text]);
            }

            // Wait for the pause duration
            if (pause > 0) {
                await new Promise(resolve => setTimeout(resolve, pause));
            }
        }

        // After all lines are shown, set the cookie
        Cookies.set(cookies.keywordOfTheDay, 'true', {expires: 365});
    };

    if (!mounted) return null;

    if (alreadyCompleted) {
        return (
            <>
                <audio
                    ref={audioRef}
                    style={{display: 'none'}}
                    src={BACKGROUND_AUDIO.WORD_OF_THE_DAY}
                    preload="auto"
                    loop/>
                <div className={styles.container}>
                    <div className={styles.completedMessage}>
                        You have already completed this puzzle.
                    </div>
                </div>
            </>
        );
    }

    if (isShowingNarrative) {
        return (
            <>
                <audio
                    ref={audioRef}
                    style={{display: 'none'}}
                    src={BACKGROUND_AUDIO.WORD_OF_THE_DAY}
                    preload="auto"
                    loop/>
                <div className={styles.narrativeContainer}>
                    {narrativeLines.map((line, index) => (
                        <div key={index} className={styles.narrativeLine}>
                            {line}
                        </div>
                    ))}
                </div>
            </>
        );
    }

    if (loadingMessage) {
        return (
            <>
                <audio
                    ref={audioRef}
                    style={{display: 'none'}}
                    src={BACKGROUND_AUDIO.WORD_OF_THE_DAY}
                    preload="auto"
                    loop/>
                <div className={styles.container}>
                    <div className={styles.loadingMessage}>{loadingMessage}</div>
                </div>
            </>
        );
    }

    if (showChoiceButtons) {
        return (
            <>
                <audio
                    ref={audioRef}
                    style={{display: 'none'}}
                    src={BACKGROUND_AUDIO.WORD_OF_THE_DAY}
                    preload="auto"
                    loop/>
                <div className={styles.container}>
                    <div className={styles.choiceQuestion}>Which one did you think you had?</div>
                    <div className={styles.choiceButtons}>
                        {KEYWORDS.map(keyword => (
                            <button
                                key={keyword}
                                onClick={() => handleChoiceClick(keyword)}
                                className={styles.choiceButton}
                                disabled={!!selectedChoice}
                            >
                                {keyword}
                            </button>
                        ))}
                    </div>
                </div>
            </>
        );
    }

    // Initial freeze screen
    return (
        <>
            <audio
                ref={audioRef}
                style={{display: 'none'}}
                src={BACKGROUND_AUDIO.WORD_OF_THE_DAY}
                preload="auto"
                loop/>
            <div className={styles.container}>
                <div className={styles.freezeScreen}></div>
            </div>
        </>
    );
}

