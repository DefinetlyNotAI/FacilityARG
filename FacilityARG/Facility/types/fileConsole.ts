// file console types
export type BootMessage = {
    text: string;
    delay?: number; // in ms
    typeSpeed?: number; // characters per second
    mode?: 'instant' | 'type' | 'fade';
};

export type Dirent = { name: string; type: 'file' | 'dir'; };

export type NestedBootMessages = {
    msg: BootMessage[];
    repeatMsg: BootMessage[];
};

export type NestedDirent = {
    root: Dirent[];
    code: Dirent[];
}

// tree98 types
interface SudoSequence {
    initial: string;
    trace: Array<string | ((ip: string) => string)>; // Array of strings or functions that take an IP and return a string
    infectedHTML: string;
}

interface ErrorOutputs {
    missingDir: string;
    invalidCat: string;
    invalidCmd: (cmd: string) => string;
}

export interface ConsoleMsg {
    help: string;
    helpCmd: Record<string, string>; // String Map
    catFiles: Record<string, Record<string, string>>; // Nested String Map
    wgetFiles: Record<string, Record<string, string>>; // Nested String Map
    sudoSeq: SudoSequence;
    whoamiSeq: string[];
    errOutputs: ErrorOutputs;
}
