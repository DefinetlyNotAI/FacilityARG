"use client"

import React, {useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import CryptoJS from 'crypto-js';
import Cookies from "js-cookie";
import {signCookie} from "@/lib/client/utils";
import styles from '@/styles/WifiLogin.module.css';
import {BACKGROUND_AUDIO, playSafeSFX, SFX_AUDIO, usePlayBackgroundAudio} from "@/audio";
import {form, hashes, messages} from "@/lib/client/data/wifi";
import {cookies, routes} from "@/lib/saveData";

const CurlHintPopup: React.FC<{ onDismiss: () => void }> = ({onDismiss}) => {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 6000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div className={styles.container}>
            <div className={styles.loginForm}>
                {messages.finale.map((msg, idx) => {
                    let className = '';
                    if (msg.type === 'title') className = styles.title;
                    else if (msg.type === 'loading') className = styles.loading;

                    return (
                        <div
                            key={idx}
                            className={className}
                            style={msg.style}
                        >
                            {/* Preserve newlines */}
                            <pre
                                style={{margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', textAlign: 'center'}}>
                              {msg.text}
                            </pre>
                        </div>
                    );
                })}
            </div>
        </div>
    );

};

const InterferenceCutscene: React.FC<{ onFinish: () => void }> = ({onFinish}) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (step < messages.interference.length) {
            const timer = setTimeout(() => setStep(step + 1), 3500);
            return () => clearTimeout(timer);
        } else {
            onFinish();
        }
    }, [step, onFinish]);

    return (
        <div className={styles.container} style={{
            filter: 'contrast(1.5) brightness(0.7)',
            background: 'black'
        }}>
            <div className={styles.loginForm} style={{
                border: '2px solid #ff0000',
                boxShadow: '0 0 30px rgba(255, 0, 0, 0.5)'
            }}>
                <div style={{
                    fontSize: '2rem',
                    whiteSpace: 'pre-line',
                    minHeight: '4rem',
                    color: '#ff0000',
                    textShadow: '0 0 15px #ff0000'
                }}>
                    {step > 0 ? messages.interference.slice(0, step).join('\n\n') : ''}
                    <span style={{animation: 'blink 0.5s infinite'}}>
                        {step < messages.interference.length ? '|' : ''}
                    </span>
                </div>
            </div>
        </div>
    );
};

const WifiLoginPage: React.FC = () => {
    const router = useRouter();
    const [showCutscene, setShowCutscene] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showCurlHint, setShowCurlHint] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    usePlayBackgroundAudio(audioRef, BACKGROUND_AUDIO.WIFI_LOGIN);

    useEffect(() => {
        const wifiPassed = Cookies.get(cookies.wifiPassed);
        if (wifiPassed) {
            setShowCurlHint(true);
            return;
        }

        if (!Cookies.get(cookies.interference)) {
            setShowCutscene(true);
        }
    }, [router]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const sha1 = (str: string) => CryptoJS.SHA1(str).toString();
        const sha256 = (str: string) => CryptoJS.SHA256(str).toString();
        const inputHashUser = sha256(username.trim().toLowerCase());
        const inputHashPass = sha1(password.trim().toLowerCase());

        if (inputHashUser !== hashes.username) {
            // Play error sound
            playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);

            setError(messages.err.invUsername);
            return;
        }

        if (inputHashPass !== hashes.password) {
            // Play error sound
            playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);

            setError(messages.err.invPassword(inputHashPass));
            return;
        }

        // Play success sound
        playSafeSFX(audioRef, SFX_AUDIO.SUCCESS, false);

        setLoading(true);
        setTimeout(async () => {
            await signCookie(`${cookies.wifiPassed}=true`);
            setShowCurlHint(true);
        }, 1000);
    };

    if (showCutscene) {
        return (
            <InterferenceCutscene onFinish={async () => {
                await signCookie(`${cookies.interference}=true`);
                setShowCutscene(false);
            }}/>
        );
    }

    if (showCurlHint) {
        return <CurlHintPopup onDismiss={() => router.replace(routes.wifiPanel)}/>;
    }

    return (
        <>
            <audio
                ref={audioRef}
                src={BACKGROUND_AUDIO.WIFI_LOGIN}
                loop
                preload="auto"
                style={{display: 'none'}}
            />
            <span
                dangerouslySetInnerHTML={{
                    __html: `<!--${messages.comment}-->`
                }}
                style={{display: 'none'}}
            />
            <div className={styles.container}>
                <h1 className={styles.title}>Wifi Login</h1>
                <form onSubmit={handleSubmit} className={styles.loginForm}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>{form.username.title}</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className={styles.input}
                            placeholder={form.username.placeholder}
                            autoComplete="off"
                            spellCheck={false}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>{form.password.title}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => {
                                if (new RegExp(`^[a-z]{${form.password.min},${form.password.max}}$`).test(e.target.value)) {
                                    setPassword(e.target.value);
                                }
                            }}
                            className={styles.input}
                            placeholder={form.password.placeholder}
                            minLength={form.password.min}
                            maxLength={form.password.max}
                            autoComplete="off"
                            spellCheck={false}
                            required
                        />
                    </div>
                    <button type="submit" className={styles.submitButton} disabled={loading}>
                        {loading ? messages.authMsg : 'Login'}
                    </button>
                    {error && <div className={styles.error}>{error}</div>}
                    {loading && <div className={styles.loading}>{messages.loadMsg}</div>}
                </form>
            </div>
        </>
    );
};

export default WifiLoginPage;
