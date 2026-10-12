// Generic internal hook
import {ActionState, BonusAct} from "@/types";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {validRomans} from "@/lib/client/data/chapters";
import {routes} from "@/lib/saveData";
import {bonusApi} from "@/lib/client/utils";

export function useActStateCheck(
    roman: string | null,
    targetState: ActionState,
    redirectIfMatch?: string
) {
    const router = useRouter();
    const [matches, setMatches] = useState<boolean | null>(null);
    const normalizedRoman = roman?.toLowerCase() || "";

    useEffect(() => {
        if (!normalizedRoman || !validRomans.includes(normalizedRoman)) {
            router.push(routes.notFound);
            return;
        }

        const actKey = `Act_${normalizedRoman.toUpperCase()}` as BonusAct;

        bonusApi
            .getOne(normalizedRoman)
            .then((res) => {
                const state = res[actKey];
                const matched = state === targetState;
                if (matched && redirectIfMatch) router.push(redirectIfMatch);
                setMatches(matched);
            })
            .catch(() => router.push(routes.notFound));
    }, [normalizedRoman, targetState, redirectIfMatch, router]);

    return matches;
}
