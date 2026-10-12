import {useEffect, useState} from 'react';

/**
 * Custom hook for managing a cycling counter/phase
 * Useful for animations, heartbeats, or periodic updates
 * @param interval - Interval in milliseconds between phase changes
 * @param maxPhase - Maximum phase value (cycles back to 0 after reaching this)
 */
export function useCyclingPhase(interval: number, maxPhase: number = 100) {
    const [phase, setPhase] = useState(0);

    useEffect(() => {
        const id = setInterval(() => {
            setPhase(p => (p + 1) % maxPhase);
        }, interval);

        return () => clearInterval(id);
    }, [interval, maxPhase]);

    return phase;
}

