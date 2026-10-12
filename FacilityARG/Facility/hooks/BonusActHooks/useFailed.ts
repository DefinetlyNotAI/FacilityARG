// Returns true if Failed, with conditional redirect
import {validRomansNoTimeLeft} from "@/lib/client/data/chapters";
import {routes} from "@/lib/saveData";
import {useActStateCheck} from "@/hooks/BonusActHooks/useActStateCheck";
import {ActionState} from "@/types";

export function useFailed(roman: string) {
    const normalized = roman.toLowerCase();

    // Only used for redirecting; does not affect returned boolean
    const redirect = validRomansNoTimeLeft.includes(normalized)
        ? routes.bonus.noTimeChID(normalized)
        : undefined;

    const matches = useActStateCheck(roman, ActionState.Failed, redirect);

    // Return the actual result from the state check
    return matches ?? false; // default to false while loading
}
