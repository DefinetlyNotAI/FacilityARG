"use client";

import React, {useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {signCookie} from "@/lib/client/utils";
import Cookies from "js-cookie";
import {VNTextRenderer} from "@/components/VNRenderer";
import {BACKGROUND_AUDIO, playAudio, SFX_AUDIO} from "@/audio";
import {moonlight} from "@/lib/client/data/moonlight";
import {cookies, routes} from "@/lib/saveData";

export default function Moonlight() {
    const router = useRouter();

    // Permissions & flow control
    const [allowed, setAllowed] = useState(false);
    // Pre-cutscene state
    const [preCutsceneActive, setPreCutsceneActive] = useState(false);
    const [preCutsceneIndex, setPreCutsceneIndex] = useState(0);
    const [preCutsceneLoop, setPreCutsceneLoop] = useState(0);

    const [cutsceneActive, setCutsceneActive] = useState(false);
    const [moonRed, setMoonRed] = useState(false);
    const [showMoon, setShowMoon] = useState(false);

    const [waitingForClick, setWaitingForClick] = useState(true);

    // Cutscene state
    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [lineComplete, setLineComplete] = useState(false);

    // Prevent multiple onDone calls per line
    const onDoneCalledRef = useRef(false);

    const preCutsceneAudioRef = useRef<HTMLAudioElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Track if user has interacted (for audio unlock)
    const [userInteracted, setUserInteracted] = useState(false);

    // Soothing Easter eggs for normal moonlight
    const [showEgg, setShowEgg] = useState(false);
    const [eggIndex, setEggIndex] = useState(0);
    const [eggsSeen, setEggsSeen] = useState<number[]>([]);
    const eggTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Generate stars once
    const [stars, setStars] = useState<
        Array<{ x: number; y: number; size: number; opacity: number }>
    >([]);

    const lines = moonRed ? moonlight.creepyLines : moonlight.poeticLines;

    // Check cookie once
    useEffect(() => {
        if ((window as any).__moonlight_cookie_check_ran) return;
        (window as any).__moonlight_cookie_check_ran = true;

        const hasMoonCookie = Cookies.get(cookies.theMoon);

        if (hasMoonCookie) {
            playAudio(SFX_AUDIO.EGG_CRACK, {volume: 0.5});
            setAllowed(true);
        } else {
            router.replace(routes.notFound);
        }
    }, [router]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const roll = Math.floor(Math.random() * 43); // 0 to 42
            console.log("moon color roll:", roll);
            if (roll === 0) setMoonRed(true);            // 1 out of 43
        }
    }, []);

    // Generate stars once
    useEffect(() => {
        const newStars = [];
        for (let i = 0; i < 200; i++) {
            newStars.push({
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.8 + 0.2,
            });
        }
        setStars(newStars);
    }, []);

    // Ensure pre-cutscene audio is set up correctly
    function ensurePreCutsceneAudio(conditional: boolean = true) {
        const audio = preCutsceneAudioRef.current;
        if (conditional && audio) {
            audio.pause();
            audio.src = SFX_AUDIO.STATIC;
            audio.loop = true;
            audio.currentTime = 0;
            audio.volume = 0.7;
            audio
                .play()
                .catch(() => {
                });
        }
    }

    // Only start pre-cutscene after user click
    useEffect(() => {
        if (!allowed) return;
        if (!waitingForClick) {
            const played = Cookies.get(cookies.moonTime);
            if (!played) {
                setPreCutsceneActive(true);
                // Setup pre-cutscene audio
                ensurePreCutsceneAudio()
            } else {
                setShowMoon(true);
            }
        }
    }, [allowed, waitingForClick]);

    useEffect(() => {
        ensurePreCutsceneAudio(preCutsceneActive);
    }, [preCutsceneActive]);

    // Ensure cutscene/main audio plays when cutsceneActive or showMoon is true
    useEffect(() => {
        if ((cutsceneActive || showMoon) && audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = moonRed ? BACKGROUND_AUDIO.MOONLIGHT_RED : BACKGROUND_AUDIO.MOONLIGHT_NORMAL;
            audioRef.current.loop = true;
            audioRef.current.currentTime = 0;
            audioRef.current.volume = 0.6;
            audioRef.current
                .play()
                .catch(() => {
                });
        }
        // If neither, pause audio
        if (!cutsceneActive && !showMoon && audioRef.current) {
            audioRef.current.pause();
        }
    }, [cutsceneActive, showMoon, moonRed]);

    // Pre-cutscene image sequence logic (20ms per image, 15 loops)
    useEffect(() => {
        if (!preCutsceneActive) return;
        if (preCutsceneLoop >= 15) {
            // End pre-cutscene, cleanup audio, start main cutscene
            setPreCutsceneActive(false);
            setCutsceneActive(true);
            if (preCutsceneAudioRef.current) {
                preCutsceneAudioRef.current.pause();
                preCutsceneAudioRef.current.src = "";
            }
            // Setup main cutscene audio
            if (audioRef.current) {
                audioRef.current.src = moonRed ? BACKGROUND_AUDIO.MOONLIGHT_RED : BACKGROUND_AUDIO.MOONLIGHT_NORMAL;
                audioRef.current.loop = true;
                audioRef.current.volume = 0.6;
                audioRef.current.play().catch(() => {
                });
            }
            return;
        }
        const timeout = setTimeout(() => {
            if (preCutsceneIndex < 8) {
                setPreCutsceneIndex(preCutsceneIndex + 1);
            } else {
                setPreCutsceneIndex(0);
                setPreCutsceneLoop(preCutsceneLoop + 1);
            }
        }, 40);
        return () => clearTimeout(timeout);
    }, [preCutsceneActive, preCutsceneIndex, preCutsceneLoop, moonRed]);

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
            }
            if (preCutsceneAudioRef.current) {
                preCutsceneAudioRef.current.pause();
                preCutsceneAudioRef.current.src = "";
            }
        };
    }, []);

    // Reset onDoneCalledRef and lineComplete when line changes
    useEffect(() => {
        onDoneCalledRef.current = false;
        setLineComplete(false);
    }, [currentLineIndex]);

    // Handle advancing lines on click *only* if line is complete
    const handleClick = () => {
        if (!cutsceneActive) return;
        if (!lineComplete) return;

        // Advance to next line or finish
        if (currentLineIndex < lines.length - 1) {
            setCurrentLineIndex((i) => i + 1);
            setLineComplete(false); // Reset for next line
        } else {
            finishCutscene().catch(console.error);
        }
    };

    // Finish cutscene
    const finishCutscene = async () => {
        await signCookie(`${cookies.moonTime}=true`);
        setCutsceneActive(false);
        setShowMoon(true);
    };

    // Try to play audio after user interaction if not already playing
    useEffect(() => {
        if (!userInteracted) return;
        if (preCutsceneActive && preCutsceneAudioRef.current) {
            preCutsceneAudioRef.current
                .play()
                .catch(() => {
                });
        }
        // Play main audio if cutscene or moon is shown
        if ((cutsceneActive || showMoon) && audioRef.current) {
            audioRef.current
                .play()
                .catch(() => {
                });
        }
    }, [userInteracted, preCutsceneActive, cutsceneActive, showMoon]);

    // Add event listener for user interaction to unlock audio
    useEffect(() => {
        const unlock = () => setUserInteracted(true);
        window.addEventListener("pointerdown", unlock, {once: true});
        window.addEventListener("keydown", unlock, {once: true});
        return () => {
            window.removeEventListener("pointerdown", unlock);
            window.removeEventListener("keydown", unlock);
        };
    }, []);

    // Handler to show a random egg
    const handleEgg = React.useCallback(() => {
        if (moonRed || !showMoon) return;

        let seen = eggsSeen.slice();
        let nextEggIndex: number;

        if (seen.length >= 6) {
            seen = [];
        }

        // If all 5 normal eggs have been seen and secret not yet shown, show secret
        if (seen.length === 5 && !seen.includes(5)) {
            nextEggIndex = 5; // secret egg
            seen.push(5);
        } else {
            // Pick a random normal egg not just shown
            const normalEggs = [0, 1, 2, 3, 4];
            const unseen = normalEggs.filter(i => !seen.includes(i));
            if (unseen.length > 0) {
                const randomIdx = Math.floor(Math.random() * unseen.length);
                nextEggIndex = unseen[randomIdx];
                seen.push(nextEggIndex);
            } else {
                // All normal eggs seen, pick random normal egg
                const randomIdx = Math.floor(Math.random() * normalEggs.length);
                nextEggIndex = normalEggs[randomIdx];
            }
        }

        setEggsSeen([...new Set(seen)]);
        setEggIndex(nextEggIndex);
        setShowEgg(true);

        // Ensure only one egg popup at a time, and always lasts 8s
        if (eggTimeoutRef.current) clearTimeout(eggTimeoutRef.current);
        eggTimeoutRef.current = setTimeout(() => setShowEgg(false), 8000);
    }, [moonRed, showMoon, eggsSeen]);
    // Only set userInteracted and start animation on click
    const handleInitialClick = () => {
        setUserInteracted(true);
        setWaitingForClick(false);
        Cookies.remove(cookies.theMoon);
    };

    // Set favicon based on moonRed
    useEffect(() => {
        // SVGs as data URLs for favicon
        const fullMoonSVG = encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
                <circle cx="32" cy="32" r="28" fill="#fff" stroke="#cce6ff" stroke-width="4"/>
                <circle cx="40" cy="28" r="6" fill="#e6f3ff" opacity="0.5"/>
                <circle cx="24" cy="40" r="4" fill="#cce6ff" opacity="0.3"/>
            </svg>
        `);
        const redMoonSVG = encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
                <circle cx="32" cy="32" r="28" fill="#ff4444" stroke="#cc0000" stroke-width="4"/>
                <circle cx="40" cy="28" r="6" fill="#cc0000" opacity="0.5"/>
                <circle cx="24" cy="40" r="4" fill="#ff9999" opacity="0.3"/>
            </svg>
        `);
        const faviconHref = moonRed
            ? `data:image/svg+xml,${redMoonSVG}`
            : `data:image/svg+xml,${fullMoonSVG}`;

        let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
        }
        link.type = "image/svg+xml";
        link.href = faviconHref;

        return () => {
        };
    }, [moonRed]);

    if (!allowed) return null;

    // Show black screen with prompt until user clicks
    if (waitingForClick) {
        return (
            <>
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        background: "#000",
                        zIndex: 99999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#cce6ff",
                        fontSize: "2rem",
                        fontFamily: "'Courier New', Courier, monospace",
                        userSelect: "none",
                        cursor: "pointer",
                    }}
                    onClick={handleInitialClick}
                    tabIndex={0}
                >
                    {moonlight.messages.start}
                </div>
            </>
        );
    }

    // --- PRE-CUTSCENE: Show happy1-9 images with static audio ---
    if (preCutsceneActive) {
        return (
            <>
                <audio
                    ref={preCutsceneAudioRef}
                    style={{display: "none"}}
                    preload="auto"
                    loop
                />
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        background: "#000",
                        zIndex: 99999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <img
                        src={`/static/moonlight/TIME/happy${preCutsceneIndex + 1}.png`}
                        alt=""
                        style={{
                            width: "100vw",
                            height: "100vh",
                            objectFit: "cover",
                            userSelect: "none",
                            pointerEvents: "none",
                        }}
                        draggable={false}
                    />
                </div>
            </>
        );
    }

    return (
        <>
            <audio
                ref={audioRef}
                style={{display: "none"}}
                preload="auto"
                loop
            />
            <div
                onClick={handleClick}
                onDoubleClick={handleEgg}
                style={{
                    height: "100vh",
                    width: "100vw",
                    background: moonRed
                        ? "radial-gradient(ellipse at center, #2d0a0a 0%, #1a0000 50%, #000000 100%)"
                        : "radial-gradient(ellipse at center, #0a1a2d 0%, #001122 50%, #000000 100%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: moonRed ? "#ff9999" : "#cce6ff",
                    fontFamily: "'Courier New', Courier, monospace",
                    overflow: "hidden",
                    position: "relative",
                    userSelect: "none",
                    cursor: cutsceneActive ? "pointer" : "default",
                }}
            >
                {/* Stars */}
                {stars.map((star, index) => (
                    <div
                        key={index}
                        style={{
                            position: "absolute",
                            left: `${star.x}%`,
                            top: `${star.y}%`,
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                            backgroundColor: moonRed ? "#ff6666" : "#ffffff",
                            borderRadius: "50%",
                            opacity: star.opacity,
                            animation: `twinkle ${2 + Math.random() * 3}s infinite`,
                            boxShadow: moonRed
                                ? `0 0 ${star.size * 2}px #ff6666`
                                : `0 0 ${star.size * 2}px #ffffff`,
                        }}/>
                ))}

                {/* Cutscene Text */}
                {cutsceneActive && (
                    <div
                        style={{
                            position: "absolute",
                            top: "20%",
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: "80%",
                            maxWidth: "800px",
                            textAlign: "center",
                            fontSize: "1.8rem",
                            lineHeight: "1.6",
                            textShadow: moonRed
                                ? "0 0 20px #ff0000, 0 0 40px #ff0000"
                                : "0 0 20px #00aaff, 0 0 40px #00aaff",
                            animation: moonRed
                                ? "creepyGlow 2s ease-in-out infinite alternate"
                                : "soothingGlow 3s ease-in-out infinite alternate",
                            zIndex: 10,
                        }}
                    >
                        {!lineComplete ? (
                            <VNTextRenderer
                                text={lines[currentLineIndex]}
                                onDone={() => {
                                    if (!onDoneCalledRef.current) {
                                        setLineComplete(true);
                                        onDoneCalledRef.current = true;
                                    }
                                }}/>
                        ) : (
                            <span>{lines[currentLineIndex]}</span>
                        )}
                    </div>
                )}

                {/* Click to continue */}
                {cutsceneActive && lineComplete && (
                    <div
                        style={{
                            position: "absolute",
                            bottom: "15%",
                            left: "50%",
                            transform: "translateX(-50%)",
                            fontSize: "1rem",
                            color: moonRed ? "#ff9999" : "#cce6ff",
                            opacity: 0.7,
                            animation: "pulse 2s ease-in-out infinite",
                            zIndex: 10,
                            pointerEvents: "none", // Ensure this does not block clicks
                        }}
                    >
                        {moonlight.messages.continue}
                    </div>
                )}

                {/* Skip Button */}
                {cutsceneActive && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            finishCutscene().catch(console.error);
                        }}
                        style={{
                            position: "absolute",
                            bottom: "20px",
                            right: "20px",
                            background: "rgba(0, 0, 0, 0.7)",
                            border: `2px solid ${moonRed ? "#ff6666" : "#66aaff"}`,
                            color: moonRed ? "#ff9999" : "#cce6ff",
                            padding: "10px 20px",
                            borderRadius: "5px",
                            fontFamily: "inherit",
                            fontSize: "0.9rem",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            zIndex: 10,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = moonRed
                                ? "rgba(255, 0, 0, 0.2)"
                                : "rgba(0, 100, 255, 0.2)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(0, 0, 0, 0.7)";
                        }}
                    >
                        Skip Cutscene
                    </button>
                )}

                {/* Moon */}
                {showMoon && (
                    <div
                        onClick={() => {
                            if (!moonRed) return;

                            const link = document.createElement("a");
                            link.href = moonlight.riddleLocation.href;
                            link.download = moonlight.riddleLocation.name;
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                        }}
                        style={{
                            cursor: moonRed ? "pointer" : "default",
                            width: "400px",
                            height: "400px",
                            borderRadius: "50%",
                            background: moonRed
                                ? "radial-gradient(circle at 30% 30%, #ff4444 0%, #cc0000 40%, #660000 80%, #330000 100%)"
                                : "radial-gradient(circle at 30% 30%, #ffffff 0%, #e6f3ff 40%, #cce6ff 80%, #99ccff 100%)",
                            boxShadow: moonRed
                                ? "0 0 100px 20px #ff0000, inset -20px -20px 50px rgba(0, 0, 0, 0.3)"
                                : "0 0 100px 20px #99ccff, inset -20px -20px 50px rgba(0, 0, 0, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "120px",
                            textShadow: moonRed ? "0 0 30px #ff0000" : "0 0 30px #ffffff",
                            transition: "all 1s ease",
                            animation: moonRed
                                ? "redMoonPulse 3s ease-in-out infinite"
                                : "moonGlow 4s ease-in-out infinite alternate",
                            position: "relative",
                            userSelect: "none",
                        }}
                        title={moonRed
                            ? moonlight.hover.blood
                            : moonlight.hover.normal}
                    >
                        {/* Moon craters/texture */}
                        <div
                            style={{
                                position: "absolute",
                                width: "100%",
                                height: "100%",
                                borderRadius: "50%",
                                background: moonRed
                                    ? "radial-gradient(circle at 60% 40%, rgba(0, 0, 0, 0.3) 5%, transparent 15%), radial-gradient(circle at 20% 70%, rgba(0, 0, 0, 0.2) 3%, transparent 10%), radial-gradient(circle at 80% 20%, rgba(0, 0, 0, 0.25) 4%, transparent 12%)"
                                    : "radial-gradient(circle at 60% 40%, rgba(0, 0, 0, 0.1) 5%, transparent 15%), radial-gradient(circle at 20% 70%, rgba(0, 0, 0, 0.08) 3%, transparent 10%), radial-gradient(circle at 80% 20%, rgba(0, 0, 0, 0.12) 4%, transparent 12%)",
                                pointerEvents: "none",
                            }}/>
                    </div>
                )}

                {/* Atmospheric particles */}
                {showMoon && (
                    <div
                        style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            background: moonRed
                                ? "radial-gradient(circle at 50% 50%, rgba(255, 0, 0, 0.05) 0%, transparent 70%)"
                                : "radial-gradient(circle at 50% 50%, rgba(0, 150, 255, 0.03) 0%, transparent 70%)",
                            animation: "atmosphericFlow 8s ease-in-out infinite alternate",
                            pointerEvents: "none",
                        }}/>
                )}

                {/* Soothing Easter egg popup (normal moon only) */}
                {showEgg && !moonRed && (
                    <div
                        style={{
                            position: "absolute",
                            top: "10%",
                            left: "50%",
                            transform: "translateX(-50%)",
                            background: "rgba(0,0,32,0.85)",
                            color: "#cce6ff",
                            borderRadius: "16px",
                            padding: "24px 40px",
                            fontSize: "1.5rem",
                            boxShadow: "0 4px 32px #00336688",
                            zIndex: 100,
                            textAlign: "center",
                            pointerEvents: "none",
                            userSelect: "none",
                        }}
                    >
                        <div style={{fontSize: "2.5rem"}}>{moonlight.soothingEggs[eggIndex].emoji}</div>
                        <div style={{marginTop: 8}}>{moonlight.soothingEggs[eggIndex].text}</div>
                    </div>
                )}

                <style jsx>{`
                    @keyframes twinkle {
                        0%, 100% {
                            opacity: 0.3;
                            transform: scale(1);
                        }
                        50% {
                            opacity: 1;
                            transform: scale(1.2);
                        }
                    }

                    @keyframes soothingGlow {
                        0% {
                            text-shadow: 0 0 20px #00aaff, 0 0 40px #00aaff;
                        }
                        100% {
                            text-shadow: 0 0 30px #00aaff, 0 0 60px #00aaff, 0 0 80px #0088cc;
                        }
                    }

                    @keyframes creepyGlow {
                        0% {
                            text-shadow: 0 0 20px #ff0000, 0 0 40px #ff0000;
                        }
                        100% {
                            text-shadow: 0 0 30px #ff0000, 0 0 60px #ff0000, 0 0 80px #cc0000;
                        }
                    }

                    @keyframes moonGlow {
                        0% {
                            box-shadow: 0 0 100px 20px #99ccff, inset -20px -20px 50px rgba(0, 0, 0, 0.1);
                            transform: scale(1);
                        }
                        100% {
                            box-shadow: 0 0 150px 30px #66aaff, inset -20px -20px 50px rgba(0, 0, 0, 0.1);
                            transform: scale(1.05);
                        }
                    }

                    @keyframes redMoonPulse {
                        0%, 100% {
                            box-shadow: 0 0 100px 20px #ff0000, inset -20px -20px 50px rgba(0, 0, 0, 0.3);
                            transform: scale(1);
                        }
                        50% {
                            box-shadow: 0 0 150px 40px #ff0000, 0 0 200px 60px #cc0000, inset -20px -20px 50px rgba(0, 0, 0, 0.3);
                            transform: scale(1.1);
                        }
                    }

                    @keyframes atmosphericFlow {
                        0% {
                            transform: rotate(0deg) scale(1);
                        }
                        100% {
                            transform: rotate(360deg) scale(1.1);
                        }
                    }

                    @keyframes pulse {
                        0%, 100% {
                            opacity: 0.7;
                        }
                        50% {
                            opacity: 1;
                        }
                    }
                `}</style>
            </div>
        </>
    );
}
