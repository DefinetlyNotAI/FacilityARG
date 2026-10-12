export interface ClockState {
    id: number;
    keyword: string;
    symbol: string;
    revealDay: number;
    isRevealed: boolean;
    timeRemaining: number;
}

export type ChapterVIIData = {
    solved: string;
    enterLogs: (year: number) => string;
    inputPlaceholder: string;
    submit: string;
    yearProgress: (found: number, total: number, year: number) => string;
    totalProgress: (found: number, total: number) => string;
    banActive: (time: Date) => string;
    banTrigger: (time: Date) => string;
    banMinutes: number;
    witnessPhase: {
        title: string;
        instruction: string;
        events: string[];
        inputPlaceholder: string;
        submit: string;
        error: string;
        hint: string;
    };
};

export interface ChapterTemplateProps {
    chapterId: string;
    chapterData: {
        text: {
            header: string;
            subHeader: string;
            questReminder: string;
        };
    };
    redirectLink: string;
}
