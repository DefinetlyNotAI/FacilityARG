import {Box} from "./types.ts";
import {validateBoxes} from "./lib.ts";


// Love on 2nd
// Map on 3rd
// Email on 15th
// https://youtu.be/KFB-Tyh3sOo on 25th


export const boxes: Box[] = [
    {
        id: 1,
        name: 'Day 1',
        splashText: 'The experiment begins...',
        etaDate: '2025-10-01T03:15:25Z',
        contentPath: '/data/text/1.md',
    },
    {
        id: 2,
        name: 'Day 2',
        splashText: 'Something stirs in the darkness...',
        etaDate: '2025-10-02T03:15:25Z',
        contentPath: '/data/text/2.md',
    },
    {
        id: 3,
        name: 'Day 3',
        splashText: 'The tree remembers...',
        etaDate: '2025-10-03T03:15:25Z',
        contentPath: '/data/text/3.md',
    },
];

(async () => {
    try {
        await validateBoxes(boxes);
        console.debug('All boxes are valid!');
    } catch (err) {
        console.error(err);
    }
})();
