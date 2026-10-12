"use client";

import React, {useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import Cookies from 'js-cookie';
import styles from "@/styles/Choices.module.css";
import {easterEgg, monologue} from "@/lib/client/data/choices";
import TASGoodBye from "./TASGoodBye";
import {BACKGROUND_AUDIO, playSafeSFX, SFX_AUDIO} from "@/audio";
import {useTypewriter} from "@/hooks";
import {detectOsBrowser, signCookie} from "@/lib/client/utils";
import {cookies, routes} from "@/lib/saveData";
import {renderMsg} from "@/lib/ui";


// --- Main Component ---
export default function ChoicesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [greetingStep, setGreetingStep] = useState(0);
    const [greetingMessages, setGreetingMessages] = useState<string[]>([]);
    const [inputPhase, setInputPhase] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [inputDisabled, setInputDisabled] = useState(false);
    const [eggFound, setEggFound] = useState<boolean[]>(Array(easterEgg.list.length).fill(false));
    const [monologueStep, setMonologueStep] = useState(-1);
    const [showSkip, setShowSkip] = useState(false);
    const [punishment, setPunishment] = useState(false);
    const [punishCountdown, setPunishCountdown] = useState(25);
    const [showGoodLuck, setShowGoodLuck] = useState(false);
    const [cutscene, setCutscene] = useState(false);
    const [alternateGreeting, setAlternateGreeting] = useState(false);
    const [osBrowser, setOsBrowser] = useState({os: "Unknown OS", browser: "Unknown Browser"});
    const [jumpscare, setJumpscare] = useState(false);
    const [monologueInstant, setMonologueInstant] = useState(false);
    const [inputHidden, setInputHidden] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    // --- Cookie Check & Device/Location Fetch ---
    useEffect(() => {
        // 1. Cookie check
        if (!Cookies.get(cookies.choice)) {
            router.replace(routes.notFound);
            return;
        }
        if (Cookies.get(cookies.terminal)) setAlternateGreeting(true);

        // 2. Device detection
        const {os, browser} = detectOsBrowser(navigator.userAgent);
        setOsBrowser({os, browser});
        setLoading(false);
    }, []);

    // --- Greeting Message Sequence ---
    useEffect(() => {
        if (loading) return;

        const replacedMonologue: string[] = monologue.start(osBrowser.os, osBrowser.browser)
        setGreetingMessages(alternateGreeting ? [...monologue.repeatedView, ...replacedMonologue] : replacedMonologue);
        setGreetingStep(0);
        setInputPhase(false);
    }, [loading, alternateGreeting, osBrowser]);

    // --- Audio Control ---
    useEffect(() => {
        if (!audioRef.current) return;
        if (cutscene) {
            audioRef.current.pause();
        } else {
            audioRef.current.loop = true;
            audioRef.current.volume = 0.5;
            audioRef.current.play().catch(() => {
            });
        }
    }, [cutscene]);

    // --- Punishment Countdown ---
    useEffect(() => {
        if (!punishment) return;
        if (punishCountdown <= 0) {
            setPunishment(false);
            setShowGoodLuck(true);
            setJumpscare(false);
            return;
        }
        const t = setTimeout(() => setPunishCountdown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [punishment, punishCountdown]);

    // --- Greeting Advance ---
    const greetingDisplay = useTypewriter(greetingMessages[greetingStep] || "", 22);

    function handleGreetingAdvance() {
        if (greetingStep < greetingMessages.length - 1) {
            setGreetingStep((s) => s + 1);
        } else {
            setInputPhase(true);
        }
    }

    // --- Input Handling ---
    async function handleInputSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (inputDisabled) return;
        setInputDisabled(true);
        const trimmed = inputValue.trim();
        let matchedIndexes: number[] = [];
        let matchedEgg = -1;
        let matchedMsg = "";
        for (let i = 0; i < easterEgg.list.length; ++i) {
            if (easterEgg.list[i].regex.test(trimmed)) {
                matchedIndexes.push(i);
            }
        }
        if (matchedIndexes.length > 0) {
            matchedEgg = easterEgg.list[matchedIndexes[0]].egg;
            matchedMsg = easterEgg.list[matchedIndexes[0]].message;
            setEggFound((eggs) => {
                const copy = [...eggs];
                copy[matchedEgg] = true;
                return copy;
            });
            let msg = matchedMsg;
            await showMessage(msg);
            if (matchedEgg === easterEgg.specialItem.eggID) {
                setTimeout(() => {
                    setInputPhase(false);
                    setInputHidden(true);
                    setMonologueStep(0);
                }, 500);
            } else {
                setInputDisabled(false);
            }
            return;
        }
        // No match: slowly delete, then type the special message
        await slowDeleteInput();
        await slowTypeInput(easterEgg.specialItem.msg);
        setTimeout(() => {
            setInputPhase(false);
            setInputHidden(true);
            setMonologueStep(0);
        }, 500);
    }

    // --- Helpers for Input Animation ---
    function slowDeleteInput(): Promise<void> {
        return new Promise((resolve) => {
            let i = inputValue.length;

            function step() {
                if (i <= 0) return resolve();
                setInputValue((v) => v.slice(0, -1));
                setTimeout(step, 50);
                i--;
            }

            step();
        });
    }

    function slowTypeInput(str: string): Promise<void> {
        return new Promise((resolve) => {
            let i = 0;

            function step() {
                if (i > str.length) return resolve();
                setInputValue(str.slice(0, i));
                setTimeout(step, 80);
                i++;
            }

            step();
        });
    }

    function showMessage(msg: string): Promise<void> {
        return new Promise((resolve) => {
            setGreetingMessages([msg]);
            setGreetingStep(0);
            setTimeout(resolve, 1800);
        });
    }

    // --- Monologue Advance ---
    const monologueDisplay = useTypewriter(
        monologueStep >= 0 && monologueStep < monologue.final.length
            ? monologue.final[monologueStep]
            : "",
        22,
        monologueInstant
    );

    async function handleMonologueAdvance() {
        if (punishment || jumpscare || showGoodLuck) return;
        if (monologueStep < monologue.final.length - 1) {
            setMonologueStep((s) => s + 1);
        } else {
            await unlockTerminal();
        }
    }

    // --- Skip Handling ---
    function handleSkip(e: React.MouseEvent) {
        e.stopPropagation();
        setShowSkip(false);
        setJumpscare(true);
        setMonologueInstant(true);
        setTimeout(() => {
            playSafeSFX(audioRef, SFX_AUDIO.HORROR, true)
            setJumpscare(false);
            setPunishment(true);
            setPunishCountdown(25);
            setMonologueInstant(false);
        }, 1200); // Jumpscare duration
    }

    // --- Good Luck Continue Handler ---
    async function handleGoodLuckClick() {
        setShowGoodLuck(false);
        await unlockTerminal();
    }

    // --- Terminal Unlock & Cutscene ---
    async function unlockTerminal() {
        await signCookie(`${cookies.terminal}=true`);
        if (!Cookies.get(cookies.killTAS)) {
            setCutscene(true);
        } else {
            router.replace(routes.terminal);
        }
    }

    // --- Egg Tracker ---
    const eggsFoundCount = eggFound.filter(Boolean).length;

    useEffect(() => {
        if (!audioRef.current) return;

        // Play audio only after user interaction
        const playAudio = () => {
            if (cutscene) {
                audioRef.current?.pause();
            } else if (audioRef.current) {
                audioRef.current.loop = true;
                audioRef.current.volume = 0.5;
                audioRef.current.play().catch(() => {
                });
            }
            window.removeEventListener("click", playAudio);
            window.removeEventListener("keydown", playAudio);
        };

        // Attach event listeners for first interaction
        window.addEventListener("click", playAudio);
        window.addEventListener("keydown", playAudio);

        // Cleanup
        return () => {
            window.removeEventListener("click", playAudio);
            window.removeEventListener("keydown", playAudio);
        };
    }, [cutscene]);

    // --- Render ---
    return (
        <div className={styles["choices-root"]} onClick={() => {
            if (monologueStep >= 0 && !punishment && !showGoodLuck && !jumpscare) setShowSkip(true);
        }}>
            {/* Hidden looping audio */}
            <audio ref={audioRef} src={BACKGROUND_AUDIO.CHOICES} style={{display: "none"}}/>

            {/* Egg tracker */}
            <div className={styles["egg-tracker"]} title="Secret eggs found">
                {easterEgg.counterMsg}: {eggsFoundCount} / {easterEgg.list.length}
            </div>

            {/* Cutscene overlay */}
            {cutscene && (
                <TASGoodBye
                    onDone={() => router.replace(routes.terminal)}
                />
            )}

            {/* Greeting sequence */}
            {!cutscene && monologueStep < 0 && (
                <div className={styles["terminal-block"]} onClick={handleGreetingAdvance}>
                    <span>{renderMsg(greetingDisplay)}</span>
                    {greetingStep < greetingMessages.length - 1 && greetingDisplay === greetingMessages[greetingStep] && (
                        <span className={styles["blink"]}> ▍</span>
                    )}
                </div>
            )}

            {/* Input phase */}
            {!cutscene && inputPhase && !inputHidden && (
                <form className={styles["terminal-block"]} onSubmit={handleInputSubmit}>
                    <span>&gt; </span>
                    <input
                        className={styles["terminal-input"]}
                        type="text"
                        value={inputValue}
                        disabled={inputDisabled}
                        autoFocus
                        onChange={(e) => setInputValue(e.target.value)}
                        maxLength={64}
                        style={{
                            background: "transparent",
                            color: "#00FF00",
                            border: "none",
                            outline: "none",
                            fontFamily: "inherit",
                            fontSize: "inherit",
                            width: "60%",
                        }}
                    />
                </form>
            )}

            {/* Monologue phase */}
            {!cutscene && monologueStep >= 0 && (
                <div className={styles["terminal-block"]} onClick={handleMonologueAdvance}>
                    {!jumpscare && !punishment && !showGoodLuck && (
                        <>
                            <span>{renderMsg(monologueDisplay)}</span>
                            {showSkip && monologueDisplay === monologue.final[monologueStep] && (
                                <button className={styles["skip-btn"]} onClick={handleSkip}>
                                    Skip
                                </button>
                            )}
                        </>
                    )}
                    {jumpscare && (
                        <div className={styles["jumpscare"]}>{monologue.punishmentMsg.jumpscare}</div>
                    )}
                    {punishment && (
                        <div>
                            <div>{renderMsg(monologue.punishmentMsg.p1)}</div>
                            <div>{renderMsg(monologue.punishmentMsg.p2)}</div>
                            <div>{punishCountdown}s</div>
                        </div>
                    )}
                    {showGoodLuck && (
                        <>
                            <div>
                                <div>{renderMsg(monologue.punishmentMsg.end)}</div>
                            </div>
                            <div>

                                <button className={styles["skip-btn"]} onClick={handleGoodLuckClick}>Continue</button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
