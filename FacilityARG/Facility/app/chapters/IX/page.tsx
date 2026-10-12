'use client';

import {useEffect, useRef, useState} from 'react';
import {chapterIXData} from "@/lib/client/data/chapters/IX";
import styles from '@/styles/Philosophy.module.css';
import {useChapterAccess, useFailed} from "@/hooks";
import {BACKGROUND_AUDIO, usePlayBackgroundAudio} from "@/audio";
import {localStorageKeys} from "@/lib/saveData";

export default function Philosophy() {
    const {isCurrentlySolved, setIsCurrentlySolved} = useChapterAccess();
    const audioRef = useRef<HTMLAudioElement>(null);
    const [entityFragments, setEntityFragments] = useState<Record<number, string>>({});
    const [hasKilledTree, setHasKilledTree] = useState(false);

    usePlayBackgroundAudio(audioRef, BACKGROUND_AUDIO.BONUS.IX);
    useFailed('IX');

    // Check if player has collected all 7 Entity fragments and killed TREE.exe
    useEffect(() => {
        const entityData = JSON.parse(localStorage.getItem(localStorageKeys.chIV_EntityProgress) || '{"fragments":{}}');
        const fragments = entityData.fragments || {};
        const treeKilled = localStorage.getItem(localStorageKeys.chIX_TreeKilled) === 'true';
        setEntityFragments(fragments);
        setHasKilledTree(treeKilled);
    }, []);

    useEffect(() => {
        // Only mark as solved if tree has been killed
        setIsCurrentlySolved(hasKilledTree);
    }, [hasKilledTree]);

    useEffect(() => {
        if (isCurrentlySolved === false) {
            const link = document.createElement('a');
            link.href = chapterIXData.txt15Path;
            link.download = '15.txt';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }, [isCurrentlySolved]);

    // Check if all 7 fragments collected
    const allFragmentsCollected = Object.keys(entityFragments).length >= 7;
    const needsToKillTree = allFragmentsCollected && !hasKilledTree;
    const missingFragments = !allFragmentsCollected;

    return (
        <>
            <audio ref={audioRef} src={BACKGROUND_AUDIO.BONUS.IX} loop preload="auto" style={{display: 'none'}}/>
            <main className={styles.main}>
                <div className={styles.overlay}></div>
                <div className={styles.noise}></div>

                <h1 className={styles.glitch} data-text={chapterIXData.title}>
                    {chapterIXData.title}
                </h1>

                {missingFragments ? (
                    <div className={styles.text}>
                        <p className={styles.pilgrimageText}>
                            <span style={{color: '#888'}}>
                                You feel you are missing some fragments...<br/>
                                <br/>
                            </span>
                            <span style={{color: '#ff8844'}}>
                                Maybe you should go back to your future self?<br/>
                            </span>
                            <br/>
                            <span style={{color: '#666', fontSize: '0.9em', fontStyle: 'italic'}}>
                                ({Object.keys(entityFragments).length}/7 fragments collected)
                            </span>
                        </p>
                    </div>
                ) : needsToKillTree ? (
                    <div className={styles.text}>
                        <p className={styles.pilgrimageText}>
                            <span className={styles.redGlitch} data-text="THE HOLLOW SEQUENCE AWAITS">THE HOLLOW SEQUENCE AWAITS</span>
                            <br/><br/>
                            <span style={{color: '#888'}}>
                                Seven fragments assembled.<br/>
                                The pathway encoded: Smoke ≠ Dawn.<br/>
                                Rusted spires recognized.<br/>
                                <br/>
                                Yet the TREE still draws breath.<br/>
                                Still grasps behind the wall.<br/>
                                <br/>
                            </span>
                            <span className={styles.yellowGlitch} data-text="Return to where it began.">Return to where it began.</span>
                            <br/>
                            <span style={{color: '#ff4444'}}>
                                The Entity awaits your final directive.<br/>
                                Seven fragments grant permission for what was once forbidden.<br/>
                                <br/>
                            </span>
                            <span style={{color: '#666', fontSize: '0.9em', fontStyle: 'italic'}}>
                                "Via ignota, via mortis."<br/>
                                "Venite, venite, ossa camminanti."<br/>
                                "Non omnis moriar... ma nulla resta."<br/>
                                <br/>
                                What stands must fall.<br/>
                                What grows must be cut.<br/>
                            </span>
                        </p>
                    </div>
                ) : (
                <p className={styles.text}>
                    Email{' '}
                    <a
                        className={styles.email}
                        href={`mailto:${chapterIXData.email}`}
                        data-text={chapterIXData.email}
                    >
                        {chapterIXData.email}
                    </a>{' '}
                    {chapterIXData.instructions}
                    <br/><br/>
                    <span className={styles.smalltext}>
                    {chapterIXData.smallText.split('\n').map((line, idx) => (
                        <span key={idx}>{line}<br/></span>
                    ))}
                </span>
                </p>
                )}

                <div className={`${styles.status} ${isCurrentlySolved ? styles.statusSolved : styles.statusPending}`}>
                    {isCurrentlySolved === null && (
                        <p className={styles.awaiting}>{chapterIXData.status.initializing}</p>
                    )}
                    {isCurrentlySolved === false && !needsToKillTree && (
                        <div className={styles.pendingBlock}>
                            {chapterIXData.status.pending.map((line, idx) => (
                                <p key={idx} className={idx === 0 ? styles.awaiting : styles.awaitingSub}>
                                    {line}
                                </p>
                            ))}
                        </div>
                    )}
                    {isCurrentlySolved === true && (
                        <div className={styles.solvedBlock}>
                            <p className={styles.solvedGlitch} data-text={chapterIXData.status.solved.main}>
                                {chapterIXData.status.solved.main}
                            </p>
                            <p className={styles.aftertext}>
                                {chapterIXData.status.solved.afterText}
                            </p>
                        </div>
                    )}
                </div>

                <div className={styles.glow}></div>
            </main>
        </>
    );
}
