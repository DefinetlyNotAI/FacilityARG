import React, {useEffect, useState} from 'react';
import {DragState, Window} from '@/types';
import {sysConfigDefaults} from '@/lib/client/data/tree98';

const MIN_WIDTH = 250;
const MIN_HEIGHT = 120;

export const useWindowManagement = () => {
    const [windows, setWindows] = useState<Window[]>([]);
    const [nextZIndex, setNextZIndex] = useState(1);
    const [dragState, setDragState] = useState<DragState>({
        isDragging: false,
        windowId: null,
        startX: 0,
        startY: 0,
        initialX: 0,
        initialY: 0
    });

    // Mouse event handlers for dragging
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (dragState.isDragging && dragState.windowId) {
                const deltaX = e.clientX - dragState.startX;
                const deltaY = e.clientY - dragState.startY;

                setWindows(prev => prev.map(w =>
                    w.id === dragState.windowId
                        ? {
                            ...w,
                            x: Math.max(0, Math.min(window.innerWidth - w.width, dragState.initialX + deltaX)),
                            y: Math.max(0, Math.min(window.innerHeight - w.height - 32, dragState.initialY + deltaY))
                        }
                        : w
                ));
            }
        };

        const handleMouseUp = () => {
            setDragState(prev => ({...prev, isDragging: false, windowId: null}));
        };

        if (dragState.isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragState]);

    const createWindow = (
        title: string,
        component: React.ComponentType<any>,
        x: number,
        y: number,
        width: number = sysConfigDefaults.size.windowWidth,
        height: number = sysConfigDefaults.size.windowHeight,
        props: any = {}
    ) => {
        const newWindow: Window = {
            id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
            title,
            component,
            x,
            y,
            width,
            height,
            isMinimized: false,
            isMaximized: false,
            zIndex: nextZIndex,
            props
        };
        setWindows(prev => [...prev, newWindow]);
        setNextZIndex(prevZ => prevZ + 50);
    };

    const closeWindow = (id: string) => {
        setWindows(prev => prev.filter(w => w.id !== id));
    };

    const bringToFront = (id: string) => {
        setWindows(prev => prev.map(w =>
            w.id === id ? {...w, zIndex: nextZIndex} : w
        ));
        setNextZIndex(prev => prev + 1);
    };

    const startDrag = (e: React.MouseEvent, windowId: string) => {
        e.preventDefault();
        const window = windows.find(w => w.id === windowId);
        if (window) {
            setDragState({
                isDragging: true,
                windowId,
                startX: e.clientX,
                startY: e.clientY,
                initialX: window.x,
                initialY: window.y
            });
            bringToFront(windowId);
        }
    };

    const onMinimize = (id: string, minimize: boolean) => {
        setWindows(prev => prev.map(w =>
            w.id === id ? {...w, isMinimized: minimize} : w
        ));
    };

    const onMaximize = (id: string) => {
        setWindows(prev => prev.map(w => {
            if (w.id !== id) return w;
            if (!w.isMaximized) {
                // Maximize to fill screen (minus taskbar)
                return {
                    ...w,
                    x: 0,
                    y: 0,
                    width: window.innerWidth,
                    height: window.innerHeight - sysConfigDefaults.size.taskbarHeight,
                    isMaximized: true
                };
            } else {
                // Restore to default size and position
                return {
                    ...w,
                    x: 100,
                    y: 100,
                    width: sysConfigDefaults.size.windowWidth,
                    height: sysConfigDefaults.size.windowHeight,
                    isMaximized: false
                };
            }
        }));
    };

    const onResize = (id: string, width: number, height: number) => {
        setWindows(prev => prev.map(w =>
            w.id === id
                ? {
                    ...w,
                    width: Math.max(MIN_WIDTH, Math.min(width, window.innerWidth)),
                    height: Math.max(MIN_HEIGHT, Math.min(height, window.innerHeight - sysConfigDefaults.size.taskbarHeight))
                }
                : w
        ));
    };

    return {
        windows,
        createWindow,
        closeWindow,
        bringToFront,
        startDrag,
        onMinimize,
        onMaximize,
        onResize
    };
};
