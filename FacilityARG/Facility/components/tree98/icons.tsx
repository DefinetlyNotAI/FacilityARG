// noinspection JSUnusedGlobalSymbols
import React from 'react';

export const Icons = {
    computer: () => (
        <svg viewBox="0 0 32 32" className="w-full h-full">
            <rect x="4" y="8" width="24" height="16" fill="#c0c0c0" stroke="#000" strokeWidth="1"/>
            <rect x="6" y="10" width="20" height="12" fill="#000080"/>
            <rect x="14" y="24" width="4" height="4" fill="#c0c0c0" stroke="#000" strokeWidth="1"/>
            <rect x="8" y="28" width="16" height="2" fill="#c0c0c0" stroke="#000" strokeWidth="1"/>
            <circle cx="16" cy="16" r="2" fill="#00ff00"/>
        </svg>
    ),

    drive: () => (
        <svg viewBox="0 0 32 32" className="w-full h-full">
            <rect x="4" y="8" width="24" height="16" fill="#808080" stroke="#000" strokeWidth="1"/>
            <rect x="6" y="10" width="20" height="12" fill="#c0c0c0"/>
            <circle cx="16" cy="16" r="6" fill="#000"/>
            <circle cx="16" cy="16" r="2" fill="#c0c0c0"/>
            <text x="16" y="28" textAnchor="middle" fill="#000" fontSize="8">C:</text>
        </svg>
    ),

    floppy: () => (
        <svg viewBox="0 0 32 32" className="w-full h-full">
            <rect x="4" y="4" width="24" height="24" fill="#000" stroke="#000" strokeWidth="1"/>
            <rect x="6" y="6" width="20" height="20" fill="#c0c0c0"/>
            <rect x="8" y="8" width="16" height="4" fill="#000"/>
            <rect x="10" y="14" width="12" height="8" fill="#808080"/>
            <circle cx="16" cy="18" r="2" fill="#000"/>
            <text x="16" y="28" textAnchor="middle" fill="#000" fontSize="8">A:</text>
        </svg>
    ),

    folder: () => (
        <svg viewBox="0 0 32 32" className="w-full h-full">
            <path d="M4 8 L14 8 L16 6 L28 6 L28 24 L4 24 Z" fill="#ffff00" stroke="#000" strokeWidth="1"/>
            <path d="M4 10 L28 10 L28 24 L4 24 Z" fill="#ffff80" stroke="#000" strokeWidth="1"/>
        </svg>
    ),

    notepad: () => (
        <svg viewBox="0 0 32 32" className="w-full h-full">
            <rect x="6" y="4" width="20" height="24" fill="#ffffff" stroke="#000" strokeWidth="1"/>
            <rect x="4" y="6" width="2" height="20" fill="#ff0000"/>
            <line x1="8" y1="8" x2="24" y2="8" stroke="#0000ff" strokeWidth="1"/>
            <line x1="8" y1="12" x2="22" y2="12" stroke="#0000ff" strokeWidth="1"/>
            <line x1="8" y1="16" x2="20" y2="16" stroke="#0000ff" strokeWidth="1"/>
            <line x1="8" y1="20" x2="24" y2="20" stroke="#0000ff" strokeWidth="1"/>
        </svg>
    ),

    paint: () => (
        <svg viewBox="0 0 32 32" className="w-full h-full">
            <rect x="4" y="8" width="24" height="16" fill="#c0c0c0" stroke="#000" strokeWidth="1"/>
            <rect x="6" y="10" width="20" height="12" fill="#ffffff" stroke="#000" strokeWidth="1"/>
            <circle cx="12" cy="16" r="2" fill="#ff0000"/>
            <circle cx="16" cy="14" r="1.5" fill="#00ff00"/>
            <circle cx="20" cy="18" r="1" fill="#0000ff"/>
            <rect x="2" y="12" width="4" height="8" fill="#8b4513" stroke="#000" strokeWidth="1"/>
        </svg>
    ),

    executable: () => (
        <svg viewBox="0 0 32 32" className="w-full h-full">
            <rect x="6" y="4" width="20" height="24" fill="#c0c0c0" stroke="#000" strokeWidth="1"/>
            <rect x="8" y="6" width="16" height="2" fill="#000080"/>
            <rect x="10" y="10" width="12" height="8" fill="#008000"/>
            <polygon points="14,12 18,14 14,16" fill="#ffffff"/>
            <rect x="8" y="20" width="16" height="6" fill="#800000"/>
            <text x="16" y="25" textAnchor="middle" fill="#ffffff" fontSize="6">EXE</text>
        </svg>
    ),

    image: () => (
        <svg viewBox="0 0 32 32" className="w-full h-full">
            <rect x="4" y="6" width="24" height="20" fill="#ffffff" stroke="#000" strokeWidth="1"/>
            <rect x="6" y="8" width="20" height="16" fill="#87ceeb"/>
            <circle cx="12" cy="14" r="3" fill="#ffff00"/>
            <polygon points="6,20 10,16 14,18 18,14 22,16 26,18 26,24 6,24" fill="#90ee90"/>
            <polygon points="18,12 22,8 26,10 26,14" fill="#ffffff"/>
        </svg>
    ),

    settings: () => (
        <svg viewBox="0 0 32 32" className="w-full h-full">
            <circle cx="16" cy="16" r="6" fill="#c0c0c0" stroke="#000" strokeWidth="1"/>
            <circle cx="16" cy="16" r="3" fill="#808080"/>
            <rect x="14" y="4" width="4" height="8" fill="#c0c0c0" stroke="#000" strokeWidth="1"/>
            <rect x="14" y="20" width="4" height="8" fill="#c0c0c0" stroke="#000" strokeWidth="1"/>
            <rect x="4" y="14" width="8" height="4" fill="#c0c0c0" stroke="#000" strokeWidth="1"/>
            <rect x="20" y="14" width="8" height="4" fill="#c0c0c0" stroke="#000" strokeWidth="1"/>
        </svg>
    ),

    run: () => (
        <svg viewBox="0 0 32 32" className="w-full h-full">
            <rect x="4" y="8" width="24" height="16" fill="#000000"/>
            <text x="6" y="18" fill="#00ff00" fontSize="8" fontFamily="monospace">C:\&gt;</text>
            <rect x="6" y="20" width="2" height="2" fill="#00ff00"/>
        </svg>
    ),

    restart: () => (
        <svg viewBox="0 0 32 32" className="w-full h-full">
            <circle cx="16" cy="16" r="12" fill="#ff0000" stroke="#800000" strokeWidth="2"/>
            <rect x="14" y="8" width="4" height="8" fill="#ffffff"/>
            <circle cx="16" cy="20" r="2" fill="#ffffff"/>
        </svg>
    ),

    minimize: () => (
        <svg viewBox="0 0 16 16" className="w-full h-full">
            <rect x="2" y="12" width="12" height="2" fill="#000"/>
        </svg>
    ),

    maximize: () => (
        <svg viewBox="0 0 16 16" className="w-full h-full">
            <rect x="2" y="2" width="12" height="12" fill="none" stroke="#000" strokeWidth="2"/>
            <rect x="2" y="2" width="12" height="3" fill="#000"/>
        </svg>
    ),

    close: () => (
        <svg viewBox="0 0 16 16" className="w-full h-full">
            <line x1="4" y1="4" x2="12" y2="12" stroke="#000" strokeWidth="2"/>
            <line x1="12" y1="4" x2="4" y2="12" stroke="#000" strokeWidth="2"/>
        </svg>
    ),

    warning: () => (
        <svg viewBox="0 0 32 32" className="w-full h-full">
            <polygon points="16,4 28,26 4,26" fill="#ffff00" stroke="#000" strokeWidth="2"/>
            <rect x="14" y="12" width="4" height="8" fill="#000"/>
            <circle cx="16" cy="22" r="2" fill="#000"/>
        </svg>
    ),

    error: () => (
        <svg viewBox="0 0 32 32" className="w-full h-full">
            <circle cx="16" cy="16" r="14" fill="#ff0000" stroke="#800000" strokeWidth="2"/>
            <line x1="10" y1="10" x2="22" y2="22" stroke="#ffffff" strokeWidth="3"/>
            <line x1="22" y1="10" x2="10" y2="22" stroke="#ffffff" strokeWidth="3"/>
        </svg>
    ),

    cmd: () => (
        <svg viewBox="0 0 32 32" className="w-full h-full">
            <rect x="4" y="8" width="24" height="16" fill="#222"/>
            <text x="8" y="20" fill="#00ff00" fontSize="10" fontFamily="monospace">C:\&gt;_</text>
        </svg>
    )
};

export const getIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons];
    return IconComponent ? <IconComponent/> : <Icons.folder/>;
};
