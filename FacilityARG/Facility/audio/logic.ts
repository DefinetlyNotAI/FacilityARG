import React, {useEffect} from "react";


// Utility function to play audio with error handling
// Useful for custom sound control
// However it is recommended to use playSafeSFX for SFX and usePlayBackgroundAudio for background music
export const playAudio =
    (audioPath: string, options: {
        volume?: number;
        loop?: boolean;
        onError?: (error: Error) => void;
        onSuccess?: () => void;
    } = {}) => {
        try {
            const audio = new Audio(audioPath);
            audio.volume = options.volume ?? 0.6;
            audio.loop = options.loop ?? false;

            audio.play()
                .then(() => options.onSuccess?.())
                .catch((error) => {
                    console.warn(`Failed to play audio: ${audioPath}`, error);
                    options.onError?.(error);
                });

            return audio;
        } catch (error) {
            console.warn(`Failed to create audio: ${audioPath}`, error);
            options.onError?.(error as Error);
            return null;
        }
    };

// Utility function to initialize background audio with user interaction handling
const initializeBackgroundAudio = (
    audioRef: React.RefObject<HTMLAudioElement>,
    _audioPath: string,
    options: {
        volume?: number;
        autoPlay?: boolean;
    } = {}
) => {
    const {volume = 0.3, autoPlay = true} = options;

    return () => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
            if (autoPlay) {
                audioRef.current.play().catch(() => {
                    // Autoplay failed, will try again on user interaction
                    const handleInteraction = () => {
                        if (audioRef.current) {
                            audioRef.current.play().catch(console.warn);
                        }
                        document.removeEventListener('click', handleInteraction);
                        document.removeEventListener('keydown', handleInteraction);
                    };
                    document.addEventListener('click', handleInteraction);
                    document.addEventListener('keydown', handleInteraction);
                });
            }
        }
    };
};

// Utility function to clean up audio
const cleanupAudio = (audioRef: React.RefObject<HTMLAudioElement>) => {
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
};

// Function to play sound effects safely, handling background audio pause if needed
export function playSafeSFX(audioRef: React.RefObject<HTMLAudioElement>, audioPath: string, pauseBGAudio: boolean = false) {
    try {
        let wasPaused = false;
        if (
            pauseBGAudio &&
            audioRef.current
        ) {
            audioRef.current.pause();
            wasPaused = true;
        }
        const audio = new Audio(audioPath);
        audio.volume = 0.4;
        audio.play().catch(console.warn);
        // Resume background music after SFX
        if (wasPaused && audioRef.current) {
            audio.addEventListener('ended', () => {
                audioRef.current?.play().catch(() => {
                });
            });
        }
    } catch (error) {
        console.warn('Failed to play interaction audio:', error);
    }
}

// Custom hook to manage background audio with user interaction
// You will need to pass an HTML audio element reference with both the audioRef and audioSrc for this to work
export function usePlayBackgroundAudio(audioRef: React.RefObject<HTMLAudioElement>, audioSrc: string, conditional: boolean | null | undefined = true) {
    useEffect(() => {
        if (!conditional) {
            cleanupAudio(audioRef);
            return;
        }
        let hasInteracted = false;
        const startAudio = () => {
            if (!hasInteracted) {
                hasInteracted = true;
                const initAudio = initializeBackgroundAudio(audioRef, audioSrc);
                initAudio();
                window.removeEventListener('pointerdown', startAudio);
                window.removeEventListener('keydown', startAudio);
            }
        };
        window.addEventListener('pointerdown', startAudio);
        window.addEventListener('keydown', startAudio);
        return () => {
            window.removeEventListener('pointerdown', startAudio);
            window.removeEventListener('keydown', startAudio);
            cleanupAudio(audioRef);
        };
    }, [audioRef, audioSrc, conditional]);
}
