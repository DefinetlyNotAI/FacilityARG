'use client';

import React, {useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import {chapterIV} from '@/lib/client/data/chapters/IV';
import {seededShuffle, seedFromString} from '@/lib/client/utils/chapters';
import {useActStateCheck} from "@/hooks";
import {ActionState} from "@/types";
import {cookies, localStorageKeys, routes} from "@/lib/saveData";
import {BACKGROUND_AUDIO, playSafeSFX, SFX_AUDIO, usePlayBackgroundAudio} from "@/audio";
import {useRouter} from "next/navigation";
import Cookies from "js-cookie";
import {PuzzleHeader, Riddle, StageContainer, StageNavigation} from '@/components/chIV';

export default function TreePuzzlePage() {
    const router = useRouter();
    const audioRef = useRef<HTMLAudioElement>(null);

    // Check if chapter is not yet released - redirect if so
    const isNotReleased = useActStateCheck("iv", ActionState.NotReleased, routes.bonus.notYet);

    // Check if bonus content is locked - redirect if so
    useEffect(() => {
        if (!Cookies.get(cookies.end)) router.replace(routes.bonus.locked);
    }, [router]);

    usePlayBackgroundAudio(audioRef, BACKGROUND_AUDIO.BONUS.IV);

    const puzzle = chapterIV.puzzles.TREE;
    const stages = puzzle.stageData || [];
    const [stageIndex, setStageIndex] = useState<number>(0);
    const [input, setInput] = useState<string>('');
    const [feedback, setFeedback] = useState<string>('');
    const [completed, setCompleted] = useState<boolean>(false);

    // Track the highest unlocked stage index (0-based). Initially only stage 0 is unlocked.
    const [unlockedStage, setUnlockedStage] = useState<number>(0);

    // Helper to safely unlock a stage and navigate to it (persists to localStorage)
    const unlockAndGo = (index: number) => {
        setUnlockedStage(prev => Math.max(prev, index));
        setStageIndex(index);
        try {
            localStorage.setItem(localStorageKeys.chIV_TREEProgress, String(index));
        } catch (e) {
        }
    }

    // Ensure user cannot view a stage higher than their unlockedStage (clamp)
    useEffect(() => {
        if (stageIndex > unlockedStage) {
            setStageIndex(unlockedStage);
        }
    }, [stageIndex, unlockedStage]);

    // Stage 2 specific state
    const [nodes, setNodes] = useState<{ id: string, label: string, withered?: boolean }[]>([]);
    const [nodeSeq, setNodeSeq] = useState<string>('');
    const [stage2Started, setStage2Started] = useState<boolean>(false); // timer starts when true

    // Timer / difficulty spike for stage 2
    const [stage2BaseTime, setStage2BaseTime] = useState<number>(15); // seconds (can increase after penalties)
    const [remainingTime, setRemainingTime] = useState<number>(stage2BaseTime);
    const [, setConsecutiveTimeFails] = useState<number>(0);

    // Stage 3 riddle correctness tracking
    const [riddleCorrects, setRiddleCorrects] = useState<boolean[]>([false, false, false]);

    useEffect(() => {
        // load progress
        try {
            const raw = localStorage.getItem(localStorageKeys.chIV_TREEProgress);
            if (raw) {
                const i = parseInt(raw, 10);
                if (!isNaN(i) && i >= 0 && i < stages.length) {
                    setStageIndex(i);
                    // if user has progressed past stage 0, unlock up to that index
                    if (i > 0) setUnlockedStage(i);
                }
                if (!isNaN(i) && i >= stages.length) {
                    setCompleted(true);
                    setUnlockedStage(stages.length - 1);
                    setStageIndex(stages.length);
                }
            }
        } catch (e) {
            // ignore
        }
    }, [stages.length]);

    useEffect(() => {
        try {
            localStorage.setItem(localStorageKeys.chIV_TREEProgress, String(stageIndex));
        } catch (e) {
        }
    }, [stageIndex]);

    useEffect(() => {
        // initialize nodes for stage 2 when reached - deterministic from stage1 payload
        if (stageIndex === 1 && nodes.length === 0) {
            const base = [
                {id: 'n1', label: '5'},
                {id: 'n2', label: '2'},
                {id: 'n3', label: '8'},
                {id: 'n4', label: '1'},
            ];
            // use stage1 payload as seed; fallback to plaque id
            const seedStr = stages[0]?.payload || 'TREE';
            const shuffled = seededShuffle(base, seedStr).map((n, idx) => ({
                ...n,
                withered: (Math.floor(seedFromString(seedStr + n.id) % 4) === 0) && idx !== 0
            }));
            setNodes(shuffled);
            setNodeSeq('');
            setFeedback('Activate nodes in the correct order. Avoid withered nodes.');

            // initialize timer for stage 2 (use current base time)
            setRemainingTime(stage2BaseTime);
        }
    }, [stageIndex]);

    // When leaving stage 2, clear any running timer state
    useEffect(() => {
        if (stageIndex !== 1) {
            setRemainingTime(stage2BaseTime);
        }
    }, [stageIndex, stage2BaseTime]);

    // Timer effect for stage 2
    useEffect(() => {
        if (stageIndex !== 1) return;
        if (!stage2Started) return; // don't start ticking until user begins
        let cancelled = false;
        const tick = () => {
            setRemainingTime(prev => {
                if (cancelled) return prev;
                if (prev <= 1) {
                    // Time expired: count as a time failure
                    // Reset sequence and increment consecutive time-fails
                    setNodeSeq('');
                    try {
                        playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);
                    } catch (e) {
                    }
                    setFeedback('Time expired - sequence reset.');
                    setConsecutiveTimeFails(prevFails => {
                        const next = prevFails + 1;
                        if (next >= 3) {
                            // add 5 seconds penalty to base time and reset the consecutive counter
                            setStage2BaseTime(bt => bt + 5);
                            setFeedback('Three consecutive time failures - timer increased by 5 seconds.');
                            return 0;
                        }
                        return next;
                    });
                    // restart remaining time from (possibly updated) base time on next render
                    return stage2BaseTime;
                }
                return prev - 1;
            });
        }

        const id = setInterval(tick, 1000);
        return () => {
            cancelled = true;
            clearInterval(id);
        };
    }, [stageIndex, stage2BaseTime, stage2Started]);

    // Helper: mutate withered nodes with a 25% chance to change their label to a different number
    const mutateWitheredNodes = () => {
        setNodes(prev => {
            const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
            let changed = false;
            // We'll allow withered nodes to either change label or move (swap) with small chance
            let next = [...prev];
            for (let idx = 0; idx < next.length; idx++) {
                const n = next[idx];
                if (!n.withered) continue;
                const r = Math.random();
                if (r < 0.25) {
                    // change label
                    const choices = digits.filter(d => d !== n.label);
                    const newLabel = choices[Math.floor(Math.random() * choices.length)];
                    next[idx] = {...n, label: newLabel};
                    changed = true;
                } else if (r < 0.5) {
                    // move (swap) this withered node with another random node
                    const otherIdx = Math.floor(Math.random() * next.length);
                    if (otherIdx !== idx) {
                        const tmp = next[otherIdx];
                        next[otherIdx] = {...n};
                        next[idx] = {...tmp};
                        changed = true;
                    }
                }
            }
            return changed ? next : prev;
        });
    }

    const handleNodeClick = (node: { id: string, label: string, withered?: boolean }) => {
        // mark that the player started stage 2 (timer begins)
        if (!stage2Started) setStage2Started(true);

        // mutate/move some withered nodes on each interaction to create a difficulty spike
        mutateWitheredNodes();

        if (node.withered) {
            // touching a withered node resets sequence and also resets consecutive time-fail counter
            setNodeSeq('');
            try {
                playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);
            } catch (e) {
            }
            setFeedback('You touched a withered node - sequence reset.');
            setConsecutiveTimeFails(0);
            // restart timer
            setRemainingTime(stage2BaseTime);
            return;
        }

        // clicking a normal node should also clear consecutive time failures (they only count timeouts)
        setConsecutiveTimeFails(0);

        setNodeSeq(prev => {
            const next = prev + node.label;

            // Only validate locally once we've reached the expected length from the stage payload
            const expected = stages[1]?.payload || '';
            if (expected && next.length >= expected.length) {
                if (next === expected) {
                    try {
                        playSafeSFX(audioRef, SFX_AUDIO.SUCCESS, false);
                    } catch (e) {
                    }
                    setFeedback('Correct sequence! Advancing...');
                    // reset timer/consecutive fails on success
                    setConsecutiveTimeFails(0);
                    setRemainingTime(stage2BaseTime);
                    // unlock next stage and advance
                    setTimeout(() => {
                        // stop the stage2 timer when advancing
                        setStage2Started(false);
                        unlockAndGo(2);
                        setNodeSeq('');
                    }, 700);
                } else {
                    try {
                        playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);
                    } catch (e) {
                    }
                    setFeedback('Wrong sequence - reset and try again.');
                    // reset sequence and timer
                    setRemainingTime(stage2BaseTime);
                    return '';
                }
            }

            return next;
        });
    }

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        setFeedback('');
        const provided = (input || '').trim().toLowerCase();

        // Stage 1 special: accept either the full stage2 payload or its length (backwards compatible)
        if (stageIndex === 0) {
            const stage2PayloadRaw = (stages[1]?.payload || '');
            const normalize = (s: string) => s.replace(/[^a-z0-9]/gi, '').toLowerCase();
            const stage2Payload = normalize(stage2PayloadRaw);
            const providedNorm = normalize(provided);
            const stage2PayloadLengthStr = String(stage2PayloadRaw.length);
            // accept if normalized direct match, or numeric length match
            if (providedNorm === stage2Payload || providedNorm === normalize(stage2PayloadLengthStr)) {
                try {
                    playSafeSFX(audioRef, SFX_AUDIO.SUCCESS, false);
                } catch (e) {
                }
                setFeedback('Correct - unlocking Stage 2.');
                unlockAndGo(1);
                setInput('');
            } else {
                try {
                    playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);
                } catch (e) {
                }
                setFeedback('Incorrect answer. Try again.');
            }
            return;
        }

        // Generic fallback: compare to explicit 'answer' if provided in stageData
        try {
            playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);
        } catch (e) {
        }
        setFeedback('Incorrect. Try again.');
    }

    const onRiddleResult = (i: number, ok: boolean) => {
        setRiddleCorrects(prev => {
            const next = [...prev];
            next[i] = ok;
            // if all true, complete the puzzle
            if (next.every(Boolean)) {
                setFeedback('All riddles solved! You can submit to complete the plaque.');
            }
            return next;
        });
    }

    const handleStage3FinalSubmit = () => {
        if (!riddleCorrects.every(Boolean)) {
            try {
                playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);
            } catch (e) {
            }
            setFeedback('All riddles must be correct before submission.');
            return;
        }
        try {
            playSafeSFX(audioRef, SFX_AUDIO.SUCCESS, false);
        } catch (e) {
        }
        setFeedback('Stage complete - take a screenshot of this page as proof and then continue.');
        setTimeout(() => {
            setCompleted(true);
            setUnlockedStage(stages.length - 1);
            setStageIndex(stages.length);
            try {
                localStorage.setItem(localStorageKeys.chIV_TREEProgress, String(stages.length));
            } catch (e) {
            }
        }, 800);
    }

    // Show loading while checking access
    if (isNotReleased === null) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white font-mono">Loading...</div>
            </div>
        );
    }
    if (!puzzle) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white font-mono">Puzzle not found.</div>
            </div>
        );
    }

    // Basic UI rendering for stages
    return (
        <>
            <audio ref={audioRef} src={BACKGROUND_AUDIO.BONUS.IV} loop preload="auto" style={{display: 'none'}}/>
            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 p-8">
                <div className="max-w-3xl mx-auto">
                    <PuzzleHeader
                        title={chapterIV.chapterIVPlaques.find(p => p.id === 'TREE')?.solvedName || 'TREE'}
                        subtitle={chapterIV.text.subHeader}
                    />

                    <StageNavigation
                        stages={stages}
                        currentStageIndex={stageIndex}
                        unlockedStage={unlockedStage}
                        onStageChange={setStageIndex}
                    />

                    <StageContainer
                        title={stages[stageIndex]?.title || 'Stage'}
                        instruction={stages[stageIndex]?.instruction || ''}
                    >

                        {stageIndex === 0 && (
                            <div className="space-y-3">
                                <div className="text-xs text-gray-400">Stage 1 payload (dossier):</div>

                                <div
                                    className="relative bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700 rounded p-2">
                                <pre
                                    className="m-0 font-mono text-sm text-white whitespace-pre-wrap break-words max-h-28 overflow-auto px-2 py-1 bg-black/20 rounded">{stages[0]?.payload || ''}</pre>

                                    <div className="absolute top-2 right-2 flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                try {
                                                    navigator.clipboard?.writeText(stages[0]?.payload || '');
                                                    setFeedback('Payload copied to clipboard.');
                                                    setTimeout(() => setFeedback(''), 1500);
                                                } catch (e) {
                                                    setFeedback('Copy failed.');
                                                }
                                            }}
                                            className="bg-emerald-600 hover:bg-emerald-500 text-black font-mono px-2 py-1 rounded text-xs">
                                            Copy
                                        </button>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="flex gap-2">
                                    <input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Enter answer"
                                        className="bg-gray-800 text-white font-mono text-sm px-3 py-2 rounded flex-1"/>
                                    <button type="submit"
                                            className="bg-green-600 hover:bg-green-500 text-black font-mono px-3 py-1 rounded text-sm">Submit
                                    </button>
                                </form>
                            </div>
                        )}

                        {stageIndex === 1 && (
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-sm text-gray-400">Time remaining: <span
                                        className="font-mono text-white">{remainingTime}s</span></div>
                                    <div className="text-sm text-gray-400">Base timer: <span
                                        className="font-mono text-white">{stage2BaseTime}s</span></div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    {nodes.map(n => (
                                        <button key={n.id}
                                                onClick={() => handleNodeClick(n)}
                                                className={`p-4 rounded font-mono text-xl ${n.withered ? 'bg-red-900 text-red-100 opacity-90' : 'bg-green-900 text-white'}`}>
                                            {n.label}
                                            {n.withered && <div className="text-xs text-red-300 mt-1">withered</div>}
                                        </button>
                                    ))}
                                </div>

                                <div className="text-sm text-gray-300 mb-2">Sequence: <span
                                    className="font-mono">{nodeSeq}</span></div>
                                <div className="text-sm text-yellow-400">{feedback}</div>
                            </div>
                        )}

                        {stageIndex === 2 && (
                            <div className="space-y-4">
                                <div className="text-sm text-gray-400">Stage 3 is a riddle chain; solve each riddle to
                                    reveal a word. When all three are correct you may submit to complete.
                                </div>

                                <Riddle idx={0}
                                        prompt={'I speak without a mouth and hear without ears. I have nobody, but I come alive with wind.'}
                                        expectedChunk={'echo'} onResult={onRiddleResult}/>
                                <Riddle idx={1}
                                        prompt={'I have cities, but no houses. I have mountains, but no trees. I have water, but no fish.'}
                                        expectedChunk={'map'} onResult={onRiddleResult}/>
                                <Riddle idx={2}
                                        prompt={'I am not alive, but I grow; I do not have lungs, but I need air; I do not have a mouth, but water kills me.'}
                                        expectedChunk={'fire'} onResult={onRiddleResult}/>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleStage3FinalSubmit}
                                        disabled={!riddleCorrects.every(Boolean)}
                                        className={`px-3 py-1 font-mono text-sm rounded ${riddleCorrects.every(Boolean) ? 'bg-emerald-600 text-black' : 'bg-gray-800 text-gray-500'}`}>
                                        Submit Completion
                                    </button>
                                    <div className="text-sm text-yellow-400">{feedback}</div>
                                </div>
                                {riddleCorrects.every(Boolean) && (
                                    <div className="text-xs text-gray-400 italic">All riddles correct - please take a
                                        screenshot of this screen to document completion.</div>
                                )}
                            </div>
                        )}

                        {stageIndex >= stages.length && (
                            <div className="text-center py-12">
                                <div className="text-green-400 font-mono text-lg">Puzzle complete.</div>
                                <div className="mt-3">
                                    <Link href="/chapters/IV" className="text-sm font-mono underline text-gray-300">Back
                                        to
                                        Chapter IV</Link>
                                </div>
                            </div>
                        )}

                    </StageContainer>

                    <div className="mt-4 text-sm text-gray-400">{completed ? 'Completed and saved.' : ''}</div>

                </div>
            </div>
        </>
    );
}
