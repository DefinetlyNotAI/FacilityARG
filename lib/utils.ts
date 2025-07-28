import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"
import {QuestData} from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function isTimeLockTrue(quest: QuestData): (boolean | number)[] {
    /*
    Checks if the quest is time-locked and if the current time is before the unlock time.

    Returns an array with two elements:
    - A boolean indicating if the quest is still locked (true) or unlocked (false).
    - The time difference in milliseconds between the current time and the unlock time.
    If the quest is not time-locked, it returns [false, 0].
    */
    if (!quest.timeLock) return [false, 0]; // No time lock set, return false
    const now = Date.now();
    const match = quest.timeLock.match(/^([01]?\d|2[0-3]):([0-5]?\d):([0-5]?\d) (\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    const unlockTime = match
        ? new Date(
            Number(match[6]), // year
            Number(match[5]) - 1, // month (0-based)
            Number(match[4]), // day
            Number(match[1]), // hour
            Number(match[2]), // minute
            Number(match[3]) // second
        ).getTime()
        : new Date(quest.timeLock).getTime();
    const diff = unlockTime - now;
    return [diff > 0, diff];
}
