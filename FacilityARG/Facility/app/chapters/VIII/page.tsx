"use client";
import React, {useEffect, useRef, useState} from "react";
import {useChapterAccess} from "@/hooks";
import {bannedApi, ensureCsrfToken, fetchUserIP} from "@/lib/client/utils";
import {CheckMeResponse} from "@/types";
import {chapterVIIIData} from "@/lib/client/data/chapters/VIII";
import {localStorageKeys} from "@/lib/saveData";
import {BACKGROUND_AUDIO, usePlayBackgroundAudio} from "@/audio";


export default function BloomLiveDiePage() {
    const {isCurrentlySolved, setIsCurrentlySolved} = useChapterAccess() as any;

    const [clientIp, setClientIp] = useState<string | null>(null);
    const [globalList, setGlobalList] = useState<any[]>([]);
    const [countsByReason, setCountsByReason] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionPending, setActionPending] = useState(false);
    const [solvedLocal, setSolvedLocal] = useState(false);
    const [isBanned, setIsBanned] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const {meta, text, bloomWords} = chapterVIIIData;
    const totalBanned = Array.isArray(globalList) ? globalList.length : 0;
    const remaining = 43 - totalBanned;

    usePlayBackgroundAudio(audioRef, BACKGROUND_AUDIO.BONUS.VIII);

    useEffect(() => {
        if (totalBanned >= meta.totalNeeded && !solvedLocal) {
            localStorage.setItem(localStorageKeys.chapterVIIIProgressionTokens.solvedKey, "1");
            setSolvedLocal(true);
            setIsCurrentlySolved(true);
        }
    }, [totalBanned, solvedLocal, setIsCurrentlySolved]);

    useEffect(() => {
        ensureCsrfToken().catch(console.error);
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        setSolvedLocal(!!localStorage.getItem(localStorageKeys.chapterVIIIProgressionTokens.solvedKey));
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;

        (async () => {
            try {
                setLoading(true);
                const ip = await fetchUserIP();
                setClientIp(ip);

                const totalBanned = await bannedApi.count();
                setGlobalList(new Array(totalBanned).fill(null));
                setCountsByReason({total: totalBanned});

                const check: CheckMeResponse = await bannedApi.checkMe(ip);
                setIsBanned(check.banned ?? false);
            } catch {
                setError(text.failedFetch);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const refreshGlobal = async () => {
        try {
            const count = await bannedApi.count();
            setGlobalList(new Array(count).fill(null));
            setCountsByReason({total: count});
        } catch (err) {
            console.error("Failed to refresh banned count:", err);
        }
    };

    const participate = async (reason: string) => {
        if (actionPending || typeof window === "undefined") return;
        if (!clientIp) return setError(text.noRoots);

        const localKey = localStorageKeys.chapterVIIIProgressionTokens[reason as keyof typeof localStorageKeys.chapterVIIIProgressionTokens] ?? null;
        if (localKey && localStorage.getItem(localKey))
            return setError(text.offered);

        try {
            setActionPending(true);
            await bannedApi.addMe(clientIp, reason);
            document.cookie = meta.cookie;
            if (localKey) localStorage.setItem(localKey, Date.now().toString());
            await refreshGlobal();
            setError(null);
        } catch (e: any) {
            setError(e?.message ?? text.soilReject);
        } finally {
            setActionPending(false);
        }
    };

    const handleUpload = (file?: File | null) => {
        if (!file) return setError(text.noFile);
        if (!file.name.toLowerCase().endsWith(".txt"))
            return setError(text.wrongType);

        const reader = new FileReader();
        reader.onload = () => {
            const textContent = String(reader.result || "");
            const found = bloomWords.some((w) => new RegExp(`\\b${w}\\b`, "i").test(textContent));
            if (!found) return setError(text.noBloom);
            participate("upload").catch(console.error);
        };
        reader.onerror = () => setError(text.unread);
        reader.readAsText(file);
    };

    const getStepProgress = (step: number, totalBan: number) => {
        switch (step) {
            case 1:
                return Math.min(totalBan, meta.step1Max);
            case 2:
                return Math.max(0, Math.min(totalBan - meta.step1Max, meta.step2Max));
            case 3:
                return Math.max(0, Math.min(totalBan - meta.step3Trigger, meta.step3Max));
            default:
                return 0;
        }
    };

    useEffect(() => {
        const whisperCount = countsByReason["whisper"] || 0;
        if (!solvedLocal && whisperCount >= 3) {
            (async () => {
                try {
                    setActionPending(true);
                    const ips = (globalList ?? [])
                        .map((it: any) => (typeof it === "string" ? it : it.ip))
                        .filter(Boolean);
                    for (const ip of ips) {
                        try {
                            await bannedApi.remove(ip);
                        } catch {
                        }
                    }
                    localStorage.setItem(localStorageKeys.chapterVIIIProgressionTokens.solvedKey, "1");
                    setSolvedLocal(true);
                    setIsCurrentlySolved(true);
                } finally {
                    setActionPending(false);
                    await refreshGlobal();
                }
            })();
        }
    }, [countsByReason, globalList, solvedLocal, setIsCurrentlySolved]);

    if (loading)
        return <div
            className="min-h-screen bg-black flex items-center justify-center text-white font-mono">{text.loading}</div>;

    if (isBanned && !solvedLocal)
        return (
            <div className="min-h-screen bg-black text-red-600 flex flex-col items-center justify-center font-mono">
                <h1 className="text-3xl mb-4">{text.deniedTitle}</h1>
                <p>{text.deniedBody}</p>
                <p className="italic mt-2">{text.deniedNote}</p>
            </div>
        );

    if (isCurrentlySolved || solvedLocal)
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white font-mono">
                <div className="max-w-2xl text-center">
                    <h1 className="text-2xl mb-4">{chapterVIIIData.glyphMessage}</h1>
                    <p className="italic">"{text.solvedMsg}"</p>
                </div>
            </div>
        );

    return (
        <>
            <audio ref={audioRef} src={BACKGROUND_AUDIO.BONUS.VIII} loop preload="auto" style={{display: 'none'}}/>
            <div className="min-h-screen bg-black text-white font-mono flex flex-col items-center justify-start p-6">
                <h1 className="text-2xl mb-4">{text.title}</h1>
                {error && <div className="text-red-400 mb-4">{error}</div>}

                <div className="w-full max-w-2xl bg-gray-900 p-4 rounded mb-6">
                    <div className="mb-2">Souls offered: <strong>{totalBanned}</strong> / {meta.totalNeeded}</div>
                    <div className="text-sm text-gray-400 mb-4">
                        {remaining > 0
                            ? `${remaining} more must fall before the whisper is heard.`
                            : "The whisper is waiting."}
                    </div>

                    {/* Step 1: Connect */}
                    <div className="mb-6">
                        <div className="flex justify-between mb-1">
                            <span>LIVE</span>
                            <span>{getStepProgress(1, totalBanned)}/{meta.step1Max}</span>
                        </div>
                        <div className="w-full bg-gray-700 h-2 mb-2">
                            <div
                                className="h-2 bg-green-600"
                                style={{width: `${(getStepProgress(1, totalBanned) / meta.step1Max) * 100}%`}}/>
                        </div>
                        {totalBanned < meta.step1Max && (
                            <button
                                className="bg-white text-black px-3 py-1"
                                onClick={() => participate("connect")}
                                disabled={actionPending || !!localStorage.getItem(localStorageKeys.chapterVIIIProgressionTokens.connect)}
                            >
                                {!!localStorage.getItem(localStorageKeys.chapterVIIIProgressionTokens.connect) ? text.connectAgain : text.connectBtn}
                            </button>
                        )}
                    </div>

                    {/* Step 2: Upload */}
                    {totalBanned >= meta.step1Max && (
                        <div className="mb-6">
                            <div className="flex justify-between mb-1">
                                <span>BLOOM</span>
                                <span>{getStepProgress(2, totalBanned)}/{meta.step2Max}</span>
                            </div>
                            <div className="w-full bg-gray-700 h-2 mb-2">
                                <div
                                    className="h-2 bg-pink-600"
                                    style={{width: `${(getStepProgress(2, totalBanned) / meta.step2Max) * 100}%`}}/>
                            </div>
                            {totalBanned < meta.step3Trigger && (
                                <input
                                    type="file"
                                    accept=".txt"
                                    onChange={(e) => handleUpload(e.target.files?.[0] ?? null)}
                                    disabled={actionPending || !!localStorage.getItem(localStorageKeys.chapterVIIIProgressionTokens.upload)}
                                    className="text-black"/>
                            )}
                            <div className="text-xs text-gray-400 mt-1">{text.uploadHint}</div>
                        </div>
                    )}

                    {/* Step 3: Switch */}
                    {totalBanned >= meta.step3Trigger && (
                        <div className="mb-6">
                            <div className="flex justify-between mb-1">
                                <span>DIE</span>
                                <span>{getStepProgress(3, totalBanned)}/{meta.step3Max}</span>
                            </div>
                            <div className="w-full bg-gray-700 h-2 mb-2">
                                <div
                                    className="h-2 bg-yellow-500"
                                    style={{width: `${(getStepProgress(3, totalBanned) / meta.step3Max) * 100}%`}}/>
                            </div>
                            {totalBanned >= meta.step3Trigger && totalBanned < meta.step4Trigger && (
                                <button
                                    className="bg-white text-black px-3 py-1"
                                    onClick={() => participate("switch")}
                                    disabled={actionPending || !!localStorage.getItem(localStorageKeys.chapterVIIIProgressionTokens.switch)}
                                >
                                    {!!localStorage.getItem(localStorageKeys.chapterVIIIProgressionTokens.switch) ? text.switchAgain : text.switchBtn}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Step 4: Whisper */}
                    {totalBanned >= meta.step4Trigger && (
                        <div className="mt-6">
                            <div className="mb-1">
                                Whisper count: {Math.max(0, totalBanned - meta.step4Trigger)}/3
                            </div>
                            <button
                                className="bg-white text-black px-3 py-1"
                                onClick={() => participate("whisper")}
                                disabled={actionPending || !!localStorage.getItem(localStorageKeys.chapterVIIIProgressionTokens.whisper)}
                            >
                                {!!localStorage.getItem(localStorageKeys.chapterVIIIProgressionTokens.whisper)
                                    ? text.whisperAgain
                                    : text.whisperBtn}
                            </button>
                            <p className="text-xs text-gray-400 mt-2 italic">{text.whisperHint}</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
