'use client';

import {chapterXData, fileLinksVX} from "@/lib/client/data/chapters/V&X";
import {ChapterTemplate} from "@/components/ChapterTemplate";
import {BACKGROUND_AUDIO, usePlayBackgroundAudio} from "@/audio";
import {useRef} from "react";

export default function ChapterXPage() {
    const audioRef = useRef<HTMLAudioElement>(null);

    usePlayBackgroundAudio(audioRef, BACKGROUND_AUDIO.BONUS.X);
    return (
        <>
            <audio ref={audioRef} src={BACKGROUND_AUDIO.BONUS.X} loop preload="auto" style={{display: 'none'}}/>
            <ChapterTemplate
                chapterId="X"
                chapterData={chapterXData}
                redirectLink={fileLinksVX.X.Narrator}/></>
    );
}
