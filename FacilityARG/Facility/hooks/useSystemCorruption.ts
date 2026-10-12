import React, {useEffect, useState} from 'react';
import {sysConfigDefaults} from '@/lib/client/data/tree98';
import {signCookie} from "@/lib/client/utils";
import {cookies, routes} from "@/lib/saveData";
import {playSafeSFX, SFX_AUDIO} from "@/audio";
import {ErrorDialog} from "@/components/tree98/dialogs/ErrorPopup";

export const useSystemCorruption = (createWindow: any, audioRef: React.RefObject<HTMLAudioElement>) => {
    const [systemCorruption, setSystemCorruption] = useState(0);
    const [errorPopups, setErrorPopups] = useState<string[]>([]);
    const [isSystemCrashing, setIsSystemCrashing] = useState(false);
    const [showBlueScreen, setShowBlueScreen] = useState(false);
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        if (systemCorruption > 0) {
            const crashingMessages = sysConfigDefaults.sysMessages.crashingMessages;
            const intervalId = setInterval(() => {
                // Cycle through all crashingMessages in order
                const currentMessage = crashingMessages[messageIndex % crashingMessages.length];
                setErrorPopups(prev => [...prev, currentMessage]);
                setMessageIndex(prev => prev + 1);

                // Play the system error sound
                playSafeSFX(audioRef, SFX_AUDIO.ERROR_POPUP)

                // Show a system error popup with a random error message
                const randomErrorMsg = sysConfigDefaults.sysMessages.errors[
                    Math.floor(Math.random() * sysConfigDefaults.sysMessages.errors.length)
                    ];
                createWindow(
                    'System Error',
                    ErrorDialog,
                    200 + Math.random() * 300,
                    100 + Math.random() * 200,
                    320, 180,
                    {
                        message: randomErrorMsg,
                    }
                );

                // Trigger crash/BSOD after one full cycle
                if ((messageIndex + 1) % crashingMessages.length === 0) {
                    setIsSystemCrashing(true);
                    setTimeout(() => {
                        setShowBlueScreen(true);
                        setTimeout(async () => {
                            await signCookie(`${cookies.tree98}=true`);
                            window.location.href = routes.fileConsole;
                        }, sysConfigDefaults.delay.bsod);
                    }, sysConfigDefaults.delay.crash);
                }
            }, sysConfigDefaults.corruption.interval);

            return () => clearInterval(intervalId);
        }
    }, [systemCorruption, createWindow, messageIndex]);

    return {
        systemCorruption,
        setSystemCorruption,
        errorPopups,
        setErrorPopups,
        isSystemCrashing,
        showBlueScreen
    };
};
