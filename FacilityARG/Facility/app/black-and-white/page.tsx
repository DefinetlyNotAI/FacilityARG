'use client';

import React, {useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import Cookies from 'js-cookie';
import {BACKGROUND_AUDIO, playAudio, SFX_AUDIO, usePlayBackgroundAudio} from "@/audio";
import {checkKeyword, signCookie} from "@/lib/client/utils";
import {BNW} from "@/lib/client/data/bnw";
import {cookies, routes} from "@/lib/saveData";


export default function BlackAndWhitePage() {
    const router = useRouter();
    const [bnwUnlocked, setBnwUnlocked] = useState<boolean | null>(null);
    const topLeftBufferRef = useRef('');
    const [message, setMessage] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    // New state for form visibility and input
    const [showForm, setShowForm] = useState(false);
    const [formInput, setFormInput] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Initialize background audio
    usePlayBackgroundAudio(audioRef, BACKGROUND_AUDIO.BNW)

    // On mount: check cookie, else redirect 404
    useEffect(() => {
        const unlocked = Cookies.get(cookies.blackAndWhite);
        if (!unlocked) {
            router.replace(routes.notFound);
            return;
        }
        setBnwUnlocked(true);
    }, [router]);

    // Watch for 666x666 screen size
    useEffect(() => {
        function checkSize() {
            if (window.innerWidth === 666 && window.innerHeight === 666) {
                setShowForm(true);
            } else {
                setShowForm(false);
                setFormInput('');
                setFormError(null);
            }
        }

        checkSize();
        window.addEventListener('resize', checkSize);
        return () => window.removeEventListener('resize', checkSize);
    }, []);

    // 404 egg logic
    useEffect(() => {
        if (!bnwUnlocked) return;
        const onKeyDown = async (e: KeyboardEvent) => {
            // Only handle 404 egg logic
            if (e.key.length === 1) {
                topLeftBufferRef.current += e.key;
                if (topLeftBufferRef.current.length > 3) {
                    topLeftBufferRef.current = topLeftBufferRef.current.slice(-3);
                }

                if (topLeftBufferRef.current === '404') {
                    const rand = Math.floor(Math.random() * 404);
                    if (rand === 0) {
                        await signCookie(`${cookies.theMoon}=true`);
                        router.push(routes.moonlight);
                    } else {
                        router.push(routes.notFound);
                    }
                }
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [bnwUnlocked, router]);

    // Form submit handler
    async function handleFormSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setFormError(null);
        setMessage(null);
        try {
            const result = await checkKeyword(formInput.trim().toLowerCase(), 5);
            if (result) {
                playAudio(SFX_AUDIO.SUCCESS);
                await signCookie(`${cookies.choice}=true`);
                router.push(routes.choices);
            } else {
                playAudio(SFX_AUDIO.ERROR);
                setFormError(BNW.sorryMessage);
            }
        } catch (err) {
            setFormError(BNW.serverErr);
        }
        setSubmitting(false);
    }

    if (bnwUnlocked === null) return null;

    return (
        <>
            <audio
                ref={audioRef}
                src={BACKGROUND_AUDIO.BNW}
                loop
                preload="auto"
                style={{display: 'none'}}
            />
            <div
                style={{
                    backgroundColor: 'black',
                    color: 'white',
                    height: '100vh',
                    padding: '1rem',
                    fontFamily: 'Courier New, monospace',
                    userSelect: 'none',
                    overflowY: 'auto',
                }}
            >
                {/* Hidden 404 Corner */}
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        fontSize: '10px',
                        color: 'rgba(255,255,255,0.05)',
                        padding: '0.25rem',
                        fontWeight: 'bold',
                        pointerEvents: 'none',
                        zIndex: 9999,
                    }}
                >
                    {BNW.hint404}
                </div>

                <h1 style={{textAlign: 'center', marginBottom: '2rem'}}>
                    {BNW.topMessage}
                </h1>

                {/* QR Codes Side-by-Side */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '2rem',
                        flexWrap: 'wrap',
                    }}
                >
                    {/* Image 1 */}
                    <figure style={{
                        width: '500px',
                        height: '500px',
                        textAlign: 'center',
                        backgroundColor: '#111',
                        padding: '1rem',
                        border: '2px solid #444',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <img
                            src={BNW.imgLoc.qr}
                            alt={BNW.imgLoc.qrSubtitle}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                userSelect: 'none',
                            }}
                            draggable={false}
                        />
                        <figcaption style={{marginTop: '0.5rem'}}>{BNW.qrSubtitle}</figcaption>
                    </figure>

                    {/* Image 2 */}
                    <figure style={{
                        width: '500px',
                        height: '500px',
                        textAlign: 'center',
                        backgroundColor: '#fff',
                        padding: '1rem',
                        border: '2px solid #ccc',
                        boxShadow: '0 0 10px rgba(0,0,0,0.4)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <img
                            src={BNW.imgLoc.qrFake}
                            alt={BNW.imgLoc.qrFakeSubtitle}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                userSelect: 'none',
                            }}
                            draggable={false}
                        />
                    </figure>
                </div>

                {message && (
                    <div
                        style={{
                            marginTop: '2rem',
                            color: 'red',
                            textAlign: 'center',
                            fontWeight: 'bold',
                        }}
                    >
                        {message}
                    </div>
                )}

                {/* Keyword form appears only at 666x666 */}
                {showForm && (
                    <form
                        onSubmit={handleFormSubmit}
                        style={{
                            position: 'fixed',
                            bottom: '2rem',
                            left: 0,
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 10000,
                        }}
                    >
                        <input
                            type="text"
                            value={formInput}
                            onChange={e => setFormInput(e.target.value)}
                            disabled={submitting}
                            placeholder={BNW.formPlaceholder}
                            style={{
                                fontSize: '1.2rem',
                                padding: '0.5rem 1rem',
                                borderRadius: '4px 0 0 4px',
                                border: '1px solid #888',
                                outline: 'none',
                                width: '250px',
                                background: '#222',
                                color: '#fff',
                            }}
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                fontSize: '1.2rem',
                                padding: '0.5rem 1.5rem',
                                borderRadius: '0 4px 4px 0',
                                border: '1px solid #888',
                                background: '#444',
                                color: '#fff',
                                cursor: 'pointer',
                            }}
                        >
                            Submit
                        </button>
                        {formError && (
                            <div
                                style={{
                                    position: 'fixed',
                                    top: '2rem',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: 'rgba(255,0,0,0.95)',
                                    color: 'white',
                                    padding: '1rem 2rem',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    zIndex: 20000,
                                    boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
                                    opacity: 1,
                                    transition: 'opacity 0.7s',
                                    pointerEvents: 'none',
                                }}
                                className={formError ? 'fade-out-popup' : ''}
                                onAnimationEnd={() => setFormError(null)}
                            >
                                {formError}
                                <style>
                                    {`
                                        @keyframes fadeOutPopup {
                                            to {
                                                opacity: 0;
                                            }
                                        }
                                    `}
                                </style>
                            </div>
                        )}
                    </form>
                )}

                <p
                    style={{
                        position: 'fixed',
                        bottom: showForm ? '4.5rem' : '1rem',
                        right: '1rem',
                        fontSize: '0.8rem',
                        color: '#555',
                        userSelect: 'none',
                    }}
                >
                    {showForm ? '' : BNW.textHintForForm}
                </p>
            </div>
        </>
    );
}
