import {useEffect, useRef} from "react";
import {useRouter} from "next/navigation";
import Cookies from "js-cookie";
import {useActStateCheck} from "@/hooks/BonusActHooks/useActStateCheck";
import {cookies, routes} from "@/lib/saveData";
import {usePlayBackgroundAudio} from "@/audio";
import {ActionState} from "@/types";

export function useChIVSetup(backgroundAudio: string) {
    const router = useRouter();
    const audioRef = useRef<HTMLAudioElement>(null);

    // Check if chapter is not yet released
    const isNotReleased = useActStateCheck("iv", ActionState.NotReleased, routes.bonus.notYet);

    // Redirect if bonus content is locked
    useEffect(() => {
        if (!Cookies.get(cookies.end)) router.replace(routes.bonus.locked);
    }, [router]);

    // Play background audio
    usePlayBackgroundAudio(audioRef, backgroundAudio);

    const isLoading = isNotReleased === null;

    return {audioRef, isLoading, isNotReleased};
}
