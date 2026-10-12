'use client';

import React, {useRef, useState} from 'react';
import {ItemKey} from '@/lib/saveData';
import {Button} from '@/components/ui/button';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {AlertCircle, HelpCircle} from 'lucide-react';
import {chIData, linksChI} from "@/lib/client/data/chapters/I";
import {checkPass} from "@/lib/client/utils";
import {useChapterAccess} from "@/hooks";
import {BACKGROUND_AUDIO, usePlayBackgroundAudio} from "@/audio";
import {chapter} from "@/lib/client/data/chapters";


export default function ChapterIPage() {
    const {isCurrentlySolved, setIsCurrentlySolved} = useChapterAccess();
    const [port, setPort] = useState('');
    const [ip, setIp] = useState('');
    const [error, setError] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    usePlayBackgroundAudio(audioRef, BACKGROUND_AUDIO.BONUS.I);

    const handleConnect = async () => {
        setError("");
        setIsConnecting(true);

        await new Promise(resolve => setTimeout(resolve, 1500));

        // Check port number via API
        const portCheck = await checkPass(String(ItemKey.portNum), port);
        if (!portCheck.success) {
            setError(chIData.portNumErr);
            setIsConnecting(false);
            return;
        }

        // Check IP address via API
        const ipCheck = await checkPass(String(ItemKey.ipAddress), ip);
        if (!ipCheck.success) {
            setError(chIData.ipAddressErr);
            setIsConnecting(false);
            return;
        }

        // If both checks pass
        setIsCurrentlySolved(true);
        setIsConnecting(false);
    };

    if (isCurrentlySolved === null) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white font-mono">{chapter.loading}</div>
            </div>
        );
    }

    if (!isCurrentlySolved) {
        return (
            <div className="min-h-screen bg-[#c0c0c0] flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div
                        className="bg-gradient-to-r from-[#000080] to-[#1084d0] px-2 py-1 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-white border border-black"></div>
                            <span className="text-white font-bold text-sm">{chIData.text.connect}</span>
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <button
                                    className="w-5 h-5 bg-[#c0c0c0] border border-black flex items-center justify-center hover:bg-[#a0a0a0]">
                                    <HelpCircle className="w-3 h-3"/>
                                </button>
                            </DialogTrigger>
                            <DialogContent
                                className="bg-[#c0c0c0] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <DialogHeader>
                                    <DialogTitle
                                        className="text-black font-mono">{chIData.text.connectHelp}</DialogTitle>
                                </DialogHeader>
                                <div className="text-black font-mono text-sm space-y-2">
                                    <p>{chIData.text.hints[0]}</p>
                                    <p>{chIData.text.hints[1]}</p>
                                    <p>{chIData.text.hints[2]}</p>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="text-center text-black font-mono mb-6">
                            <p className="text-lg font-bold mb-2">{chIData.text.attemptingConn}</p>
                            <p className="text-sm">{chIData.text.enterCreds}</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-black font-mono text-sm font-bold">{chIData.text.inputs.port}</label>
                            <Input
                                type="text"
                                value={port}
                                onChange={(e) => setPort(e.target.value)}
                                className="font-mono border-2 border-black"
                                placeholder={chIData.text.inputs.portPlaceholder}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-black font-mono text-sm font-bold">{chIData.text.inputs.ip}</label>
                            <Input
                                type="text"
                                value={ip}
                                onChange={(e) => setIp(e.target.value)}
                                className="font-mono border-2 border-black"
                                placeholder={chIData.text.inputs.ipPlaceholder}
                            />
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 p-3 bg-red-100 border-2 border-red-600">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"/>
                                <p className="text-red-800 font-mono text-sm">{error}</p>
                            </div>
                        )}

                        <Button
                            onClick={handleConnect}
                            disabled={isConnecting || !port || !ip}
                            className="w-full bg-[#c0c0c0] text-black border-2 border-black hover:bg-[#a0a0a0] font-mono font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        >
                            {isConnecting ? chIData.text.connectButton.trueState : chIData.text.connectButton.falseState}
                        </Button>

                        <div className="text-center mt-6 pt-4 border-t-2 border-gray-300">
                            <p className="text-xs text-gray-600 font-mono">{chIData.text.accessHelpTip}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <audio ref={audioRef} src={BACKGROUND_AUDIO.BONUS.I} loop preload="auto" style={{display: 'none'}}/>
            <div className="min-h-screen bg-[#c0c0c0] flex items-center justify-center p-4">
                <div
                    className="w-full max-w-md bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8">
                    <div className="text-center space-y-4">
                        <div
                            className="text-green-600 font-mono text-2xl font-bold">{chIData.text.completed.title}</div>
                        <p className="text-black font-mono">{chIData.text.completed.subtitle}</p>
                        <Button
                            onClick={() => {
                                window.location.href = linksChI.donecAnteDolorEXE;
                            }}
                            className="w-full bg-green-600 text-white border-2 border-green-800 hover:bg-green-700 font-mono font-bold shadow-[2px_2px_0px_0px_rgba(0,100,0,1)]"
                        >
                            {chIData.text.completed.downloadButton}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
