import {useRouter} from "next/navigation";
import {useActStateCheck} from "@/hooks/BonusActHooks/useActStateCheck";
import {ActionState} from "@/types";
import {cookies, routes} from "@/lib/saveData";
import {useEffect} from "react";
import Cookies from "js-cookie";

function useChapterAccess(chapterKey: string, redirectSuccess?: string) {
    const router = useRouter();

    // Check succeeded state (optional, no redirect)
    useActStateCheck(chapterKey, ActionState.Succeeded, redirectSuccess);

    // Redirect if not yet released
    useActStateCheck(chapterKey, ActionState.NotReleased, routes.bonus.notYet);

    // Redirect if bonus locked
    useEffect(() => {
        if (!Cookies.get(cookies.end)) router.replace(routes.bonus.locked);
    }, [router]);

    return true;
}

// Specific hooks
export const useChapter2Access = () => useChapterAccess("ii", routes.bonus.actID("ii"));
export const useChapter5Access = () => useChapterAccess("v");
export const useChapter10Access = () => useChapterAccess("x");
