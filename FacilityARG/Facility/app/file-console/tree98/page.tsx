"use client";

import React, {useEffect} from 'react';
import Cookie from 'js-cookie';
import {useRouter} from 'next/navigation';
import Tree98Sim from "./Tree98Sim";
import {cookies, routes} from "@/lib/saveData";
import {playSafeSFX, SFX_AUDIO} from "@/audio";

function TREE() {
    const router = useRouter();
    const [audioSrc, setAudioSrc] = React.useState<string>(SFX_AUDIO.MOUSE_CLICK);
    const audioRef = React.useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const handleMouseClick = () => {
            playSafeSFX(audioRef, SFX_AUDIO.MOUSE_CLICK);
        };

        window.addEventListener('mousedown', handleMouseClick);
        window.addEventListener('keydown', handleMouseClick);

        if (Cookie.get(cookies.tree98)) {
            router.replace(routes.notFound);
        }

        return () => {
            window.removeEventListener('mousedown', handleMouseClick);
            window.removeEventListener('keydown', handleMouseClick);
        };
    }, [router]);

    return (
        <>
            <audio
                ref={audioRef}
                src={audioSrc}
                loop
                preload="auto"
                style={{display: 'none'}}
            />
            <Tree98Sim audioRef={audioRef} audioSrc={audioSrc} setAudioSrc={setAudioSrc}/>
        </>
    );
}

export default TREE;
