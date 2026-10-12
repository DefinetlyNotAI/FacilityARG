import {useState} from 'react';

/**
 * Custom hook for temporary glitch/flash effects
 * @param duration - Duration of the glitch effect in milliseconds (default: 300ms)
 */
export function useGlitchEffect(duration: number = 300) {
    const [isGlitchActive, setIsGlitchActive] = useState(false);

    const triggerGlitch = () => {
        setIsGlitchActive(true);
        setTimeout(() => setIsGlitchActive(false), duration);
    };

    return {
        isGlitchActive,
        triggerGlitch,
    };
}

