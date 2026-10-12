// Chapter VII data
import {ChapterVIIData} from "@/types";

export const chapterVIIData: ChapterVIIData = {
    solved: "Dates are now considered canon. Timeline check succeeded. Please tell HIM you have seen time itself.",
    enterLogs: (year: number) => `Enter the logs for the year ${year}:`,
    inputPlaceholder: "Comma-separated numbers",
    submit: "Submit",
    yearProgress: (found: number, total: number, year: number) => `${found} / ${total} logs found for ${year}`,
    totalProgress: (found: number, total: number) => `Total progress: ${found} / ${total}`,
    banActive: (time: Date) => `The clock whispers... patience, mortal. You may try again at ${time.toLocaleTimeString()}.`,
    banTrigger: (time: Date) => `The temporal gates reject you. Wait until ${time.toLocaleTimeString()} before meddling with time again.`,
    banMinutes: 5,
    witnessPhase: {
        title: "WITNESS THE TIMELINE",
        instruction: "Before you may alter the timeline, you must first prove you can WITNESS it - For today's word of the day is WITNESS. Observe the events below. Count how many contain the digit 7. Enter that count to proceed.",
        events: [
            "1946 - Unlicensed transmission detected in the Barents Sea",
            "1958 - Deep-core drilling halted after anomalous readings",
            "1969 - Orbital survey records an object not matching cataloged bodies",
            "1974 - Coastal town evacuated following unexplained atmospheric shifts",
            "1983 - Research station goes dark for 11 minutes; resumes without logs",
            "1991 - Mass clock desynchronization reported across three continents",
            "1999 - Silent data packet received from decommissioned satellite",
            "2008 - Global sensor network flags recurring null intervals",
            "2015 - Archaeological site sealed under emergency classification",
            "2021 - Signal repeats after 75-year delay"
        ],
        inputPlaceholder: "Enter the count",
        submit: "Verify",
        error: "Incorrect. A true witness observes carefully.",
        hint: "Look at the YEARS. How many years contain the digit 7?",
    },
};
