"use client"

import React, {useEffect, useState} from 'react';
import LoginScreen from './LoginScreen';
import {desktop, exeTitle, sysConfigDefaults} from '@/lib/client/data/tree98';
import Cookies from "js-cookie";
import {ContextMenu, FileSystemItem} from '@/types';
import {useBootSequence, useSystemCorruption, useWindowManagement} from '@/hooks';
import {BlueScreen} from '@/components/tree98/ui/BlueScreen';
import {CMD} from '@/components/tree98/applications/CMD';
import {ContextMenuComponent} from '@/components/tree98/ui/ContextMenu';
import {ControlPanel} from '@/components/tree98/dialogs/ControlPanel';
import {FileExplorer} from '@/components/tree98/applications/FileExplorer';
import {FileViewer} from '@/components/tree98/dialogs/FileViewer';
import {LoadingScreen} from '@/components/tree98/ui/LoadingScreen';
import {Notepad} from '@/components/tree98/applications/Notepad';
import {Paint} from '@/components/tree98/applications/Paint';
import {StartMenu} from '@/components/tree98/ui/StartMenu';
import {VesselBootDialog} from '@/components/tree98/dialogs/VesselBootDialog';
import {WindowComponent} from '@/components/tree98/WindowComponent';
import {BACKGROUND_AUDIO, playSafeSFX, SFX_AUDIO, usePlayBackgroundAudio} from "@/audio";
import {cookies, routes} from '@/lib/saveData';
import {getIcon} from "@/components/tree98/icons";

const Tree98Sim: React.FC<{
    audioRef: React.RefObject<HTMLAudioElement>;
    audioSrc: string;
    setAudioSrc: (src: string) => void
}> = ({audioRef: externalAudioRef, audioSrc, setAudioSrc}) => {
    const {bootPhase, setBootPhase, tree98BootText, bootText, loadingProgress} = useBootSequence();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [contextMenu, setContextMenu] = useState<ContextMenu>({x: 0, y: 0, visible: false});
    const [showDesktopIcons, setShowDesktopIcons] = useState(true);
    const [showStartMenu, setShowStartMenu] = useState(false);
    const [glitchAudio, setGlitchAudio] = useState<HTMLAudioElement | null>(null);
    const [cursorGlitch, setCursorGlitch] = useState(false);
    const audioRef = externalAudioRef;
    const {
        windows,
        createWindow,
        closeWindow,
        bringToFront,
        startDrag,
        onMinimize,
        onMaximize,
        onResize
    } = useWindowManagement();
    const {
        systemCorruption,
        setSystemCorruption,
        errorPopups,
        setErrorPopups,
        isSystemCrashing,
        showBlueScreen
    } = useSystemCorruption(createWindow, audioRef);

    // Check cutscene status
    useEffect(() => {
        if (Cookies.get(cookies.tree98) === 'true') {
            window.location.href = routes.fileConsole;
            return;
        }
    }, []);

    // Time update
    useEffect(() => {
        const timeInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timeInterval);
    }, []);

    // Escalate corruption effects
    useEffect(() => {
        if (systemCorruption > 2) {
            // Cursor glitch
            setCursorGlitch(true);
        } else {
            if (glitchAudio) {
                glitchAudio.pause();
                setGlitchAudio(null);
            }
            setCursorGlitch(false);
        }
    }, [systemCorruption]);

    const handleFileOpen = (item: FileSystemItem) => {
        if ('action' in item) {
            switch (item.action) {
                case 'notepad':
                    createWindow(exeTitle.Notepad, Notepad, 150, 150, 500, 400);
                    break;
                case 'paint':
                    createWindow(exeTitle.Paint, Paint, 150, 150, 500, 400);
                    break;
                case 'cmd':
                    createWindow(exeTitle.CommandPrompt, CMD, 180, 120, 600, 300);
                    break;
                case 'settings':
                    createWindow(exeTitle.ControlPanel, ControlPanel, 140, 140, 400, 200);
                    break;
                default:
                    break;
            }
        } else if (item.executable && item.name === sysConfigDefaults.vesselEXE) {
            createWindow(exeTitle.VesselBoot, VesselBootDialog, 100, 100, 500, 300, {item});
            setTimeout(async () => {
                await new Promise(res => setTimeout(res, 7000));
                try {
                    if (!document.fullscreenElement) {
                        await document.exitFullscreen();
                    }
                } catch {
                }
                setSystemCorruption(1);
            }, 6000);
        } else if (item.type === 'file') {
            createWindow(item.name, FileViewer, 100 + Math.random() * 200, 100 + Math.random() * 200, 500, 400, {item});
        }
    };

    const handleDesktopIconClick = (action: string) => {
        switch (action) {
            case 'file-explorer':
                createWindow(exeTitle.FileExplorer, FileExplorer, 100, 100, 600, 400, {onFileOpen: handleFileOpen});
                break;
            case 'notepad':
                createWindow(exeTitle.Notepad, Notepad, 150, 150, 500, 400);
                break;
            case 'paint':
                createWindow(exeTitle.Paint, Paint, 200, 50, 750, 600);
                break;
            case 'cmd':
                createWindow(exeTitle.CommandPrompt, CMD, 180, 120, 600, 300);
                break;
        }
    };

    const handleStartMenuAction = (action: string) => {
        setShowStartMenu(false);
        switch (action) {
            case 'documents':
                createWindow(exeTitle.FileExplorer, FileExplorer, 120, 120, 600, 400, {
                    startPath: ['My Computer', 'C:', 'Desktop'],
                    onFileOpen: handleFileOpen
                });
                break;
            case 'settings':
                createWindow(exeTitle.ControlPanel, ControlPanel, 140, 140, 400, 200);
                break;
            case 'cmd':
                createWindow(exeTitle.CommandPrompt, CMD, 180, 120, 600, 300);
                break;
            case 'restart':
                window.location.reload();
                break;
        }
    };

    const handleRightClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            visible: true
        });
    };

    const handleContextMenuAction = (action: string) => {
        if (action === 'toggle-icons') {
            setShowDesktopIcons(!showDesktopIcons);
        }
        setContextMenu({...contextMenu, visible: false});
    };

    // Play safe SFX on loading phase
    useEffect(() => {
        if (bootPhase === 'loading') {
            playSafeSFX(audioRef, SFX_AUDIO.RESTART, true);
        }
    }, [bootPhase]);
    // Set background audio based on boot phase and blue screen status
    useEffect(() => {
        if (showBlueScreen) {
            setAudioSrc(BACKGROUND_AUDIO.BSOD);
        } else if (bootPhase === 'boot' || bootPhase === 'main') {
            setAudioSrc(BACKGROUND_AUDIO.COMPUTER_BOOT);
        } else {
            setAudioSrc(BACKGROUND_AUDIO.COMPUTER);
        }
    }, [showBlueScreen, bootPhase]);
    usePlayBackgroundAudio(audioRef, audioSrc);

    // Show appropriate boot phase
    if (bootPhase === 'boot') {
        return (
            <div
                className="w-full h-screen bg-black text-green-400 p-8"
                style={{fontFamily: sysConfigDefaults.fonts.mono}}
            >
                <div className="whitespace-pre-wrap text-sm overflow-auto h-full" ref={el => {
                    if (el) el.scrollTop = el.scrollHeight;
                }}>
                    {tree98BootText}
                </div>
                <div className="mt-4 animate-pulse">_</div>
            </div>
        );
    }

    if (bootPhase === 'main') {
        return (
            <div
                className="w-full h-screen bg-black text-green-400 p-8"
                style={{fontFamily: sysConfigDefaults.fonts.mono}}
            >
                <div className="whitespace-pre-wrap text-sm">
                    {bootText}
                </div>
                <div className="mt-4 animate-pulse">_</div>
            </div>
        );
    }

    if (bootPhase === 'loading') {
        return <LoadingScreen loadingProgress={loadingProgress}/>
    }

    if (bootPhase === 'login') {
        if (Cookies.get(cookies.loggedIn)) {
            setBootPhase('desktop');
            return null;
        }
        return <LoginScreen onLogin={() => setBootPhase('desktop')} audioRef={audioRef}/>;
    }

    // Blue Screen of Death
    if (showBlueScreen) {
        return <BlueScreen/>;
    }

    // Main Desktop
    return (
        <div
            className="w-full h-screen relative overflow-hidden select-none"
            style={{
                backgroundImage: `url(${sysConfigDefaults.background})`,
                color: sysConfigDefaults.colors.text,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                filter: systemCorruption > 3 ? 'contrast(1.2) brightness(0.9) hue-rotate(10deg)' : undefined
            }}
            onClick={() => {
                setShowStartMenu(false);
                setContextMenu({...contextMenu, visible: false});
            }}
            onContextMenu={handleRightClick}
        >
            {/* Cursor glitch effect */}
            {cursorGlitch && (
                <style>{`body, * { cursor: url('/static/tree98/corrupt-cursor.png'), auto !important; }`}</style>
            )}

            {/* Desktop Background Pattern (corruption effect) */}
            {systemCorruption > 3 && (
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ff0000' fill-opacity='0.1'%3E%3Crect width='60' height='60'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}
                />
            )}

            {/* Desktop Icons */}
            {showDesktopIcons && (
                <div className="absolute top-4 left-4 space-y-6">
                    {desktop.map((icon, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center p-2 hover:bg-blue-100 hover:bg-opacity-50 cursor-pointer w-20 rounded"
                            onDoubleClick={() => handleDesktopIconClick(icon.action)}
                            style={{fontFamily: sysConfigDefaults.fonts.system}}
                        >
                            <div className="w-8 h-8 mb-1">
                                {getIcon(icon.icon)}
                            </div>
                            <span className="text-xs text-center text-white drop-shadow-lg">
                                {icon.name}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Windows */}
            {windows.map(window => (
                <WindowComponent
                    key={window.id}
                    window={window}
                    systemCorruption={systemCorruption}
                    onBringToFront={bringToFront}
                    onStartDrag={startDrag}
                    onClose={closeWindow}
                    onMinimize={onMinimize}
                    onMaximize={onMaximize}
                    onResize={onResize}
                />
            ))}

            {/* Error Popups */}
            {errorPopups.map((error, index) => (
                <div
                    key={index}
                    className="absolute border-2 shadow-lg p-4 text-center bg-white"
                    style={{
                        left: `calc(50vw - 150px)`,
                        top: `calc(50vh - 80px)`,
                        zIndex: 1000 + index,
                        transform: `rotate(${Math.random() * 10 - 5}deg)`,
                        borderColor: sysConfigDefaults.colors.windowBorder,
                        fontFamily: sysConfigDefaults.fonts.system,
                        maxWidth: '300px',
                        maxHeight: '160px',
                        overflow: 'auto'
                    }}
                >
                    <div className="w-8 h-8 mx-auto mb-2">
                        {getIcon('warning')}
                    </div>
                    <div className="text-xs mb-4">{error}</div>
                    <button
                        className="px-4 py-1 border bg-gray-100 text-xs hover:bg-gray-200"
                        onClick={() => setErrorPopups(prev => prev.filter((_, i) => i !== index))}
                    >
                        OK
                    </button>
                </div>
            ))}

            {/* Context Menu */}
            {contextMenu.visible && (
                <ContextMenuComponent
                    contextMenu={contextMenu}
                    showDesktopIcons={showDesktopIcons}
                    onAction={handleContextMenuAction}
                />
            )}

            {/* Start Menu */}
            {showStartMenu && <StartMenu onAction={handleStartMenuAction}/>}

            {/* Taskbar */}
            <div
                className="absolute bottom-0 left-0 right-0 border-t-2 flex items-center px-2"
                style={{
                    height: sysConfigDefaults.size.taskbarHeight,
                    backgroundColor: sysConfigDefaults.colors.taskbarBg,
                    borderColor: sysConfigDefaults.colors.windowBorder,
                    fontFamily: sysConfigDefaults.fonts.system
                }}
            >
                <button
                    className="px-4 py-1 border border-gray-400 text-xs font-bold mr-2 hover:bg-gray-300"
                    style={{backgroundColor: sysConfigDefaults.colors.buttonBg}}
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowStartMenu(!showStartMenu);
                    }}
                >
                    Start
                </button>

                {/* Taskbar App List */}
                <div className="flex gap-1 flex-1">
                    {windows.filter(win => !win.isMinimized).map(win => (
                        <button
                            key={win.id}
                            className="px-2 py-1 bg-gray-700 text-white rounded text-xs border border-gray-500 hover:bg-gray-600"
                            style={{
                                fontWeight: win.zIndex === Math.max(...windows.map(w => w.zIndex)) ? 'bold' : 'normal'
                            }}
                            onClick={e => {
                                e.stopPropagation();
                                bringToFront(win.id);
                            }}
                        >
                            {win.title}
                        </button>
                    ))}
                </div>

                <div className="text-xs px-2 border-l border-gray-400">
                    {currentTime.toLocaleTimeString()}
                </div>
            </div>

            {/* System Corruption Effects */}
            {systemCorruption > 5 && (
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-red-500 opacity-10 animate-pulse"/>
                    <div
                        className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-transparent animate-pulse"/>
                </div>
            )}

            {/* System Crash Overlay */}
            {isSystemCrashing && (
                <div className="text-white text-center" style={{fontFamily: sysConfigDefaults.fonts.system}}>
                    <div className="text-2xl animate-pulse">SYSTEM FAILURE</div>
                    <div className="text-sm mt-4">Please wait...</div>
                </div>
            )}
        </div>
    );
};

export default Tree98Sim;
