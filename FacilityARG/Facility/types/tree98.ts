import React from "react";
import {Icons} from "@/components/tree98/icons";


// Define the types for the tree98 application window management.
export interface Window {
    id: string;
    title: string;
    component: React.ComponentType<any>;
    x: number;
    y: number;
    width: number;
    height: number;
    isMinimized: boolean;
    isMaximized: boolean;
    zIndex: number;
    props?: any;
}

export interface ContextMenu {
    x: number;
    y: number;
    visible: boolean;
}

export interface DragState {
    isDragging: boolean;
    windowId: string | null;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
}

// Desktop icon type
export interface DesktopIcon {
    name: string;
    icon: keyof typeof Icons;
    action: string;
}

// File system item type
export interface FileSystemItem {
    name: string;
    type: 'file' | 'folder';
    content?: string;
    children?: FileSystemItem[];
    executable?: boolean;
    icon?: keyof typeof Icons;
    action?: 'paint' | 'notepad' | 'cmd' | 'settings';
}

export interface FileExplorerProps {
    startPath?: string[];
    onFileOpen?: (item: FileSystemItem) => void;
}

// Start menu item type
export interface StartMenuProps {
    onAction: (action: string) => void;
}

// Loading/Login screen properties
export interface LoadingScreenProps {
    loadingProgress: number;
}

export interface LoginScreenProps {
    onLogin: () => void;
}

// Context menu properties
export interface ContextMenuProps {
    contextMenu: ContextMenu;
    showDesktopIcons: boolean;
    onAction: (action: string) => void;
}

// Vessel Boot Dialog properties
export interface VesselBootDialogProps {
    item: FileSystemItem;
}

// File viewer properties
export interface FileViewerProps {
    item: FileSystemItem;
}

// Window component properties
export interface WindowComponentProps {
    window: Window;
    systemCorruption: number;
    onBringToFront: (id: string) => void;
    onStartDrag: (e: React.MouseEvent, windowId: string) => void;
    onClose: (id: string) => void;
    onMinimize?: (id: string, minimize: boolean) => void;
    onMaximize?: (id: string) => void;
    onResize?: (id: string, width: number, height: number) => void;
}

// Paint tool properties
export type Tool = 'brush' | 'line' | 'rectangle' | 'square' | 'circle' | 'fill';

// CMD command properties
export type DirItem = {
    name: string;
    children?: (FileSystemItem | DirItem)[];
    type: 'folder' | 'file';
    [key: string]: any;
};

export interface CommandDeps {
    setHistory: React.Dispatch<React.SetStateAction<string[]>>;
    setPath: (newPath: string[]) => void;
    path: string[];
    resolvePath: (path: string[], target?: string) => DirItem | null;
    listDir: (dir: DirItem) => string[];
    variables: Record<string, any>;
    evaluateExpression: (input: string, vars: Record<string, any>) => any;
}

// Control panel properties
export type ControlPanelData = {
    dateTime: string;
    resolution: string;
    userAgent: string;
    language: string;
    platform: string;
    isOnline: boolean;
    batteryInfo: { level: number; charging: boolean } | null;
    cookieCount: number;
    refreshCount: string;
    sessionId: string;
};
export type InfoField = {
    section: string;
    icon: string;
    label: string;
    key: string;
    format?: (val: any) => string;
    condition?: (ctx: ControlPanelData) => boolean;
};

// Error dialog properties
export interface ErrorDialogProps {
    message: string,
    onClose?: () => void,
    style?: React.CSSProperties;
}
