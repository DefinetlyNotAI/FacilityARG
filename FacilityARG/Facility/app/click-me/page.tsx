'use client';

import React, {useEffect, useRef, useState} from 'react';
import {SFX_AUDIO} from '@/audio';

export default function ClickMePage() {
    const [clickedActions, setClickedActions] = useState<Set<string>>(new Set());
    const [slowdownLevel, setSlowdownLevel] = useState(0);
    const [isCrashing, setIsCrashing] = useState(false);
    const [showCreepy, setShowCreepy] = useState(false);
    const [showStatic, setShowStatic] = useState(false);
    const [currentImage, setCurrentImage] = useState(1);
    const slowdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const crashTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const staticAudioRef = useRef<HTMLAudioElement | null>(null);

    const actions = [
        'apologize',
        'be_saved',
        'forgive',
        'forget',
        'be_pure'
    ];

    // Load clicked actions from localStorage on mount
    useEffect(() => {
        const clicked = new Set<string>();
        actions.forEach(action => {
            if (localStorage.getItem(`clicked_to_${action}`)) {
                clicked.add(action);
            }
        });
        setClickedActions(clicked);
    }, []);

    // Static effect: cycle images and play audio
    useEffect(() => {
        if (!showStatic) return;

        // Play static audio on loop
        staticAudioRef.current = new Audio(SFX_AUDIO.STATIC);
        staticAudioRef.current.loop = true;
        staticAudioRef.current.volume = 0.6;
        staticAudioRef.current.play().catch(console.warn);

        // Cycle images every 25ms
        const imageInterval = setInterval(() => {
            setCurrentImage(prev => (prev % 9) + 1);
        }, 25);

        // After 15 seconds, crash the tab
        const crashTimeout = setTimeout(() => {
            // Stop audio and intervals
            if (staticAudioRef.current) {
                staticAudioRef.current.pause();
                staticAudioRef.current = null;
            }
            clearInterval(imageInterval);

            // Crash the tab by creating an infinite loop or closing it
            try {
                window.close();
            } catch {
                // If window.close() doesn't work, create a crash
                // noinspection InfiniteLoopJS
                while (true) {
                    // Infinite loop to crash the tab
                }
            }
        }, 15000);

        return () => {
            if (staticAudioRef.current) {
                staticAudioRef.current.pause();
                staticAudioRef.current = null;
            }
            clearInterval(imageInterval);
            clearTimeout(crashTimeout);
        };
    }, [showStatic]);

    // Check completion status and apply slowdown
    useEffect(() => {
        const allClicked = actions.every(action => clickedActions.has(action));

        if (allClicked) {
            // All 5 clicked - trigger creepy behavior
            if (slowdownIntervalRef.current) {
                clearInterval(slowdownIntervalRef.current);
            }
            if (crashTimeoutRef.current) {
                clearTimeout(crashTimeoutRef.current);
            }
            setSlowdownLevel(0);
            setIsCrashing(false);

            setTimeout(() => {
                setShowCreepy(true);
            }, 500);
        } else if (clickedActions.size > 0) {
            // Some but not all clicked - start slowdown process
            startSlowdown();
        }

        return () => {
            if (slowdownIntervalRef.current) {
                clearInterval(slowdownIntervalRef.current);
            }
            if (crashTimeoutRef.current) {
                clearTimeout(crashTimeoutRef.current);
            }
        };
    }, [clickedActions]);

    // Apply slowdown to entire page by blocking execution
    useEffect(() => {
        if (slowdownLevel > 0) {
            const delay = slowdownLevel * 200;
            const start = Date.now();
            while (Date.now() - start < delay) {
                // Blocking loop to simulate slowdown
            }
        }
    }, [slowdownLevel]);

    const startSlowdown = () => {
        // Clear any existing intervals
        if (slowdownIntervalRef.current) {
            clearInterval(slowdownIntervalRef.current);
        }
        if (crashTimeoutRef.current) {
            clearTimeout(crashTimeoutRef.current);
        }

        // Gradually increase slowdown
        let level = 0;
        slowdownIntervalRef.current = setInterval(() => {
            level += 1;
            setSlowdownLevel(level);

            if (level >= 10) {
                // Trigger crash
                if (slowdownIntervalRef.current) {
                    clearInterval(slowdownIntervalRef.current);
                }
                crashTimeoutRef.current = setTimeout(() => {
                    setIsCrashing(true);
                }, 2000);
            }
        }, 3000);
    };

    const handleClick = (action: string) => {
        if (clickedActions.has(action)) return;

        localStorage.setItem(`clicked_to_${action}`, 'true');
        setClickedActions(prev => new Set([...prev, action]));

        // Trigger static effect immediately
        setShowStatic(true);
    };

    // Show static fullscreen effect
    if (showStatic) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                margin: 0,
                padding: 0,
                overflow: 'hidden',
                backgroundColor: 'black'
            }}>
                <img
                    src={`/static/moonlight/TIME/happy${currentImage}.png`}
                    alt=""
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                    }}
                />
            </div>
        );
    }

    if (isCrashing) {
        return (
            <div>
                <p>SYSTEM ERROR</p>
                <p>Incomplete salvation detected</p>
            </div>
        );
    }

    if (showCreepy) {
        return (
            <div>
                <p>PURIFIED</p>
                <br/>
                <p>You have clicked all that was asked.</p>
                <br/>
                <p>The debt is paid.</p>
                <br/>
                <p>You may leave now.</p>
                <br/>
                <p>praise be</p>
            </div>
        );
    }

    return (
        <div>
            <a
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    handleClick('apologize');
                }}
            >
                click to apologize
            </a>
            <br/>
            <a
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    handleClick('be_saved');
                }}
            >
                click to be saved
            </a>
            <br/>
            <a
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    handleClick('forgive');
                }}
            >
                click to forgive
            </a>
            <br/>
            <a
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    handleClick('forget');
                }}
            >
                click to forget
            </a>
            <br/>
            <a
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    handleClick('be_pure');
                }}
            >
                click to be pure
            </a>
        </div>
    );
}

