import {useEffect, useState} from 'react';

/**
 * Custom hook for managing a temporary boolean state with auto-reset
 * Useful for flash messages, temporary UI states, etc.
 * @param duration - Duration in milliseconds before auto-reset (default: 3000ms)
 */
export function useTemporaryState(duration: number = 3000) {
    const [isActive, setIsActive] = useState(false);

    const activate = () => {
        setIsActive(true);
    };

    const deactivate = () => {
        setIsActive(false);
    };

    // Auto-reset after duration
    useEffect(() => {
        if (!isActive) return;

        const timeoutId = setTimeout(() => {
            setIsActive(false);
        }, duration);

        return () => clearTimeout(timeoutId);
    }, [isActive, duration]);

    return {
        isActive,
        activate,
        deactivate,
    };
}

