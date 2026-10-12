'use client';

import React, {useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import Cookies from 'js-cookie';
import {VNTextRenderer} from "@/components/VNRenderer";
import styles from '@/styles/Terminal.module.css';
import {BACKGROUND_AUDIO, playSafeSFX, SFX_AUDIO, usePlayBackgroundAudio} from "@/audio";
import {
    cutsceneMetaCountdown,
    errorMessages,
    keywordsMapping,
    phrase,
    placeholders,
    terminalMsg,
    totalKeywords,
    vesselLoc,
    wingdingsTitles
} from '@/lib/client/data/terminal';
import {FullScreenOverlay, KeywordKey, TerminalStep} from "@/types";
import {getOrCreateSessionId, signCookie} from "@/lib/client/utils";
import {cookies, routes} from "@/lib/saveData";

export default function TerminalPage() {
    const router = useRouter();
    const [unlocked, setUnlocked] = useState<boolean | null>(null);
    const [noCount, setNoCount] = useState(0);
    const [input, setInput] = useState('');
    const [guessedKeywords, setGuessedKeywords] = useState<Set<KeywordKey>>(new Set());
    const [keywordNames, setKeywordNames] = useState<Record<KeywordKey, string>>({} as Record<KeywordKey, string>);
    const [messages, setMessages] = useState<string[]>([]);
    const [step, setStep] = useState<TerminalStep>('locked');
    const [showButtons, setShowButtons] = useState(false);
    const [wrongCount, setWrongCount] = useState(0);
    const [fullScreenOverlay, setFullScreenOverlay] = useState<null | FullScreenOverlay>(null);
    const [isReplay, setIsReplay] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [sessionID, setSessionID] = useState<string>('SID-UNKNOWN');
    const [showFallbackButton, setShowFallbackButton] = useState(false);

    useEffect(() => {
        setSessionID(getOrCreateSessionId())
    }, []);

    const normalize = (str: string) => str.trim().toLowerCase();

    const buildPhraseDisplay = () => {
        return phrase.template
            .map((word, idx) => {
                if (keywordsMapping[idx]) {
                    const keywordKey = keywordsMapping[idx];
                    return guessedKeywords.has(keywordKey)
                        ? keywordNames[keywordKey] || phrase.placeholder
                        : phrase.placeholder;
                }
                return word;
            })
            .join(' ');
    };

    usePlayBackgroundAudio(audioRef, BACKGROUND_AUDIO.TERMINAL, (unlocked && !fullScreenOverlay));

    // Queue system for timed rendering
    const flushMessagesSequentially = async (queue: string[], delay = 800) => {
        for (const msg of queue) {
            setMessages(prev => [...prev, msg]);
            await new Promise(r => setTimeout(r, delay));
        }
    };

    useEffect(() => {
        if (!Cookies.get(cookies.terminal)) {
            setUnlocked(false);
        } else {
            setUnlocked(true);
            setStep('fill');
        }

        setIsReplay(!!Cookies.get(cookies.endQuestion));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const val = normalize(input);
        setInput('');

        if (step === 'fill') {
            try {
                // Call API to validate keyword
                const response = await fetch(routes.api.utils.checkKeyword.validateKeyword, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        provided: val,
                        guessedKeywords: Array.from(guessedKeywords)
                    })
                });

                const data = await response.json();

                if (!data.ok) {
                    handleWrongPhrase(val);
                    return;
                }

                // Play success sound for correct keyword
                playSafeSFX(audioRef, SFX_AUDIO.SUCCESS, false);
                setMessages(['']);

                const {keywordKey, keyword, alreadyGuessed} = data;

                if (alreadyGuessed) {
                    setMessages(msgs => [...msgs, terminalMsg.alrPlaced(keyword)]);
                    return;
                }

                // Store the keyword name from server
                setKeywordNames(prev => ({...prev, [keywordKey]: keyword}));
                setGuessedKeywords(prev => new Set(prev).add(keywordKey));
                setMessages(msgs => [...msgs, terminalMsg.successPlaced(keyword)]);

                if (guessedKeywords.size + 1 === totalKeywords) {
                    setMessages(['']);
                    setStep('solving');
                    await flushMessagesSequentially(terminalMsg.afterSuccess.part1(sessionID));
                    await new Promise(r => setTimeout(r, 1000));
                    setMessages(['']);
                    await flushMessagesSequentially(terminalMsg.afterSuccess.part2(sessionID));
                    setTimeout(() => {
                        setShowButtons(true);
                        setStep('question');
                    }, 1000);
                }
            } catch (error) {
                console.error('Error validating keyword:', error);
                handleWrongPhrase(val);
            }
        } else if (step === 'email') {
            try {
                // Call API to validate email
                const response = await fetch(routes.api.utils.checkKeyword.validateEmail, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({provided: val})
                });

                const data = await response.json();

                if (data.ok) {
                    // Play success sound
                    playSafeSFX(audioRef, SFX_AUDIO.SUCCESS, false);
                    setMessages(msgs => [...msgs, terminalMsg.successPlacedEmail]);

                    // Wait before dumping the monologue
                    setTimeout(() => {
                        flushMessagesSequentially(terminalMsg.afterSuccess.part3, 1300).catch(console.error);

                        setTimeout(() => {
                            setStep('countdown');
                            runCountdown().catch(console.error);
                        }, 6000); // Slight delay to ensure the lines are read
                    }, 1500); // Pause after terminalMsg.successPlacedEmail msg
                } else {
                    // Play error sound
                    playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);

                    const nextWrong = wrongCount + 1;
                    setWrongCount(nextWrong);

                    if (nextWrong % 5 === 0) {
                        setMessages(['']); // Clear terminal every 5 wrongs
                    }

                    if (nextWrong > 25) setWrongCount(10);

                    const response = terminalMsg.wrongPlaced[Math.min(nextWrong - 1, terminalMsg.wrongPlaced.length - 1)];
                    setMessages(msgs => [...msgs, response]);
                }
            } catch (error) {
                console.error('Error validating email:', error);
                playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);
                setMessages(msgs => [...msgs, 'Connection error. Try again.']);
            }
        }
    };

    // --- Helpers for Input Animation ---
    const handleWrongPhrase = (val: string) => {
        // Play error sound
        playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);

        function handleMessage(val: string, newCount: number) {
            const message = errorMessages[newCount];

            if (typeof message === 'string') {
                setMessages(msgs => [...msgs, message]);
            } else if (typeof message === 'function') {
                if (newCount === 8) {
                    // Slice all but first message, then add '...'
                    setMessages(msgs => msgs.slice(0, 1).concat([message(val)]));
                } else {
                    setMessages(msgs => [...msgs, message(val)]);
                }
            } else {
                // Fallback glitch logic
                const glitch = val
                    .split('')
                    .map((c, i) => (i % 2 === 0 ? '█' : c))
                    .join('');
                setMessages(msgs => [...msgs, `${glitch}?? try again??`]);
            }
        }

        let newCount = wrongCount + 1;
        if (newCount > 20) newCount = 10;
        setWrongCount(newCount);
        handleMessage(val, newCount);
    };

    const handleYes = () => {
        // Play interaction sound
        playSafeSFX(audioRef, SFX_AUDIO.SUCCESS, false);

        setShowButtons(false);
        setMessages(['']);
        flushMessagesSequentially(terminalMsg.afterSuccess.part4, 1200).catch(console.error);
        setStep('email');
    };

    const handleNo = () => {
        // Play error sound
        playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);

        const newCount = noCount + 1;
        setNoCount(newCount);

        const msgQueue: string[] = terminalMsg.wrongChoice(sessionID);
        setMessages([msgQueue[Math.min(newCount - 1, msgQueue.length - 1)]]);

        // Optional: delay redirect to let message render for a moment
        setTimeout(() => {
            router.replace(routes.terminal);
        }, 1200);
    };

    function downloadVESSEL() {
        const a = document.createElement('a');
        a.href = vesselLoc.href;
        a.download = vesselLoc.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    const runCountdown = async () => {
        setMessages([]);

        if (audioRef.current) {
            audioRef.current.pause();
        }

        if (isReplay) {
            for (const line of terminalMsg.afterSuccess.endCutsceneText.metaLines) {
                setFullScreenOverlay({
                    text: line,
                    size: 'huge',
                });
                await new Promise(r => setTimeout(r, 1800));
            }

            for (let i = cutsceneMetaCountdown; i >= 1; i--) {
                setFullScreenOverlay({
                    text: terminalMsg.afterSuccess.endCutsceneText.metaReplayTitle(i),
                    size: 'massive',
                });
                document.title = terminalMsg.afterSuccess.endCutsceneText.metaReplayTitle(i);
                await new Promise(r => setTimeout(r, 500));
            }

            setFullScreenOverlay({
                text: terminalMsg.afterSuccess.endCutsceneText.metaFinalMessage,
                size: 'huge',
            });
            document.title = terminalMsg.afterSuccess.endCutsceneText.metaFinalTitle;
            await new Promise(r => setTimeout(r, 3500));

            downloadVESSEL();

            try {
                await signCookie(`${cookies.endQuestion}=true`);
            } catch {
            }

            router.push(routes.theEnd);

            // Start a 10-second timer to show a fallback button
            setTimeout(() => {
                setShowFallbackButton(true);
            }, 10000);

            return;
        }

        for (const line of terminalMsg.afterSuccess.endCutsceneText.poeticLines) {
            setFullScreenOverlay({
                text: line,
                size: 'huge',
            });
            await new Promise(r => setTimeout(r, 1700));
        }

        for (let i = 24; i >= 1; i--) {
            setFullScreenOverlay({
                text: `${i}`,
                size: 'massive',
            });
            if (wingdingsTitles[i - 1]) {
                document.title = wingdingsTitles[i - 1];
            }
            await new Promise(r => setTimeout(r, i > 5 ? 700 : 350));
        }

        for (const line of terminalMsg.afterSuccess.endCutsceneText.finaleLines) {
            setFullScreenOverlay({
                text: line,
                size: 'huge',
            });
            await new Promise(r => setTimeout(r, 1400));
        }

        document.title = terminalMsg.afterSuccess.endCutsceneText.vesselFinalTitle;

        await new Promise(r => setTimeout(r, 2000));

        downloadVESSEL();

        try {
            await signCookie(`${cookies.endQuestion}=true`);
        } catch {
        }

        router.push(routes.theEnd);

        // Start a 10-second timer to show a fallback button
        setTimeout(() => {
            setShowFallbackButton(true);
        }, 10000);
    };

    if (unlocked === false) {
        router.replace(routes.notFound);
        return null;
    }
    if (unlocked === null) return null;

    return (
        <>
            <audio
                ref={audioRef}
                src={BACKGROUND_AUDIO.TERMINAL}
                loop
                preload="auto"
                style={{display: 'none'}}
            />
            <div className={styles.container}>
                {/* Hide phraseDisplay during cutscene */}
                {!fullScreenOverlay && (
                    <div className={styles.phraseDisplay}>
                        {buildPhraseDisplay()}
                    </div>
                )}

                <div className={styles.messageContainer}>
                    {messages.map((line, i) => (
                        <VNTextRenderer key={`msg-${i}`} text={line}/>
                    ))}
                </div>

                {(step === 'fill' || step === 'email') && !fullScreenOverlay && (
                    <form onSubmit={handleSubmit} className={styles.inputForm}>
                        <input
                            autoFocus
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder={placeholders[step as 'fill' | 'email']}
                            className={styles.input}
                            spellCheck={false}
                            autoComplete="off"
                        />
                    </form>
                )}

                {showButtons && !fullScreenOverlay && (
                    <div className={styles.buttonContainer}>
                        <button onClick={handleYes} className={styles.choiceButton}>
                            YES
                        </button>
                        <button onClick={handleNo} className={styles.choiceButton}>
                            NO
                        </button>
                    </div>
                )}

                {fullScreenOverlay && (
                    <div
                        className={`${styles.fullscreenOverlay} ${fullScreenOverlay.size || ''} ${fullScreenOverlay.glitch ? 'corrupted-glitch' : ''}`}>
                        {fullScreenOverlay.text}
                        {showFallbackButton && (
                            <button
                                onClick={() => router.push(routes.theEnd)}
                                className={styles.choiceButton}
                                style={{
                                    position: 'absolute',
                                    bottom: '20%',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    fontSize: '1.5rem',
                                    padding: '1rem 2rem'
                                }}
                            >
                                Continue
                            </button>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
