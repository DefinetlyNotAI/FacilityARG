'use client';

import {useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import Cookies from 'js-cookie';
import {fetchUserIP, getRandomFilename, signCookie} from "@/lib/client/utils";
import {BACKGROUND_AUDIO, playSafeSFX, SFX_AUDIO} from "@/audio";
import {begStop, creepyTTS, defaultIP, errors, motivate} from "@/lib/client/data/scroll";
import {cookies, routes} from "@/lib/saveData";

export default function ScrollPage() {
    const router = useRouter();
    const [scrollUnlocked, setScrollUnlocked] = useState<boolean | null>(null);
    const [contentHeight, setContentHeight] = useState(2000);
    const [showEscape, setShowEscape] = useState(false);
    const [escapeHovered, setEscapeHovered] = useState(false);
    const [ipAddress, setIpAddress] = useState('...loading...');
    const faviconRef = useRef<HTMLLinkElement | null>(null);
    const audioRef = useRef<HTMLAudioElement[]>([]);
    const hasInteractedRef = useRef(false);
    const ttsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const unlocked = Cookies.get(cookies.scroll);
        const repeater = Cookies.get(cookies.blackAndWhite);
        if (!unlocked) {
            router.replace(routes.notFound);
            return;
        }
        if (repeater) {
            router.replace(routes.blackAndWhite);
            return;
        }
        setScrollUnlocked(true);

        faviconRef.current = document.querySelector("link[rel~='icon']");
        if (!faviconRef.current) {
            const link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
            faviconRef.current = link;
        }

        fetchUserIP().then(ip => setIpAddress(ip === 'UNKNOWN' ? defaultIP : ip));
    }, [router]);

    useEffect(() => {
        if (!scrollUnlocked) return;

        const container = document.querySelector('.scroll-container');
        if (!container) return;

        const scrollHandler = () => {
            const scrollTop = container.scrollTop;
            const containerHeight = container.clientHeight;
            const contentHeight = container.scrollHeight;

            if (scrollTop + containerHeight >= contentHeight - 500) {
                setContentHeight(prev => prev + 1500);
            }

            if (faviconRef.current && Math.random() < 0.1) {
                const colors = ['red', 'green', 'blue', 'yellow', 'purple', 'cyan', 'white'];
                const color = colors[Math.floor(Math.random() * colors.length)];
                const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="${color}" />
                </svg>`;
                faviconRef.current.href = `data:image/svg+xml;base64,${btoa(svg)}`;
            }

            if (!hasInteractedRef.current && audioRef.current[0]) {
                audioRef.current[0].play().catch(() => {
                });
                hasInteractedRef.current = true;
            }
        };

        container.addEventListener('scroll', scrollHandler);
        return () => container.removeEventListener('scroll', scrollHandler);
    }, [scrollUnlocked]);

    useEffect(() => {
        if (!scrollUnlocked) return;

        const errorLog = setInterval(() => {
            if (Math.random() < 0.3) {
                console.error(errors[Math.floor(Math.random() * errors.length)]);
            }
        }, 5000);

        return () => clearInterval(errorLog);
    }, [scrollUnlocked]);

    useEffect(() => {
        if (!scrollUnlocked) return;

        const triggerFileDownload = () => {
            playSafeSFX({current: audioRef.current[0]}, SFX_AUDIO.FILE_DELETE, false);
            const blob = new Blob([begStop], {type: 'text/plain'});
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = getRandomFilename() + '.txt';
            document.body.appendChild(a);
            a.click();
            a.remove();
        };

        const downloadInterval = setInterval(() => {
            if (Math.random() < 0.4) {
                triggerFileDownload();
            }
        }, 20000);

        return () => clearInterval(downloadInterval);
    }, [scrollUnlocked]);

    useEffect(() => {
        if (!scrollUnlocked || !hasInteractedRef.current) return;

        ttsTimeoutRef.current = setTimeout(() => {
            audioRef.current[0].volume = 0.2;
            const utterance = new SpeechSynthesisUtterance(creepyTTS);
            audioRef.current[0].volume = 0.7;
            utterance.lang = 'en-US';
            utterance.onend = () => {
                playSafeSFX({current: audioRef.current[0]}, SFX_AUDIO.HORROR, true);
                setShowEscape(true);
            };
            window.speechSynthesis.speak(utterance);
        }, 5000);

        return () => {
            if (ttsTimeoutRef.current) clearTimeout(ttsTimeoutRef.current);
            window.speechSynthesis.cancel();
        };
    }, [scrollUnlocked, hasInteractedRef.current]);

    useEffect(() => {
        if (audioRef.current[0]) {
            audioRef.current[0].load();
            audioRef.current[0].play().catch(() => {
            });
        }
    }, [showEscape]);

    if (scrollUnlocked === null) return null;

    return (
        <div className="scroll-container">
            <audio
                ref={(el) => {
                    if (el) audioRef.current[0] = el;
                }}
                src={showEscape ? BACKGROUND_AUDIO.SCROLL_ESCAPE : BACKGROUND_AUDIO.SCROLL}
                autoPlay
                loop={true}
                hidden
            />
            <div
                className="scroll-glitch"
                style={{
                    minHeight: `${contentHeight}px`,
                    transition: 'filter 3s ease-in-out',
                    filter: `brightness(0.4) contrast(1.2)`,
                }}
            >
                <h1 style={{color: 'white', textAlign: 'center', paddingTop: '3rem'}}>{motivate}</h1>

                {showEscape && (
                    <div style={{textAlign: 'center', marginTop: '50vh'}}>
                        <button
                            style={{
                                fontSize: '1.5rem',
                                fontFamily: 'Courier New, monospace',
                                padding: '1rem 2rem',
                                backgroundColor: escapeHovered ? '#111' : 'black',
                                color: 'white',
                                border: '2px solid white',
                                cursor: 'default',
                                transition: 'background-color 0.3s ease'
                            }}
                            onMouseEnter={() => setEscapeHovered(true)}
                            onMouseLeave={() => setEscapeHovered(false)}
                            onClick={async () => {
                                playSafeSFX({current: audioRef.current[0]}, SFX_AUDIO.STATIC, true);
                                await new Promise(resolve => setTimeout(resolve, 10000));
                                audioRef.current.forEach(audio => {
                                    audio.pause();
                                    audio.currentTime = 0;
                                    audio.src = '';
                                });
                                await signCookie(`${cookies.blackAndWhite}=true`);
                                router.push(routes.blackAndWhite);
                                setEscapeHovered(true);
                            }}
                        >
                            {escapeHovered ? ipAddress : defaultIP}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
