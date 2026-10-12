'use client';

import {useRef} from 'react';
import styles from '@/styles/Buttons.module.css';
import {BACKGROUND_AUDIO, usePlayBackgroundAudio} from "@/audio";
import {buttons} from '@/lib/client/data/buttons';

function HiddenFooter() {
    return (
        <footer className={styles.SECRET}>
            <a href="/file-console">Go to File Console</a>
        </footer>
    );
}

export default function ButtonsPage() {
    const audioRef = useRef<HTMLAudioElement>(null);

    // All buttons start as pressed
    const buttonStates = {
        Chrome: true,
        Firefox: true,
        Safari: true,
        Edge: true,
        Opera: true,
    };

    const allPressed = true;
    const pressedCount = Object.values(buttonStates).length;

    usePlayBackgroundAudio(audioRef, BACKGROUND_AUDIO.BUTTONS);

    return (
        <>
            <audio
                ref={audioRef}
                src={BACKGROUND_AUDIO.BUTTONS}
                loop
                preload="auto"
                style={{display: 'none'}}
            />
            <div className={styles.container}>
                <h1 className={styles.title}>{buttons.title}</h1>

                <p className={styles.subtitle}>
                    {buttons.subtitleText.split('\n').map((line, idx) => (
                        <span key={idx}>
                            {line}
                            {idx < buttons.subtitleText.split('\n').length - 1 && <br/>}
                        </span>
                    ))}
                </p>

                {/* Progress Indicator */}
                <div className={styles.progressIndicator}>
                    <div>Progress: {pressedCount}/5</div>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{width: `100%`}}
                        />
                    </div>
                </div>

                <div className={styles.buttonGrid}>
                    {buttons.browsers.map((browser) => (
                        <button
                            key={browser}
                            disabled
                            className={`${styles.browserButton} ${styles.pressed}`}
                            title="Already pressed"
                        >
                            <div>{browser}<br/></div>
                            <div style={{fontSize: '0.8rem', marginTop: '0.2rem'}}>✓</div>
                        </button>
                    ))}
                </div>

                {allPressed && (
                    <>
                        <div className={styles.secretMessage}>
                            {buttons.wingding}
                            <div style={{
                                fontSize: '1rem',
                                marginTop: '1rem',
                                fontStyle: 'italic',
                                color: '#666',
                                fontFamily: 'JetBrains Mono, monospace'
                            }}/>
                        </div>
                        <HiddenFooter/>
                    </>
                )}
            </div>
        </>
    );
}
