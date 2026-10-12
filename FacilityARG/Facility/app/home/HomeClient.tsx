'use client';

import {useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import {signCookie} from "@/lib/client/utils";
import {BACKGROUND_AUDIO} from "@/audio";
import {classificationClass, data, text} from '@/lib/client/data/home';
import {ResearchLog} from '@/types';
import {cookies, localStorageKeys, routes} from "@/lib/saveData";
import Cookies from "js-cookie";

export default function HomeClient() {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [countdown, setCountdown] = useState<number | null>(null);
    const [voiceTriggered, setVoiceTriggered] = useState(false);
    const [binaryVisible, setBinaryVisible] = useState(false);
    const [systemStatus, setSystemStatus] = useState('INITIALIZING');
    const [showLogModal, setShowLogModal] = useState(false);
    const [selectedLog, setSelectedLog] = useState<ResearchLog | null>(null);
    const [currentTime, setCurrentTime] = useState<string>('');
    const [mounted, setMounted] = useState(false);

    // Easter Egg States - Refresh Based Only
    const [refreshCount, setRefreshCount] = useState(0);
    const [facilityDataDynamic, setFacilityDataDynamic] = useState(text.systemMetrics.sensorData);
    const [isInverted, setIsInverted] = useState(false);

    const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
    const indexRef = useRef(0);
    const ttsTriggeredRef = useRef(false);

    // Handle client-side mounting and time updates
    useEffect(() => {
        setMounted(true);

        const updateTime = () => {
            const now = new Date();
            setCurrentTime(
                `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ` +
                `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
            );
        };

        updateTime();
        const timeInterval = setInterval(updateTime, 1000);

        // Track page refreshes for Easter eggs
        const savedRefreshCount = localStorage.getItem(localStorageKeys.refreshCount);
        if (savedRefreshCount) {
            const count = parseInt(savedRefreshCount, 10);
            setRefreshCount(count + 1);
            localStorage.setItem(localStorageKeys.refreshCount, (count + 1).toString());
        } else {
            setRefreshCount(1);
            localStorage.setItem(localStorageKeys.refreshCount, '1');
        }

        // Dynamic facility data updates
        const dataInterval = setInterval(() => {
            setFacilityDataDynamic(prev => prev.map(item => {
                let newValue = item.value;

                switch (item.key) {
                    case "temperature":
                        newValue = (22 + Math.random() * 2 - 1).toFixed(1) + "°C";
                        break;
                    case "pressure":
                        newValue = (1013 + Math.random() * 10 - 5).toFixed(2) + " hPa";
                        break;
                    case "humidity":
                        newValue = (43 + Math.random() * 6 - 3).toFixed(0) + "%";
                        break;
                    case "radiation":
                        newValue = (0.09 + Math.random() * 0.02 - 0.01).toFixed(2) + " μSv/h";
                        break;
                    default:
                        break;
                }
                return {...item, value: newValue};
            }));
        }, 3000);

        return () => {
            clearInterval(timeInterval);
            clearInterval(dataInterval);
        };
    }, []);

    // Refresh-based Easter eggs with proper TTS (triggered by user interaction)
    useEffect(() => {
        if (!mounted || refreshCount === 0) return;

        // Handler to trigger TTS on first user interaction
        const handleInteraction = () => {
            if ([5, 15, 25].includes(refreshCount)) {
                let message = '';
                const matchedMessage = text.systemMessages.refreshMessages.find(
                    (entry) => entry.threshold === refreshCount
                );

                if (matchedMessage) {
                    message = matchedMessage.message;
                    if (matchedMessage.invert) setIsInverted(true);
                }


                if (message) {
                    setTimeout(() => {
                        if (ambientAudioRef.current) {
                            ambientAudioRef.current.pause();
                        }

                        const utterance = new SpeechSynthesisUtterance(message);
                        utterance.rate = 0.6;
                        utterance.pitch = 0.4;
                        utterance.volume = 0.9;

                        utterance.onend = () => {
                            if (ambientAudioRef.current) {
                                ambientAudioRef.current.play().catch(console.warn);
                            }
                        };

                        if (window.speechSynthesis) {
                            window.speechSynthesis.cancel();
                            setTimeout(() => {
                                window.speechSynthesis.speak(utterance);
                            }, 100);
                        }
                    }, 2000);
                }
            }
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('keydown', handleInteraction);
        };

        document.addEventListener('click', handleInteraction);
        document.addEventListener('keydown', handleInteraction);

        return () => {
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('keydown', handleInteraction);
        };
    }, [refreshCount, mounted]);

    // Initialize ambient audio using the audio tag below
    useEffect(() => {
        if (!mounted) return;

        const audioEl = ambientAudioRef.current;
        if (!audioEl) return;

        audioEl.loop = true;
        audioEl.volume = 0.7;

        const playAudio = () => {
            audioEl.play().catch(() => {
                const handleInteraction = () => {
                    audioEl.play().catch(console.warn);
                    document.removeEventListener('click', handleInteraction);
                    document.removeEventListener('keydown', handleInteraction);
                };
                document.addEventListener('click', handleInteraction);
                document.addEventListener('keydown', handleInteraction);
            });
        };

        playAudio();

        return () => {
            audioEl.pause();
            audioEl.currentTime = 0;
        };
    }, [mounted]);

    // Cookie and redirect checks
    useEffect(() => {
        if (!mounted) return;

        if (Cookies.get(cookies.corrupt)) {
            router.replace(routes.h0m3);
            return;
        }

        // Check if scroll is allowed
        const runAsync = async () => {
            setTimeout(() => setSystemStatus('ONLINE'), 1000);
            setTimeout(() => setSystemStatus('MONITORING'), 2000);

            if (Cookies.get(cookies.noCorruption) && !Cookies.get(cookies.blackAndWhite)) {
                setModalMessage(text.systemMessages.scroll);
                setShowModal(true);
                await signCookie(`${cookies.scroll}=true`);
                setTimeout(() => router.push(routes.scroll), 2000);
            }

            setCountdown(Math.floor(Math.random() * 6) + 5);
        };

        runAsync().catch(console.error);
    }, [router, mounted]);

    // Countdown and TTS logic (play only once ever)
    useEffect(() => {
        if (
            !mounted ||
            countdown === null ||
            countdown <= 0 ||
            voiceTriggered ||
            ttsTriggeredRef.current
        )
            return;

        // Check if TTS has already played (persisted)
        const ttsPlayed = localStorage.getItem(localStorageKeys.timeTTSSpoken);
        if (ttsPlayed === 'true') {
            setCountdown(null); // Keep time as infinity
            return;
        }

        const timer = setInterval(() => {
            setCountdown(c => {
                if (c === null) return null;
                if (c <= 1) {
                    if (!ttsTriggeredRef.current) {
                        ttsTriggeredRef.current = true;

                        if (ambientAudioRef.current) {
                            ambientAudioRef.current.pause();
                        }

                        const utterance = new SpeechSynthesisUtterance(text.systemMessages.time);
                        utterance.rate = 0.7;
                        utterance.pitch = 0.6;
                        utterance.volume = 0.8;

                        utterance.onend = () => {
                            if (ambientAudioRef.current) {
                                ambientAudioRef.current.play().catch(console.warn);
                            }
                            setVoiceTriggered(true);
                        };

                        speechSynthesis.speak(utterance);
                        localStorage.setItem(localStorageKeys.timeTTSSpoken, 'true');
                    }
                    clearInterval(timer);
                    return null;
                }
                return c - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown, voiceTriggered, mounted]);

    // Time check
    useEffect(() => {
        if (!mounted) return;

        const checkTime = async () => {
            const now = new Date();
            const timeNow = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            if (timeNow === text.puzzlePanel.timePuzzleVal) {
                await signCookie(`${cookies.wifiPanel}=true`);
                setModalMessage(text.systemMessages.wifiUnlocked);
                setShowModal(true);
                setTimeout(() => router.push(routes.wifiLogin), 3000);
            }
        };

        checkTime().catch(console.error);
        const interval = setInterval(checkTime, 1000);
        return () => clearInterval(interval);
    }, [router, mounted]);

    // Easter Egg: After refreshCount > 25 and cookies.hollowPilgrimage not set, roll 1/25 every minute for TTS and download
    useEffect(() => {
        if (!mounted || refreshCount <= 25) return;
        const checkTHP = async () => {
            if (document.cookie.includes(cookies.hollowPilgrimage)) return;

            // 1/25 chance
            if (Math.floor(Math.random() * 25) === 0) {
                if (ambientAudioRef.current) {
                    ambientAudioRef.current.pause();
                }
                if (window.speechSynthesis) window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text.systemMessages.hollowPilgrimage);
                utterance.rate = 0.7;
                utterance.pitch = 0.5;
                utterance.volume = 0.9;

                utterance.onend = async () => {
                    if (ambientAudioRef.current) {
                        ambientAudioRef.current.play().catch(console.warn);
                    }
                    await signCookie(`${cookies.hollowPilgrimage}=true`);
                    // Download the file
                    const link = document.createElement('a');
                    link.href = data.hollowPilgrimagePath.href;
                    link.download = data.hollowPilgrimagePath.title;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                };

                if (window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                    setTimeout(() => {
                        window.speechSynthesis.speak(utterance);
                    }, 100);
                }
            }
        };

        checkTHP().catch(console.error);
        const interval = setInterval(checkTHP, 60000);
        return () => clearInterval(interval);
    }, [refreshCount, mounted]);

    // Original Konami code for corruption (kept for puzzle functionality)
    useEffect(() => {
        if (
            !mounted ||
            Cookies.get(cookies.noCorruption)
        ) return;

        const handler = async (e: KeyboardEvent) => {
            if (e.code === data.konamiSequence[indexRef.current]) {
                indexRef.current++;
                if (indexRef.current === data.konamiSequence.length) {
                    if (Cookies.get(cookies.fileConsole)) {
                        await signCookie(`${cookies.corrupt}=true`);
                        setModalMessage(text.systemMessages.konamiUnlock);
                        setShowModal(true);
                        setTimeout(() => window.location.reload(), 3000);
                    }
                    indexRef.current = 0;
                }
            } else {
                indexRef.current = 0;
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [Cookies.get(cookies.fileConsole), Cookies.get(cookies.noCorruption), mounted]);

    const openLog = (log: ResearchLog) => {
        setSelectedLog(log);
        setShowLogModal(true);
    };

    // Don't render until mounted to prevent hydration mismatch
    if (!mounted) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
                <div className="text-green-400 text-2xl font-mono animate-pulse">{text.mainPanel.load}</div>
            </div>
        );
    }

    return (
        <div
            className={`min-h-screen bg-gradient-to-br from-black via-gray-900 to-black facility-layout ${isInverted ? 'inverted-colors' : ''}`}>
            {/* Scrolling Classification Banner */}
            <div className="classification-banner">
                <div className="classification-content">
                    <span>{text.mainPanel.announcementBar}</span>
                    <span>{text.mainPanel.announcementBar}</span>
                    <span>{text.mainPanel.announcementBar}</span>
                </div>
            </div>

            {/* Main Header */}
            <header className="facility-header">
                <div className="container mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <div className="facility-logo">
                                <br/>
                                <div
                                    className="text-4xl font-mono font-bold text-green-400">{text.mainPanel.title}</div>
                                <div className="text-sm text-gray-400 font-mono">{text.mainPanel.subtitle}</div>
                                <br/>
                            </div>
                            <div className={`status-indicator ${systemStatus.toLowerCase()}`}>
                                <div className="status-dot"></div>
                                <span className="status-text">{systemStatus}</span>
                            </div>
                        </div>
                        <div className="facility-time">
                            <div className="text-green-400 font-mono text-xl">{currentTime}</div>
                            <div className="text-xs text-gray-400">{text.mainPanel.timeSubtitle}</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Grid */}
            <main className="facility-main">
                <div className="container mx-auto px-6 py-8">
                    {/* Top Row - Mission Critical Systems */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {/* Primary Terminal */}
                        <div className="lg:col-span-2">
                            <div className="facility-panel primary-terminal">
                                <div className="panel-header">
                                    <h2 className="panel-title">{text.topBarPanel.title}</h2>
                                    <div className="panel-subtitle">{text.topBarPanel.subtitle}</div>
                                </div>

                                <div className="terminal-display">
                                    <div className="terminal-header">
                                        <div className="terminal-dots">
                                            <div className="dot red"></div>
                                            <div className="dot yellow"></div>
                                            <div className="dot green"></div>
                                        </div>
                                        <span className="terminal-label">{text.topBarPanel.h1}</span>
                                    </div>

                                    <div className="terminal-content">
                                        {text.terminalPanel.lines.map((line, idx) => (
                                            <div
                                                key={idx}
                                                className={`terminal-line ${line.warning ? "warning" : ""}`}
                                            >
                                                <span className="prompt">{line.prompt}:</span>
                                                {line.dynamic ? (
                                                    <span
                                                        onMouseEnter={() => setBinaryVisible(true)}
                                                        onMouseLeave={() => setBinaryVisible(false)}
                                                        className="data-stream"
                                                    >
                                                        {binaryVisible ? text.puzzlePanel.binaryPuzzleVal : line.text}
                                                    </span>
                                                ) : (
                                                    <span className={line.warning ? "warning-text" : ""}>
                                                        {line.text}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>


                                <div className="metrics-grid">
                                    <div className="metric-card consciousness">
                                        <div className="metric-label">{text.timePanel.timeCountdown.title}</div>
                                        <div className="metric-value">
                                            {countdown === null ? '∞' : countdown}
                                        </div>
                                        <div className="metric-unit">
                                            {countdown === null ? text.timePanel.timeCountdown.afterSubtitle : text.timePanel.timeCountdown.beforeSubtitle}
                                        </div>
                                    </div>
                                    <div className="metric-card temporal">
                                        <div className="metric-label">{text.timePanel.timeHex.title}</div>
                                        {/* Convert timePuzzleVal to hex string */}
                                        <div
                                            className="metric-value">{Array.from(text.puzzlePanel.timePuzzleVal, c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('')}</div>
                                        <div className="metric-unit">{text.timePanel.timeHex.subtitle}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* System Status */}
                        <div className="facility-panel system-status">
                            <div className="panel-header">
                                <h2 className="panel-title">{text.dataPanel.title}</h2>
                                <div className="panel-subtitle">{text.dataPanel.subtitle}</div>
                            </div>

                            <div className="status-grid">
                                {facilityDataDynamic.map(({label, value}, index) => (
                                    <div key={index} className="status-item">
                                        <span className="status-label">{label}</span>
                                        <span className="status-value">{value}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="system-indicators">
                                {text.sysIndicators.map((indicator, idx) => (
                                    <div
                                        key={idx}
                                        className={`indicator ${
                                            idx === 2
                                                ? 'warning'
                                                : 'active'
                                        }`}
                                    >
                                        <div className="indicator-dot"></div>
                                        <span>{indicator}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Middle Row - Research and Security */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Research Logs */}
                        <div className="facility-panel research-logs">
                            <div className="panel-header">
                                <h2 className="panel-title">{text.logPanel.title}</h2>
                                <div className="panel-subtitle">{text.logPanel.subtitle}</div>
                            </div>

                            {text.researchLogs.slice(0, 8).map((log) => {
                                const isLocked = refreshCount < 15;
                                return (
                                    <div
                                        key={log.id}
                                        onClick={() => {
                                            if (!isLocked) {
                                                openLog(log);
                                            } else {
                                                setModalMessage(text.systemMessages.invalidLogPerm);
                                                setShowModal(true);
                                            }
                                        }}
                                        className={`log-entry ${log.corrupted ? 'corrupted' : 'normal'} ${isLocked ? 'locked' : ''}`}
                                    >
                                        {isLocked && (
                                            <span className="padlock-icon" title="Locked"
                                                  style={{position: 'absolute', top: 8, right: 8, fontSize: '1.5rem'}}>
                                                🔒
                                            </span>
                                        )}
                                        <div className="log-header">
                                            <h3 className="log-title">
                                                {log.title}
                                            </h3>
                                            <span
                                                className={`classification ${log.classification.toLowerCase().replace(' ', '-')}`}>
                                                {log.classification}
                                            </span>
                                        </div>
                                        <div className="log-meta">
                                            {log.id} | {log.researcher} | {log.date}
                                        </div>
                                        <div className="log-preview">
                                            {log.content.split('\n')[0].substring(0, 80)}...
                                        </div>
                                        {log.corrupted && (
                                            <div className="corruption-warning">{text.logPanel.corruptionWarn}</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Security and Performance */}
                        <div className="space-y-8">
                            {/* Security Metrics */}
                            <div className="facility-panel security-panel">
                                <div className="panel-header">
                                    <h2 className="panel-title">{text.securityPanel.title}</h2>
                                    <div className="panel-subtitle">{text.securityPanel.subtitle}</div>
                                </div>

                                <div className="security-grid">
                                    {text.securityData.map((item) => (
                                        <div key={item.title} className="security-metric">
                                            <span className="metric-label">{item.title}</span>
                                            <span className="metric-value">{item.value}</span>
                                        </div>
                                    ))}

                                    <div className="security-metric">
                                        <span className="metric-label">{text.securityPanel.easterEggCountMsg}</span>
                                        <span
                                            className={`metric-value ${
                                                refreshCount >= 25
                                                    ? 'text-red-400'
                                                    : refreshCount >= 15
                                                        ? 'text-yellow-400'
                                                        : 'text-green-400'
                                            }`}
                                        >{refreshCount}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* System Performance */}
                            <div className="facility-panel performance-panel">
                                <div className="panel-header">
                                    <h2 className="panel-title">{text.sysMetricPanel.title}</h2>
                                    <div className="panel-subtitle">{text.sysMetricPanel.subtitle}</div>
                                </div>

                                <div className="performance-grid">
                                    {text.systemMetrics.performanceData.map((item, index) => (
                                        <div key={index} className="perf-metric">
                                            <span className="metric-label">{item.label}</span>
                                            <span className={`metric-value ${item.status ?? ''}`}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="neural-units">
                                    <div className="units-label">{text.sysMetricPanel.subtitle}</div>
                                    <div className="units-grid">
                                        {Object.entries(text.systemMetrics.neuralUnits)
                                            .flatMap(([type, count]) =>
                                                Array.from({length: Number(count)}, (_, i) => ({
                                                    key: `${type}-${i}`,
                                                    type,
                                                }))
                                            )
                                            .sort(() => Math.random() - 0.5)
                                            .map(({key, type}) => (
                                                <div key={key} className={`unit ${type}`}></div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                            <div className="lg:col-span-2 facility-panel alert-panel">
                                <div className="panel-header">
                                    <h2 className="panel-title">{text.alertsData.title}</h2>
                                    <div className="panel-subtitle">{text.alertsData.subtitle}</div>
                                </div>

                                <div className="alerts-container">
                                    {text.alertsData.alerts.map((alert, idx) => (
                                        <div key={idx} className={`alert-item ${alert.level}`}>
                                            <div className="alert-dot"></div>
                                            <span>{alert.message}</span>
                                        </div>
                                    ))}

                                    {refreshCount >= text.alertsData.refreshAlert.minRefreshCount && (
                                        <div className={`alert-item ${text.alertsData.refreshAlert.level}`}>
                                            <div className="alert-dot"></div>
                                            <span>{text.alertsData.refreshAlert.message}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row - Critical Alerts and Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Emergency Contacts */}
                        <div className="facility-panel contacts-panel">
                            <div className="panel-header">
                                <h2 className="panel-title">EMERGENCY CONTACTS</h2>
                                <div className="panel-subtitle">Response Teams</div>
                            </div>

                            <div className="contacts-list">
                                {text.contactPanel.emergency.map(({label, extension, emergency}, i) => (
                                    <div key={i} className={`contact-item ${emergency ? "emergency" : ""}`}>
                                        <span>{label}:</span>
                                        <span className="contact-number">{extension}</span>
                                    </div>
                                ))}

                                {refreshCount >= text.contactPanel.secret.minRefreshCount && (
                                    <div className="contact-item emergency">
                                        <span>{text.contactPanel.secret.label}:</span>
                                        <span className="contact-number">{text.contactPanel.secret.extension}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Project Classification */}
                        <div className="facility-panel classification-panel">
                            <div className="panel-header">
                                <h2 className="panel-title">{text.projectClassPanel.title}</h2>
                                <div className="panel-subtitle">{text.projectClassPanel.subtitle}</div>
                            </div>

                            <div className="classification-info">
                                {text.projectClassPanel.classifications.map((item, i) => {
                                    if ("threshold" in item) {
                                        const active = refreshCount >= (item.threshold ?? 0);
                                        return (
                                            <div key={i} className="class-item">
                                                <span>{item.label}:</span>
                                                <span
                                                    className={`class-value ${active ? item.classNameIfHigh : item.classNameIfLow}`}>
                                                    {active ? item.valueIfHigh : item.valueIfLow}
                                                </span>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={i} className="class-item">
                                            <span>{item.label}:</span>
                                            <span className={`class-value ${item.className ?? ""}`}>{item.value}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Research Log Modal */}
            {showLogModal && selectedLog && (
                <div className="modal-overlay" onClick={() => setShowLogModal(false)}>
                    <div className="modal-content max-w-6xl max-h-[90vh] overflow-y-auto"
                         onClick={e => e.stopPropagation()}>
                        <div className="mb-6">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className={`text-2xl font-bold ${selectedLog.corrupted ? 'text-red-400' : 'text-green-400'}`}>
                                    {selectedLog.title}
                                </h2>
                                <button
                                    onClick={() => setShowLogModal(false)}
                                    className="text-gray-400 hover:text-white text-3xl transition-colors"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="text-sm text-gray-400 mb-6 flex flex-wrap gap-4">
                                <span className="font-mono bg-gray-800 px-2 py-1 rounded">{selectedLog.id}</span>
                                <span>{selectedLog.researcher}</span>
                                <span>{selectedLog.date}</span>
                                <span
                                    className={`px-3 py-1 rounded text-xs font-bold ${classificationClass(selectedLog)}`}>
                                    {selectedLog.classification}
                                </span>
                            </div>
                        </div>
                        <div
                            className={`terminal ${selectedLog.corrupted ? 'border-red-500/50' : ''} relative overflow-hidden`}>
                            {selectedLog.corrupted && (
                                <div className="absolute inset-0 bg-red-500/5 animate-pulse"></div>
                            )}
                            <div className="terminal-content relative z-10">
                                <pre className={`whitespace-pre-wrap text-sm leading-relaxed ${
                                    selectedLog.corrupted ? 'text-red-300' : 'text-green-300'
                                }`}>
                                    {selectedLog.content}
                                </pre>
                            </div>
                        </div>
                        {selectedLog.corrupted && (
                            <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                                <div
                                    className="text-red-400 text-sm font-bold mb-2 animate-pulse">{text.logPanel.corruptionWarn}</div>
                                <div className="text-red-300 text-xs">{text.logPanel.corruptionMsg}</div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <audio
                ref={ambientAudioRef}
                src={BACKGROUND_AUDIO.HOME}
                loop={true}
                style={{display: 'none'}}
            />

            {/* System Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="text-4xl mb-4">⚠️</div>
                            <h2 className="text-xl font-bold text-green-400 mb-4">{text.notifications.title}</h2>
                            <p className="text-gray-300 mb-6 whitespace-pre-line">{modalMessage}</p>
                            <button
                                onClick={() => setShowModal(false)}
                                className="btn btn-primary"
                            >
                                {text.notifications.accept}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden Easter Egg Indicator */}
            {refreshCount >= 5 && (
                <div className="fixed bottom-4 right-4 text-xs text-gray-600 font-mono opacity-30">
                    🌳 {Math.min(refreshCount, 25)}/25 🌳
                </div>
            )}
        </div>
    );
}
