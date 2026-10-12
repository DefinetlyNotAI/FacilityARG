'use client';

import {useEffect, useRef} from 'react';
import {useParams, useRouter} from 'next/navigation';
import {chIIData} from '@/lib/client/data/chapters/II';
import Image from 'next/image';
import {routes} from "@/lib/saveData";
import {useChapter2Access} from "@/hooks";
import {BACKGROUND_AUDIO, usePlayBackgroundAudio} from "@/audio";

export default function ChapterIIPathPage() {
    const router = useRouter();
    const params = useParams();
    const path = params.path as string;
    const audioRef = useRef<HTMLAudioElement>(null);

    usePlayBackgroundAudio(audioRef, BACKGROUND_AUDIO.BONUS.II);
    useChapter2Access()

    useEffect(() => {
        if (!path) return;

        const normalizedPath = path.toUpperCase();
        const validPath = chIIData.chapterIIPaths.find(
            (p: { path: string; }) => p.path.toUpperCase() === normalizedPath
        );

        if (!validPath && normalizedPath !== path) {
            router.replace(`${routes.bonus.actID("II")}/${normalizedPath}`);
        } else if (!validPath) {
            router.replace(routes.bonus.actID("II"));
        }
    }, [path, router]);

    const pathData = chIIData.chapterIIPaths.find(p => p.path.toUpperCase() === path?.toUpperCase());

    if (!pathData) {
        return null;
    }

    return (
        <>
            <audio ref={audioRef} src={BACKGROUND_AUDIO.BONUS.II} loop preload="auto" style={{display: 'none'}}/>
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="max-w-2xl w-full space-y-8">
                    <div className="relative w-full aspect-square bg-gray-900 border border-gray-800">
                        <Image
                            src={pathData.image}
                            alt={pathData.path}
                            fill
                            className="object-contain"/>
                    </div>

                    <div className="text-center">
                        <p className="text-gray-400 font-mono text-lg italic">
                            {pathData.caption}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
