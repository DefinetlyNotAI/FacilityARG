'use client';
import React, {useEffect, useRef, useState} from 'react';
import {sysConfigDefaults, vesselBoot} from '@/lib/client/data/tree98';
import {VesselBootDialogProps} from '@/types';

export const VesselBootDialog: React.FC<VesselBootDialogProps> = ({item}) => {
    const [showInitialError, setShowInitialError] = useState(true);
    const [displayedText, setDisplayedText] = useState('');
    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!showInitialError && dialogRef.current) {
            dialogRef.current.requestFullscreen?.().catch(console.error);
            document.body.style.pointerEvents = 'none';
        }
        return () => {
            document.body.style.pointerEvents = '';
        };
    }, [showInitialError]);

    useEffect(() => {
        if (!showInitialError) {
            let i = 0;
            const text = item.content || '';
            const interval = setInterval(() => {
                setDisplayedText(text.slice(0, i));
                i++;
                if (i > text.length) {
                    clearInterval(interval);
                    if (dialogRef.current && document.fullscreenElement) {
                        document.exitFullscreen?.().catch(console.error);
                    }
                }
            }, vesselBoot.animationInterval);

            return () => clearInterval(interval);
        }
    }, [showInitialError, item.content]);

    return (
        <div
            ref={dialogRef}
            className="fixed inset-0 z-[9999] bg-black text-green-400 flex items-center justify-center"
            style={{fontFamily: sysConfigDefaults.fonts.mono, fontSize: vesselBoot.fontSize}}
        >
            {showInitialError ? (
                <div
                    className="bg-gray-900 border-2 border-red-400 p-8 rounded shadow-lg text-center animate-pulse"
                    style={{maxWidth: vesselBoot.maxWidth}}
                >
                    <div className="mb-4 text-red-400 font-bold">{vesselBoot.errorTitle}</div>
                    <div className="mb-6 text-white text-sm whitespace-pre-line">
                        {vesselBoot.initErr}
                    </div>
                    <button
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        onClick={() => setShowInitialError(false)}
                    >
                        OK
                    </button>
                </div>
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className="w-full h-full overflow-auto animate-pulse">
                        <pre className="whitespace-pre-wrap">{displayedText}</pre>
                    </div>
                    <div className="mt-4 text-red-400 animate-pulse text-center">
                        {vesselBoot.sysCorruptionMsg}
                    </div>
                </div>
            )}
        </div>
    );
};
