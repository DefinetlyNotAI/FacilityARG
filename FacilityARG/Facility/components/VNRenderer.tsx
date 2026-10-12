import {useEffect, useRef, useState} from "react";
import {VNTextRendererProps} from "@/types";

export const VNTextRenderer = ({text, onDone}: VNTextRendererProps) => {
    const [displayedText, setDisplayedText] = useState('');
    const indexRef = useRef(0);
    const textRef = useRef(text);

    useEffect(() => {
        textRef.current = text;
        indexRef.current = 0;
        setDisplayedText('');

        const interval = setInterval(() => {
            if (indexRef.current >= textRef.current.length) {
                clearInterval(interval);
                if (onDone) onDone(); // fire callback after text is done typing
                return;
            }

            const nextChar = textRef.current.charAt(indexRef.current);
            setDisplayedText(prev => prev + nextChar);
            indexRef.current++;
        }, 20);

        return () => clearInterval(interval);
    }, [text, onDone]);

    return (
        <p style={{
            textAlign: 'center',
            margin: '0 auto',
            maxWidth: '600px',
            whiteSpace: 'pre-wrap'
        }}>
            {displayedText}
        </p>
    );
};
