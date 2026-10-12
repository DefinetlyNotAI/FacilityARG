import {useEffect, useRef, useState} from 'react';

/**
 * Custom hook for managing command history with ref tracking
 * Useful for terminal-like interfaces where you need both state and ref access
 * @param initialHistory - Initial command history
 */
export function useCommandHistory(initialHistory: string[] = []) {
    const [commandHistory, setCommandHistory] = useState<string[]>(initialHistory);
    const commandHistoryRef = useRef<string[]>(initialHistory);

    // Keep ref in sync with state
    useEffect(() => {
        commandHistoryRef.current = commandHistory;
    }, [commandHistory]);

    const addCommand = (command: string) => {
        setCommandHistory(prev => [...prev, command]);
    };

    const clearHistory = () => {
        setCommandHistory([]);
    };

    return {
        commandHistory,
        commandHistoryRef,
        setCommandHistory,
        addCommand,
        clearHistory,
    };
}

