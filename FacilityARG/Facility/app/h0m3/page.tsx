'use client';

import React, {useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import Cookies from 'js-cookie';
import {BACKGROUND_AUDIO, playSafeSFX, SFX_AUDIO, usePlayBackgroundAudio} from "@/audio";
import {h0m3} from '@/lib/client/data/h0m3';
import {getOrCreateSessionId, signCookie} from "@/lib/client/utils";
import {cookies, routes} from "@/lib/saveData";

const letterReplace = (text: string) =>
    text
        .replace(/o/gi, '0')
        .replace(/a/gi, '@')
        .replace(/i/gi, '1')
        .replace(/e/gi, '3')
        .replace(/s/gi, '$')
        .replace(/\bI\b/gi, 'we')
        .replace(/\bmy\b/gi, 'our')
        .replace(/\bme\b/gi, 'us')
        .replace(/\bmine\b/gi, 'ours')
        .replace(/\bam\b/gi, 'are')
        .replace(/\byou\b/gi, 'we')
        .replace(/\byour\b/gi, 'our')
        .replace(/\byours\b/gi, 'ours');

export default function H0m3() {
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
    const [sessionID, setSessionID] = useState<string>('SID-UNKNOWN');

    const [mode, setMode] = useState<'initial' | 'glitch'>('initial');
    const [scrollCount, setScrollCount] = useState(0);
    const [currentTime, setCurrentTime] = useState<string>('');
    const [mounted, setMounted] = useState(false);
    const [isInverted, setIsInverted] = useState(false);

    // Corruption states
    const [corruptionLevel, setCorruptionLevel] = useState(0);
    const [brokenElements, setBrokenElements] = useState<string[]>([]);
    const [glitchText, setGlitchText] = useState<string>('');

    // Refs for each scroll section so we can scroll programmatically
    const sectionRefs = useRef<Array<HTMLElement | null>>([]);

    useEffect(() => {
        setSessionID(getOrCreateSessionId())
    }, []);

    // Handle mounting and time updates
    useEffect(() => {
        setMounted(true);
        const updateTime = () => {
            setCurrentTime(new Date().toLocaleString());
        };
        updateTime();
        const timeInterval = setInterval(updateTime, 1000);

        return () => {
            clearInterval(timeInterval);
        };
    }, []);

    // Initialize background audio
    usePlayBackgroundAudio(ttsAudioRef, BACKGROUND_AUDIO.N404)

    // Redirect and cookie check logic
    useEffect(() => {
        if (!mounted) return;

        const corrupt = Cookies.get(cookies.corrupt);
        const corrupting = Cookies.get(cookies.corrupting);
        const noCorrupt = Cookies.get(cookies.noCorruption);

        if ((!corrupt && !corrupting) || noCorrupt) {
            router.replace(routes.home);
            return;
        }

        if (corrupting) {
            setMode('glitch');

            // Initialize TTS audio
            const ttsAudio = new Audio();
            ttsAudio.loop = true;
            ttsAudio.volume = 0.4;
            ttsAudioRef.current = ttsAudio;

            // Use TTS
            const speakLoop = () => {
                const randomIndex = Math.floor(Math.random() * h0m3.ttsMessages.length);
                const utterance = new SpeechSynthesisUtterance(h0m3.ttsMessages[randomIndex]);
                utterance.rate = 0.5;
                utterance.pitch = 0.3;
                utterance.volume = 0.8;
                speechSynthesis.speak(utterance);
                utterance.onend = () => {
                    setTimeout(speakLoop, 5000); // 5 second pause between repetitions
                };
            };

            speakLoop();

            // Color inversion after 30 seconds
            const inversionTimeout = setTimeout(() => {
                setIsInverted(true);
            }, 30000);

            // Static flash and smiley faces every minute
            const staticInterval = setInterval(() => {
                if (!containerRef.current) return;

                // Flash effect
                containerRef.current.style.background = 'white';
                setTimeout(() => {
                    if (containerRef.current) {
                        containerRef.current.style.background = 'black';
                    }
                }, 200);

                // Show smiley faces cycling
                let smileyIndex = 1;
                const smileyOverlay = document.createElement('div');
                smileyOverlay.style.position = 'fixed';
                smileyOverlay.style.top = '20px';
                smileyOverlay.style.left = '50%';
                smileyOverlay.style.transform = 'translateX(-50%)';
                smileyOverlay.style.zIndex = '10001';
                smileyOverlay.style.pointerEvents = 'none';
                smileyOverlay.style.background = 'transparent';
                smileyOverlay.style.display = 'flex';
                smileyOverlay.style.justifyContent = 'center';
                smileyOverlay.style.alignItems = 'center';
                smileyOverlay.style.height = '120px';
                smileyOverlay.style.width = '120px';

                containerRef.current.appendChild(smileyOverlay);

                const cycleSmileys = () => {
                    if (smileyIndex > 9) {
                        if (containerRef.current) {
                            containerRef.current.removeChild(smileyOverlay);
                        }
                        return;
                    }
                    smileyOverlay.innerHTML = `<img src="/static/moonlight/TIME/happy${smileyIndex}.png" style="position:fixed;top:0;left:0;width:100vw;height:100vh;object-fit:cover;z-index:99999;pointer-events:none;" alt="SMILE"/>`;
                    smileyIndex++;
                    setTimeout(cycleSmileys, 2000 / 9);
                };
                cycleSmileys();

                // Play static SFX
                playSafeSFX(ttsAudioRef, SFX_AUDIO.STATIC, true);

                // TTS the creepy message
                const creepyUtterance = new SpeechSynthesisUtterance(h0m3.ttsMessageID(sessionID));
                creepyUtterance.rate = 0.4;
                creepyUtterance.pitch = 0.2;
                creepyUtterance.volume = 0.9;

                // Pause main TTS, speak creepy message, then resume
                speechSynthesis.cancel();
                speechSynthesis.speak(creepyUtterance);

                creepyUtterance.onend = () => {
                    // Resume the main TTS loop
                    setTimeout(speakLoop, 1000);
                };
            }, 60_000);

            return () => {
                clearInterval(staticInterval);
                clearTimeout(inversionTimeout);
                speechSynthesis.cancel();
                if (ttsAudioRef.current) {
                    ttsAudioRef.current.pause();
                    ttsAudioRef.current.src = '';
                }
            };
        }
    }, [router, mounted]);

    // Progressive corruption scroll handler
    useEffect(() => {
        if (!mounted || mode !== 'glitch') return;

        const onScroll = () => {
            const scrollTop = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            // Check if user reached bottom
            if (scrollTop + windowHeight >= documentHeight && scrollCount <= 9) {
                const newCount = scrollCount + 1;
                setScrollCount(newCount);
                setCorruptionLevel(newCount);

                // Add progressive corruption
                addCorruption(newCount);

                // Seamlessly scroll back to top to create infinite loop effect
                setTimeout(() => {
                    window.scrollTo({top: 0, behavior: 'auto'});
                }, 500);
            }
        };

        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, [mounted, mode, scrollCount]);

    // Add progressive corruption effects
    const addCorruption = (level: number) => {
        const corruptions = [
            () => setBrokenElements(prev => [...prev, 'header-broken']),
            () => setBrokenElements(prev => [...prev, 'text-scrambled']),
            () => setBrokenElements(prev => [...prev, 'colors-inverted']),
            () => setBrokenElements(prev => [...prev, 'layout-broken']),
            () => setBrokenElements(prev => [...prev, 'fonts-corrupted']),
            () => setBrokenElements(prev => [...prev, 'complete-chaos']),
            () => setBrokenElements(prev => [...prev, 'final-breakdown'])
        ];

        if (level <= corruptions.length) {
            corruptions[level - 1]();
        }

        // Add random glitch text
        setGlitchText(h0m3.glitchMessages[Math.floor(Math.random() * h0m3.glitchMessages.length)]);

        // Break console
        if (level >= 3) {
            h0m3.corruptionConsoleMessages.forEach(fn => fn(level));
        }
    };

    // Helper to handle Next button clicks that advance to the next scroll section
    const handleNext = (index: number) => {
        const nextIndex = index + 1;
        // Increase the scrollCount/corruption level safely
        setScrollCount(prev => {
            const newCount = Math.min(prev + 1, 9);
            setCorruptionLevel(newCount);
            addCorruption(newCount);
            return newCount;
        });

        if (nextIndex < sectionRefs.current.length) {
            sectionRefs.current[nextIndex]?.scrollIntoView({behavior: 'smooth'});
        } else {
            // Last section: scroll to top and set final corruption if not already
            window.scrollTo({top: 0, behavior: 'smooth'});
            setTimeout(() => {
                setScrollCount(9);
                setCorruptionLevel(9);
                addCorruption(9);
            }, 600);
        }
    };

    if (!mounted) {
        return (
            <div style={{backgroundColor: 'black', height: '100vh', width: '100vw'}}>
                <div style={{color: 'green', textAlign: 'center', paddingTop: '50vh', fontFamily: 'monospace'}}>
                    L0@D1NG...
                </div>
            </div>
        );
    }

    // Blank page with hidden button
    if (mode === 'initial') {
        return (
            <div style={{
                backgroundColor: 'black',
                height: '100vh',
                width: '100vw',
                position: 'relative',
                cursor: 'crosshair'
            }}>
                <button
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '100px',
                        height: '100px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        opacity: 0,
                        fontSize: 0
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.1';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '0';
                        e.currentTarget.style.background = 'transparent';
                    }}
                    onClick={async () => {
                        try {
                            await signCookie('corrupting=true');
                            // Force a page reload to trigger the corrupting mode
                            window.location.reload();
                        } catch (error) {
                            console.error('Failed to set corrupting cookie:', error);
                            // Fallback: try to navigate directly
                            setMode('glitch');
                        }
                    }}
                    aria-label="Hidden corrupt button"
                >
                    :)
                </button>
            </div>
        );
    }

    // Glitch mode - render corrupted Home
    return (
        <>
            <audio
                ref={ttsAudioRef}
                src={BACKGROUND_AUDIO.H0M3}
                loop={true}
                preload="auto"
                style={{display: "none"}}/>
            <div
                ref={containerRef}
                style={{
                    filter: `${brokenElements.includes('colors-inverted') || isInverted ? 'invert(1) hue-rotate(180deg)' : ''}`,
                    transition: 'filter 0.3s ease',
                    backgroundColor: 'black',
                    minHeight: 'auto', // switched to auto and rely on sections for height
                    color: brokenElements.includes('colors-inverted') || isInverted ? '#ff0000' : '#00ff00',
                    fontFamily: brokenElements.includes('fonts-corrupted') ? 'Impact, Arial Black, serif' : 'monospace',
                    transform: brokenElements.includes('layout-broken') ? 'skew(-2deg, 1deg)' : 'none',
                    animation: brokenElements.includes('complete-chaos') ? 'chaos 0.1s infinite' : 'none',
                    overflowX: 'hidden', // prevent horizontal offscreen content
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word'
                }}
                className={`
                ${brokenElements.includes('header-broken') ? 'header-broken' : ''}
                ${brokenElements.includes('text-scrambled') ? 'text-scrambled' : ''}
                ${brokenElements.includes('final-breakdown') ? 'final-breakdown' : ''}
            `}
            >
                {/* Corruption Error Overlay */}
                {corruptionLevel > 0 && (
                    <div style={{
                        position: 'fixed',
                        top: '10px',
                        right: '10px',
                        background: 'red',
                        color: 'white',
                        padding: '10px',
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        zIndex: 9999,
                        animation: 'blink 0.5s infinite'
                    }}>
                        CORRUPTION: {corruptionLevel}/9<br/>
                        {glitchText}
                    </div>
                )}

                {/* Scrolling Classification Banner */}
                <div style={{
                    background: brokenElements.includes('header-broken') ? 'linear-gradient(45deg, #ff0000, #00ff00, #0000ff)' : '#dc2626',
                    color: 'white',
                    fontFamily: 'monospace',
                    fontSize: brokenElements.includes('fonts-corrupted') ? '2rem' : '0.875rem',
                    fontWeight: 'bold',
                    height: brokenElements.includes('layout-broken') ? '80px' : '40px',
                    overflow: 'hidden',
                    position: 'relative',
                    borderBottom: '2px solid #b91c1c',
                    transform: brokenElements.includes('header-broken') ? 'rotate(1deg)' : 'none'
                }}>
                    <div style={{
                        display: 'flex',
                        whiteSpace: 'nowrap',
                        animation: brokenElements.includes('text-scrambled') ? 'scroll-broken 5s linear infinite' : 'scroll-left 30s linear infinite',
                        lineHeight: brokenElements.includes('layout-broken') ? '80px' : '40px'
                    }}>
                        <span style={{paddingRight: '100px'}}>
                            {letterReplace(
                                brokenElements.includes('text-scrambled')
                                    ? "T0P $3CR3T//3RR0R//??? - F@C1L1TY 05-B - PR0J3CT V3$$3L - @UTH0R1Z3D P3R$0NN3L 0NLY"
                                    : "T0P $3CR3T//SC1//??? - F@C1L1TY 05-B - PR0J3CT V3$$3L - @UTH0R1Z3D P3R$0NN3L 0NLY"
                            )}
                        </span>
                    </div>
                </div>

                {/* Main Header */}
                <header style={{
                    background: brokenElements.includes('colors-inverted') || isInverted ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                    borderBottom: '1px solid rgba(0, 255, 0, 0.3)',
                    backdropFilter: 'blur(10px)',
                    padding: '1.5rem 0',
                    transform: brokenElements.includes('layout-broken') ? 'translateX(-20px)' : 'none'
                }}>
                    <div style={{maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem'}}>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '2rem'}}>
                                <div>
                                    <div style={{
                                        fontSize: brokenElements.includes('fonts-corrupted') ? '4rem' : '2.5rem',
                                        fontWeight: 'bold',
                                        color: brokenElements.includes('complete-chaos') ? '#ff00ff' : '#00ff00',
                                        textShadow: brokenElements.includes('complete-chaos') ? '5px 5px 0px #ff0000' : 'none'
                                    }}>
                                        {letterReplace(brokenElements.includes('text-scrambled') ? "F@C1L1TY 05-B" : "FACILITY 05-B")}
                                    </div>
                                    <div style={{fontSize: '0.875rem', color: '#666'}}>
                                        {letterReplace(brokenElements.includes('text-scrambled') ? "N3UR@L 1NT3RF@C3 R3$3@RCH C0MPL3X" : "NEURAL INTERFACE RESEARCH COMPLEX")}
                                    </div>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.5rem',
                                    background: brokenElements.includes('colors-inverted') || isInverted ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 255, 0, 0.1)',
                                    color: brokenElements.includes('colors-inverted') || isInverted ? '#ff0000' : '#10b981'
                                }}>
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        background: 'currentColor',
                                        animation: brokenElements.includes('complete-chaos') ? 'chaos-pulse 0.1s infinite' : 'pulse 2s infinite'
                                    }}></div>
                                    <span>{letterReplace(brokenElements.includes('text-scrambled') ? "M0N1T0R1NG" : "MONITORING")}</span>
                                </div>
                            </div>
                            <div style={{
                                transform: brokenElements.includes('layout-broken') ? 'rotate(-5deg)' : 'none'
                            }}>
                                <div style={{
                                    color: brokenElements.includes('complete-chaos') ? '#ff00ff' : '#00ff00',
                                    fontSize: brokenElements.includes('fonts-corrupted') ? '2rem' : '1.25rem',
                                    fontFamily: brokenElements.includes('fonts-corrupted') ? 'Impact' : 'inherit'
                                }}>
                                    {brokenElements.includes('text-scrambled') ? '██:██:██' : currentTime}
                                </div>
                                <div style={{fontSize: '0.75rem', color: '#666'}}>
                                    {letterReplace(brokenElements.includes('text-scrambled') ? "F@C1L1TY L0C@L T1M3" : "FACILITY LOCAL TIME")}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content - Duplicated multiple times for seamless scrolling */}
                {[...Array(5)].map((_, index) => (
                    <main
                        key={index}
                        ref={el => {
                            sectionRefs.current[index] = el as HTMLElement | null;
                        }}
                        style={{
                            padding: '2rem 0',
                            minHeight: '100vh'
                        }} // make each section viewport tall so Next scroll is predictable
                    >
                        <div style={{maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem'}}>
                            {/* Primary Terminal */}
                            <div style={{
                                background: brokenElements.includes('colors-inverted') || isInverted ?
                                    'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(245, 245, 245, 0.9) 100%)' :
                                    'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(10, 10, 10, 0.9) 100%)',
                                border: `1px solid ${brokenElements.includes('colors-inverted') || isInverted ? 'rgba(255, 0, 0, 0.4)' : 'rgba(0, 255, 0, 0.4)'}`,
                                borderRadius: brokenElements.includes('layout-broken') ? '50px' : '12px',
                                padding: '1.5rem',
                                marginBottom: '2rem',
                                transform: brokenElements.includes('layout-broken') ? `rotate(${index * 2}deg)` : 'none'
                            }}>
                                <div style={{
                                    marginBottom: '1.5rem',
                                    borderBottom: '1px solid rgba(0, 255, 0, 0.2)',
                                    paddingBottom: '1rem',
                                    transform: brokenElements.includes('complete-chaos') ? 'scaleX(-1)' : 'none'
                                }}>
                                    <h2 style={{
                                        fontSize: brokenElements.includes('fonts-corrupted') ? '2rem' : '1.125rem',
                                        fontWeight: '700',
                                        color: brokenElements.includes('complete-chaos') ? '#ff0000' : '#10b981',
                                        marginBottom: '0.25rem',
                                        fontFamily: brokenElements.includes('fonts-corrupted') ? 'Impact' : 'inherit'
                                    }}>
                                        {letterReplace(brokenElements.includes('text-scrambled') ? "N3UR@L 1NT3RF@C3 T3RM1N@L" : "NEURAL INTERFACE TERMINAL")}
                                    </h2>
                                    <div style={{fontSize: '0.75rem', color: '#6b7280'}}>
                                        {letterReplace(brokenElements.includes('text-scrambled') ? "Pr0j3ct V3$$3L • $ubj3ct 31525 • Cl3@r@nc3 C0$M1C" : "Project VESSEL • Subject 31525 • Clearance COSMIC")}
                                    </div>
                                </div>

                                {/* Terminal Content with corruption */}
                                <div style={{
                                    background: 'rgba(0, 0, 0, 0.6)',
                                    border: '1px solid rgba(0, 255, 0, 0.3)',
                                    borderRadius: '8px',
                                    marginBottom: '1.5rem',
                                    overflow: 'hidden',
                                    transform: brokenElements.includes('layout-broken') ? 'skew(5deg)' : 'none'
                                }}>
                                    <div style={{
                                        background: 'rgba(0, 255, 0, 0.1)',
                                        padding: '0.75rem 1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        borderBottom: '1px solid rgba(0, 255, 0, 0.2)'
                                    }}>
                                        <div style={{display: 'flex', gap: '0.5rem'}}>
                                            <div style={{
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '50%',
                                                background: brokenElements.includes('complete-chaos') ? '#00ff00' : '#ef4444'
                                            }}></div>
                                            <div style={{
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '50%',
                                                background: brokenElements.includes('complete-chaos') ? '#ff0000' : '#f59e0b'
                                            }}></div>
                                            <div style={{
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '50%',
                                                background: brokenElements.includes('complete-chaos') ? '#0000ff' : '#10b981'
                                            }}></div>
                                        </div>
                                        <span style={{fontSize: '0.75rem', color: '#6b7280'}}>
                                            {letterReplace(brokenElements.includes('text-scrambled') ? "$3CUR3 N3UR@L L1NK" : "SECURE NEURAL LINK")}
                                        </span>
                                    </div>

                                    <div style={{padding: '1rem', fontSize: '0.875rem', lineHeight: '1.6'}}>
                                        <div style={{
                                            marginBottom: '0.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <span style={{color: '#10b981', fontWeight: '600', minWidth: '80px'}}>
                                                {letterReplace(brokenElements.includes('text-scrambled') ? "F@C1L1TY:" : "FACILITY:")}
                                            </span>
                                            {letterReplace(brokenElements.includes('text-scrambled') ? "N3UR@L 1NT3RF@C3 R3$3@RCH C0MPL3X 05-B" : "Neural Interface Research Complex 05-B")}
                                        </div>
                                        <div style={{
                                            marginBottom: '0.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <span style={{color: '#10b981', fontWeight: '600', minWidth: '80px'}}>
                                                {letterReplace(brokenElements.includes('text-scrambled') ? "PR0J3CT:" : "PROJECT:")}
                                            </span>
                                            {letterReplace(brokenElements.includes('text-scrambled') ? "V3$$3L - C0n$c10u$n3$$ Tr@n$f3r Pr0t0c0l" : "VESSEL - Consciousness Transfer Protocol")}
                                        </div>
                                        <div style={{
                                            marginBottom: '0.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <span style={{color: '#10b981', fontWeight: '600', minWidth: '80px'}}>
                                                {letterReplace(brokenElements.includes('text-scrambled') ? "$UBJ3CT:" : "SUBJECT:")}
                                            </span>
                                            {letterReplace(brokenElements.includes('text-scrambled') ? "31525 - N3UR@L c0mp@t1b1l1ty: 97.3%" : "31525 - Neural compatibility: 97.3%")}
                                        </div>
                                        <div style={{
                                            marginBottom: '0.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <span style={{color: '#10b981', fontWeight: '600', minWidth: '80px'}}>
                                                {letterReplace(brokenElements.includes('text-scrambled') ? "$T@TU$:" : "STATUS:")}
                                            </span>
                                            {letterReplace(brokenElements.includes('text-scrambled') ? "Tr@n$f3r $3qu3nc3 1n1t1@t3d" : "Transfer sequence initiated")}
                                        </div>
                                        <div style={{
                                            marginBottom: '0.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <span style={{color: '#10b981', fontWeight: '600', minWidth: '80px'}}>
                                                {letterReplace(brokenElements.includes('text-scrambled') ? "D@T@:" : "DATA:")}
                                            </span>
                                            <span style={{
                                                color: brokenElements.includes('complete-chaos') ? '#ff00ff' : '#ef4444',
                                                background: 'rgba(255, 0, 0, 0.1)',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '4px',
                                                fontFamily: brokenElements.includes('fonts-corrupted') ? 'Impact' : 'inherit'
                                            }}>
                                                {h0m3.binaryCorruptText}
                                            </span>
                                        </div>
                                        <div style={{
                                            marginBottom: '0.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            color: '#f59e0b'
                                        }}>
                                            <span style={{color: '#10b981', fontWeight: '600', minWidth: '80px'}}>
                                                {letterReplace(brokenElements.includes('text-scrambled') ? "W@RN1NG:" : "WARNING:")}
                                            </span>
                                            <span
                                                style={{animation: brokenElements.includes('complete-chaos') ? 'chaos 0.1s infinite' : 'pulse 1.5s infinite'}}>
                                                {letterReplace(brokenElements.includes('text-scrambled') ? "T3mp0r@l d1$pl@c3m3nt d3t3ct3d 1n T3$t Ch@mb3r 3" : "Temporal displacement detected in Test Chamber 3")}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                                    <div style={{
                                        background: 'rgba(0, 0, 0, 0.4)',
                                        border: '1px solid rgba(0, 255, 0, 0.2)',
                                        borderRadius: '8px',
                                        padding: '1rem',
                                        textAlign: 'center',
                                        transform: brokenElements.includes('layout-broken') ? 'rotate(-10deg)' : 'none'
                                    }}>
                                        <div style={{fontSize: '0.75rem', color: '#10b981', marginBottom: '0.5rem'}}>
                                            {letterReplace(brokenElements.includes('text-scrambled') ? "C0N$C10U$N3$$ T1M3R" : "CONSCIOUSNESS TIMER")}
                                        </div>
                                        <div style={{
                                            fontSize: brokenElements.includes('fonts-corrupted') ? '4rem' : '2rem',
                                            fontWeight: '700',
                                            color: brokenElements.includes('complete-chaos') ? '#ff00ff' : '#ffffff',
                                            marginBottom: '0.25rem',
                                            fontFamily: brokenElements.includes('fonts-corrupted') ? 'Impact' : 'inherit'
                                        }}>
                                            {brokenElements.includes('text-scrambled') ? '∞∞∞' : '∞'}
                                        </div>
                                        <div style={{fontSize: '0.625rem', color: '#6b7280'}}>
                                            {letterReplace(brokenElements.includes('text-scrambled') ? "T1m3 D1$$0lv3d" : "Time Dissolved")}
                                        </div>
                                    </div>
                                    <div style={{
                                        background: 'rgba(0, 0, 0, 0.4)',
                                        border: '1px solid rgba(0, 255, 0, 0.2)',
                                        borderRadius: '8px',
                                        padding: '1rem',
                                        textAlign: 'center',
                                        transform: brokenElements.includes('layout-broken') ? 'rotate(10deg)' : 'none'
                                    }}>
                                        <div style={{fontSize: '0.75rem', color: '#10b981', marginBottom: '0.5rem'}}>
                                            {letterReplace(brokenElements.includes('text-scrambled') ? "T3MP0R@L R3F3R3NC3" : "TEMPORAL REFERENCE")}
                                        </div>
                                        <div style={{
                                            fontSize: brokenElements.includes('fonts-corrupted') ? '4rem' : '2rem',
                                            fontWeight: '700',
                                            color: brokenElements.includes('complete-chaos') ? '#00ffff' : '#06b6d4',
                                            marginBottom: '0.25rem',
                                            fontFamily: brokenElements.includes('fonts-corrupted') ? 'Impact' : 'inherit'
                                        }}>
                                            {brokenElements.includes('text-scrambled') ? '0xDEAD' : h0m3.hexCorruptText}
                                        </div>
                                        <div style={{fontSize: '0.625rem', color: '#6b7280'}}>
                                            {letterReplace(brokenElements.includes('text-scrambled') ? "R3@l1ty @nch0r T1m3$t@mp" : "Reality Anchor Timestamp")}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Session ID Warning */}
                            <div style={{
                                background: 'rgba(255, 0, 0, 0.1)',
                                border: '2px solid #ef4444',
                                borderRadius: brokenElements.includes('layout-broken') ? '50px' : '12px',
                                padding: '2rem',
                                textAlign: 'center',
                                marginBottom: '2rem',
                                animation: brokenElements.includes('complete-chaos') ? 'chaos 0.1s infinite' : 'flash 1s infinite',
                                transform: brokenElements.includes('layout-broken') ? `translateY(${index * 20}px)` : 'none'
                            }}>
                                <div style={{
                                    fontSize: brokenElements.includes('fonts-corrupted') ? '3rem' : '1.5rem',
                                    color: '#ef4444',
                                    marginBottom: '1rem',
                                    fontFamily: brokenElements.includes('fonts-corrupted') ? 'Impact' : 'inherit'
                                }}>
                                    {letterReplace(`Y0U $H0ULDNT B3 H3R3 ${sessionID}`)}
                                </div>
                                <div style={{fontSize: '1rem', color: '#fca5a5'}}>
                                    {letterReplace(brokenElements.includes('text-scrambled') ? "Th3 $y$t3m kn0w$ w3 @r3 h3r3. Th3 r00t$ @r3 w@tch1ng." : "The system knows we are here. The roots are watching.")}
                                </div>
                            </div>

                            {/* Next button for manual progression */}
                            <div style={{textAlign: 'center', marginBottom: '2rem'}}>
                                <button
                                    onClick={() => handleNext(index)}
                                    style={{
                                        background: 'linear-gradient(135deg, #06b6d4 0%, #0ea5a4 100%)',
                                        border: 'none',
                                        color: '#000',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        fontWeight: '700',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {index < 4 ? 'Next' : h0m3.buttons.why}
                                </button>
                            </div>

                        </div>
                    </main>
                ))}

                {/* Reset button after 9 scrolls */}
                {scrollCount >= 9 && (
                    <div style={{
                        position: 'fixed',
                        bottom: '2rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        textAlign: 'center',
                        background: 'rgba(0, 0, 0, 0.9)',
                        padding: '2rem',
                        border: '2px solid #ef4444',
                        borderRadius: '12px',
                        boxShadow: '0 0 30px rgba(255, 0, 0, 0.5)',
                        zIndex: 1000
                    }}>
                        <div style={{
                            color: '#ffff00',
                            marginBottom: '1rem',
                            fontSize: '1.1rem',
                            lineHeight: '1.6'
                        }}>
                            {h0m3.buttons.why}
                        </div>
                        <button
                            style={{
                                background: 'linear-gradient(135deg, #ef4444 0%, #cc0000 100%)',
                                border: 'none',
                                color: '#ffffff',
                                padding: '1rem 2rem',
                                borderRadius: '8px',
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #cc0000 0%, #ef4444 100%)';
                                e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.7)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #ef4444 0%, #cc0000 100%)';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                            onClick={async () => {
                                speechSynthesis.cancel();
                                ttsAudioRef.current = null;
                                Cookies.remove(cookies.corrupt);
                                Cookies.remove(cookies.corrupting);
                                await signCookie(`${cookies.noCorruption}=true`);
                                window.location.href = routes.home
                            }}
                        >
                            {h0m3.buttons.reset}
                        </button>
                    </div>
                )}

                <style jsx>{`
                    @keyframes scroll-left {
                        0% {
                            transform: translateX(100%);
                        }
                        100% {
                            transform: translateX(-100%);
                        }
                    }

                    @keyframes scroll-broken {
                        0% {
                            transform: translateX(100%) rotate(0deg);
                        }
                        50% {
                            transform: translateX(0%) rotate(180deg);
                        }
                        100% {
                            transform: translateX(-100%) rotate(360deg);
                        }
                    }

                    @keyframes flash {
                        0%, 100% {
                            opacity: 1;
                        }
                        50% {
                            opacity: 0.7;
                        }
                    }

                    @keyframes pulse {
                        0%, 100% {
                            opacity: 1;
                        }
                        50% {
                            opacity: 0.5;
                        }
                    }

                    @keyframes chaos {
                        0% {
                            transform: translate(0px, 0px) rotate(0deg);
                        }
                        25% {
                            transform: translate(-2px, 2px) rotate(1deg);
                        }
                        50% {
                            transform: translate(2px, -2px) rotate(-1deg);
                        }
                        75% {
                            transform: translate(-1px, 1px) rotate(0.5deg);
                        }
                        100% {
                            transform: translate(0px, 0px) rotate(0deg);
                        }
                    }

                    @keyframes chaos-pulse {
                        0% {
                            opacity: 1;
                            transform: scale(1);
                        }
                        50% {
                            opacity: 0.3;
                            transform: scale(1.5);
                        }
                        100% {
                            opacity: 1;
                            transform: scale(1);
                        }
                    }

                    @keyframes blink {
                        0%, 50% {
                            opacity: 1;
                        }
                        51%, 100% {
                            opacity: 0;
                        }
                    }


                    .text-scrambled * {
                        text-shadow: 2px 2px 0 #ff0000, -2px -2px 0 #00ff00;
                    }

                    .final-breakdown * {
                        font-family: 'Impact', 'Arial Black', serif !important;
                        text-transform: uppercase;
                        letter-spacing: 3px;
                    }
                `}</style>
            </div>
        </>
    );
}
