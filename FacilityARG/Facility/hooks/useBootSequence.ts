import {useEffect, useState} from 'react';
import {sysConfigDefaults} from '@/lib/client/data/tree98';
import {localStorageKeys} from "@/lib/saveData";

export const useBootSequence = () => {
    const [bootPhase, setBootPhase] = useState<'boot' | 'main' | 'loading' | 'login' | 'desktop'>('boot');
    const [tree98BootText, setTree98BootText] = useState('');
    const [bootText, setBootText] = useState('');
    const [loadingProgress, setLoadingProgress] = useState(0);

    useEffect(() => {
        // Tree98 boot sequence
        let messageIndex = 0;
        let charIndex = 0;
        let currentText = '';

        const bootInterval = setInterval(() => {
            if (messageIndex < sysConfigDefaults.sysMessages.tree98BootSeq.length) {
                const currentMessage = sysConfigDefaults.sysMessages.tree98BootSeq[messageIndex];
                if (charIndex < currentMessage.length) {
                    currentText += currentMessage[charIndex];
                    charIndex++;
                } else {
                    currentText += '\n';
                    messageIndex++;
                    charIndex = 0;
                }
                setTree98BootText(currentText);
            } else {
                clearInterval(bootInterval);
                setTimeout(() => {
                    setBootPhase('main');
                    startMainBoot();
                }, 1000);
            }
        }, sysConfigDefaults.delay.boot);

        const startMainBoot = () => {
            if (localStorage.getItem(localStorageKeys.vesselBoot) === 'true') {
                setBootPhase('loading');
                startLoadingBar();
                return;
            }
            let mainMessageIndex = 0;
            let mainCharIndex = 0;
            let mainCurrentText = '';

            const mainBootInterval = setInterval(() => {
                if (mainMessageIndex < sysConfigDefaults.sysMessages.vesselBootMsg.length) {
                    const currentMessage = sysConfigDefaults.sysMessages.vesselBootMsg[mainMessageIndex];
                    if (mainCharIndex < currentMessage.length) {
                        mainCurrentText += currentMessage[mainCharIndex];
                        mainCharIndex++;
                    } else {
                        mainCurrentText += '\n';
                        mainMessageIndex++;
                        mainCharIndex = 0;
                    }
                    setBootText(mainCurrentText);
                } else {
                    clearInterval(mainBootInterval);
                    localStorage.setItem(localStorageKeys.vesselBoot, 'true');
                    setTimeout(() => {
                        setBootPhase('loading');
                        startLoadingBar();
                    }, sysConfigDefaults.delay.bootComplete);
                }
            }, sysConfigDefaults.delay.bootMsg);
        };

        const startLoadingBar = () => {
            const loadingInterval = setInterval(() => {
                setLoadingProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(loadingInterval);
                        setTimeout(() => setBootPhase('login'), 500);
                        return 100;
                    }
                    return Math.min(prev + Math.floor(Math.random() * (sysConfigDefaults.loadBar.incMax - sysConfigDefaults.loadBar.incMin + 1)) + sysConfigDefaults.loadBar.incMin, 100);
                });
            }, sysConfigDefaults.loadBar.speed);
        };
    }, []);

    return {
        bootPhase,
        setBootPhase,
        tree98BootText,
        bootText,
        loadingProgress
    };
};
