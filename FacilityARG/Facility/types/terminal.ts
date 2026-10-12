export type KeywordKey = 1 | 2 | 3 | 4 | 5;
export type TerminalStep = 'locked' | 'fill' | 'solving' | 'question' | 'email' | 'countdown';
export type FullScreenOverlay = {
    text: string;
    size?: 'huge' | 'massive';
    glitch?: boolean;
};
export type PlaceholderKeys = 'fill' | 'email';
