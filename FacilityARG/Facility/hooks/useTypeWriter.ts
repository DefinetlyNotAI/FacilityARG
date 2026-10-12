import {useEffect, useState} from "react";

export function useTypewriter(text: string, speed = 28, instant = false) {
    const [display, setDisplay] = useState("");
    useEffect(() => {
        if (instant) {
            setDisplay(text);
            return;
        }
        setDisplay("");
        let i = 0;
        let cancelled = false;

        function step() {
            if (cancelled) return;
            setDisplay(text.slice(0, i));
            if (i < text.length) setTimeout(step, speed); // fix off-by-one
            i++;
        }

        step();
        return () => {
            cancelled = true;
        };
    }, [text, speed, instant]);
    return display;
}
