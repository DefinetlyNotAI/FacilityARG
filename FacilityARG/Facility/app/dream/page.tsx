'use client';

import React, {useEffect, useRef, useState} from 'react';
import {BACKGROUND_AUDIO, usePlayBackgroundAudio} from '@/audio';
import {imgCaption, smileLocation, whispers} from '@/lib/client/data/dream';
import styles from '@/styles/Dream.module.css';
import Cookies from "js-cookie";
import {cookies, routes} from "@/lib/saveData";


export default function DreamScreen() {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [caption, setCaption] = useState<string>('');
    const audioRef = useRef<HTMLAudioElement>(null);

    usePlayBackgroundAudio(audioRef, BACKGROUND_AUDIO.DREAM);

    useEffect(() => {
        const treeCookie = Cookies.get(cookies.tree);
        if (typeof window !== 'undefined' && !treeCookie && Math.floor(Math.random() * 43) === 0) {
            window.location.href = routes.oArvoreDaCarne;
            return;
        }
        const filenames = Object.keys(imgCaption);
        const random = filenames[Math.floor(Math.random() * filenames.length)];
        setImageSrc(smileLocation(random));
        setCaption(imgCaption[random]);
    }, []);

    const generateWhispers = () =>
        whispers.map((text, index) => {
            const left = Math.floor(Math.random() * 90) + '%';
            const top = Math.floor(Math.random() * 90) + '%';
            const rotate = Math.floor(Math.random() * 10 - 5);
            const opacity = Math.random() * 0.05 + 0.02;
            const fontSize = `${Math.floor(Math.random() * 14 + 10)}px`;

            return (
                <span
                    key={index}
                    className={styles.whisperText}
                    style={{
                        left,
                        top,
                        opacity,
                        fontSize,
                        transform: `rotate(${rotate}deg)`,
                    }}
                >
                    {text}
                </span>
            );
        });

    return (
        <>
            <audio
                ref={audioRef}
                style={{display: 'none'}}
                src={BACKGROUND_AUDIO.DREAM}
                preload="auto"
                loop
            />

            {imageSrc && (
                <main
                    style={{
                        width: '100vw',
                        minHeight: '100vh',
                        margin: 0,
                        padding: '3rem 1rem 4rem',
                        backgroundColor: '#121212',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        userSelect: 'none',
                        color: '#bbb',
                        fontFamily: `'Palatino Linotype', 'Book Antiqua', Palatino, serif`,
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                    aria-label="images of a dream once more"
                >
                    <div className={styles.backgroundWhispers} aria-hidden="true">
                        {generateWhispers()}
                    </div>

                    <figure
                        style={{
                            position: 'relative',
                            display: 'inline-block',
                            backgroundColor: '#e6dfd6',
                            border: '1.2rem solid #c1b9a7',
                            borderRadius: '1rem',
                            boxShadow:
                                'inset 0 0 12px 3px #dfd7c7, 0 4px 10px rgba(0,0,0,0.4)',
                            filter: 'grayscale(0.5) contrast(0.85) brightness(1.05)',
                            clipPath: 'polygon(5% 0%, 95% 2%, 98% 95%, 3% 98%)',
                            padding: '0.6rem',
                            maxWidth: '400px',
                            zIndex: 2,
                        }}
                    >
                        <img
                            src={imageSrc}
                            alt="Dream"
                            draggable={false}
                            style={{
                                display: 'block',
                                width: '100%',
                                height: 'auto',
                                maxWidth: '350px',
                                objectFit: 'cover',
                                filter: 'sepia(0.15) contrast(1.1) saturate(0.7) brightness(0.9)',
                                mixBlendMode: 'multiply',
                                borderRadius: '0.6rem',
                                userSelect: 'none',
                                transform: 'scale(1.1) translateZ(0)',
                                willChange: 'transform',
                                transition: 'transform 0.3s ease',
                                margin: '0 auto',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'scale(1.15) translateZ(0)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'scale(1.1) translateZ(0)';
                            }}
                        />

                        <div className={styles.paperTexture}/>
                        <div className={styles.vignette}/>
                        <div className={styles.flickerDot} aria-hidden="true"/>
                    </figure>

                    <figcaption
                        style={{
                            marginTop: '1.5rem',
                            maxWidth: '90vw',
                            fontSize: '1.3rem',
                            lineHeight: 1.4,
                            color: '#aaa',
                            textAlign: 'center',
                            userSelect: 'text',
                            textShadow: '0 0 3px #00000088',
                            fontStyle: 'italic',
                            fontFamily: `'Georgia', serif`,
                            zIndex: 2,
                        }}
                    >
                        {caption}
                    </figcaption>
                </main>
            )}
        </>
    );
}
