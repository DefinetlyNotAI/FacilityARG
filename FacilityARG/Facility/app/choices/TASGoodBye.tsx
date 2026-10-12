import React, {useEffect, useState} from "react";
import styles from "@/styles/Choices.module.css";
import {cutsceneLines, finaleMsg} from "@/lib/client/data/choices";
import {useTypewriter} from "@/hooks";
import {SFX_AUDIO} from "@/audio";
import {signCookie} from "@/lib/client/utils";
import {TASGoodByeProps} from "@/types";
import {cookies} from "@/lib/saveData";
import {renderMsg} from "@/lib/ui";


const TASGoodBye: React.FC<TASGoodByeProps> = ({onDone}) => {
    const [step, setStep] = useState(0);
    const [done, setDone] = useState(false);
    const display = useTypewriter(cutsceneLines[step] || "", 26);

    useEffect(() => {
        (async () => {
            await signCookie(`${cookies.killTAS}=true`);
        })();
    }, []);

    useEffect(() => {
        let cancelled = false;
        let audio: HTMLAudioElement | null = null;
        let timeout: NodeJS.Timeout;

        function playNext() {
            if (cancelled) return;
            if (step >= cutsceneLines.length) {
                setDone(true);
                setTimeout(() => {
                    onDone();
                }, 2200);
                return;
            }

            // note not using `playSafeSFX` here as there is no background audio to process safely
            function playSfx(src: string, vol = 1.0) {
                audio = new Audio(src);
                audio.volume = vol;
                audio.play().catch(console.error);
            }

            // Play audio for certain steps
            if (audio) {
                audio.pause();
                audio = null;
            }
            if (step === 1) playSfx(SFX_AUDIO.HEARTBEAT);
            if ([4, 5, 9].includes(step)) playSfx(SFX_AUDIO.FILE_DELETE, 0.95);
            if ([8, 10].includes(step)) playSfx(SFX_AUDIO.CENSORSHIP);
            if ([11, 12].includes(step)) playSfx(SFX_AUDIO.STATIC);
            clearTimeout(timeout); // right before setting a new one
            timeout = setTimeout(() => {
                setStep((s) => s + 1);
            }, step === 3 ? 3200 : 1800);
        }

        playNext();

        return () => {
            cancelled = true;
            if (audio) audio.pause();
            clearTimeout(timeout);
        };
    }, [step, onDone]);

    return (
        <div className={styles["cutscene-overlay"]}>
            <div className={styles["cutscene-typewriter"]}>
                <span>
                    {renderMsg(display)}
                </span>
                {done && (
                    <div className={styles["cutscene-finale"]}>
                        <b>{finaleMsg}</b>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TASGoodBye;
