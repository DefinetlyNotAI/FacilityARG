import {Box} from "./types.ts";
import {validateBoxes} from "./lib.ts";

// - 25th of the month unprivate the YouTube video of the AVI and share it https://youtu.be/KFB-Tyh3sOo
// - On the 3rd, release the links (make sure that YouTube vid is unprivated, the GitHub repos 3 are unprivated)!
//
// - Wait a long while till everything is solved
// - Release the Sagas 1-by-1 from I to X

export const boxes: Box[] = [
    {
        id: 1,
        name: 'Day 1',
        splashText: 'The experiment begins...',
        etaDate: '2025-10-02T03:00:00Z',
        content: 'FACILITY LOG - ENTRY #0001\n\nThe sapling has been planted. The vessel awaits.\n\nInitial observations suggest promising growth patterns.\nThe subjects remain unaware of their purpose.\n\nWe continue to observe.',
    },
    {
        id: 2,
        name: 'Day 2',
        splashText: 'Something stirs in the darkness...',
        etaDate: '2025-10-02T03:00:00Z',
        content: 'FACILITY LOG - ENTRY #0002\n\nMovement detected in Sector 7.\n\nThe sapling grows faster than anticipated.\nRoot systems expanding beyond projected parameters.\n\nContainment protocols remain effective... for now.',
    },
    {
        id: 3,
        name: 'Day 3',
        splashText: 'The tree remembers...',
        etaDate: '2025-10-06T03:00:00Z',
        content: 'FACILITY LOG - ENTRY #0003\n\nThe tree has reached maturity.\nIt whispers secrets we are not meant to hear.\n\nThe vessel draws near.\nAll preparations are complete.\n\nThere is no turning back.',
        filePath: 'https://example.com/final-report.pdf',
    },
];

validateBoxes(boxes);
