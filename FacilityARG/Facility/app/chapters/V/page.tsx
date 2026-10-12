'use client';

import {chapterVData, fileLinksVX} from "@/lib/client/data/chapters/V&X";
import {ChapterTemplate} from "@/components/ChapterTemplate";
import {BACKGROUND_AUDIO, usePlayBackgroundAudio} from "@/audio";
import {useRef} from "react";
import {Button} from "@/components/ui/button";

export default function ChapterVPage() {
    const audioRef = useRef<HTMLAudioElement>(null);

    usePlayBackgroundAudio(audioRef, BACKGROUND_AUDIO.BONUS.V);

    const handleDownloadAll = () => {
        fileLinksVX.V.lost.forEach((url) => {
            const link = document.createElement("a");
            link.href = url;
            link.download = url.split("/").pop()!;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };

    return (
        <>
            <audio ref={audioRef} src={BACKGROUND_AUDIO.BONUS.V} loop preload="auto" style={{display: 'none'}}/>
            <ChapterTemplate
                chapterId="V"
                chapterData={chapterVData}
                redirectLink={fileLinksVX.V.Narrator}
            />
            <Button
                onClick={handleDownloadAll}
                style={{
                    position: "fixed",
                    bottom: "2rem",
                    right: "2rem",
                    zIndex: 9999
                }}
            >
                Get the lost
            </Button>
        </>
    );
}
