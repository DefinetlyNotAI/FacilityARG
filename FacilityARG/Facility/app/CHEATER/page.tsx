"use client";

import {useEffect, useRef, useState} from "react";
import {BACKGROUND_AUDIO, usePlayBackgroundAudio} from "@/audio";
import {narratorLines} from "@/lib/client/data/cheater";

// Join all lines with two newlines
const fullText = narratorLines.join("\n\n");

export default function CheaterTrap() {
    const [displayedText, setDisplayedText] = useState("");
    const charIndex = useRef(0);
    const typingSpeed = 40;
    const audioRef = useRef<HTMLAudioElement>(null);

    // Clear cookies immediately on mount
    useEffect(() => {
        const cookies = document.cookie.split("; ");
        for (const cookie of cookies) {
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        }
    }, []);

    // Initialize background audio
    usePlayBackgroundAudio(audioRef, BACKGROUND_AUDIO.CHEATER);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        function typeNextChar() {
            if (charIndex.current < fullText.length) {
                charIndex.current++;
                setDisplayedText(fullText.substring(0, charIndex.current));
                timeoutId = setTimeout(typeNextChar, typingSpeed);
            }
        }

        timeoutId = setTimeout(typeNextChar, 1000); // initial delay for drama

        return () => clearTimeout(timeoutId);
    }, []);

    return (
        <>
            <audio
                ref={audioRef}
                src={BACKGROUND_AUDIO.CHEATER}
                loop
                preload="auto"
                style={{display: 'none'}}
            />
            <main
                style={{
                    backgroundColor: "black",
                    color: "limegreen",
                    height: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontFamily: "'Courier New', Courier, monospace",
                    whiteSpace: "pre-wrap",
                    fontSize: "1.5rem",
                    padding: "2rem",
                    userSelect: "none",
                }}
            >
                {displayedText || "..."}
            </main>
        </>
    );
}
