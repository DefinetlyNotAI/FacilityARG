export interface Chapter {
    // Unique identifier for the chapter
    id: number;
    // Title is the main heading for the chapter
    title: string;
    // Subtitle is a short description or tagline for the chapter
    subtitle: string;
    // Filename corresponds to a text file in the public/static/codex directory
    filename: string;
}

export interface CodexOverlay {
    // Unique string identifier for the overlay entry
    id: string;
    // Visual/behavioral category used for styling and logic
    type: 'warning' | 'info' | 'glitch' | 'revelation';
    // Short heading displayed in the overlay
    title: string;
    // Main body content (plain text or sanitized HTML)
    content: string;
    // Optional: when set, overlay triggers when reader reaches this line number
    triggerLine?: number;
    // Optional: when set, overlay triggers when this keyword is hovered or detected
    triggerKeyword?: string;
    // Optional: how long (ms) the overlay should remain visible if auto-dismissed
    duration?: number;
}

export interface OverlaySystemProps {
    // List of overlays the system can show
    overlays: CodexOverlay[];
    // Current reading line index; used to evaluate triggerLine matches
    currentLine?: number;
    // Currently hovered keyword; used to evaluate triggerKeyword matches
    hoveredKeyword?: string;
}

export interface ChapterNavigationProps {
    // Array of available chapters to display in the navigation
    chapters: Chapter[];
    // Index or id of the currently selected chapter
    currentChapter: number;
    // Callback invoked when a chapter is selected; receives chapter id
    onChapterSelect: (chapterId: number) => void;
    // Whether the chapter navigation UI is currently open/visible
    isOpen: boolean;
    // Toggles the open/closed state of the navigation UI
    onToggle: () => void;
}

export interface CodexReaderProps {
    // Full text content of the chapter to be rendered by the reader
    chapterText: string;
    // Optional callback invoked when reader finishes displaying the chapter
    onComplete?: () => void;
    // When true, text is revealed progressively (e.g., typewriter effect)
    autoReveal?: boolean;
    // Reveal speed in milliseconds per character or chunk (when autoReveal is true)
    revealSpeed?: number;
}

export interface HoverState {
    // The hovered keyword text.
    keyword: string;
    // X coordinate of the hover position in pixels (viewport / client coordinates).
    x: number;
    // Y coordinate of the hover position in pixels (viewport / client coordinates).
    y: number;
}
