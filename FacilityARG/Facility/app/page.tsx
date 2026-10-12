'use client';

import {useEffect, useRef, useState} from "react";
import {useRouter} from 'next/navigation';
import Cookies from "js-cookie";
import {BACKGROUND_AUDIO, playSafeSFX, SFX_AUDIO, usePlayBackgroundAudio} from "@/audio";
import {cookies, routes} from "@/lib/saveData";
import {text} from "@/lib/client/data/root";
import {signCookie} from "@/lib/client/utils";

export default function RootPage() {
    const router = useRouter();
    const [accepted, setAccepted] = useState<boolean | null>(null);
    const [showConsoleWarning, setShowConsoleWarning] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [countdown, setCountdown] = useState(25);
    const audioRef = useRef<HTMLAudioElement>(null);

    usePlayBackgroundAudio(audioRef, BACKGROUND_AUDIO.ROOT_PAGE);

    useEffect(() => {
        const timer = setTimeout(() => {
            const cookieAccepted = Cookies.get(cookies.disclaimersAccepted);
            if (cookieAccepted) {
                setAccepted(true);
                router.replace(routes.home);
            } else {
                setAccepted(false);
            }
            setIsLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, [router]);

    async function handleAccept() {
        // Play success sound
        playSafeSFX(audioRef, SFX_AUDIO.ALERT, true);

        await signCookie(`${cookies.disclaimersAccepted}=true`);
        setAccepted(true);
        setShowConsoleWarning(true);
        setCountdown(25); // reset countdown

        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    router.replace(routes.home);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="text-green-400 text-4xl font-mono mb-8 animate-pulse">
                        {text.loading.title}
                    </div>
                    <div className="text-green-400 font-mono text-lg mb-4">
                        {text.loading.subtitle}
                    </div>
                    <div className="loading-bar w-64 mx-auto"></div>
                </div>
            </div>
        );
    }

    if (accepted === null) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!accepted) {
        return (
            <>
                <audio
                    ref={audioRef}
                    src={BACKGROUND_AUDIO.ROOT_PAGE}
                    loop
                    preload="auto"
                    style={{display: 'none'}}
                />
                <main
                    className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
                    <div className="card max-w-2xl w-full">
                        <div className="card-header">
                            <h1 className="card-title text-red-400 text-center">
                                {text.restrictedAccess.header}
                            </h1>
                            <p className="card-subtitle text-center">
                                {text.restrictedAccess.subheader}
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="terminal">
                                <div className="terminal-header">
                                    <div className="terminal-dot red"></div>
                                    <div className="terminal-dot yellow"></div>
                                    <div className="terminal-dot green"></div>
                                    <span className="text-xs text-gray-400 ml-2">PERMISSIONS REQUIRED</span>
                                </div>
                                <div
                                    className="terminal-content flex flex-col gap-2 bg-gray-900/80 rounded-md p-4 border border-gray-700">
                                    {text.restrictedAccess.systemLines.map((line, i) => (
                                        <div className="terminal-line flex items-center text-green-300 font-mono"
                                             key={i}>
                                            <span
                                                className="terminal-prompt font-bold text-green-400 mr-2">SYSTEM:</span> {line}
                                        </div>
                                    ))}
                                    <div className="terminal-line flex items-center text-yellow-300 font-mono">
                                        <span
                                            className="terminal-prompt font-bold text-yellow-400 mr-2">MORALS:</span> {text.restrictedAccess.morality}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                                <h2 className="text-red-400 font-bold mb-3 flex items-center gap-2">
                                    {text.warnings.title}
                                </h2>
                                <ul className="space-y-2 text-sm text-red-300">
                                    {text.warnings.items.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                                <h3 className="text-yellow-400 font-bold mb-2">{text.protocols.title}</h3>
                                <p className="text-sm text-yellow-300">
                                    {text.protocols.text}
                                </p>
                            </div>

                            <div className="text-center">
                                <button
                                    onClick={handleAccept}
                                    className="btn btn-danger text-lg px-8 py-4"
                                >
                                    {text.acceptBtn}
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    if (showConsoleWarning) {
        return (
            <>
                <audio
                    ref={audioRef}
                    src={BACKGROUND_AUDIO.ROOT_PAGE}
                    loop
                    preload="auto"
                    style={{display: 'none'}}
                />
                <main className="min-h-screen bg-black flex items-center justify-center p-4">
                    <div className="card max-w-2xl w-full card-danger">
                        <div className="text-center">
                            <div className="text-6xl mb-6 animate-pulse">⚠️</div>
                            <h1 className="text-3xl font-bold text-red-400 mb-6">
                                {text.consoleWarning.header}
                            </h1>
                            <div
                                className="terminal mb-6 rounded-lg shadow-lg border border-gray-700 bg-gray-950/90 p-4">
                                <div className="terminal-content space-y-2">
                                    {text.consoleWarning.lines.map((line, i) => {
                                        const [prefix, ...rest] = line.text.split('! ');
                                        return (
                                            <div key={i}
                                                 className={`terminal-line ${line.class} flex items-center px-3 py-2 rounded bg-gray-900/80`}>
                                                <span
                                                    className="terminal-prompt font-bold text-green-400 mr-2">{prefix}</span>
                                                <span className="text-gray-200">{rest.join('! ')}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <p className="text-gray-300 mb-4">
                                {text.consoleWarning.redirect}{' '}
                                <span className="text-green-400 font-mono">{countdown}</span> seconds...
                            </p>
                            <div className="loading-bar w-full"></div>
                            <div className="mt-6 text-center space-y-2">
                                <a
                                    href={text.consoleWarning.links.discord.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 underline font-mono block"
                                >
                                    {text.consoleWarning.links.discord.label}
                                </a>
                                <a
                                    href={text.consoleWarning.links.questLog.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-green-400 underline font-mono block"
                                >
                                    {text.consoleWarning.links.questLog.label}
                                </a>
                            </div>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    return null;
}
