import React, {useLayoutEffect, useRef, useState} from 'react';
import {WindowComponentProps} from '@/types';
import {sysConfigDefaults} from '@/lib/client/data/tree98';
import {getIcon} from "@/components/tree98/icons";


// Minimum window size to prevent hiding elements
const MIN_WIDTH = 250;
const MIN_HEIGHT = 120;

export const WindowComponent: React.FC<WindowComponentProps> = ({
                                                                    window,
                                                                    systemCorruption,
                                                                    onBringToFront,
                                                                    onStartDrag,
                                                                    onClose,
                                                                    onMinimize,
                                                                    onMaximize,
                                                                    onResize
                                                                }) => {
    const Component = window.component;
    const glitchX = systemCorruption > 2 ? Math.random() * sysConfigDefaults.corruption.glitchPosMax - 5 : 0;
    const glitchY = systemCorruption > 2 ? Math.random() * sysConfigDefaults.corruption.glitchPosMax - 5 : 0;
    const rotation = systemCorruption > 4 ? Math.random() * sysConfigDefaults.corruption.glitchRotMax - 2 : 0;

    // Resize logic
    const resizing = useRef(false);
    const lastPosition = useRef<{ x: number, y: number }>({x: 0, y: 0});

    const startResize = (e: React.MouseEvent) => {
        e.stopPropagation();
        resizing.current = true;
        lastPosition.current = {x: e.clientX, y: e.clientY};
        const startWidth = window.width;
        const startHeight = window.height;

        const onMouseMove = (moveEvent: MouseEvent) => {
            if (!resizing.current) return;
            const deltaX = moveEvent.clientX - lastPosition.current.x;
            const deltaY = moveEvent.clientY - lastPosition.current.y;
            const newWidth = Math.max(MIN_WIDTH, startWidth + deltaX);
            const newHeight = Math.max(MIN_HEIGHT, startHeight + deltaY);
            if (onResize) {
                onResize(window.id, newWidth, newHeight);
            }
        };

        const onMouseUp = () => {
            resizing.current = false;
            globalThis.window.removeEventListener('mousemove', onMouseMove);
            globalThis.window.removeEventListener('mouseup', onMouseUp);
        };

        globalThis.window.addEventListener('mousemove', onMouseMove);
        globalThis.window.addEventListener('mouseup', onMouseUp);
    };

    // Ref and state for content overflow detection
    const contentRef = useRef<HTMLDivElement>(null);
    const [showScroll, setShowScroll] = useState(false);

    useLayoutEffect(() => {
        if (contentRef.current) {
            const content = contentRef.current;
            // Check if content overflows window size
            setShowScroll(
                content.scrollHeight > content.clientHeight ||
                content.scrollWidth > content.clientWidth
            );
        }
    }, [window.width, window.height, window.props]);

    // If minimized, render only the title bar
    if (window.isMinimized) {
        return (
            <div
                className="absolute border-2 shadow-lg"
                style={{
                    left: window.x + glitchX,
                    top: window.y + glitchY,
                    width: MIN_WIDTH,
                    height: 24,
                    zIndex: window.zIndex,
                    backgroundColor: sysConfigDefaults.colors.windowBg,
                    borderColor: sysConfigDefaults.colors.windowBorder,
                    fontFamily: sysConfigDefaults.fonts.system
                }}
                onClick={() => onBringToFront(window.id)}
            >
                <div
                    className="text-white px-2 py-1 flex items-center justify-between text-xs cursor-move select-none"
                    style={{backgroundColor: sysConfigDefaults.colors.titleBar}}
                    onMouseDown={(e) => onStartDrag(e, window.id)}
                >
                    <span>{window.title}</span>
                    <div className="flex gap-1">
                        <button
                            className="w-4 h-4 bg-gray-300 border border-gray-400 flex items-center justify-center hover:bg-gray-400"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onMinimize) onMinimize(window.id, false);
                            }}
                        >
                            {getIcon('restore')}
                        </button>
                        <button
                            className="w-4 h-4 bg-gray-300 border border-gray-400 flex items-center justify-center hover:bg-gray-400"
                            onClick={(e) => {
                                e.stopPropagation();
                                onClose(window.id);
                            }}
                        >
                            {getIcon('close')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="absolute border-2 shadow-lg"
            style={{
                left: window.x + glitchX,
                top: window.y + glitchY,
                width: window.width,
                height: window.height,
                zIndex: window.zIndex,
                transform: `rotate(${rotation}deg)`,
                backgroundColor: sysConfigDefaults.colors.windowBg,
                borderColor: sysConfigDefaults.colors.windowBorder,
                fontFamily: sysConfigDefaults.fonts.system
            }}
            onClick={() => onBringToFront(window.id)}
        >
            <div
                className="text-white px-2 py-1 flex items-center justify-between text-xs cursor-move select-none"
                style={{backgroundColor: sysConfigDefaults.colors.titleBar}}
                onMouseDown={(e) => onStartDrag(e, window.id)}
            >
                <span>{window.title}</span>
                <div className="flex gap-1">
                    <button
                        className="w-4 h-4 bg-gray-300 border border-gray-400 flex items-center justify-center hover:bg-gray-400"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onMinimize) onMinimize(window.id, true);
                        }}
                    >
                        {getIcon('minimize')}
                    </button>
                    <button
                        className="w-4 h-4 bg-gray-300 border border-gray-400 flex items-center justify-center hover:bg-gray-400"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onMaximize) onMaximize(window.id);
                        }}
                    >
                        {getIcon(window.isMaximized ? 'restore' : 'maximize')}
                    </button>
                    <button
                        className="w-4 h-4 bg-gray-300 border border-gray-400 flex items-center justify-center hover:bg-gray-400"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose(window.id);
                        }}
                    >
                        {getIcon('close')}
                    </button>
                </div>
            </div>

            <div
                ref={contentRef}
                className="h-full"
                style={{
                    height: 'calc(100% - 24px)',
                    overflow: showScroll ? 'auto' : 'hidden'
                }}
            >
                {Component && <Component {...window.props} />}
            </div>
            {/* Resize handle */}
            {!window.isMaximized && (
                <>
                    {/* Right edge */}
                    <div
                        style={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            width: 8,
                            height: '100%',
                            cursor: 'ew-resize',
                            zIndex: 10
                        }}
                        onMouseDown={(e) => startResize(e)}
                        data-resize="right"
                    />
                    {/* Bottom edge */}
                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            bottom: 0,
                            width: '100%',
                            height: 8,
                            cursor: 'ns-resize',
                            zIndex: 10
                        }}
                        onMouseDown={(e) => startResize(e)}
                        data-resize="bottom"
                    />
                    {/* Left edge */}
                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: 8,
                            height: '100%',
                            cursor: 'ew-resize',
                            zIndex: 10
                        }}
                        onMouseDown={(e) => startResize(e)}
                        data-resize="left"
                    />
                    {/* Top edge */}
                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: '100%',
                            height: 8,
                            cursor: 'ns-resize',
                            zIndex: 10
                        }}
                        onMouseDown={(e) => startResize(e)}
                        data-resize="top"
                    />
                    {/* Bottom-right corner */}
                    <div
                        style={{
                            position: 'absolute',
                            right: 0,
                            bottom: 0,
                            width: 16,
                            height: 16,
                            cursor: 'nwse-resize',
                            zIndex: 11
                        }}
                        onMouseDown={startResize}
                        data-resize="corner"
                    />
                </>
            )}
        </div>
    );
};
