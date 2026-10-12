// Chapter access hook
import {usePathname, useRouter} from "next/navigation";
import {useEffect, useMemo, useState} from "react";
import {useActStateCheck} from "@/hooks/BonusActHooks/useActStateCheck";
import {ActionState, BonusAct} from "@/types";
import {cookies, routes} from "@/lib/saveData";
import {validRomans, validRomansNoTimeLeft} from "@/lib/client/data/chapters";
import Cookies from "js-cookie";

export function useChapterAccess() {
    const router = useRouter();
    const pathname = usePathname();

    const chapter = useMemo(() => {
        if (!pathname) return null;
        const segments = pathname.split("/").filter(Boolean);
        if (!segments.length) return null;

        // Get last segment, remove optional ACT_ prefix
        let last = segments[segments.length - 1];
        if (last.toUpperCase().startsWith("ACT_")) last = last.slice(4);
        return last.toLowerCase();
    }, [pathname]);

    const [isCurrentlySolved, setIsCurrentlySolved] = useState<boolean | null>(null);

    // State checks
    const succeeded = useActStateCheck(
        chapter,
        ActionState.Succeeded,
        chapter ? routes.bonus.actID(chapter.toUpperCase() as BonusAct) : undefined
    );

    useActStateCheck(
        chapter,
        ActionState.Failed,
        chapter && validRomansNoTimeLeft.includes(chapter)
            ? routes.bonus.noTimeChID(chapter)
            : undefined
    );

    useActStateCheck(chapter, ActionState.NotReleased, routes.bonus.notYet);
    useActStateCheck(
        chapter,
        ActionState.Released,
        chapter ? routes.bonus.actID(chapter.toUpperCase() as BonusAct) : undefined
    );

    // Redirect if invalid
    useEffect(() => {
        if (!chapter || !validRomans.includes(chapter)) router.push(routes.notFound);
    }, [chapter, router]);

    // Locked bonus check
    useEffect(() => {
        if (!Cookies.get(cookies.end)) router.replace(routes.bonus.locked);
    }, [router]);

    // Sync solved state
    useEffect(() => {
        if (succeeded !== null) setIsCurrentlySolved(succeeded);
    }, [succeeded]);

    return {isCurrentlySolved, setIsCurrentlySolved};
}
