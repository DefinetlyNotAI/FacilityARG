'use client';

import {useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import Cookies from 'js-cookie';
import styles from '@/styles/FileConsole.module.css';
import {BACKGROUND_AUDIO, playSafeSFX, SFX_AUDIO, usePlayBackgroundAudio} from "@/audio";
import {boot, consoleMsg, files} from "@/lib/client/data/fileConsole";
import {BootMessage} from "@/types";
import {fetchUserIP} from "@/lib/client/utils";
import {cookies, localStorageKeys, routes} from "@/lib/saveData";


export default function FileConsole() {
    const router = useRouter();
    const [cwd, setCwd] = useState('/');
    const [history, setHistory] = useState<BootMessage[]>([]);
    const [input, setInput] = useState('');
    const [booting, setBooting] = useState(true);
    const consoleRef = useRef<HTMLPreElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [ip, setIp] = useState<string>('0.0.0.0');

    useEffect(() => {
        fetchUserIP().then(setIp);
    }, []);

    // Initialize background audio
    usePlayBackgroundAudio(audioRef, BACKGROUND_AUDIO.FILE_CONSOLE);

    useEffect(() => {
        if (!Cookies.get(cookies.fileConsole)) {
            router.replace(routes.notFound);
            return;
        }
        if (!Cookies.get(cookies.tree98)) {
            router.replace(routes.tree98);
            return;
        }
        // Start the boot sequence when component mounts and File_Unlocked is true
        playBootSequence().then(() => setBooting(false));
    }, [router]);

    // Scroll console down after history updates
    useEffect(() => {
        consoleRef.current?.scrollTo(0, consoleRef.current.scrollHeight);
    }, [history]);

    // Append a message to history
    const appendMessage = (msg: BootMessage) => {
        setHistory((h: BootMessage[]): BootMessage[] => [...h, msg]);
    };

    // Utility to delay for ms
    const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

    // Slow typing function for a single string, simulating typing effect
    // Calls appendMessage once done with full text
    const typeLine = async (msg: BootMessage) => {
        const {text, typeSpeed = 30} = msg; // chars per second, default 30
        if (!text) return;

        if (msg.mode === 'instant') {
            // Just append instantly
            appendMessage({text, mode: 'instant'});
            return;
        }

        // For 'fade' or 'type' mode, simulate typing
        let typed = '';
        const delayPerChar = 1000 / typeSpeed;

        // Always append a new message for each line, never overwrite
        setHistory((h) => [...h, {text: '', mode: msg.mode}]);

        for (let i = 0; i < text.length; i++) {
            typed += text[i];
            setHistory((h) => {
                const newHist = [...h];
                // Only update the last message, never touch previous ones
                newHist[newHist.length - 1] = {text: typed, mode: msg.mode};
                return newHist;
            });
            await wait(delayPerChar);
        }
        // Finalize line as full typed text
        setHistory((h) => {
            const newHist = [...h];
            newHist[newHist.length - 1] = msg;
            return newHist;
        });
    };

    // Main boot sequence player
    const playBootSequence = async () => {
        // Wait until the site is fully loaded and mounted
        await new Promise<void>((resolve) => {
            if (document.readyState === 'complete') {
                // Wait for next tick to ensure React mount
                setTimeout(resolve, 0);
            } else {
                window.addEventListener('load', () => setTimeout(resolve, 0), {once: true});
            }
        });

        setHistory([]); // Clear history at start

        const hasBooted = localStorage.getItem(localStorageKeys.fileConsoleBooted) === 'true';

        const messages = !hasBooted ? boot.msg : boot.repeatMsg;
        for (const msg of messages) {
            if (msg.delay) await wait(msg.delay);
            await typeLine(msg);
        }
        if (!hasBooted) {
            localStorage.setItem(localStorageKeys.fileConsoleBooted, 'true');
        }
    };

    async function downloadFile(filename: string) {
        playSafeSFX(audioRef, SFX_AUDIO.SUCCESS);

        // Special handling for riddle.pdf
        if (filename === 'riddle.pdf') {
            try {
                // Fetch the binary file
                const response = await fetch('/static/file-console/riddle.bin');
                if (!response.ok) throw new Error('Failed to fetch riddle.bin');

                const arrayBuffer = await response.arrayBuffer();
                const blob = new Blob([arrayBuffer], {type: 'application/pdf'});

                // Trigger download
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'riddle.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
            } catch (err) {
                console.error('Error downloading riddle.pdf:', err);
            }
        } else {
            // Default download for other files
            const link = document.createElement('a');
            link.href = `/static/file-console/${filename}`;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }


    const execute = (raw: string) => {
        appendMessage({text: `${cwd}$ ${raw}`, mode: 'instant'});
        const [cmd, ...args] = raw.trim().split(' ');

        switch (cmd) {
            case 'clear':
                setHistory([]);
                break;
            case 'help': {
                if (args.length === 0) {
                    appendMessage({text: consoleMsg.help, mode: 'instant'});
                } else {
                    const topic = args[0];
                    const message = consoleMsg.helpCmd[topic] ?? `${consoleMsg.helpCmd._default}${topic}`;
                    appendMessage({text: message, mode: 'instant'});
                }
                break;
            }
            case 'ls': {
                // Play interaction sound
                playSafeSFX(audioRef, SFX_AUDIO.SUCCESS)

                const list = cwd === '/' ? files.root : cwd === '/code' ? files.code : [];
                list.forEach(f => appendMessage({text: f.type === 'dir' ? f.name + '/' : f.name, mode: 'instant'}));
                appendMessage({text: '\n', mode: 'instant'});
                break;
            }
            case 'cd': {
                const [dir] = args;
                if (cwd === '/' && dir === 'code') {
                    // Play success sound
                    playSafeSFX(audioRef, SFX_AUDIO.SUCCESS)
                    setCwd('/code');
                } else if (cwd === '/code' && dir === '..') {
                    // Play success sound
                    playSafeSFX(audioRef, SFX_AUDIO.SUCCESS)
                    setCwd('/');
                } else {
                    // Play error sound
                    playSafeSFX(audioRef, SFX_AUDIO.ERROR)
                    appendMessage({text: consoleMsg.errOutputs.missingDir, mode: 'instant'});
                }
                break;
            }
            case 'cat': {
                const [fn] = args;
                let found = false;

                const fileContent = consoleMsg.catFiles[cwd]?.[fn];
                if (fileContent !== undefined) {
                    found = true;
                    appendMessage({text: fileContent, mode: 'instant'});
                }

                playSafeSFX(audioRef, found ? SFX_AUDIO.SUCCESS : SFX_AUDIO.ERROR);
                if (!found) {
                    appendMessage({text: consoleMsg.errOutputs.invalidCat, mode: 'instant'});
                }
                break;
            }
            case 'wget': {
                const [fn] = args;
                let found = false;

                const message = consoleMsg.wgetFiles[cwd]?.[fn];
                if (message !== undefined) {
                    found = true;
                    appendMessage({text: message, mode: 'instant'});
                    downloadFile(fn).catch(console.error);
                }

                playSafeSFX(audioRef, found ? SFX_AUDIO.SUCCESS : SFX_AUDIO.ERROR);
                if (!found) {
                    appendMessage({text: 'wget: file not found\n', mode: 'instant'});
                }
                break;
            }
            case 'whoami':
                playSafeSFX(audioRef, SFX_AUDIO.HORROR, true)

                for (const line of consoleMsg.whoamiSeq) {
                    appendMessage({text: line, mode: 'type'});
                }
                break;
            case 'sudo': {
                playSafeSFX(audioRef, SFX_AUDIO.ALERT, true);

                appendMessage({text: consoleMsg.sudoSeq.initial, mode: 'instant'});

                setTimeout(() => {
                    for (const line of consoleMsg.sudoSeq.trace) {
                        const msg = typeof line === 'function' ? line(ip) : line;
                        appendMessage({text: msg, mode: 'instant'});
                    }

                    setTimeout(() => {
                        playSafeSFX(audioRef, SFX_AUDIO.HORROR, true);
                        document.body.style.background = 'black';
                        document.body.innerHTML = consoleMsg.sudoSeq.infectedHTML;

                        setTimeout(() => {
                            window.location.reload();
                        }, 4000);
                    }, 5000); // Delay after trace
                }, 500); // Delay before trace starts
                break;
            }
            default:
                // Play error sound for unknown commands
                playSafeSFX(audioRef, SFX_AUDIO.ERROR, false)
                appendMessage({text: consoleMsg.errOutputs.invalidCmd(cmd), mode: 'instant'});
                break;
        }
    };

    return (
        <>
            <audio
                ref={audioRef}
                src={BACKGROUND_AUDIO.FILE_CONSOLE}
                loop
                preload="auto"
                style={{display: 'none'}}
            />
            <div className={styles.container}>
                <pre ref={consoleRef} className={styles.console}>
                    {/* Always render history as typed text */}
                    {history.map((msg) => msg.text).join('\n')}
                </pre>
                {!booting && (
                    <form className={styles.form} onSubmit={(e) => {
                        e.preventDefault();
                        execute(input);
                        setInput('');
                    }}>
                        <span className={styles.prompt}>{cwd}$</span>
                        <input
                            className={styles.input}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            autoFocus
                        />
                    </form>
                )}
            </div>
        </>
    );
}
