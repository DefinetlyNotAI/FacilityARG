export interface TASProps {
    className?: string;
}

export interface TASGoodByeProps {
    onDone: () => void;
}

export interface TASType {
    pageHints: Record<string, string[]>;
    snarkyComments: string[];
    unknownPageHints: string[];
}