'use client';

import React, {useEffect, useRef, useState} from 'react';
import {Eye, Play} from 'lucide-react';
import styles from '@/styles/Codex.module.css';
import {CodexReaderProps, HoverState} from "@/types";
import {keywordInfo} from "@/lib/client/data/codex";


export function CodexReader({
                                chapterText,
                                onComplete,
                                autoReveal = false,
                                revealSpeed = 2000
                            }: CodexReaderProps) {
    const [lines, setLines] = useState<string[]>([]);
    const [revealedLines, setRevealedLines] = useState<number>(0);
    const [currentLineText, setCurrentLineText] = useState<string>('');
    const [isTyping, setIsTyping] = useState(false);
    const [hovered, setHovered] = useState<HoverState | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const autoRevealTimerRef = useRef<NodeJS.Timeout | null>(null);
    const typewriterTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Split text into lines
    useEffect(() => {
        const textLines = chapterText.split('\n').filter(line => line.trim() !== '');
        setLines(textLines);
        setRevealedLines(0);
        setCurrentLineText('');
        setIsTyping(false);
    }, [chapterText]);

    // Auto reveal (used for cinematic reading)
    useEffect(() => {
        if (autoReveal && revealedLines < lines.length) {
            autoRevealTimerRef.current = setTimeout(() => {
                setRevealedLines(prev => {
                    const next = prev + 1;
                    if (next >= lines.length && onComplete) onComplete();
                    return next;
                });
            }, revealSpeed);
        }
        return () => {
            if (autoRevealTimerRef.current) clearTimeout(autoRevealTimerRef.current);
        };
    }, [autoReveal, revealedLines, lines.length, revealSpeed, onComplete]);

    // Scroll to latest revealed line
    useEffect(() => {
        if (containerRef.current) {
            const lastLine = containerRef.current.querySelector(`[data-line="${revealedLines - 1}"]`);
            if (lastLine) {
                lastLine.scrollIntoView({behavior: 'smooth', block: 'center'});
            }
        }
    }, [revealedLines]);

    // Typewriter animation
    const startTypewriter = () => {
        if (isTyping) return;
        setIsTyping(true);
        setRevealedLines(0);
        setCurrentLineText('');

        let currentLineIndex = 0;
        let charIndex = 0;

        const typeNextChar = () => {
            if (currentLineIndex >= lines.length) {
                setIsTyping(false);
                if (onComplete) onComplete();
                return;
            }

            const currentLine = lines[currentLineIndex];
            if (charIndex < currentLine.length) {
                setCurrentLineText(currentLine.substring(0, charIndex + 1));
                charIndex++;
                typewriterTimerRef.current = setTimeout(typeNextChar, 20);
            } else {
                setRevealedLines(currentLineIndex + 1);
                setCurrentLineText('');
                currentLineIndex++;
                charIndex = 0;
                const delay = currentLineIndex < lines.length ? 300 : 0;
                typewriterTimerRef.current = setTimeout(typeNextChar, delay);
            }
        };
        typeNextChar();
    };

    // Cleanup timers
    useEffect(() => {
        return () => {
            if (typewriterTimerRef.current) clearTimeout(typewriterTimerRef.current);
        };
    }, []);

    // Instantly reveal everything
    const revealAll = () => {
        if (typewriterTimerRef.current) clearTimeout(typewriterTimerRef.current);
        setIsTyping(false);
        setCurrentLineText('');
        setRevealedLines(lines.length);
        if (onComplete) onComplete();
    };

    // Highlight special terms
    const highlightKeywords = (text: string) => {
        let result = text;
        Object.keys(keywordInfo).forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            result = result.replace(
                regex,
                match => `<span class="${styles.keyword}" data-keyword="${match.toLowerCase()}">${match}</span>`
            );
        });
        return result;
    };

    // Handle hover position
    const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
        const target = e.target as HTMLElement;
        const keyword = target.getAttribute("data-keyword");
        if (!keyword) return;

        // Use viewport coordinates (getBoundingClientRect) and store them as-is.
        // We'll render the tooltip with position: fixed so these coordinates align with the tooltip.
        const rect = target.getBoundingClientRect();
        setHovered({
            keyword,
            x: rect.left + rect.width / 2,
            y: rect.top
        });
    };

    const handleMouseLeave = () => setHovered(null);

    return (
        <div className="relative w-full max-w-4xl mx-auto">
            {/* Control buttons */}
            {!isTyping && revealedLines < lines.length && (
                <div className="flex flex-col sm:flex-row justify-center gap-3 mb-8 px-4">
                    <button
                        onClick={startTypewriter}
                        className="px-6 py-3 bg-black/40 border border-amber-900/40 rounded hover:bg-amber-950/40 transition-all duration-300 flex items-center justify-center gap-2 text-amber-100"
                    >
                        <Play className="w-4 h-4"/>
                        <span>Start Play</span>
                    </button>
                    <button
                        onClick={revealAll}
                        className="px-6 py-3 bg-black/40 border border-amber-900/40 rounded hover:bg-amber-950/40 transition-all duration-300 flex items-center justify-center gap-2 text-amber-100"
                    >
                        <Eye className="w-4 h-4"/>
                        <span>Reveal All</span>
                    </button>
                </div>
            )}

            {/* Text container */}
            <div
                ref={containerRef}
                className={`${styles.codexText} ${styles.scrollbarThin} space-y-6 min-h-[60vh] max-h-[70vh] overflow-y-auto px-4 sm:px-8 py-12`}
            >
                {lines.map((line, index) => {
                    const isRevealed = index < revealedLines;
                    const isCurrentlyTyping = index === revealedLines && isTyping;
                    const isTitle = index === 0 || line.startsWith('Chapter');
                    const displayText = isCurrentlyTyping ? currentLineText : line;

                    if (!isRevealed && !isCurrentlyTyping) return null;

                    return (
                        <div
                            key={index}
                            data-line={index}
                            className={`${styles.codexLine} transition-all duration-1000 ${
                                isRevealed || isCurrentlyTyping
                                    ? 'opacity-100 translate-y-0'
                                    : 'opacity-0 translate-y-4'
                            } ${isTitle
                                ? 'text-center text-xl sm:text-2xl font-bold mb-8 text-amber-200'
                                : 'text-base sm:text-lg leading-relaxed'}`}
                            dangerouslySetInnerHTML={{__html: highlightKeywords(displayText)}}
                            onMouseOver={handleMouseEnter}
                            onMouseOut={handleMouseLeave}
                        />
                    );
                })}
            </div>

            {/* Floating Tooltip */}
            {hovered && (
                <div
                    className={`${styles.animateFadeIn} fixed`} // use fixed so coordinates are viewport-based
                    style={{
                        // Use the raw viewport coords stored in hovered.
                        top: hovered.y,
                        left: hovered.x,
                        transform: 'translate(-50%, -100%)', // bottom-center of tooltip aligns with keyword top-center
                        position: 'fixed',
                        background: 'rgba(0,0,0,0.9)',
                        border: '1px solid rgba(146,64,14,0.6)',
                        borderRadius: '0.5rem',
                        padding: '0.5rem 1rem',
                        color: '#fef3c7',
                        backdropFilter: 'blur(4px)',
                        whiteSpace: 'nowrap',
                        zIndex: 50,
                        pointerEvents: 'none' // avoid tooltip stealing pointer events and causing flicker
                    }}
                >
                    <span className="text-amber-400 font-semibold">{hovered.keyword}</span>
                    {' - '}
                    {keywordInfo[hovered.keyword.toLowerCase()] ?? "A key term in the Codex"}
                </div>
            )}
        </div>
    );
}
