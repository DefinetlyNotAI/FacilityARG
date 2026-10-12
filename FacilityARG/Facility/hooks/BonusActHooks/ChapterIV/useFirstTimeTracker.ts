import {useState} from 'react';

/**
 * Custom hook for tracking first-time occurrences (e.g., first time a command is run)
 * Useful for showing flavor text or tutorials only once
 */
export function useFirstTimeTracker() {
    const [firstTimeMap, setFirstTimeMap] = useState<Record<string, boolean>>({});

    const isFirstTime = (key: string): boolean => {
        if (firstTimeMap[key]) return false;
        setFirstTimeMap(prev => ({...prev, [key]: true}));
        return true;
    };

    const reset = (key?: string) => {
        if (key) {
            setFirstTimeMap(prev => {
                const next = {...prev};
                delete next[key];
                return next;
            });
        } else {
            setFirstTimeMap({});
        }
    };

    const hasOccurred = (key: string): boolean => {
        return firstTimeMap[key];
    };

    return {
        isFirstTime,
        hasOccurred,
        reset,
    };
}

