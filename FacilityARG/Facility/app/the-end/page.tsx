'use client';

import React, {useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import Cookies from 'js-cookie';
import {BACKGROUND_AUDIO, playSafeSFX, SFX_AUDIO} from "@/audio";
import {checkKeyword, signCookie} from "@/lib/client/utils";
import {messages} from "@/lib/client/data/theEnd";
import {cookies, localStorageKeys, routes} from "@/lib/saveData";
import styles from '@/styles/TheEnd.module.css';

export default function TheEnd() {
    const router = useRouter();
    const [hasEndCookie, setHasEndCookie] = useState(false);
    const [hasEndQuestionCookie, setHasEndQuestionCookie] = useState(false);
    const [input, setInput] = useState('');
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);
    const flowerRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const backgroundAudioRef = useRef<HTMLAudioElement>(null);
    const [glitchIntensity, setGlitchIntensity] = useState(0);
    const [showMemories, setShowMemories] = useState(false);
    const [audioInitialized, setAudioInitialized] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(false);
    const [flowerCut, setFlowerCut] = useState(false);

    useEffect(() => {
        setMounted(true);
        const end = Cookies.get(cookies.end);
        const endQuestion = Cookies.get(cookies.endQuestion);
        if (!end && !endQuestion) {
            router.replace(routes.theEnd);
            return;
        }
        setHasEndCookie(!!end);
        setHasEndQuestionCookie(!!endQuestion);
        const flowerWasCut = localStorage.getItem(localStorageKeys.flowerCut) === 'true';
        setFlowerCut(flowerWasCut);
        if (flowerWasCut && audioRef.current) audioRef.current.play().catch(console.warn);
    }, [router]);

    const initializeAudio = async () => {
        if (!audioRef.current || audioInitialized) return;
        try {
            audioRef.current.volume = 0.3;
            await audioRef.current.play();
            setAudioInitialized(true);
            setAudioEnabled(true);
        } catch {
            setAudioEnabled(false);
        }
    };

    const initializeBackgroundAudio = async () => {
        if (!backgroundAudioRef.current) return;
        try {
            backgroundAudioRef.current.volume = 0.4;
            await backgroundAudioRef.current.play();
        } catch {
        }
    };

    useEffect(() => {
        if (!hasEndCookie || !mounted) return;
        const glitchTimer = setInterval(() => {
            setGlitchIntensity(prev => Math.min(prev + 0.1, 1));
        }, 2000);
        setTimeout(() => setShowMemories(true), 5000);
        let i = 0;
        const logInterval = setInterval(() => {
            const msg = messages.console[i] || messages.console[Math.floor(Math.random() * messages.console.length)];
            console.log('%c' + msg, 'color: #ff0000; font-weight:bold; font-size:14px;text-shadow:0 0 5px #ff0000;');
            i++;
        }, 4000);
        return () => {
            clearInterval(glitchTimer);
            clearInterval(logInterval);
        };
    }, [hasEndCookie, mounted]);

    useEffect(() => {
        if (!hasEndCookie) return;

        function onKeyDown(e: KeyboardEvent) {
            let buffer = (window as any).inputBuffer || '';
            buffer += e.key.toUpperCase();
            if (buffer.length > 3) buffer = buffer.slice(-3);
            (window as any).inputBuffer = buffer;
            if (messages.deathKeys.some(k => buffer.includes(k))) {
                triggerFlowerCutAndStatic();
                (window as any).inputBuffer = '';
            }
        }

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [hasEndCookie]);

    function triggerFlowerCutAndStatic() {
        if (!flowerRef.current || flowerCut) return;
        setFlowerCut(true);
        localStorage.setItem(localStorageKeys.flowerCut, 'true');
        flowerRef.current.classList.add(styles.cut);
        setGlitchIntensity(2);
        if (audioRef.current && !audioRef.current.paused) audioRef.current.pause();
        playSafeSFX(audioRef, SFX_AUDIO.STATIC, true);
        setTimeout(() => setGlitchIntensity(prev => Math.min(prev, 1)), 3000);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const result = await checkKeyword(input.trim().toLowerCase(), 6);
        if (result) {
            Cookies.remove(cookies.endQuestion);
            await signCookie(`${cookies.end}=true`);
            setHasEndCookie(true);
            setHasEndQuestionCookie(false);
            setError('');
        } else {
            setError(messages.invalidKeywordErr);
            playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);
        }
    }

    if (!mounted) return null;

    if (hasEndCookie) {
        return (
            <>
                <span dangerouslySetInnerHTML={{__html: `<!--${messages.htmlComment.end}-->`}}
                      style={{display: 'none'}}/>
                <div
                    onClick={initializeAudio}
                    className={styles.finalContainer}
                    style={{cursor: audioEnabled ? 'default' : 'pointer'}}
                >
                    <audio ref={audioRef} src={BACKGROUND_AUDIO.THE_END_FINAL} loop preload="auto"
                           style={{display: 'none'}}/>
                    <div className={styles.particles}>
                        {[...Array(50)].map((_, i) => <div key={i} className={styles.particle}/>)}
                    </div>
                    {showMemories && (
                        <div className={styles.memoryFragments}>
                            {messages.memoryFragments.map((m, i) => (
                                <div key={i} className={styles.memory} style={m.style}>
                                    <span className={styles.memoryText}>{m.text}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <div
                        ref={flowerRef}
                        className={`${styles.vesselSymbol} ${flowerCut ? styles.permanentlyCut : ''}`}
                        style={{
                            filter: `brightness(${1 + glitchIntensity * 0.5})
                            contrast(${1 + glitchIntensity * 0.3})
                            ${flowerCut ? 'grayscale(100%) brightness(0.3)' : ''}`
                        }}
                    >
                        🌸
                    </div>
                    <div className={styles.nostalgicText}>
                        {messages.nostalgicLines.map((line, i) => (
                            <p key={i}>{line}</p>
                        ))}
                    </div>
                    {glitchIntensity > 0 && (
                        <div
                            className={styles.glitchOverlay}
                            style={{
                                background: `
                                    repeating-linear-gradient(
                                        0deg,
                                        transparent,
                                        transparent 2px,
                                        rgba(255, 0, 0, ${glitchIntensity * 0.1}) 2px,
                                        rgba(255, 0, 0, ${glitchIntensity * 0.1}) 4px
                                    )
                                `,
                                animationDuration: `${1 / glitchIntensity}s`
                            }}
                        />
                    )}
                </div>
            </>
        );
    }

    if (hasEndQuestionCookie) {
        return (
            <>
                <span dangerouslySetInnerHTML={{__html: `<!--${messages.htmlComment.question}-->`}}
                      style={{display: 'none'}}/>
                <div onClick={initializeBackgroundAudio} className={styles.questionContainer}>
                    <audio ref={backgroundAudioRef} src={BACKGROUND_AUDIO.THE_END_QUESTION} loop preload="auto"
                           style={{display: 'none'}}/>
                    <div className={styles.ambientGlow}/>
                    <div className={styles.questionBox}>
                        <h1 className={styles.questionTitle}>{messages.questionInput.title}</h1>
                        <p className={styles.questionSubtitle}>
                            {messages.questionInput.subtitle.map((line, i) => (
                                <React.Fragment key={i}>{line}<br/></React.Fragment>))}
                        </p>
                        <form onSubmit={handleSubmit}>
                            <input
                                autoFocus
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder={messages.questionInput.placeholder}
                                className={styles.inputBox}
                            />
                            <button type="submit" className={styles.submitBtn}>
                                {messages.questionInput.buttonLabel}
                            </button>
                        </form>
                        {error && <p className={styles.errorMsg}>{error}</p>}
                    </div>
                </div>
            </>
        );
    }

    return null;
}
