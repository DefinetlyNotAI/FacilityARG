'use client';

import React, {useEffect, useRef, useState} from 'react';
import {ChapterNavigation} from '@/components/codex/ChapterNavigation';
import {CodexReader} from '@/components/codex/CodexReader';
import {OverlaySystem} from '@/components/codex/OverlaySystem';
import styles from '@/styles/Codex.module.css';
import {BACKGROUND_AUDIO, usePlayBackgroundAudio} from '@/audio';
import Cookies from 'js-cookie';
import {cookies, routes} from '@/lib/saveData';
import {useRouter} from 'next/navigation';
import {chapters, codexTxt, overlays} from '@/lib/client/data/codex';


function Codex() {
    const router = useRouter();
    const [currentChapter, setCurrentChapter] = useState(1);
    const [chapterText, setChapterText] = useState('');
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [revealedLines, setRevealedLines] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    usePlayBackgroundAudio(audioRef, BACKGROUND_AUDIO.CODEX);

    useEffect(() => {
        if (!Cookies.get(cookies.end)) {
            router.replace(routes.notFound);
        }
    }, [router]);

    useEffect(() => {
        loadChapter(currentChapter).catch(console.error);
    }, [currentChapter]);

    const loadChapter = async (chapterId: number) => {
        setIsLoading(true);
        const chapter = chapters.find(ch => ch.id === chapterId);
        if (!chapter) return;

        try {
            const response = await fetch(`/static/codex/${chapter.filename}`);
            const text = await response.text();
            setChapterText(text);
            setRevealedLines(0);
        } catch (error) {
            console.error('Failed to load chapter:', error);
            setChapterText(codexTxt.error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChapterSelect = (chapterId: number) => setCurrentChapter(chapterId);

    const handleChapterComplete = () => console.log(codexTxt.curiosity);

    return (
        <div className={`${styles.body} min-h-screen relative overflow-hidden`}>
            <audio
                ref={audioRef}
                style={{display: 'none'}}
                src={BACKGROUND_AUDIO.CODEX}
                preload="auto"
                loop
            />

            <ChapterNavigation
                chapters={chapters}
                currentChapter={currentChapter}
                onChapterSelect={handleChapterSelect}
                isOpen={isNavOpen}
                onToggle={() => setIsNavOpen(!isNavOpen)}
            />

            <OverlaySystem
                overlays={overlays}
                currentLine={revealedLines}
            />

            <div className={`${styles.parchmentTexture} absolute inset-0 opacity-5 pointer-events-none`}/>

            <main className="relative z-10 container mx-auto px-4 py-12 sm:py-16 md:py-20 pb-24 sm:pb-28">
                <header className={`${styles.animateFadeIn} text-center mb-8 sm:mb-12 md:mb-16`}>
                    <h1 className={`${styles.heading} ${styles.textShadowGlow} text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-amber-200 mb-3 sm:mb-4 px-2`}>
                        {codexTxt.title}
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-amber-100/70 italic px-4">
                        {chapters[currentChapter - 1]?.subtitle}
                    </p>
                    <div
                        className="w-48 sm:w-64 h-px bg-gradient-to-r from-transparent via-amber-700 to-transparent mx-auto mt-6 sm:mt-8"/>
                </header>

                {isLoading ? (
                    <div className="text-center text-amber-100/60 text-base sm:text-lg md:text-xl animate-pulse">
                        {codexTxt.loading}
                    </div>
                ) : (
                    <CodexReader
                        chapterText={chapterText}
                        onComplete={handleChapterComplete}
                        autoReveal={false}
                        revealSpeed={2000}
                    />
                )}

                <footer className="text-center mt-12 sm:mt-16 md:mt-20 text-amber-100/40 text-xs sm:text-sm px-4">
                    <p>{codexTxt.footerLine1}</p>
                    <p className="mt-2">{codexTxt.footerLine2}</p>
                </footer>
            </main>

            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/50 to-transparent"/>
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/50 to-transparent"/>
            </div>
        </div>
    );
}

export default Codex;
