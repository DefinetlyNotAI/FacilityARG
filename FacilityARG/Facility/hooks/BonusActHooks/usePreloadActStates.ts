// Preload all checks and return ready flag
import {useActStateCheck} from "@/hooks/BonusActHooks/useActStateCheck";
import {ActionState, BonusAct} from "@/types";
import {routes} from "@/lib/saveData";
import {useFailed} from "@/hooks/BonusActHooks/useFailed";
import {useEffect, useState} from "react";

export function usePreloadActStates(roman: string) {
    const normalized = roman.toLowerCase();

    useActStateCheck(normalized, ActionState.NotReleased, routes.bonus.notYet);
    useActStateCheck(normalized, ActionState.Released, routes.bonus.actID(normalized.toUpperCase() as BonusAct));
    useFailed(normalized);
    useActStateCheck(normalized, ActionState.Succeeded, routes.bonus.actID(normalized.toUpperCase() as BonusAct));

    const [ready, setReady] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setReady(true), 0);
        return () => clearTimeout(t);
    }, []);

    return ready;
}
