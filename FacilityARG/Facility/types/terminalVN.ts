/**
 * Terminal VN Engine - Type Definitions
 * A professional Visual Novel engine with terminal aesthetics
 */

export interface VNLine {
    type: 'dialogue' | 'command' | 'choice' | 'input';
    content: string;
    speaker?: string;
    condition?: string;
    options?: VNOption[];
}

export interface VNOption {
    text: string;
    target?: string; // Node ID to jump to
    condition?: string; // Condition to show this option
}

export interface VNNode {
    id: string;
    lines: VNLine[];
    jump?: string; // Default next node
}

export interface TerminalVNScript {
    metadata?: {
        title?: string;
        author?: string;
        version?: string;
        autoclear?: string | boolean;
    };
    nodes: Record<string, VNNode>;
}

export interface TerminalVNProps {
    script: string;
    chapterID: string;
    onComplete?: () => void;
    onVariableChange?: (variables: Record<string, any>) => void;
    initialVariables?: Record<string, any>;
    typingSpeed?: number;
    className?: string;
}

export type VFXEffect = {
    name: string;
    duration: number;
    apply: (element: HTMLElement) => void;
    cleanup?: (element: HTMLElement) => void;
};