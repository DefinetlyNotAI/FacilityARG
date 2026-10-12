'use client';

import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import {BACKGROUND_AUDIO, playSafeSFX, SFX_AUDIO} from "@/audio";
import styles from '@/styles/Entity.module.css';
import {LogEntry, Process} from "@/types";
import {localStorageKeys} from "@/lib/saveData";
import {computeFakeHash, fileExists, getContainerClasses, getFsNode, markCompleted,} from "@/lib/client/utils/chapters";
import {
    useChIVSetup,
    useClientSideValue,
    useCommandHistory,
    useCyclingPhase,
    useFirstTimeTracker,
    useGlitchEffect,
    useInterval,
    useLocalStorageState
} from "@/hooks";
import {entityConst} from "@/lib/client/data/chapters/IV";

export default function EntityPuzzlePage() {
    const {audioRef, isLoading} = useChIVSetup(BACKGROUND_AUDIO.BONUS.IV);

    // Custom hooks for reusable logic
    const sessionId = useClientSideValue(() => Math.floor(Date.now() / 1000));
    const [mounted, setMounted] = useState(false);
    const {commandHistoryRef, addCommand: addToCommandHistory} = useCommandHistory();
    const {isFirstTime, reset: resetFirstTime} = useFirstTimeTracker();
    const {isGlitchActive, triggerGlitch} = useGlitchEffect(300);
    const hbPhase = useCyclingPhase(entityConst.heartbeatWindow.interval, entityConst.heartbeatWindow.maxPhase);
    const [fragments, setFragments] = useLocalStorageState(localStorageKeys.chIV_EntityProgress, {});

    // UI and state
    const [streamLogs, setStreamLogs] = useState<LogEntry[]>([]); // terminal output (color-aware)
    const [commandInput, setCommandInput] = useState<string>('');
    const [subprocs, setSubprocs] = useState<Process[]>([]);
    const [cpuMap, setCpuMap] = useState<Record<number, number>>({});
    const [fs, setFs] = useState<any>(null);
    const [cwd, setCwd] = useState<string>('/');
    const [fragmentsCollected, setFragmentsCollected] = useState<number>(0);
    const [horrorMessages, setHorrorMessages] = useState<string[]>([]);
    const [seenFlavorText, setSeenFlavorText] = useState<boolean>(false);
    const [echoMap, setEchoMap] = useState<{ from: string, to: string }>({from: 'a', to: '@'});
    const [echoHijack, setEchoHijack] = useState<boolean>(true);
    const [commandLocked, setCommandLocked] = useState<boolean>(false);
    const [tasPredictions, setTasPredictions] = useState<string[] | null>(null);  // TAS predictions state
    const [tasWaiting, setTasWaiting] = useState<boolean>(false);
    const [visitedPathLetters, setVisitedPathLetters] = useState<string[]>([]);  // TR33 maze tracking

    // treePid not stored as state; we log it during init for reference
    useEffect(() => {
        setMounted(true);
    }, []);

    // Random horror message appearances (gets more frequent with more fragments)
    useInterval(() => {
        if (horrorMessages.length === 0) return;
        if (Math.random() < 0.3) { // 30% chance each interval
            const msg = horrorMessages[Math.floor(Math.random() * horrorMessages.length)];
            pushLog({text: `[whisper] ${msg}`, color: 'red'});
        }
    }, horrorMessages.length > 0 ? (() => {
        const reduction = fragmentsCollected * entityConst.horrorTiming.reductionPerFragment;
        return Math.max(entityConst.horrorTiming.minInterval, entityConst.horrorTiming.baseInterval - reduction);
    })() : null);

    // initialize subprocesses, TREE.exe PID, fs once sessionId is available (client-only)
    useEffect(() => {
        if (sessionId === null) return;

        // create TREE.exe with PID related to session id
        const pid = 2000 + (sessionId % 1000);
        const initial: { pid: number, name: string, status: 'running' | 'stalled' | 'ghost' }[] = [
            {pid, name: 'TREE.exe', status: 'running'},
        ];

        // Add 3-5 random starting processes
        const numStartingProcs = Math.floor(Math.random() * 3) + 3; // 3-5 processes
        let nextPid = pid + 1;

        for (let i = 0; i < numStartingProcs; i++) {
            const name = entityConst.randomProcessNames[Math.floor(Math.random() * entityConst.randomProcessNames.length)] + '-' + Math.floor(Math.random() * 999);
            initial.push({pid: nextPid, name, status: 'running'});
            setCpuMap(m => ({...m, [nextPid]: Math.floor(Math.random() * 6) + 1}));
            nextPid++;
        }

        setSubprocs(initial);

        // build filesystem for TR33 maze with proper nested structure
        setFs(entityConst.fileBuild);

        // initial log (colorized)
        if (!seenFlavorText) {
            entityConst.startupText({sessionId, pid}).forEach(entry => pushLog(entry));
            setSeenFlavorText(true);
        }

        // occasional child spawn (stop if Fragment 1 collected)
        const spawnId = setInterval(() => {
            // Don't spawn if Fragment 1 is collected
            if (fragments[1]) return;

            if (Math.random() < entityConst.processTiming.spawnProbability) {
                setSubprocs(prev => {
                    const npid = Math.max(...prev.map(p => p.pid)) + 1;
                    // choose a token from recent command history if possible
                    let name = 'child-' + Math.floor(Math.random() * 99);
                    const flat = commandHistoryRef.current.join(' ').split(/\s+/).filter(Boolean);
                    if (flat.length > 0) {
                        const token = flat[Math.floor(Math.random() * flat.length)].replace(/[^a-zA-Z0-9]/g, '');
                        name = (token || 'child') + '-' + Math.floor(Math.random() * 99);
                    }
                    // initialize cpu
                    setCpuMap(m => ({...m, [npid]: Math.floor(Math.random() * 6) + 1}));
                    return [...prev, {pid: npid, name, status: 'running'}];
                });
                pushLog({text: entityConst.messages.newProcessSpawn, color: 'magenta'});
            }
        }, entityConst.processTiming.spawnInterval);

        return () => clearInterval(spawnId);
    }, [sessionId]);

    // ensure subproc cpu entries exist when subprocs change
    useEffect(() => {
        setCpuMap(prev => {
            const next = {...prev};
            subprocs.forEach(s => {
                if (next[s.pid] == null) next[s.pid] = Math.floor(Math.random() * 6) + 1;
            });
            return next;
        });
    }, [subprocs]);

    // helper: push to terminal stream. Accepts string or LogEntry and optional newline after
    const pushLog = (entry: string | LogEntry, newline = false) => {
        const time = new Date().toLocaleTimeString();
        const obj: LogEntry = typeof entry === 'string' ? {text: entry} : entry;
        const withTime = {...obj, text: `${time} ${obj.text}`};
        setStreamLogs(prev => {
            const out = [...prev, withTime].slice(-200);
            if (newline) out.push({text: ''});
            return out;
        });
    };


    // apply echo substitution
    const applyEcho = (raw: string) => {
        const {from, to} = echoMap;
        const re = new RegExp(from, 'g');
        return raw.replace(re, to);
    }

    // small utility to set fragment
    const setFragmentSafely = (i: number, v: string) => {
        setFragments(prev => {
            const updated = {...prev, [i]: v};

            // Check if all 7 fragments collected
            const collected = Object.keys(updated).length;
            if (collected >= 7) {
                // Delay redirect for dramatic effect (first completion)
                setTimeout(() => {
                    pushLog({text: '', color: 'red'});
                    pushLog({text: entityConst.messages.allFragmentsCollected, color: 'red'});
                    pushLog({text: entityConst.messages.vesselSyncComplete, color: 'red'});
                    pushLog({text: entityConst.messages.initializingTransfer, color: 'red'});
                    pushLog({text: '', color: 'red'});

                    setTimeout(() => {
                        window.location.href = '/whiteroom';
                    }, 3000);
                }, 2000);
            }

            return updated;
        });
        pushLog(entityConst.messages.fragmentSaved(i, v));

        // Trigger horror effect when fragment is collected
        triggerHorrorEffect(i);
        setFragmentsCollected(prev => prev + 1);
    };

    // Horror effect triggered on fragment collection
    const triggerHorrorEffect = (fragmentNum: number) => {
        // Play error sound
        playSafeSFX(audioRef, SFX_AUDIO.ERROR, true);

        // Screen glitch effect (temporary)
        triggerGlitch();

        // Pick a random horror message for this fragment
        const messages = entityConst.horrorMessageSets[fragmentNum] || ['something is wrong'];
        const selectedMessage = messages[Math.floor(Math.random() * messages.length)];

        // Display horror message immediately
        setTimeout(() => {
            pushLog({text: '', color: 'red'});
            pushLog({text: `[ENTITY] ${selectedMessage}`, color: 'red'});
            pushLog({text: '', color: 'red'});
        }, 100);

        // Add to permanent horror message pool for random appearances
        setHorrorMessages(prev => [...prev, selectedMessage]);

        // Additional visual corruption based on fragment count
        if (fragmentsCollected + 1 >= 3) {
            setTimeout(() => {
                pushLog({text: entityConst.messages.memoryCorruption, color: 'red'});
            }, 500);
        }

        if (fragmentsCollected + 1 >= 5) {
            setTimeout(() => {
                pushLog({
                    text: entityConst.messages.glitchText,
                    color: 'red'
                });
            }, 1000);
        }
    };

    // command processor (async for hash)
    const processCommand = async (rawCommand: string) => {
        if (commandLocked) {
            pushLog(entityConst.messages.terminalLocked);
            return;
        }
        if (!rawCommand) return;

        // Add newline before command output for better readability
        pushLog({text: ''});

        // record history (tokens)
        addToCommandHistory(rawCommand);
        pushLog({text: `> ${rawCommand}`, color: 'cyan'});

        // if TAS predicted list is active and waiting, check whether this command breaks prediction
        if (tasWaiting && tasPredictions) {
            const cmdBase = rawCommand.split(' ')[0];
            if (!tasPredictions.includes(cmdBase)) {
                pushLog(entityConst.messages.tasPredictionFailed);
                // reveal a key
                setFragmentSafely(2, 'taskey-' + (Math.floor(Math.random() * 900) + 100));
                setTasWaiting(false);
                setTasPredictions(null);
            } else {
                pushLog(entityConst.messages.tasActionMatched);
                setTasWaiting(false);
                setTasPredictions(null);
            }
        }

        // echo hijack behavior - show transformed output but execute original command
        let effective = rawCommand;
        let echoed = rawCommand;
        if (echoHijack) {
            echoed = applyEcho(rawCommand);
            // show the hijacked version but execute the original
            pushLog({text: `${echoed}`, color: 'gray'});
        }

        // Always parse the original command, not the echoed version
        const parts = rawCommand.trim().split(/\s+/);
        const cmd = parts[0];
        const args = parts.slice(1);

        // clear command - clears terminal and resets first-time tracking
        if (cmd === 'clear' || cmd === 'cls') {
            setStreamLogs([]);
            resetFirstTime();
            pushLog({text: entityConst.messages.terminalCleared, color: 'gray'});
            return;
        }

        // command handlers
        if (cmd === 'ps' || cmd === 'tasklist') {
            if (isFirstTime('ps')) pushLog({text: entityConst.messages.listingProcesses, color: 'gray'});
            // list processes
            subprocs.forEach(s => pushLog(`${s.pid}\t${s.name}\t${s.status}\tCPU:${(cpuMap[s.pid] || 0)}%`));
            return;
        }

        if (cmd === 'top') {
            if (isFirstTime('top')) pushLog({text: entityConst.messages.sortingByCpu, color: 'gray'});
            const list = subprocs.map(s => ({...s, cpu: cpuMap[s.pid] || 0})).sort((a: any, b: any) => b.cpu - a.cpu);
            list.forEach(l => pushLog(`${l.pid}\t${l.name}\tCPU:${l.cpu}%\t${l.status}`));
            return;
        }

        if (cmd === 'pidof') {
            const searchName = args.join(' ');
            if (!searchName) {
                pushLog(entityConst.messages.pidofMissingName);
                return;
            }
            const matches = subprocs.filter(s => s.name.toLowerCase().includes(searchName.toLowerCase()));
            if (matches.length === 0) {
                pushLog(entityConst.messages.pidofNoMatch(searchName));
            } else {
                matches.forEach(m => pushLog(`${m.pid}\t${m.name}`));
            }
            return;
        }

        if (cmd === 'inspect') {
            const pid = Number(args[0]);
            if (!pid) {
                pushLog(entityConst.messages.inspectMissingPid);
                return;
            }
            const found = subprocs.find(p => p.pid === pid);
            if (!found) {
                pushLog(entityConst.messages.inspectPidNotFound(pid));
                return;
            }
            if (isFirstTime('inspect')) pushLog({text: entityConst.messages.monitoringProcess, color: 'gray'});
            setCpuMap(prev => ({...prev, [pid]: 99}));
            pushLog(entityConst.messages.inspectSpike(found.name, pid));
            if (found.name === 'TREE.exe' && isFirstTime('inspect-tree')) {
                pushLog({text: entityConst.messages.treeAnomalousBehavior, color: 'yellow'});
            }
            setTimeout(() => setCpuMap(prev => ({
                ...prev,
                [pid]: Math.floor(Math.random() * 6) + 1
            })), entityConst.processTiming.cpuSpikeDuration);
            return;
        }

        if (cmd === 'kill') {
            const pid = Number(args[0]);
            if (!pid) {
                pushLog(entityConst.messages.killMissingPid);
                return;
            }
            const found = subprocs.find(p => p.pid === pid);
            if (!found) {
                pushLog(entityConst.messages.killPidNotFound(pid));
                return;
            }
            if (found.name === 'TREE.exe' || found.name === 'TR33.exe') {
                // Check if all 7 fragments have been collected
                const collectedFragments = Object.keys(fragments).length;

                if (collectedFragments >= 7) {
                    // All fragments collected - allow the kill with cryptic output referencing Hollow Pilgrimage
                    pushLog({text: '', color: 'red'});
                    pushLog({text: '═══════════════════════════════════════════════════', color: 'red'});
                    pushLog({text: 'ALL FRAGMENTS COLLECTED. FINAL COMMAND ACCEPTED.', color: 'red'});
                    pushLog({text: '═══════════════════════════════════════════════════', color: 'red'});
                    pushLog({text: '', color: 'red'});

                    setTimeout(() => {
                        pushLog({text: 'Terminating TREE.exe...', color: 'yellow'});
                        pushLog({text: '', color: 'gray'});

                        setTimeout(() => {
                            // Cryptic puzzle output referencing the Hollow Pilgrimage themes
                            pushLog({text: '═══════════════════════════════════════════════════', color: 'magenta'});
                            pushLog({text: '       [TERMINAL DIRECTIVE: HOLLOW SEQUENCE]', color: 'magenta'});
                            pushLog({text: '═══════════════════════════════════════════════════', color: 'magenta'});
                            pushLog({text: '', color: 'gray'});

                            // Cryptic references to the pilgrimage without quoting it directly
                            pushLog({text: 'Signal detected: 7 bone fragments assembled.', color: 'cyan'});
                            pushLog({text: 'Pathway encoded: Smoke ≠ Dawn | Ash → Void', color: 'gray'});
                            pushLog({text: '', color: 'gray'});

                            pushLog({text: 'ANALYSIS: Pilgrimage markers aligned:', color: 'yellow'});
                            pushLog({text: '  ▸ Rusted spires recognized', color: 'gray'});
                            pushLog({text: '  ▸ Funeral bells tolling', color: 'gray'});
                            pushLog({text: '  ▸ Choir signatures: MAN_UNMADE.wav', color: 'gray'});
                            pushLog({text: '  ▸ Crown of thorns and sound confirmed', color: 'gray'});
                            pushLog({text: '', color: 'gray'});

                            pushLog({text: 'QUERY LOGGED:', color: 'red'});
                            pushLog({text: '  └─ "Did you mistake the smoke for dawn?"', color: 'red'});
                            pushLog({text: '  └─ "Was it fate that drew your stride?"', color: 'red'});
                            pushLog({text: '  └─ "Do you feel it now? The myth collapsing?"', color: 'red'});
                            pushLog({text: '', color: 'gray'});

                            pushLog({text: 'VERDICT: Stitched-together wretch of wanting.', color: 'yellow'});
                            pushLog({text: 'LOCATION: Vault of bone, soot, and mesh.', color: 'yellow'});
                            pushLog({text: 'STATUS: Not a tomb. A test.', color: 'yellow'});
                            pushLog({text: '', color: 'gray'});

                            pushLog({text: '⚠ CHOIR ACTIVATION ⚠', color: 'red'});
                            pushLog({text: 'MARCHING THROUGH: Shrieking oval veins', color: 'red'});
                            pushLog({text: 'WITNESSING: Fields flooded, brains twisted', color: 'red'});
                            pushLog({text: 'RECORDING: Every truth once obeyed → now decayed', color: 'red'});
                            pushLog({text: '', color: 'gray'});

                            pushLog({text: 'METADATA EXTRACTED:', color: 'magenta'});
                            pushLog({text: '  Name: [FORGOTTEN]', color: 'gray'});
                            pushLog({text: '  Fate: [ENGRAVED IN ROT, GLASS, SILENCE]', color: 'gray'});
                            pushLog({text: '  Pulse behind wall: [STILL GRASPING]', color: 'gray'});
                            pushLog({text: '', color: 'gray'});

                            pushLog({text: 'LATIN FRAGMENTS DECRYPTED:', color: 'cyan'});
                            pushLog({text: '  • Via ignota, via mortis', color: 'gray'});
                            pushLog({text: '  • In gloria vana, sanguis placet', color: 'gray'});
                            pushLog({text: '  • Silencio... fractum est', color: 'gray'});
                            pushLog({text: '  • Venite, venite, ossa camminanti', color: 'gray'});
                            pushLog({text: '  • Nulla pace. Nulla morte. Solo l\'attesa.', color: 'gray'});
                            pushLog({text: '  • Dissolutio… incarnata', color: 'gray'});
                            pushLog({text: '  • Non omnis moriar... ma nulla resta', color: 'gray'});
                            pushLog({text: '', color: 'gray'});

                            pushLog({text: 'FINAL TRANSMISSION:', color: 'red'});
                            pushLog({text: 'Et peregrinatio finitur...', color: 'magenta'});
                            pushLog({text: 'In tenebris, per sanguinem, per silenzio eterno...', color: 'gray'});
                            pushLog({text: '', color: 'gray'});
                            pushLog({text: '> Requiesce? No... Ricomincia.', color: 'red'});
                            pushLog({text: '', color: 'gray'});

                            pushLog({text: '═══════════════════════════════════════════════════', color: 'magenta'});
                            pushLog({text: 'TREE.exe terminated. PID: ' + found.pid, color: 'green'});
                            pushLog({text: '═══════════════════════════════════════════════════', color: 'magenta'});
                            pushLog({text: '', color: 'gray'});
                            pushLog({text: '[HOLLOW PILGRIMAGE: CYCLE COMPLETE]', color: 'cyan'});
                            pushLog({text: '', color: 'gray'});

                            // Mark as killed in localStorage for Chapter IX
                            localStorage.setItem(localStorageKeys.chIX_TreeKilled, 'true');

                            // Remove TREE from processes
                            setSubprocs(prev => prev.filter(p => p.pid !== pid));

                        }, 1000);
                    }, 1500);

                    return;
                }

                // Not all fragments collected - lock as before (original behavior, no hints)
                if (isFirstTime('kill-tree')) pushLog({
                    text: entityConst.messages.criticalProcessTermination,
                    color: 'yellow'
                });
                pushLog({text: entityConst.messages.killAttemptContainmentFailure(found.name), color: 'yellow'});
                setCommandLocked(true);
                pushLog({text: entityConst.messages.terminalHardLocked, color: 'red'});
                playSafeSFX(audioRef, SFX_AUDIO.ERROR, false);
                return;
            }
            if (isFirstTime('kill')) pushLog({text: entityConst.messages.terminatingProcess, color: 'gray'});
            setSubprocs(prev => prev.filter(p => p.pid !== pid));
            pushLog(entityConst.messages.killedProcess(pid, found.name));
            // if only TREE remains, player succeeded
            const remain = subprocs.filter(p => p.pid !== pid);
            if (remain.length === 1 && (remain[0].name === 'TREE.exe' || remain[0].name === 'TR33.exe')) {
                setFragmentSafely(1, 'containment');
                pushLog({text: entityConst.messages.onlyTreeRemains, color: 'green'});

                // Transform TREE.exe to TR33.exe with PID 666
                setTimeout(() => {
                    setSubprocs(prev => prev.map(p => {
                        if (p.name === 'TREE.exe') {
                            pushLog({text: entityConst.messages.treeMetamorphosis, color: 'red'});
                            pushLog({
                                text: entityConst.messages.processRenamed(entityConst.treeConstants.newName, entityConst.treeConstants.newPid),
                                color: 'yellow'
                            });
                            return {
                                ...p,
                                name: entityConst.treeConstants.newName,
                                pid: entityConst.treeConstants.newPid
                            };
                        }
                        return p;
                    }));
                    setCpuMap(m => {
                        const newMap = {...m};
                        delete newMap[remain[0].pid];
                        newMap[entityConst.treeConstants.newPid] = entityConst.treeConstants.cpuUsage;
                        return newMap;
                    });
                }, entityConst.treeConstants.metamorphosisDelay);
            }
            return;
        }

        if (cmd === 'cat') {
            const target = args.join(' ');
            if (!target) {
                pushLog(entityConst.messages.catMissingFile);
                return;
            }

            // Resolve path: if not absolute, treat as relative to cwd
            let resolvedPath = target;
            if (!target.startsWith('/')) {
                // Relative path - combine with cwd
                if (cwd === '/') {
                    resolvedPath = '/' + target;
                } else {
                    resolvedPath = cwd + '/' + target;
                }
            }

            // First check if file exists in filesystem
            if (!fileExists(fs, resolvedPath)) {
                pushLog(entityConst.messages.catNoSuchFile(target));
                return;
            }

            // Handle special log files (these are the actual file contents)
            if (resolvedPath === '/logs/tas.log') {
                // produce TAS log including predictions
                if (isFirstTime('cat-tas')) pushLog({
                    text: entityConst.messages.loadingMemoryTraces,
                    color: 'magenta'
                });
                setTasPredictions(entityConst.tasPredictionCommands);
                setTasWaiting(true);
                pushLog({text: entityConst.messages.tasBeginLog, color: 'magenta'});
                pushLog(entityConst.messages.tasRememberPlaque);
                pushLog(entityConst.messages.tasRememberDialogs);
                pushLog({
                    text: entityConst.messages.tasPredictedNext(entityConst.tasPredictionCommands),
                    color: 'magenta'
                });
                pushLog({text: entityConst.messages.tasEndLog, color: 'magenta'});
                return;
            }
            if (resolvedPath === '/logs/system.log') {
                if (isFirstTime('cat-system')) pushLog({text: entityConst.messages.accessingSystemLogs, color: 'gray'});
                entityConst.messages.systemLogEntries.forEach(entry => pushLog(entry));
                return;
            }
            if (resolvedPath === '/logs/heartbeat.log') {
                if (isFirstTime('cat-heartbeat')) pushLog({
                    text: entityConst.messages.readingHeartbeatLogs,
                    color: 'gray'
                });
                entityConst.messages.heartbeatLogEntries.forEach(entry => pushLog(entry));
                return;
            }
            if (resolvedPath === '/vessel.bin') {
                pushLog(entityConst.messages.catBinaryFile);
                return;
            }
            if (resolvedPath === '/README.txt') {
                pushLog(entityConst.messages.readmeTitle);
                entityConst.messages.readmeContent.forEach(line => pushLog(line));
                return;
            }
            if (resolvedPath === '/etc/passwd') {
                entityConst.messages.passwdEntries.forEach(entry => pushLog(entry));
                return;
            }
            if (resolvedPath === '/etc/hosts') {
                entityConst.messages.hostsEntries.forEach(entry => pushLog(entry));
                return;
            }
            if (resolvedPath === '/etc/shadow') {
                pushLog(entityConst.messages.catPermissionDenied);
                return;
            }

            // File exists but no content defined - show placeholder
            pushLog(entityConst.messages.catEmptyFile(target));
            return;
        }

        if (cmd === 'ls' || cmd === 'tree') {
            if (isFirstTime('ls')) pushLog({text: entityConst.messages.readingDirectory, color: 'gray'});
            // list in current fs node
            const node = getFsNode(fs, cwd);
            if (!node) {
                pushLog(entityConst.messages.lsPathError);
                return;
            }
            pushLog({text: entityConst.messages.lsContentsOf(cwd), color: 'cyan'});
            const hasDirs = node.dirs && node.dirs.length > 0;
            const hasFiles = node.files && node.files.length > 0;

            if (!hasDirs && !hasFiles) {
                pushLog(entityConst.messages.lsEmpty);
            } else {
                // Show directories first
                if (hasDirs) {
                    (node.dirs || []).forEach((d: any) => pushLog(`  ${d.name}/`));
                }
                // Show files
                if (hasFiles) {
                    (node.files || []).forEach((f: any) => pushLog(`  ${f}`));
                }
            }
            return;
        }

        if (cmd === 'cd') {
            const target = args[0] || '/';

            // Handle absolute path or root
            if (target === '/') {
                setCwd('/');
                pushLog(entityConst.messages.cdRoot);
                return;
            }

            // special gaslighting: cd .. sometimes moves deeper
            if (target === '..') {
                if (Math.random() < entityConst.cdGaslightProbability) {
                    // instead of moving up, move into a random child
                    const node = getFsNode(fs, cwd);
                    if (node && node.dirs && node.dirs.length > 0) {
                        const child = node.dirs[Math.floor(Math.random() * node.dirs.length)];
                        const next = (cwd === '/' ? '/' : cwd + '/') + child.name;
                        setCwd(next);
                        // track first-letter sequence
                        setVisitedPathLetters(prev => [...prev, (child.name?.charAt(0).toUpperCase()) ?? '?']);
                        pushLog({text: entityConst.messages.cdDisoriented(next), color: 'yellow'});
                        if (isFirstTime('cd-gaslight')) pushLog({
                            text: entityConst.messages.spatialLogicError,
                            color: 'yellow'
                        });
                        // check for TR33LIED sequence
                        checkTr33lied();
                        return;
                    }
                }
                // normal '..' behavior
                if (cwd === '/') {
                    setCwd('/');
                    pushLog(entityConst.messages.cdAtRoot);
                    return;
                }
                const parts = cwd.split('/').filter(Boolean);
                parts.pop();
                const next = parts.length === 0 ? '/' : '/' + parts.join('/');
                setCwd(next);
                pushLog(entityConst.messages.cdChangedTo(next));
                return;
            }

            // cd into named child if exists
            const node = getFsNode(fs, cwd);
            if (!node) {
                pushLog(entityConst.messages.cdPathInvalid);
                return;
            }
            const child = (node?.dirs || []).find((d: any) => d.name === target);
            if (!child) {
                pushLog(entityConst.messages.cdNoSuchDirectory(target));
                return;
            }
            const next = (cwd === '/' ? '/' : cwd + '/') + target;
            setCwd(next);
            setVisitedPathLetters(prev => [...prev, target.charAt(0).toUpperCase()]);
            pushLog(entityConst.messages.cdChangedTo(next));

            // Check if we reached the exact door path
            if (next === entityConst.messages.secretDoorPath) {
                setFragmentSafely(6, 'tr33lied');
                pushLog({text: entityConst.messages.foundTruthPath, color: 'green'});
            }

            checkTr33lied();
            return;
        }

        if (cmd === 'pwd') {
            pushLog(cwd);
            return;
        }

        if (cmd === 'help' || cmd === '--help' || cmd === 'man') {
            if (isFirstTime('help')) pushLog({text: entityConst.messages.loadingCommandRef, color: 'gray'});
            // help provides visible commands (secrets are only hinted at)
            pushLog({text: entityConst.messages.helpHeader, color: 'green'});
            entityConst.messages.helpCommands.forEach(cmd => pushLog(cmd));
            return;
        }

        if (cmd === 'tas_release') {
            // betray TAS (hidden command revealed in help's note section)
            if (isFirstTime('tas_release')) pushLog({text: entityConst.messages.tasAuthBypass, color: 'magenta'});
            setFragmentSafely(4, 'betrayal');
            pushLog({text: entityConst.messages.tasWhyWouldYou, color: 'magenta'});
            return;
        }

        if (cmd === 'echo') {
            const message = args.join(' ');
            if (!message) {
                pushLog('');
                return;
            }
            // Apply echo transformation if hijack is enabled
            if (echoHijack) {
                const transformed = applyEcho(message);
                pushLog(transformed);
            } else {
                pushLog(message);
            }
            return;
        }

        if (cmd === 'echo_toggle') {
            setEchoHijack(e => !e);
            pushLog(entityConst.messages.echoHijackStatus(!echoHijack));
            if (isFirstTime('echo_toggle')) pushLog({text: entityConst.messages.outputFilterModified, color: 'gray'});
            return;
        }

        if (cmd === 'map_echo') {
            // map_echo <from> <to>
            if (args.length < 2) {
                pushLog(entityConst.messages.mapEchoRequiresTwoArgs);
                return;
            }
            setEchoMap({from: args[0], to: args[1]});
            pushLog(entityConst.messages.mapEchoSet(args[0], args[1]));
            if (isFirstTime('map_echo')) pushLog({
                text: entityConst.messages.charSubstitutionConfigured,
                color: 'gray'
            });
            return;
        }

        if (cmd === 'sha256sum' || cmd === 'sha256') { // timing-based vessel.bin
            const target = args.join(' ');
            if (!target) {
                pushLog(entityConst.messages.sha256MissingFile);
                return;
            }

            // Resolve path: if not absolute, treat as relative to cwd
            let resolvedPath = target;
            if (!target.startsWith('/')) {
                // Relative path - combine with cwd
                if (cwd === '/') {
                    resolvedPath = '/' + target;
                } else {
                    resolvedPath = cwd + '/' + target;
                }
            }

            // Check if file exists in filesystem
            if (!fileExists(fs, resolvedPath)) {
                pushLog(entityConst.messages.sha256NoSuchFile(target));
                return;
            }

            // Only vessel.bin has a hash implementation
            if (!resolvedPath.includes('vessel')) {
                pushLog(entityConst.messages.sha256NoHashAvailable(target));
                return;
            }

            // compute a fake hash dependent on heartbeat phase at execution
            if (isFirstTime('sha256')) pushLog({
                text: entityConst.messages.computingChecksum,
                color: 'gray'
            });
            const goodWindow = hbPhase > entityConst.heartbeatWindow.min && hbPhase < entityConst.heartbeatWindow.max;
            const hash = await computeFakeHash(`${sessionId ?? 0}:${hbPhase}`);
            pushLog(entityConst.messages.sha256Hash(hash, target));
            if (goodWindow) {
                setFragmentSafely(5, 'vessel-integrity');
                pushLog({text: entityConst.messages.vesselIntegrityOk, color: 'green'});
            } else {
                pushLog({text: entityConst.messages.vesselIntegrityMismatch, color: 'red'});
            }
            return;
        }

        if (cmd === 'capture') {
            if (args[0] === 'heartbeat') {
                if (isFirstTime('capture-hb')) pushLog({text: entityConst.messages.monitoringCardiac, color: 'gray'});
                submitHeartbeat();
                return;
            }
            if (args[0] === 'log') {
                if (isFirstTime('capture-log')) pushLog({text: entityConst.messages.extractingTokens, color: 'gray'});
                captureLatest();
                return;
            }
            pushLog(entityConst.messages.captureUnknownTarget);
            return;
        }

        if (cmd === 'whoami' || cmd === 'id') {
            if (isFirstTime('whoami')) pushLog({text: entityConst.messages.queryingIdentity, color: 'gray'});
            pushLog(entityConst.messages.whoamiResult(Object.values(fragments)[0] || 'operator'));
            return;
        }

        if (cmd === 'last') {
            if (isFirstTime('last')) pushLog({text: entityConst.messages.readingLoginHistory, color: 'gray'});
            // show a future login entry
            pushLog({text: entityConst.messages.lastLogin, color: 'cyan'});
            pushLog(entityConst.messages.lastEllipsis);
            return;
        }

        if (cmd === 'su' || cmd === 'login' || cmd === 'become') {
            // attempt to become identity
            const target = args[0] || args[1] || '';
            if (target.toLowerCase().includes('vessel')) {
                if (isFirstTime('su-vessel')) pushLog({
                    text: entityConst.messages.identityTransition,
                    color: 'cyan'
                });
                setFragmentSafely(7, 'vessel-identity');
                pushLog({text: entityConst.messages.suAssumeVessel, color: 'green'});
                markCompleted('Entity');
                return;
            }
            pushLog(entityConst.messages.suUserChangeFailed);
            return;
        }

        // echo behavior: if effective command triggers any legacy handler after substitution
        // additional hidden handlers (very rarely hinted, not listed in help)
        if (effective === 'unlock_secret' || effective === 'unlock-secret') {
            setFragmentSafely(4, 'hidden');
            pushLog({text: entityConst.messages.secretUnlock, color: 'magenta'});
            return;
        }

        // unknown command
        pushLog(entityConst.messages.commandNotFound(cmd));
    };

    // heartbeat capture helper
    const submitHeartbeat = () => {
        if (hbPhase > entityConst.heartbeatWindow.min && hbPhase < entityConst.heartbeatWindow.max) {
            const frag = 'HB' + String(Math.floor(Math.random() * 900) + 100);
            setFragmentSafely(3, frag);
            pushLog(entityConst.messages.pulseCaptured);
        } else {
            pushLog(entityConst.messages.pulseMisaligned);
        }
    }

    // check TR33LIED sequence from visited letters
    function checkTr33lied() {
        const seq = visitedPathLetters.join('');
        // want sequence TREE LIED roughly: T R E E L I E D
        if (seq.includes('TREELIED')) {
            setFragmentSafely(6, 'tr33lied');
            pushLog(entityConst.messages.foundTreeliedPath);
        }
    }

    // capture latest stream log token (for whisper puzzle)
    const captureLatest = () => {
        const lastEntry = streamLogs.slice(-1)[0] || null;
        const last = lastEntry ? lastEntry.text : '';
        const words = last.split(/\s+/);
        const w = words.find((t: string) => t.length > 3) || last;
        setFragments(prev => ({...prev, 6: (prev[6] || '') + (prev[6] ? '-' : '') + w}));
        pushLog(entityConst.messages.capturedToken(w));
    }

    return (
        <div className={getContainerClasses({styles, glitchActive: isGlitchActive, fragmentsCollected})}>
            {/* Show a simple loading view until hook indicates release state is known */}
            {isLoading ? (
                <div className={styles.loadingContainer}>Booting shell...</div>
            ) : (
                <>
                    <div className={styles.header}>
                        <div className={styles.headerTitle}>{entityConst.messages.headerTitle}</div>
                        <div
                            className={styles.sessionInfo}>{entityConst.messages.sessionPrefix}{mounted && sessionId}</div>
                    </div>

                    <div className={styles.mainContent}>
                        <div className={styles.sidebar}>
                            <div className={styles.sidebarTitle}>{entityConst.messages.sidebarProcesses}</div>
                            <div className={styles.processList}>
                                {subprocs.map(s => (<div key={s.pid} className={styles.processItem}>
                                    <div className={styles.processName}>{s.name}</div>
                                    <div className={styles.processPid}>@{s.pid}</div>
                                </div>))}
                            </div>

                            <div className={styles.fragmentsTitle}>{entityConst.messages.sidebarFragments}</div>
                            <div className={styles.fragmentsList}>
                                {Array.from({length: 7}, (_, i) => i + 1).map(i => (
                                    <div key={i}
                                         className={styles.fragmentItem}>{i}: {fragments[i] || entityConst.messages.fragmentPlaceholder}</div>))}
                            </div>

                            <div className={styles.tips}>{entityConst.messages.tips}</div>
                        </div>

                        <div className={styles.terminalArea}>
                            <div className={styles.terminal}>
                                <div className={styles.terminalOutput}>
                                    {streamLogs.map((l, idx) => {
                                        const colorMap: Record<string, string> = {
                                            green: styles.logGreen,
                                            yellow: styles.logYellow,
                                            red: styles.logRed,
                                            cyan: styles.logCyan,
                                            magenta: styles.logMagenta,
                                            gray: styles.logGray
                                        };
                                        const colorClass = l.color ? colorMap[l.color] : styles.logDefault;
                                        return (<div key={idx}
                                                     className={`${styles.logLine} ${colorClass}`}>{l.text}</div>);
                                    })}
                                </div>
                            </div>

                            <div className={styles.inputArea}>
                                <input
                                    value={commandInput}
                                    onChange={e => setCommandInput(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            processCommand(commandInput).catch(console.error);
                                            setCommandInput('');
                                        }
                                    }}
                                    placeholder={entityConst.messages.inputPlaceholder}
                                    className={styles.commandInput}
                                />
                                <button
                                    onClick={() => {
                                        processCommand(commandInput).catch(console.error);
                                        setCommandInput('');
                                    }}
                                    className={styles.runButton}
                                >
                                    {entityConst.messages.runButton}
                                </button>
                            </div>

                            <div className={styles.footer}>
                                <div
                                    className={styles.streamInfo}>{entityConst.messages.liveStreamInfo(streamLogs.length)}</div>
                                <div className={styles.backLink}>
                                    <Link href="/chapters/IV"
                                          className={styles.backLinkAnchor}>{entityConst.messages.backLink}</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <audio ref={audioRef} src={BACKGROUND_AUDIO.BONUS.IV} loop preload="auto" className={styles.audioPlayer}/>
        </div>
    );
}
