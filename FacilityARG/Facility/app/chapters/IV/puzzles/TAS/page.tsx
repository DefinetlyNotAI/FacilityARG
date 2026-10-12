'use client';

import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import {chapterIV} from '@/lib/client/data/chapters/IV';
import {getJsonCookie, markCompleted, seededShuffle, setJsonCookie} from '@/lib/client/utils/chapters';
import {cookies, localStorageKeys, routes} from '@/lib/saveData';
import {useChIVSetup} from "@/hooks";
import {BACKGROUND_AUDIO, playSafeSFX, SFX_AUDIO} from "@/audio";
import {PuzzleHeader, Riddle, StageNavigation} from '@/components/chIV';


export default function TasPuzzlePage() {
    const {audioRef, isLoading} = useChIVSetup(BACKGROUND_AUDIO.BONUS.IV);

    const puzzle = chapterIV.puzzles.TAS;
    const puzzleMissing = !puzzle;

    const stages = puzzle.stageData || [];

    useEffect(() => {
        // when user opens TAS puzzle, mark as started (2) if lower
        try {
            const current = getJsonCookie(cookies.chIV_progress) || {};
            const prev = Number(current['TAS'] || 0);
            if (prev < 1) {
                current['TAS'] = 1;
                setJsonCookie(cookies.chIV_progress, current, 365);
            }
        } catch (e) {
        }
    }, []);

    const [completed, setCompleted] = useState<boolean>(false);

    // Stage answers validated on server via API

    const [stageIndex, setStageIndex] = useState<number>(0);
    const [input, setInput] = useState<string>('');
    const [feedback, setFeedback] = useState<string>('');

    // stage1 switches
    const [switches, setSwitches] = useState<number[]>([0, 0, 0, 0, 0]);

    // assembly parts
    const [parts, setParts] = useState<string[]>([]);
    const [used, setUsed] = useState<boolean[]>([]);
    const [assembly, setAssembly] = useState<string>('');

    // general stage results for merge/collect
    const [stageResults, setStageResults] = useState<Record<number, string>>({});
    const setStageResult = (idx: number, val: string) => {
        setStageResults(prev => ({...prev, [idx]: val}));
    }

    // Riddle chain correctness for final stage (local extra requirement)
    const RIDDLE_COUNT = 8;
    const [riddleCorrects, setRiddleCorrects] = useState<boolean[]>(new Array(RIDDLE_COUNT).fill(false));

    // Numpad state (Stage 5)
    const [numpadInput, setNumpadInput] = useState<string>('');
    const [witheredNumbers, setWitheredNumbers] = useState<number[]>([]);
    const [consecutiveErrors, setConsecutiveErrors] = useState<number>(0);

    // Word of the Day state (Stage 4)
    const [wordOfDayInput, setWordOfDayInput] = useState<string>('');
    const [wordOfDayCountdown, setWordOfDayCountdown] = useState<number>(15);
    const [isInverted, setIsInverted] = useState<boolean>(false);


    useEffect(() => {
        if (stageIndex === 2 && parts.length === 0) {
            // deterministic parts order seeded from stage0 payload
            const seedStr = stages[0]?.payload || 'TAS';
            const base = ['co', 'ns', 'en', 'su', 's'];
            const shuffled = seededShuffle(base, seedStr);
            setParts(shuffled);
            setUsed(new Array(shuffled.length).fill(false));
            setAssembly('');
            setFeedback('Assemble the parts in order to form the final key.');
        }
    }, [stageIndex]);

    // Load saved progress
    useEffect(() => {
        try {
            const raw = localStorage.getItem(localStorageKeys.chIV_TASProgress);
            if (raw) {
                const i = parseInt(raw, 10);
                if (!isNaN(i)) {
                    if (i >= stages.length) {
                        setCompleted(true);
                        setStageIndex(stages.length);
                    } else if (i >= 0) {
                        setStageIndex(i);
                    }
                }
            }
        } catch (e) {
        }
    }, [stages.length]);

    // Persist progress
    useEffect(() => {
        try {
            localStorage.setItem(localStorageKeys.chIV_TASProgress, String(stageIndex));
        } catch (e) {
        }
    }, [stageIndex]);

    // unlocked stage tracking (TREE-style)
    const [unlockedStage, setUnlockedStage] = useState<number>(0);
    // robust advancement helper that persists unlocked stage and index
    const advanceTo = (index: number) => {
        try {
            // persist immediately
            localStorage.setItem(localStorageKeys.chIV_TASProgress, String(index));
        } catch (e) {
        }
        setUnlockedStage(prev => Math.max(prev, index));
        setStageIndex(index);
    }

    useEffect(() => {
        if (stageIndex > unlockedStage) setStageIndex(unlockedStage);
    }, [stageIndex, unlockedStage]);

    useEffect(() => {
        // if loading a saved index, also ensure unlockedStage is at least that index
        try {
            const raw = localStorage.getItem(localStorageKeys.chIV_TASProgress);
            if (raw) {
                const i = parseInt(raw, 10);
                if (!isNaN(i)) {
                    setUnlockedStage(Math.max(0, i));
                }
            }
        } catch (e) {
        }
    }, []);

    const toggleSwitch = (i: number) => {
        setSwitches(prev => {
            const c = prev.slice();
            c[i] = c[i] === 0 ? 1 : 0;
            return c;
        });
    }

    const submitSwitches = () => {
        const bits = switches.join('');
        (async () => {
            try {
                const res = await fetch(routes.api.chapters.IV.validateStage, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({plaqueId: 'TAS', stageIndex: 1, provided: bits})
                });
                const json = await res.json();
                if (json?.ok) {
                    try {
                        playSafeSFX(audioRef, SFX_AUDIO.SUCCESS, false);
                    } catch (e) {
                    }
                    setFeedback('Correct - advancing to Stage 3');
                    // save result
                    setStageResult(1, bits);
                    // unlock/persist like TREE
                    setTimeout(() => advanceTo(2), 400);
                } else {
                    try {
                        playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);
                    } catch (e) {
                    }
                    setFeedback('Incorrect switch configuration.');
                }
            } catch (e) {
                try {
                    playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);
                } catch (er) {
                }
                setFeedback('Server error');
            }
        })();
    }

    const clickPart = (i: number) => {
        if (used[i]) return;
        setUsed(prev => {
            const c = prev.slice();
            c[i] = true;
            return c;
        });
        setAssembly(prev => prev + parts[i]);
        setFeedback('');
    }

    const submitAssembly = async () => {
        if (!assembly) {
            setFeedback('Please select at least one part.');
            return;
        }

        try {
            const res = await fetch(routes.api.chapters.IV.validateStage, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({plaqueId: 'TAS', stageIndex: 2, provided: assembly})
            });
            const json = await res.json();
            if (json?.ok) {
                try {
                    playSafeSFX(audioRef, SFX_AUDIO.SUCCESS, false);
                } catch (e) {
                }
                setFeedback('Correct final assembly - saved.');
                // save assembly result
                setStageResult(2, assembly);
                setTimeout(() => {
                    // unlock next stage (Signal Spike)
                    advanceTo(3);
                }, 500);
            } else {
                try {
                    playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);
                } catch (e) {
                }
                setFeedback('Wrong assembly - try a different order.');
            }
        } catch (e) {
            try {
                playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);
            } catch (er) {
            }
            setFeedback('Server error');
        }
    }

    // TIMED stage (Signal Spike) implementation
    const [nodes, setNodes] = useState<{ id: string, label: string, withered?: boolean }[]>([]);
    const [nodeSeq, setNodeSeq] = useState<string>('');
    const [stageTimedStarted, setStageTimedStarted] = useState<boolean>(false);
    const [stageTimedBase, setStageTimedBase] = useState<number>(15);
    const [remainingTime, setRemainingTime] = useState<number>(15);
    const [consecutiveTimeouts, setConsecutiveTimeouts] = useState<number>(0);

    useEffect(() => {
        if (stageIndex === 3 && nodes.length === 0) {
            // build nodes from seed
            const base = [
                {id: 'n1', label: '5'},
                {id: 'n2', label: '2'},
                {id: 'n3', label: '8'},
                {id: 'n4', label: '1'},
            ];
            const seedStr = stages[0]?.payload || 'TAS';
            const shuffled = seededShuffle(base, seedStr).map((n, idx) => ({
                ...n,
                withered: (Math.floor(Math.random() * 4) === 0) && idx !== 0
            }));
            setNodes(shuffled);
            setNodeSeq('');
            setStageTimedStarted(false);
            setRemainingTime(stageTimedBase);
            setFeedback('Signal Spike: activate nodes in order while avoiding withered nodes.');
        }
    }, [stageIndex]);

    useEffect(() => {
        if (stageIndex !== 3) {
            setRemainingTime(stageTimedBase);
            return;
        }
        if (!stageTimedStarted) return;
        let cancelled = false;
        const tick = () => {
            setRemainingTime(prev => {
                if (cancelled) return prev;
                if (prev <= 1) {
                    setNodeSeq('');
                    try {
                        playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);
                    } catch (e) {
                    }
                    setFeedback('Time expired - sequence reset.');
                    const next = consecutiveTimeouts + 1;
                    setConsecutiveTimeouts(next);
                    if (next >= 3) {
                        setStageTimedBase(b => b + 5);
                        setFeedback('Three consecutive timeouts - base timer increased by 5s.');
                        setConsecutiveTimeouts(0);
                    }
                    return stageTimedBase;
                }
                return prev - 1;
            });
        }
        const id = setInterval(tick, 1000);
        return () => {
            cancelled = true;
            clearInterval(id);
        }
    }, [stageIndex, stageTimedStarted, stageTimedBase, consecutiveTimeouts]);

    const mutateWithered = () => {
        setNodes(prev => {
            const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
            let changed = false;
            const next = [...prev];
            for (let i = 0; i < next.length; i++) {
                const n = next[i];
                if (!n.withered) continue;
                const r = Math.random();
                if (r < 0.25) {
                    const choices = digits.filter(d => d !== n.label);
                    const newLabel = choices[Math.floor(Math.random() * choices.length)];
                    next[i] = {...n, label: newLabel};
                    changed = true;
                } else if (r < 0.5) {
                    const other = Math.floor(Math.random() * next.length);
                    if (other !== i) {
                        const tmp = next[other];
                        next[other] = {...n};
                        next[i] = {...tmp};
                        changed = true;
                    }
                }
            }
            return changed ? next : prev;
        });
    }

    const handleNodeClick = (n: { id: string, label: string, withered?: boolean }) => {
        if (!stageTimedStarted) setStageTimedStarted(true);
        mutateWithered();
        if (n.withered) {
            setNodeSeq('');
            try {
                playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);
            } catch (e) {
            }
            setFeedback('You touched a withered node - sequence reset.');
            setRemainingTime(stageTimedBase);
            setConsecutiveTimeouts(0);
            return;
        }
        setConsecutiveTimeouts(0);
        setNodeSeq(prev => {
            const next = prev + n.label;
            const serverExpectedLen = (stages[3]?.payload || '').length || 5;
            if (next.length >= serverExpectedLen) {
                // validate with server
                (async () => {
                    try {
                        const res = await fetch(routes.api.chapters.IV.validateStage, {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({plaqueId: 'TAS', stageIndex: 3, provided: next})
                        });
                        const json = await res.json();
                        if (json?.ok) {
                            try {
                                playSafeSFX(audioRef, SFX_AUDIO.SUCCESS, false);
                            } catch (e) {
                            }
                            setFeedback('Signal sequence correct - saved.');
                            setStageResult(3, next);
                            // unlock next stage
                            setTimeout(() => advanceTo(4), 400);
                        } else {
                            try {
                                playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);
                            } catch (e) {
                            }
                            setFeedback('Wrong sequence - reset and try again.');
                            setNodeSeq('');
                            setRemainingTime(stageTimedBase);
                        }
                    } catch (e) {
                        try {
                            playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);
                        } catch (er) {
                        }
                        setFeedback('Server error');
                    }
                })();
            }
            return next;
        });
    }

    // GRID parity toggles (simple 5-bit toggles mapping to server answer)
    const [gridBits, setGridBits] = useState<number[]>([0, 0, 0, 0, 0]);
    const toggleGridBit = (i: number) => {
        setGridBits(prev => {
            const c = prev.slice();
            c[i] = c[i] ? 0 : 1;
            return c;
        });
    }
    const submitGridBits = async () => {
        const bits = gridBits.join('');
        try {
            const res = await fetch(routes.api.chapters.IV.validateStage, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({plaqueId: 'TAS', stageIndex: 4, provided: bits})
            });
            const json = await res.json();
            if (json?.ok) {
                try {
                    playSafeSFX(audioRef, SFX_AUDIO.SUCCESS, false);
                } catch (e) {
                }
                setFeedback('Grid pattern correct - saved.');
                setStageResult(4, bits);
                setTimeout(() => advanceTo(5), 400);
            } else {
                try {
                    playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);
                } catch (e) {
                }
                setFeedback('Incorrect grid pattern');
            }
        } catch (e) {
            try {
                playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);
            } catch (er) {
            }
            setFeedback('Server error');
        }
    }

    // MERGE stage: allow ordering of previously collected keys (from stageResults)
    const [_mergeOrder, setMergeOrder] = useState<number[]>([]);
    useEffect(() => {
        // initialize mergeOrder with available keys when entering merge stage
        if (stageIndex === 6) {
            const keys = Object.keys(stageResults).map(k => Number(k)).filter(k => k > 0 && k < 6).sort();
            setMergeOrder(keys);
        }
    }, [stageIndex]);
    const clickMergeItem = (idx: number) => {
        // append key to a builder
        const key = stageResults[idx];
        if (!key) return;
        setAssembly(prev => prev + (prev ? '-' : '') + key);
    }
    const submitMerge = async () => {
        const payload = assembly;
        try {
            const res = await fetch(routes.api.chapters.IV.validateStage, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({plaqueId: 'TAS', stageIndex: 6, provided: payload})
            });
            const json = await res.json();
            if (json?.ok) {
                try {
                    playSafeSFX(audioRef, SFX_AUDIO.SUCCESS, false);
                } catch (e) {
                }
                setFeedback('Merge accepted - saved.');
                setStageResult(6, payload);
                setTimeout(() => advanceTo(7), 400);
            } else {
                try {
                    playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);
                } catch (e) {
                }
                setFeedback('Merge incorrect');
            }
        } catch (e) {
            try {
                playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);
            } catch (er) {
            }
            setFeedback('Server error');
        }
    }

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setFeedback('');
        const provided = (input || '').trim().toLowerCase();
        // If on final configured stage, require riddles to be solved client-side before allowing finalization
        if (stageIndex === stages.length - 1) {
            if (!riddleCorrects.every(Boolean)) {
                try {
                    playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);
                } catch (e) {
                }
                setFeedback('Solve the riddle chain before finalizing the plaque.');
                return;
            }
        }
        // validate with server
        try {
            const res = await fetch(routes.api.chapters.IV.validateStage, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({plaqueId: 'TAS', stageIndex, provided})
            });
            const json = await res.json();
            if (!json?.ok) {
                try {
                    playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);
                } catch (e) {
                }
                setFeedback('Incorrect answer.');
                return;
            }
            // proceed
            try {
                playSafeSFX(audioRef, SFX_AUDIO.SUCCESS, false);
            } catch (e) {
            }
            // save result
            setStageResult(stageIndex, provided);
            // if this is the final stage (last configured), mark completed state
            if (stageIndex >= stages.length - 1) {
                try {
                    const current = getJsonCookie(cookies.chIV_progress) || {};
                    const prev = Number(current['TAS'] || 0);
                    current['TAS'] = Math.max(prev, 2);
                    setJsonCookie(cookies.chIV_progress, current, 365);
                } catch (e) {
                }
            }
            setInput('');
            setFeedback('Correct!');
            // auto-advance/unlock next stage if not final stage
            if (stageIndex < stages.length - 1) {
                // use unlockAndGo so unlockedStage is updated (prevents clamp in useEffect)
                setTimeout(() => advanceTo(stageIndex + 1), 500);
            }
        } catch (e) {
            try {
                playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);
            } catch (er) {
            }
            setFeedback('Server error');
        }
    }

    // Riddles for the final riddle-chain (expanded for longer play)
    const riddlePrompts = [
        'I am small as a seed but carry whole maps; I am pressed between covers yet free as thought.',
        'I turn without hands and mark without time; I hold things together though I do not bind.',
        'I hum without voice and answer to wind; I am born from repetition in a hollowed hall.',
        'I carry numbers in order, yet never speak; align my faces to show the path you seek.',
        'I have teeth but do not eat; I fit into grooves and make the world complete.',
        'I am the reflection of a signal on a line; flip me and the pattern will align.',
        'I sleep in shadow but wake at spark; my pulse moves current through the dark.',
        'I am given to you at journey\'s start; I open the gate and let you part.'
    ];

    const riddleAnswers = [
        'page',      // 1
        'gear',      // 2
        'echo',      // 3
        'clock',     // 4
        'comb',      // 5
        'bit',       // 6
        'wire',      // 7
        'key'        // 8
    ];

    // Render final riddle chain when on last stage
    const renderFinalRiddleChain = () => {
        return (
            <div className="mt-4 space-y-3">
                <div className="text-sm text-gray-400">Final: solve the riddle chain to prove understanding of the
                    circuit.
                </div>
                {riddlePrompts.map((p, idx) => (
                    <Riddle key={idx} idx={idx} prompt={p} expectedChunk={riddleAnswers[idx]} onResult={(i, ok) => {
                        setRiddleCorrects(prev => {
                            const next = prev.slice();
                            next[i] = ok;
                            return next;
                        });
                    }}/>
                ))}

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            if (!riddleCorrects.every(Boolean)) {
                                setFeedback('All riddles must be correct before completion.');
                                return;
                            }
                            setFeedback('Stage complete - take a screenshot of this page as proof and then it will be saved.');
                            setTimeout(() => {
                                setCompleted(true);
                                try {
                                    localStorage.setItem(localStorageKeys.chIV_TASProgress, String(stages.length));
                                } catch (e) {
                                }
                                markCompleted('TAS');
                            }, 800);
                        }}
                        className={`px-3 py-1 font-mono text-sm rounded ${riddleCorrects.every(Boolean) ? 'bg-emerald-600 text-black' : 'bg-gray-800 text-gray-500'}`}>
                        Submit Completion
                    </button>
                    <div className="text-sm text-yellow-400">{feedback}</div>
                </div>
                <div className="text-xs text-gray-400 italic">When all riddles are correct, click Submit and screenshot
                    the result.
                </div>
            </div>
        );
    }

    const reset = () => {
        setStageIndex(0);
        setInput('');
        setFeedback('Reset.');
        setSwitches([0, 0, 0, 0, 0]);
        setParts([]);
        setUsed([]);
        setAssembly('');
        setRiddleCorrects(new Array(RIDDLE_COUNT).fill(false));
        setStageResults({});
    }

    // Numpad handler
    const handleNumpadPress = (digit: number) => {
        if (witheredNumbers.includes(digit)) {
            try {
                playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);
            } catch (e) {
            }
            setFeedback('That number has withered away...');
            return;
        }

        const newInput = numpadInput + digit;
        setNumpadInput(newInput);

        // 20% chance to wither a random number with each key press
        if (Math.random() < 0.2) {
            const available = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => !witheredNumbers.includes(n) && n !== digit);
            if (available.length > 0) {
                const toWither = available[Math.floor(Math.random() * available.length)];
                setWitheredNumbers(prev => [...prev, toWither]);
                setFeedback(`The keypad decays... ${toWither} has withered.`);
            }
        }

        // Check if complete
        if (newInput.length >= 5) {
            // Validate
            (async () => {
                try {
                    const res = await fetch(routes.api.chapters.IV.validateStage, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({plaqueId: 'TAS', stageIndex: 3, provided: newInput})
                    });
                    const json = await res.json();
                    if (json?.ok) {
                        try {
                            playSafeSFX(audioRef, SFX_AUDIO.SUCCESS, false);
                        } catch (e) {
                        }
                        setFeedback('Code accepted. Advancing...');
                        setStageResult(3, newInput);
                        setNumpadInput('');
                        setWitheredNumbers([]);
                        setConsecutiveErrors(0);
                        setTimeout(() => advanceTo(4), 500);
                    } else {
                        try {
                            playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);
                        } catch (e) {
                        }

                        const errors = consecutiveErrors + 1;
                        setConsecutiveErrors(errors);

                        if (errors >= 3) {
                            // Reset keypad
                            setWitheredNumbers([]);
                            setConsecutiveErrors(0);
                            setFeedback('Keypad reset after 3 errors.');
                        } else {
                            setFeedback(`Wrong code. Try again.`);
                        }
                        setNumpadInput('');
                    }
                } catch (e) {
                    try {
                        playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);
                    } catch (er) {
                    }
                    setFeedback('Server error');
                    setNumpadInput('');
                }
            })();
        }
    };

    // Word of Day stage initialization and countdown
    useEffect(() => {
        if (stageIndex === 4) {
            // Stop music
            if (audioRef.current) {
                audioRef.current.pause();
            }
            // Enable color inversion
            setIsInverted(true);
            // Reset countdown
            setWordOfDayCountdown(15);
            setWordOfDayInput('');
            setFeedback('');

            // Countdown timer
            const interval = setInterval(() => {
                setWordOfDayCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        } else {
            // Resume music and disable inversion when leaving stage 4
            if (isInverted) {
                if (audioRef.current) {
                    audioRef.current.play().catch(() => {
                    });
                }
                setIsInverted(false);
            }
        }
    }, [stageIndex, isInverted]);

    const handleWordOfDaySubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (wordOfDayCountdown > 0) {
            setFeedback(`Wait ${wordOfDayCountdown} seconds...`);
            return;
        }

        const provided = wordOfDayInput.trim().toLowerCase();
        try {
            const res = await fetch(routes.api.chapters.IV.validateStage, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({plaqueId: 'TAS', stageIndex: 4, provided})
            });
            const json = await res.json();
            if (json?.ok) {
                try {
                    playSafeSFX(audioRef, SFX_AUDIO.SUCCESS, false);
                } catch (e) {
                }
                setFeedback('Correct.');
                setStageResult(4, provided);
                setTimeout(() => {
                    setIsInverted(false);
                    if (audioRef.current) {
                        audioRef.current.play().catch(() => {
                        });
                    }
                    setCompleted(true);
                    markCompleted('TAS');
                    localStorage.setItem(localStorageKeys.chIV_TASProgress, String(stages.length));
                }, 800);
            } else {
                try {
                    playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);
                } catch (e) {
                }
                setFeedback('Incorrect.');
            }
        } catch (e) {
            try {
                playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);
            } catch (er) {
            }
            setFeedback('Error');
        }
    };

    return (
        <>
            <audio ref={audioRef} src={BACKGROUND_AUDIO.BONUS.IV} loop preload="auto" style={{display: 'none'}}/>

            {isLoading ? (
                <div className="min-h-screen bg-black flex items-center justify-center">
                    <div className="text-white font-mono">Loading...</div>
                </div>
            ) : puzzleMissing ? (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-white font-mono">Puzzle not found.</div>
                </div>
            ) : (
                <div
                    className={`min-h-screen p-8 font-mono transition-all duration-500 ${isInverted ? 'bg-white text-black' : 'bg-gray-900 text-white'}`}>
                    <div className="max-w-4xl mx-auto">
                        <PuzzleHeader
                            title="TAS Puzzle Challenge"
                            subtitle="Progress is saved locally and to a plaque cookie (3-state save)."
                            className={isInverted ? 'text-black' : 'text-white'}
                        />

                        <StageNavigation
                            stages={stages}
                            currentStageIndex={stageIndex}
                            unlockedStage={unlockedStage}
                            onStageChange={setStageIndex}
                            className="overflow-x-auto px-2 py-1"
                        />
                        <div
                            className={`p-6 rounded border-2 ${isInverted ? 'bg-gray-50 border-gray-300' : 'bg-gray-900 border-gray-800'}`}>
                            <h2 className="font-mono text-lg mb-2">{stages[stageIndex]?.title || 'Stage'}</h2>
                            <p className="text-sm text-gray-400 mb-4">{stages[stageIndex]?.instruction || ''}</p>

                            {/* Render by configured type */}
                            {stages[stageIndex]?.type === 'switches' && (
                                <div>
                                    <div className="flex gap-2 mb-3">
                                        {switches.map((b, i) => (
                                            <button key={i} onClick={() => toggleSwitch(i)}
                                                    className={b === 1 ? 'px-3 py-2 bg-green-600 text-black rounded' : 'px-3 py-2 bg-gray-700 text-gray-200 rounded'}>{b}</button>
                                        ))}
                                        <button onClick={submitSwitches}
                                                className="ml-3 px-3 py-2 bg-blue-600 rounded">Submit
                                        </button>
                                    </div>
                                    <div className="text-xs text-gray-500">Toggle switches to match the expected
                                        pattern.
                                    </div>
                                </div>
                            )}

                            {stages[stageIndex]?.type === 'assembly' && (
                                <div>
                                    <div className="text-xs text-gray-400 mb-2">
                                        Click parts in order to assemble the word. You can reset and try different
                                        orders.
                                    </div>
                                    <div className="flex gap-2 flex-wrap mb-3">
                                        {parts.map((p, i) => (
                                            <button key={i} disabled={used[i]} onClick={() => clickPart(i)}
                                                    className={used[i] ? 'px-3 py-2 bg-gray-700 rounded' : 'px-3 py-2 bg-black text-green-300 border rounded'}>{p}</button>
                                        ))}
                                    </div>
                                    <div className="mb-3">Current: <span
                                        className="font-mono text-green-300">{assembly || '(empty)'}</span></div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={submitAssembly}
                                            disabled={!assembly}
                                            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded"
                                        >
                                            Submit Assembly
                                        </button>
                                        <button onClick={() => {
                                            setUsed(new Array(parts.length).fill(false));
                                            setAssembly('');
                                            setFeedback('');
                                        }} className="px-3 py-2 text-xs text-red-400 underline">Reset
                                        </button>
                                    </div>
                                </div>
                            )}

                            {stages[stageIndex]?.type === 'timed' && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="text-sm text-gray-400">Time remaining: <span
                                            className="font-mono">{remainingTime}s</span></div>
                                        <div className="text-sm text-gray-400">Base timer: <span
                                            className="font-mono">{stageTimedBase}s</span></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        {nodes.map(n => (
                                            <button key={n.id} onClick={() => handleNodeClick(n)}
                                                    className={`p-4 rounded font-mono text-xl ${n.withered ? 'bg-red-900 text-red-100 opacity-90' : 'bg-green-900 text-white'}`}>
                                                {n.label}
                                                {n.withered &&
                                                    <div className="text-xs text-red-300 mt-1">withered</div>}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="text-sm text-gray-300 mb-2">Sequence: <span
                                        className="font-mono">{nodeSeq}</span></div>
                                    <div className="text-sm text-yellow-400">{feedback}</div>
                                </div>
                            )}

                            {stages[stageIndex]?.type === 'grid' && (
                                <div>
                                    <div className="flex gap-2 mb-3">
                                        {gridBits.map((b, i) => (
                                            <button key={i} onClick={() => toggleGridBit(i)}
                                                    className={`px-3 py-2 rounded ${b ? 'bg-green-600 text-black' : 'bg-gray-700 text-gray-200'}`}>{b}</button>
                                        ))}
                                        <button onClick={submitGridBits}
                                                className="ml-3 px-3 py-2 bg-blue-600 rounded">Submit
                                        </button>
                                    </div>
                                    <div className="text-xs text-gray-500">Toggle tiles to match parity pattern.</div>
                                </div>
                            )}

                            {stages[stageIndex]?.type === 'merge' && (
                                <div>
                                    <div className="text-sm text-gray-400 mb-2">Available keys (click to append):</div>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {Object.keys(stageResults).length === 0 &&
                                            <div className="text-xs text-gray-500">No keys collected yet.</div>}
                                        {Object.entries(stageResults).map(([k, v]) => (
                                            <button key={k} onClick={() => clickMergeItem(Number(k))}
                                                    className="px-3 py-1 bg-gray-700 rounded text-xs">Stage {k}: {String(v).slice(0, 10)}</button>
                                        ))}
                                    </div>
                                    <div className="mt-2">Merged: <span className="font-mono">{assembly}</span></div>
                                    <div className="mt-2 flex gap-2">
                                        <button onClick={submitMerge} className="px-3 py-2 bg-blue-600 rounded">Submit
                                            Merge
                                        </button>
                                        <button onClick={() => setAssembly('')}
                                                className="px-2 py-1 underline text-xs">Clear
                                        </button>
                                    </div>
                                </div>
                            )}

                            {stages[stageIndex]?.type === 'riddle' && (
                                <div>
                                    <form onSubmit={handleSubmit} className="mt-2">
                                        <input value={input} onChange={(e) => setInput(e.target.value)}
                                               placeholder="Enter answer"
                                               className="w-full bg-gray-900 px-3 py-2 rounded"/>
                                        <div className="mt-2">
                                            <button type="submit" className="px-3 py-2 bg-green-600 rounded">Submit
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {stages[stageIndex]?.type === 'payload' && (
                                <div>
                                    {stages[stageIndex]?.payload && (
                                        <div className="space-y-2">
                                            <div className="bg-black p-2 rounded text-xs text-green-300 break-all">
                                                {stages[stageIndex].payload}
                                            </div>
                                            {stageIndex === 0 && (
                                                <div className="text-xs text-gray-400 italic">
                                                    💡 Hint: This appears to be base64 encoded. Try decoding it to find
                                                    the
                                                    key word.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <form onSubmit={handleSubmit} className="mt-2">
                                        <input value={input} onChange={(e) => setInput(e.target.value)}
                                               placeholder="Enter answer"
                                               className="w-full bg-gray-900 px-3 py-2 rounded"/>
                                        <div className="mt-2">
                                            <button type="submit" className="px-3 py-2 bg-green-600 rounded">Submit
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {stages[stageIndex]?.type === 'riddle-chain' && renderFinalRiddleChain()}

                            {/* Numpad Stage */}
                            {stages[stageIndex]?.type === 'numpad' && (
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <div className="text-xl font-mono tracking-widest mb-4">
                                            {numpadInput.padEnd(5, '_').split('').map((char, i) => (
                                                <span key={i}
                                                      className="inline-block w-8 mx-1 text-center border-b-2 border-green-500">
                                                {char}
                                            </span>
                                            ))}
                                        </div>
                                        <div className="text-xs text-gray-400 mb-4">
                                            Errors: {consecutiveErrors}/3 (keypad resets at 3)
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit => {
                                            const isWithered = witheredNumbers.includes(digit);
                                            return (
                                                <button
                                                    key={digit}
                                                    onClick={() => handleNumpadPress(digit)}
                                                    disabled={isWithered}
                                                    className={`p-6 text-2xl font-mono rounded transition-all ${
                                                        isWithered
                                                            ? 'bg-red-900/30 text-red-600 cursor-not-allowed opacity-30 line-through'
                                                            : 'bg-gray-800 hover:bg-gray-700 text-white active:bg-green-600'
                                                    }`}
                                                >
                                                    {isWithered ? '✗' : digit}
                                                </button>
                                            );
                                        })}
                                        <button
                                            onClick={() => setNumpadInput('')}
                                            className="p-6 text-sm font-mono bg-gray-700 hover:bg-gray-600 rounded"
                                        >
                                            CLR
                                        </button>
                                        <button
                                            onClick={() => handleNumpadPress(0)}
                                            disabled={witheredNumbers.includes(0)}
                                            className={`p-6 text-2xl font-mono rounded transition-all ${
                                                witheredNumbers.includes(0)
                                                    ? 'bg-red-900/30 text-red-600 cursor-not-allowed opacity-30 line-through'
                                                    : 'bg-gray-800 hover:bg-gray-700 text-white active:bg-green-600'
                                            }`}
                                        >
                                            {witheredNumbers.includes(0) ? '✗' : '0'}
                                        </button>
                                        <button
                                            onClick={() => setNumpadInput(prev => prev.slice(0, -1))}
                                            className="p-6 text-sm font-mono bg-gray-700 hover:bg-gray-600 rounded"
                                        >
                                            ←
                                        </button>
                                    </div>

                                    {witheredNumbers.length > 0 && (
                                        <div className="text-center space-y-2">
                                            <div className="text-xs text-red-400 animate-pulse">
                                                Withered: {witheredNumbers.sort().join(', ')}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setWitheredNumbers([]);
                                                    setNumpadInput('');
                                                    setConsecutiveErrors(0);
                                                    setFeedback('Keypad forcefully reset.');
                                                }}
                                                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-mono text-sm rounded"
                                            >
                                                Force Reset Keypad
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Word of the Day Stage */}
                            {stages[stageIndex]?.type === 'wordofday' && (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <h2 className={`text-4xl font-bold mb-8 ${isInverted ? 'text-black' : 'text-white'}`}>
                                            What is the word of the day?
                                        </h2>
                                    </div>

                                    <form onSubmit={handleWordOfDaySubmit} className="space-y-4">
                                        <input
                                            type="text"
                                            value={wordOfDayInput}
                                            onChange={(e) => setWordOfDayInput(e.target.value)}
                                            placeholder="Type the word..."
                                            className={`w-full px-4 py-3 rounded font-mono text-lg text-center border-2 focus:outline-none ${
                                                isInverted
                                                    ? 'bg-gray-100 border-black text-black placeholder-gray-500 focus:border-gray-600'
                                                    : 'bg-gray-800 border-white text-white placeholder-gray-400 focus:border-gray-300'
                                            }`}
                                        />

                                        <button
                                            type="submit"
                                            disabled={wordOfDayCountdown > 0}
                                            className={`w-full px-6 py-4 rounded font-mono text-lg transition-all ${
                                                wordOfDayCountdown > 0
                                                    ? isInverted
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                    : isInverted
                                                        ? 'bg-black text-white hover:bg-gray-800'
                                                        : 'bg-white text-black hover:bg-gray-200'
                                            }`}
                                        >
                                            {wordOfDayCountdown > 0 ? `Wait ${wordOfDayCountdown}s` : 'SUBMIT'}
                                        </button>
                                    </form>
                                </div>
                            )}


                            <div className="mt-4">
                                <button onClick={reset} className="text-xs text-red-400 underline">Reset</button>
                            </div>

                            <div className="mt-4 text-sm text-green-400">{completed ? 'Completed and saved.' : ''}</div>
                            <div className="mt-2 text-sm text-yellow-300">{feedback}</div>
                        </div>

                        <div className="mt-6 text-center">
                            <Link href="/chapters/IV" className="text-sm text-gray-300 underline">Back to Chapter
                                IV</Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
