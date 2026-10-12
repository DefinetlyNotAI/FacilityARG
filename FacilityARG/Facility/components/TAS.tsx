'use client';

import React, {useEffect, useRef, useState} from 'react';
import {usePathname} from 'next/navigation';
import Cookies from 'js-cookie';
import {TAScript} from "@/lib/client/data/TAScript";
import {cookies, routes} from "@/lib/saveData";
import {TASProps} from '@/types';


// Page-specific hints for TAS (friendly sarcastic tone)
export function TAS({className = ''}: TASProps) {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(false);
    const [currentHint, setCurrentHint] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [isAFK, setIsAFK] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [afkStartedAt, setAfkStartedAt] = useState<number | null>(null);
    const [mutedStartedAt, setMutedStartedAt] = useState<number | null>(null);
    const [startTime] = useState(Date.now());
    const [isCorrupted, setIsCorrupted] = useState(false);
    const [lastSnarkyComment, setLastSnarkyComment] = useState(0);

    const afkTimeoutRef = useRef<NodeJS.Timeout>();
    const lastActivityRef = useRef(Date.now());
    const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
    const speechQueueRef = useRef<string[]>([]);
    const isSpeakingRef = useRef(false);
    const backgroundAudioRef = useRef<HTMLAudioElement[]>([]);
    const originalVolumesRef = useRef<Map<HTMLAudioElement, number>>(new Map());

    // Check if TAS should exist and if he should be corrupted
    useEffect(() => {
        const killTasSeen = Cookies.get(cookies.killTAS);

        if (
            killTasSeen ||
            pathname === routes.smileking ||
            pathname === routes.smilekingAuth ||
            pathname === routes.moonlight ||
            pathname === routes.notFound ||
            pathname === routes.tree98 ||
            pathname === routes.cheater ||
            pathname === routes.bonus.locked ||
            pathname === routes.bonus.noTime ||
            pathname === routes.bonus.notYet ||
            pathname === routes.bonus.main ||
            pathname === routes.saveFile ||
            pathname === routes.whiteroom ||
            pathname === routes.wordOfTheDay
        ) {
            setIsVisible(false);
            return;
        }

        // Check if we're in corrupted areas
        const isInCorruptedArea = pathname === routes.scroll || pathname === routes.h0m3;
        setIsCorrupted(isInCorruptedArea);
        setIsVisible(true);
    }, [pathname]);

    // Monitor all audio elements for dimming
    useEffect(() => {
        const updateAudioElements = () => {
            const audioElements = document.querySelectorAll('audio');
            backgroundAudioRef.current = Array.from(audioElements);

            // Store original volumes
            backgroundAudioRef.current.forEach(audio => {
                if (!originalVolumesRef.current.has(audio)) {
                    originalVolumesRef.current.set(audio, audio.volume);
                }
            });
        };

        updateAudioElements();

        // Update audio list when DOM changes
        const observer = new MutationObserver(updateAudioElements);
        observer.observe(document.body, {childList: true, subtree: true});

        return () => observer.disconnect();
    }, [pathname]);

    // Initialize page-specific hints
    useEffect(() => {
        if (!isVisible) return;

        const hints = TAScript.pageHints[pathname] || TAScript.unknownPageHints

        setCurrentHint(hints[0]);
    }, [pathname, isVisible]);

    const processNextSpeech = () => {
        if (speechQueueRef.current.length === 0) {
            isSpeakingRef.current = false;

            // Restore ALL audio volumes on the page
            document.querySelectorAll('audio').forEach(audio => {
                audio.volume = originalVolumesRef.current.get(audio) || 1;
            });

            return;
        }

        const nextText = speechQueueRef.current.shift()!;
        isSpeakingRef.current = true;

        // Dim ALL <audio> elements on the page to 20%
        requestAnimationFrame(() => {
            document.querySelectorAll('audio').forEach(audio => {
                if (!audio.paused && !audio.muted && audio.volume > 0) {
                    const originalVolume = originalVolumesRef.current.get(audio) || audio.volume;
                    originalVolumesRef.current.set(audio, originalVolume);
                    audio.volume = originalVolume * 0.2;
                }
            });
        });

        // Cancel existing speech if any
        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(nextText);
        utterance.rate = 0.9;
        utterance.pitch = 0.8;
        utterance.volume = 1;

        // Select a friendly voice
        const voices = speechSynthesis.getVoices();
        const friendlyVoice = voices.find(voice =>
            voice.name.includes('Google') ||
            voice.name.includes('Alex') ||
            voice.name.includes('Daniel') ||
            voice.lang.includes('en')
        ) || voices[0];

        if (friendlyVoice) {
            utterance.voice = friendlyVoice;
        }

        // When speech ends, restore audio and proceed
        utterance.onend = () => {
            setTimeout(processNextSpeech, 500);
        };

        // For debugging: speech start, error
        utterance.onerror = e => {
            // Ignore interruption errors (code 5 or 'interrupted'), log others
            if (e.error !== 'interrupted' && e.error !== 'canceled') {
                console.error("Speech error", e);
            }
        };
        speechRef.current = utterance;
        speechSynthesis.speak(utterance);
    };

    const queueSpeech = (text: string, priority: 'normal' | 'high' = 'normal') => {
        if (!isVisible || isCorrupted) return;

        const timeMinutes = Math.floor((Date.now() - startTime) / 60000);
        const finalText = text.replace('[TIME]', timeMinutes.toString());

        if (priority === 'high') {
            speechSynthesis.cancel();
            speechQueueRef.current = [finalText];
            isSpeakingRef.current = false;
            processNextSpeech();
        } else {
            // Normal priority: just enqueue
            speechQueueRef.current.push(finalText);

            // Only start if nothing is speaking
            if (!isSpeakingRef.current) {
                processNextSpeech();
            }
        }
    };

    // AFK detection (disabled if TAS is dead, reduced frequency)
    useEffect(() => {
        if (!isVisible || isCorrupted) return;

        const resetAFKTimer = () => {
            lastActivityRef.current = Date.now();
            setIsAFK(false);
            setAfkStartedAt(null);

            if (afkTimeoutRef.current) {
                clearTimeout(afkTimeoutRef.current);
            }

            afkTimeoutRef.current = setTimeout(() => {
                setIsAFK(true);
                setAfkStartedAt(Date.now());
                const timeSinceLastSnarky = Date.now() - lastSnarkyComment;
                if (timeSinceLastSnarky > 120000 && Math.random() < 0.3) {
                    // Always normal priority for this snarky remark
                    queueSpeech("AFK for a bit? Time keeps ticking here, but don't worry - I'll wait for you.", 'normal');
                    setLastSnarkyComment(Date.now());
                }
            }, 120000);
        };

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(event => {
            document.addEventListener(event, resetAFKTimer, true);
        });

        resetAFKTimer(); // Initialize timer

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, resetAFKTimer, true);
            });
            if (afkTimeoutRef.current) {
                clearTimeout(afkTimeoutRef.current);
            }
        };
    }, [isVisible, isCorrupted, lastSnarkyComment, afkStartedAt]);

    // Audio context detection for muting (disabled if TAS is dead)
    useEffect(() => {
        if (!isVisible || isCorrupted) return;

        const checkAudioContext = () => {
            // Check if any audio elements are muted
            const audioElements = document.querySelectorAll('audio');
            const anyMuted = Array.from(audioElements).some(audio => audio.muted || audio.volume === 0);

            if (anyMuted && !isMuted) {
                setIsMuted(true);
                setMutedStartedAt(Date.now());
                const timeSinceLastSnarky = Date.now() - lastSnarkyComment;
                if (timeSinceLastSnarky > 120000) {
                    setTimeout(() => {
                        // Always normal priority for this snarky remark
                        showAlert("Muted the audio? Smart move, though you might miss some important stuff.");
                        setLastSnarkyComment(Date.now());
                    }, 1000);
                }
            } else if (!anyMuted && isMuted) {
                setIsMuted(false);
                setMutedStartedAt(null);
            }
        };

        const interval = setInterval(checkAudioContext, 5000); // Check every 5 seconds
        return () => clearInterval(interval);
    }, [isVisible, isMuted, isCorrupted, lastSnarkyComment, mutedStartedAt]);

    const showAlert = (message: string) => {
        alert(`TAS: ${message}`);
    };

    const handleTASClick = () => {
        if (!isVisible) return;

        setIsExpanded(!isExpanded);

        if (!isExpanded) {
            // Speak the current hint with high priority
            const hints = TAScript.pageHints[pathname] || ["No specific guidance available for this area, but we'll figure it out!"];
            const randomHint = hints[Math.floor(Math.random() * hints.length)];
            setCurrentHint(randomHint);

            // Always high priority for hints
            queueSpeech(randomHint, 'high');
        }
    };

    const getRandomSnarkyComment = () => {
        const comments = [...TAScript.snarkyComments];
        return comments[Math.floor(Math.random() * comments.length)];
    };

    if (!isVisible) return null;

    return (
        <>
            {/* TAS Button */}
            <div
                className={`fixed bottom-4 left-4 z-50 ${className}`}
                style={{
                    fontFamily: "'Courier New', monospace",
                }}
            >
                <div
                    onClick={handleTASClick}
                    className={`
                        bg-black border-2 rounded-lg p-3 cursor-pointer
                        transition-all duration-300 hover:bg-green-900/20
                        ${isExpanded ? 'w-80' : 'w-16 h-16'}
                        ${isCorrupted ?
                        'border-red-500 animate-pulse bg-red-900/20 hover:bg-red-800/30' :
                        `border-green-400 hover:border-green-300 
                             ${isAFK ? 'animate-bounce border-blue-400' : ''}`
                    }
                    `}
                    style={{
                        boxShadow: isCorrupted ?
                            '0 0 20px rgba(255, 0, 0, 0.5)' :
                            '0 0 20px rgba(0, 255, 0, 0.3)',
                        backdropFilter: 'blur(10px)',
                        filter: isCorrupted ? 'contrast(1.5) brightness(0.7) hue-rotate(180deg)' : 'none'
                    }}
                >
                    {!isExpanded ? (
                        <div className="flex items-center justify-center h-full">
                            <span className={`text-xl font-bold ${isCorrupted ? 'text-red-400' : 'text-green-400'}`}>
                                {isCorrupted ? '█AS' : 'TAS'}
                            </span>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span
                                    className={`font-bold text-lg ${isCorrupted ? 'text-red-400' : 'text-green-400'}`}>
                                    {isCorrupted ? '█AS - ER█OR' : 'TAS - Your Buddy'}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsExpanded(false);
                                    }}
                                    className={`hover:text-green-300 text-xl ${isCorrupted ? 'text-red-400' : 'text-green-400'}`}
                                >
                                    ×
                                </button>
                            </div>

                            <div
                                className={`text-sm leading-relaxed ${isCorrupted ? 'text-red-300' : 'text-green-300'}`}>
                                {isCorrupted ? '█████ ████ ███ ████████' : currentHint}
                            </div>

                            {!isCorrupted && (
                                <div className="flex gap-2 text-xs">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const hints = TAScript.pageHints[pathname] || ["No hints available, but hey - we're exploring together!"];
                                            const randomHint = hints[Math.floor(Math.random() * hints.length)];
                                            setCurrentHint(randomHint);
                                            queueSpeech(randomHint, 'high');
                                        }}
                                        className="bg-green-700 hover:bg-green-600 text-white px-2 py-1 rounded transition-colors"
                                    >
                                        New Tip
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();

                                            const comment = getRandomSnarkyComment();
                                            // Check if comment is one of the three special ones
                                            if (
                                                comment.startsWith("Mouse left the site?") ||
                                                comment.startsWith("Muted the audio?") ||
                                                comment.startsWith("AFK for a bit?")
                                            ) {
                                                queueSpeech(comment, 'normal');
                                            } else {
                                                queueSpeech(comment, 'high');
                                            }

                                        }}
                                        className="bg-blue-700 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors"
                                    >
                                        Chat
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.7;
                    }
                }

                @keyframes bounce {
                    0%, 20%, 53%, 80%, 100% {
                        transform: translateY(0);
                    }
                    40%, 43% {
                        transform: translateY(-10px);
                    }
                    70% {
                        transform: translateY(-5px);
                    }
                    90% {
                        transform: translateY(-2px);
                    }
                }
            `}</style>
        </>
    );
}
