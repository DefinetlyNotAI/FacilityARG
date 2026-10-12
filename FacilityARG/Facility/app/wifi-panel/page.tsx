'use client';

import {useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import Cookies from 'js-cookie';
import styles from '@/styles/WifiPanel.module.css';
import {BACKGROUND_AUDIO, playSafeSFX, SFX_AUDIO, usePlayBackgroundAudio} from "@/audio";
import {checkKeyword, signCookie} from "@/lib/client/utils";
import {messages, wifiPanel} from "@/lib/client/data/wifi";
import {cookies, routes} from "@/lib/saveData";


export default function WifiPanel() {
    const router = useRouter();
    const [mode, setMode] = useState<'loading' | 'locked' | 'receive' | 'send' | 'caesar'>('locked');
    const [question, setQuestion] = useState<string>('');
    const [password, setPassword] = useState('');
    const [userAnswer, setUserAnswer] = useState('');
    const [sendUnlocked, setSendUnlocked] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [fadeOut, setFadeOut] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Initialize background audio
    usePlayBackgroundAudio(audioRef, BACKGROUND_AUDIO.WIFI_PANEL);

    // Check cookies on mount
    useEffect(() => {
        (async () => {
            try {
                if (!Cookies.get(cookies.wifiPanel)) {
                    await signCookie(`${cookies.wifiPanel}=true`);
                    return router.replace(routes.wifiLogin);
                }

                if (!Cookies.get(cookies.wifiPassed)) {
                    await signCookie(`${cookies.wifiLogin}=true`);
                    return router.replace(routes.wifiLogin);
                }

                setMode('locked');
            } catch (err) {
                console.error('Error:', err);
            }
        })();
    }, [router]);

    // Generate the encoded question
    const handleReceive = () => {
        // Play interaction sound
        playSafeSFX(audioRef, SFX_AUDIO.SUCCESS, false);

        const q = btoa(messages.question);
        setQuestion(q);
        setMode('receive');
    };

    const handleUnlockSend = async () => {
        const result = await checkKeyword(password.trim().toLowerCase(), 1);
        if (result) {
            // Play success sound
            playSafeSFX(audioRef, SFX_AUDIO.SUCCESS, false);

            setSendUnlocked(true);
            setMode('send');
            setErrorMsg(null);
        } else {
            // Play error sound
            playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);

            setErrorMsg(messages.err.failedUnlock);
        }
    };

    const handleSendAnswer = () => {
        if (userAnswer.trim() === messages.answer.normal) {
            // Play alert sound for transmission error
            playSafeSFX(audioRef, SFX_AUDIO.ALERT, true);

            setErrorMsg(messages.err.intentionalTransmission);
            setMode('caesar');
        } else {
            // Play error sound
            playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);

            setErrorMsg(messages.err.incorrectPass);
        }
    };

    const handleCaesarSubmit = async () => {
        const decoded = userAnswer
            .split('')
            .map((ch) => {
                if (/[a-z]/i.test(ch)) {
                    const code = ch.charCodeAt(0);
                    const base = code >= 97 ? 97 : 65;
                    return String.fromCharCode(((code - base - 3 + 26) % 26) + base);
                }
                return ch;
            })
            .join('');
        if (decoded === messages.answer.ceaser) {
            // Play success sound
            playSafeSFX(audioRef, SFX_AUDIO.SUCCESS, false);

            setFadeOut(true);
            setTimeout(async () => {
                try {
                    await signCookie(`${cookies.media}=true`);
                    router.push(routes.media);
                } catch (e) {
                    console.error('signCookie failed:', e);
                }
            }, 650);

        } else {
            // Play error sound
            playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);

            setErrorMsg(messages.err.incorrectCeaserPass);
        }
    };

    return (
        <>
            <audio
                ref={audioRef}
                src={BACKGROUND_AUDIO.WIFI_PANEL}
                loop
                preload="auto"
                style={{display: 'none'}}/>

            <div className={`${styles.container} ${fadeOut ? styles.fadeOut : ''}`}>
                <h1 className={styles.title}>{wifiPanel.title}</h1>
                <div className={styles.buttonContainer}>
                    <button
                        onClick={handleReceive}
                        disabled={mode !== 'locked'}
                        className={styles.actionButton}
                    >
                        {wifiPanel.receiveButton}
                    </button>

                    <button
                        onClick={async () => {
                            if (mode === 'locked' || mode === 'receive') {
                                await handleUnlockSend();
                            } else if (mode === 'send') {
                                handleSendAnswer();
                            } else if (mode === 'caesar') {
                                await handleCaesarSubmit();
                            }
                        }}
                        disabled={
                            (mode === 'locked' && !password) ||
                            (mode === 'receive' && !password) ||  // add this line
                            (mode === 'send' && !userAnswer) ||
                            (mode === 'caesar' && !userAnswer)
                        }
                        className={styles.actionButton}
                    >
                        {wifiPanel.sendButton}
                    </button>


                    {errorMsg && (
                        <div
                            key={errorMsg}
                            className={styles.error}
                            onAnimationEnd={() => setErrorMsg('')}
                        >
                            {errorMsg}
                        </div>
                    )}
                </div>
                {mode === 'receive' && (
                    <div className={styles.contentBox}>
                        <h2>{wifiPanel.transmissionPanel.title}</h2>
                        <p><em>{wifiPanel.transmissionPanel.netForm.request}</em></p>
                        <input
                            id="wifi-code-input"
                            type="text"
                            placeholder={wifiPanel.transmissionPanel.netForm.placeholder}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}/>
                    </div>
                )}

                {mode === 'send' && sendUnlocked && (
                    <div className={styles.contentBox}>
                        <h2>{wifiPanel.transmissionPanel.mainTitle}</h2>
                        <p><em>{wifiPanel.transmissionPanel.title}</em></p>
                        <div className={styles.codeBlock}>{question}</div>
                        <label className={styles.inputLabel} htmlFor="wifi-answer-input">
                            {wifiPanel.transmissionPanel.ansForm.request}
                        </label>
                        <input
                            id="wifi-answer-input"
                            type="text"
                            placeholder={wifiPanel.transmissionPanel.ansForm.placeholder}
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            className={styles.input}/>
                    </div>
                )}

                {mode === 'caesar' && (
                    <div className={styles.contentBox}>
                        <h2>{wifiPanel.caesarPanel.title}</h2>
                        <p>{wifiPanel.caesarPanel.description}</p>
                        <input
                            id="wifi-caesar-input"
                            type="text"
                            placeholder={wifiPanel.caesarPanel.placeholder}
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            className={styles.input}/>
                    </div>
                )}
            </div>
        </>
    );
}
