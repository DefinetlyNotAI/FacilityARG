'use client';

import React, {useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import styles from "@/styles/ChapterBonusRoot.module.css";
import {bonusApi} from "@/lib/client/utils";
import {routes} from "@/lib/saveData";
import {ActionState, BonusResponse} from "@/types";
import {BACKGROUND_AUDIO, usePlayBackgroundAudio} from "@/audio";
import {failQuestNames, rootChapterText, successQuestNames, validRomans} from "@/lib/client/data/chapters";


export default function ChapterBonusPage() {
    const router = useRouter();
    const [data, setData] = useState<BonusResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const POLL_MS = 5000;
    const audioRef = useRef<HTMLAudioElement>(null);

    // Initialize background audio
    usePlayBackgroundAudio(audioRef, BACKGROUND_AUDIO.BONUS.MAIN)

    const fetchAll = async () => {
        try {
            const res = await bonusApi.getAll();
            setData(res);
        } catch (e) {
            console.error("Failed fetching bonus states:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll().catch(console.error);
        const id = setInterval(fetchAll, POLL_MS);
        return () => clearInterval(id);
    }, []);

    const handleClick = (roman: string, _idx: number, state: ActionState) => {
        if (state === ActionState.NotReleased) return;
        if (state === ActionState.Failed) {
            router.push(routes.bonus.noTimeChID(roman));
            return;
        }
        router.push(routes.bonus.actID(roman));
    };

    return (
        <>
            <audio
                ref={audioRef}
                src={BACKGROUND_AUDIO.BONUS.MAIN}
                loop={true}
                preload="auto"
                style={{display: "none"}}/>
            <main className={styles.root}>
                <div className={styles.vignette}/>
                <section className={styles.container}>
                    <h1 className={styles.title}>{rootChapterText.pageTitle}</h1>
                    <p className={styles.subtitle}>{rootChapterText.pageSubtitle}</p>

                    <div className={styles.grid}>
                        {validRomans.map((roman, idx) => {
                            const actKey = `Act_${roman.toUpperCase()}` as keyof BonusResponse;
                            const state = data ? data[actKey] : undefined;

                            let label = rootChapterText.unknownLabel;
                            let cls = styles.btnGrey;
                            let disabled = true;

                            if (!state) {
                                label = loading ? rootChapterText.loadingLabel : rootChapterText.unknownLabel;
                            } else {
                                switch (state) {
                                    case ActionState.NotReleased:
                                        label = rootChapterText.unknownLabel;
                                        cls = styles.btnGrey;
                                        disabled = true;
                                        break;
                                    case ActionState.Released:
                                        label = rootChapterText.actLabel(roman);
                                        cls = styles.btnCyan;
                                        disabled = false;
                                        break;
                                    case ActionState.Failed:
                                        label = failQuestNames[idx] ?? rootChapterText.failDefault;
                                        cls = styles.btnRed;
                                        disabled = false;
                                        break;
                                    case ActionState.Succeeded:
                                        label = successQuestNames[idx] ?? rootChapterText.actLabel(roman);
                                        cls = styles.btnGreen;
                                        disabled = false;
                                        break;
                                }
                            }

                            return (
                                <button
                                    key={roman}
                                    className={`${styles.btn} ${cls}`}
                                    onClick={() => handleClick(roman, idx, state as ActionState)}
                                    disabled={disabled}
                                    aria-disabled={disabled}
                                    title={label}
                                >
                                    <div className={styles.btnInner}>
                                        <span className={styles.btnLabel}>{label}</span>
                                        <span className={styles.btnRoman}>{roman}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>
            </main>
        </>
    );
}
