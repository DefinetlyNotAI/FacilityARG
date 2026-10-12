'use client';

import {useEffect, useRef, useState} from 'react';
import {TerminalVN} from '@/components/V&X/terminalVN';
import {BACKGROUND_AUDIO, usePlayBackgroundAudio} from "@/audio";
import {useChapter5Access} from "@/hooks/BonusActHooks/useChapterSpecialAccess";

export default function AStoryPage() {
    const [script, setScript] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [variables, setVariables] = useState<Record<string, any>>({});
    const audioRef = useRef<HTMLAudioElement>(null);

    usePlayBackgroundAudio(audioRef, BACKGROUND_AUDIO.BONUS.V);
    useChapter5Access();

    useEffect(() => {
        // Load the VN script
        fetch('/static/chapters/V/aStory.vns')
            .then(res => res.text())
            .then(text => {
                setScript(text);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load story:', err);
                setScript(`@node start
> System: Error loading story. Please refresh the page.
@jump end

@node end
> System: [Error]
`);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        // Update tab title based on variables
        if (variables.tabTitle) {
            document.title = variables.tabTitle;
        }
    }, [variables]);

    if (loading) {
        return (
            <div style={{
                width: '100vw',
                height: '100vh',
                background: '#0a0a0a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00ff00',
                fontFamily: 'monospace',
                fontSize: '18px'
            }}>
                <div>
                    <div style={{textAlign: 'center', marginBottom: '20px'}}>
                        Loading The Narrator's Tale...
                    </div>
                    <div style={{textAlign: 'center', animation: 'pulse 2s ease-in-out infinite'}}>
                        ▊
                    </div>
                </div>
                <style jsx>{`
                    @keyframes pulse {
                        0%, 100% {
                            opacity: 1;
                        }
                        50% {
                            opacity: 0.3;
                        }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <>
            <audio ref={audioRef} src={BACKGROUND_AUDIO.BONUS.V} loop preload="auto" style={{display: 'none'}}/>
            <div style={{
                width: '100vw',
                height: '100vh',
                background: '#0a0a0a',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                <div style={{
                    flex: 1,
                    padding: '20px',
                    maxWidth: '1000px',
                    margin: '0 auto',
                    width: '100%'
                }}>
                    <TerminalVN
                        script={script}
                        chapterID={"V"}
                        onComplete={() => {
                            console.log('Story complete');
                        }}
                        onVariableChange={(vars) => {
                            setVariables(vars);
                        }}
                        initialVariables={{
                            tabTitle: 'To Those Who End Well'
                        }}
                        typingSpeed={25}/>
                </div>
            </div>
        </>
    );
}

