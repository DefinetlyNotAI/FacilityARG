'use client';
import React, {useEffect, useRef, useState} from 'react';
import styles from '@/styles/ChaptersVI.module.css';
import {BACKGROUND_AUDIO, usePlayBackgroundAudio} from '@/audio';
import {useChapterAccess} from "@/hooks";
import {localStorageKeys} from "@/lib/saveData";
import {chapterVIData} from "@/lib/client/data/chapters/VI";
import {getSecureItem, setSecureItem} from "@/lib/client/utils/secureStorage";
import {chapter} from "@/lib/client/data/chapters";

export default function ChapterVIPage() {
    const {isCurrentlySolved, setIsCurrentlySolved} = useChapterAccess() as any;
    const [seconds, setSeconds] = useState(0);
    const intervalRef = useRef<number | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [petals, setPetals] = useState<{ left: string; duration: string; delay: string }[]>([]);

    // Side-puzzle state
    const [sideSolved, setSideSolved] = useState<boolean | null>(null);
    const [showSidePuzzle, setShowSidePuzzle] = useState(false);
    const [sideFeedback, setSideFeedback] = useState<string | null>(null);

    // New hold-to-wait puzzle state (patience-themed)
    const [holding, setHolding] = useState(false);
    const [holdProgress, setHoldProgress] = useState(0); // 0..1 (derived from accumulatedSeconds)
    // Track accumulated seconds toward the required hold time in a ref for accuracy across holds
    const accumulatedRef = useRef<number>(0);
    const accumulatedAtStartRef = useRef<number | null>(null);
    const lastTickRef = useRef<number | null>(null);
    const holdPressedAtRef = useRef<number | null>(null); // per-press timestamp for accurate elapsed display
    const holdIntervalRef = useRef<number | null>(null);
    const [requiredHoldSeconds, setRequiredHoldSeconds] = useState(10); // seconds required to demonstrate patience (can increase with impatience)
    const [impatienceCount, setImpatienceCount] = useState(0);

    // Load saved time and side-puzzle solved flag
    useEffect(() => {
        const loadSaved = async () => {
            try {
                const stored = await getSecureItem(localStorageKeys.chapterVISeconds);
                if (stored) setSeconds(Number(stored));
                const side = await getSecureItem(localStorageKeys.chapterVISidePuzzleSolved as any);
                if (side) setSideSolved(Boolean(Number(side)));
                else setSideSolved(false);
            } catch (e) {
                console.error(e);
                setSideSolved(false);
            }
        };
        loadSaved().catch(console.error);
    }, []);

    // Timer
    useEffect(() => {
        if (isCurrentlySolved) return;

        intervalRef.current = window.setInterval(() => {
            setSeconds((prev) => prev + 1);
        }, 1000);

        const beforeunload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', beforeunload);

        return () => {
            if (intervalRef.current) window.clearInterval(intervalRef.current);
            window.removeEventListener('beforeunload', beforeunload);
        };
    }, [isCurrentlySolved]);

    // Save time
    useEffect(() => {
        setSecureItem(localStorageKeys.chapterVISeconds, seconds.toString()).catch(console.error);
    }, [seconds]);

    usePlayBackgroundAudio(audioRef, BACKGROUND_AUDIO.BONUS.VI);

    // When time reaches duration, either show side-puzzle or reveal prize if side already solved
    useEffect(() => {
        if (seconds >= chapterVIData.duration && !isCurrentlySolved) {
            if (sideSolved) {
                setIsCurrentlySolved(true);
            } else {
                setShowSidePuzzle(true);
            }
        }
    }, [seconds, isCurrentlySolved, sideSolved]);

    // When user solves side puzzle, persist and reveal prize
    useEffect(() => {
        if (sideSolved) {
            setSecureItem(localStorageKeys.chapterVISidePuzzleSolved as any, '1').catch(console.error);
            if (seconds >= chapterVIData.duration && !isCurrentlySolved) {
                setIsCurrentlySolved(true);
            }
        }
    }, [sideSolved]);

    useEffect(() => {
        const generated = Array.from({length: 20}).map(() => ({
            left: `${Math.random() * 100}%`,
            duration: `${8 + Math.random() * 5}s`,
            delay: `${Math.random() * 5}s`,
        }));
        setPetals(generated);

    }, []);

    const formatTime = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    };

    const progress = seconds / chapterVIData.duration;
    const messageIndex = Math.floor(progress * chapterVIData.msgs.length);
    const currentMessage = chapterVIData.msgs[Math.min(messageIndex, chapterVIData.msgs.length - 1)];

    // Hold-to-wait puzzle handlers
    const startHold = () => {
        if (sideSolved) return;
        setSideFeedback(null);
        // mark the accumulated value at start so we can compute elapsed during this hold
        accumulatedAtStartRef.current = accumulatedRef.current;
        setHolding(true);
        lastTickRef.current = performance.now();
        holdPressedAtRef.current = performance.now();
        if (holdIntervalRef.current) window.clearInterval(holdIntervalRef.current);
        holdIntervalRef.current = window.setInterval(() => {
            if (!lastTickRef.current) return;
            const now = performance.now();
            const delta = (now - lastTickRef.current) / 1000;
            lastTickRef.current = now;
            // add to accumulated seconds
            accumulatedRef.current = Math.min(accumulatedRef.current + delta, requiredHoldSeconds);
            const prog = Math.min(accumulatedRef.current / requiredHoldSeconds, 1);
            setHoldProgress(prog);
            if (accumulatedRef.current >= requiredHoldSeconds) {
                // solved
                if (holdIntervalRef.current) {
                    window.clearInterval(holdIntervalRef.current);
                    holdIntervalRef.current = null;
                }
                setHolding(false);
                setSideFeedback('You finally waited. The prize is revealed.');
                setSideSolved(true);
                setShowSidePuzzle(false);
            }
        }, 100);
    };

    const stopHold = () => {
        // ignore duplicate calls if we're not currently holding
        if (!holding) return;
        if (holdIntervalRef.current) {
            window.clearInterval(holdIntervalRef.current);
            holdIntervalRef.current = null;
        }
        // If we never started properly, just reset UI
        if (accumulatedAtStartRef.current === null) {
            setHolding(false);
            setHoldProgress(0);
            return;
        }

        // compute elapsed during this hold by checking accumulated seconds since start
        const started = accumulatedAtStartRef.current ?? 0;
        const elapsed = accumulatedRef.current - started;
        // use a per-press timestamp to show the actual time the user held this press
        const perHoldElapsed = holdPressedAtRef.current ? (performance.now() - holdPressedAtRef.current) / 1000 : elapsed;
        accumulatedAtStartRef.current = null;
        lastTickRef.current = null;
        setHolding(false);

        if (accumulatedRef.current >= requiredHoldSeconds) {
            // already handled in interval, but guard
            setSideFeedback('You finally waited. The prize is revealed.');
            setSideSolved(true);
            setShowSidePuzzle(false);
            // clear per-press refs
            accumulatedAtStartRef.current = null;
            holdPressedAtRef.current = null;
            return;
        }

        if (elapsed <= 0) {
            // very short/zero hold — use per-hold elapsed for message
            setSideFeedback(`You released immediately after ${perHoldElapsed.toFixed(1)}s. Try holding until the progress fills.`);
            return;
        }

        // Premature release: penalize progress and increase required time slightly to simulate "harder to be patient"
        setImpatienceCount((c) => c + 1);
        setRequiredHoldSeconds((prev) => Math.min(10, prev + 1));

        // regress accumulated time by 25% of the required seconds (not of progress) to scale with difficulty
        accumulatedRef.current = Math.max(0, accumulatedRef.current - requiredHoldSeconds * 0.25);
        const prog = Math.max(0, accumulatedRef.current / requiredHoldSeconds);
        setHoldProgress(prog);
        setSideFeedback(`You released early after ${perHoldElapsed.toFixed(1)}s. Progress regresses and patience becomes harder.`);
        holdPressedAtRef.current = null;
    };

    // Passive decay when not holding: gentle regression to encourage continuous patience
    useEffect(() => {
        if (!showSidePuzzle) return;
        if (holding) return;
        const decay = window.setInterval(() => {
            // decay a small amount of accumulated seconds
            accumulatedRef.current = Math.max(0, accumulatedRef.current - 0.15);
            const prog = Math.max(0, accumulatedRef.current / requiredHoldSeconds);
            setHoldProgress(prog);
        }, 400);
        return () => window.clearInterval(decay);
    }, [showSidePuzzle, holding, requiredHoldSeconds]);

    // cleanup intervals on unmount
    useEffect(() => {
        return () => {
            if (holdIntervalRef.current) window.clearInterval(holdIntervalRef.current);
        };
    }, []);

    return (
        <div className={`${styles.chapterVI} ${isCurrentlySolved ? 'solved' : ''}`}>
            <audio ref={audioRef} src={BACKGROUND_AUDIO.BONUS.VI} loop preload="auto" style={{display: 'none'}}/>
            <div className={styles.flowerBlackHole} aria-hidden></div>

            {petals.map((petal, i) => (
                <div
                    key={i}
                    className={styles.petal}
                    style={{
                        left: petal.left,
                        animationDuration: petal.duration,
                        animationDelay: petal.delay,
                    }}
                />
            ))}

            <div className={styles.messageBox} role="status" aria-live="polite">
                {showSidePuzzle && !sideSolved ? (
                    // ...replace typing puzzle with a hold-to-wait patience puzzle...
                    <div>
                        <div style={{fontWeight: 600, marginBottom: 8}}>Todays word of the day
                            is <strong>PATIENCE</strong></div>
                        <div style={{marginBottom: 8}}>
                            Demonstrate patience: press and hold the button below for {requiredHoldSeconds} seconds to
                            claim your prize.
                        </div>
                        <div style={{fontSize: '.8rem', opacity: 0.85, marginBottom: 8}}>
                            Current required hold: {requiredHoldSeconds}s — Impatience strikes: {impatienceCount}
                        </div>

                        <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                            <button
                                type="button"
                                onPointerDown={startHold}
                                onPointerUp={stopHold}
                                onPointerCancel={stopHold}
                                onPointerLeave={stopHold}
                                onTouchStart={startHold}
                                onTouchEnd={stopHold}
                                onTouchCancel={stopHold}
                                onKeyDown={(e) => {
                                    if (e.key === ' ' || e.key === 'Enter') {
                                        e.preventDefault();
                                        startHold();
                                    }
                                }}
                                onKeyUp={(e) => {
                                    if (e.key === ' ' || e.key === 'Enter') {
                                        e.preventDefault();
                                        stopHold();
                                    }
                                }}
                                aria-pressed={holding}
                                style={{padding: '10px 14px', fontWeight: 700, cursor: 'pointer', touchAction: 'none'}}
                            >
                                {holding ? 'Holding…' : 'Hold to wait'}
                            </button>

                            <div style={{flex: 1}} aria-hidden>
                                <div style={{
                                    height: 12,
                                    background: 'rgba(255,255,255,0.08)',
                                    borderRadius: 6,
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${Math.round(holdProgress * 100)}%`,
                                        height: '100%',
                                        background: 'linear-gradient(90deg,#8ee7ff,#7bffb2)'
                                    }}/>
                                </div>
                                <div style={{fontSize: '.8rem', opacity: 0.85, marginTop: 6}}>
                                    {Math.round(accumulatedRef.current * 10) / 10}/{requiredHoldSeconds}s
                                </div>
                            </div>
                        </div>

                        <div style={{display: 'flex', gap: 8, marginTop: 10}}>
                            <button type="button" onClick={() => {
                                setShowSidePuzzle(false);
                                setSideFeedback(null);
                                accumulatedRef.current = 0;
                                accumulatedAtStartRef.current = null;
                                holdPressedAtRef.current = null;
                                setHoldProgress(0);
                            }} style={{padding: '6px 10px'}}>Close
                            </button>
                        </div>

                        {sideFeedback && <div style={{marginTop: 8, opacity: 0.9}}>{sideFeedback}</div>}
                    </div>

                ) : isCurrentlySolved === null ? (
                    <div className="text-white font-mono">{chapter.loading}</div>
                ) : isCurrentlySolved ? (
                    <>
                        <div style={{fontStyle: 'normal', marginBottom: 8, fontWeight: 600}}>
                            {chapterVIData.solveText.title}
                        </div>
                        <div style={{fontSize: '.9rem', opacity: 0.85}}>
                            {chapterVIData.solveText.subtitle}
                        </div>
                    </>
                ) : (
                    <>
                        <div>{currentMessage}</div>
                        <div style={{marginTop: 8, fontSize: '.9rem', opacity: 0.8}}>
                            {formatTime(seconds)} endured.
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
