'use client';

import {useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import Cookies from 'js-cookie';
import styles from '@/styles/Media.module.css';
import {BACKGROUND_AUDIO, playSafeSFX, SFX_AUDIO, usePlayBackgroundAudio} from "@/audio";
import {checkKeyword, signCookie} from "@/lib/client/utils";
import {err, fileLoc, getStatusText, text} from "@/lib/client/data/media";
import {cookies, routes} from "@/lib/saveData";

export default function MediaPage() {
    const router = useRouter();
    const [accessGranted, setAccessGranted] = useState(false);
    const [inputKey, setInputKey] = useState('');
    const [msg, setMsg] = useState('');
    const [played, setPlayed] = useState(false);
    const [dl1, setDl1] = useState(false);
    const [dl2, setDl2] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Initialize background audio
    usePlayBackgroundAudio(audioRef, BACKGROUND_AUDIO.MEDIA);

    useEffect(() => {
        if (!Cookies.get(cookies.media)) {
            router.replace(routes.notFound);
        }
    }, [router]);

    useEffect(() => {
        if (played && dl1 && dl2) {
            const unlockButton = async () => {
                await signCookie(`${cookies.buttons}=true`);
            };
            unlockButton().catch(error => {
                console.error('Error caught:', error);
            });
        }
    }, [played, dl1, dl2]);

    const checkKey = async () => {
        const result = await checkKeyword(inputKey.trim().toLowerCase(), 2);
        if (result) {
            // Play success sound
            playSafeSFX(audioRef, SFX_AUDIO.SUCCESS, false);
            setAccessGranted(true);
            setMsg('');
        } else {
            // Play error sound
            playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);
            setMsg(err.incorrectKeyword);
        }
    };

    return (
        <div className={styles.container}>
            <audio
                ref={audioRef}
                src={BACKGROUND_AUDIO.MEDIA}
                loop
                preload="auto"
                style={{display: 'none'}}
            />
            <h1>{text.title}</h1>
            {!accessGranted ? (
                <div className={styles.access}>
                    <p>{text.entryMsg}</p>
                    <input
                        type="text"
                        value={inputKey}
                        onChange={e => setInputKey(e.target.value)}
                    />
                    <button onClick={checkKey}>{text.unlockButton}</button>
                    {msg && <p className={styles.error}>{msg}</p>}
                </div>
            ) : (
                <div className={styles.content}>
                    <div className={styles.item}>
                        <label>{text.itemTitle1}</label>
                        <audio
                            controls
                            onPlay={() => {
                                setPlayed(true);
                                if (audioRef.current && !audioRef.current.paused) {
                                    audioRef.current.pause();
                                }
                            }}
                            onPause={() => {
                                if (audioRef.current && audioRef.current.paused) {
                                    audioRef.current.play().catch(() => {
                                    });
                                }
                            }}
                        >
                            <source src={fileLoc.audio} type="audio/wav"/>
                            {err.unsupportedAudioBrowser}
                        </audio>
                    </div>

                    <div className={styles.item}>
                        <label>{text.itemTitle2}</label>
                        <a
                            href={fileLoc.protectedFile1}
                            download
                            onClick={() => setDl1(true)}
                        >
                            {text.downloadButton1}
                        </a>
                    </div>

                    <div className={styles.item}>
                        <label>{text.itemTitle3}</label>
                        <a
                            href={fileLoc.protectedFile2}
                            download
                            onClick={() => setDl2(true)}
                        >
                            {text.downloadButton2}
                        </a>
                    </div>

                    <p>{getStatusText(played, dl1, dl2)}</p>
                </div>
            )}
        </div>
    );
}
