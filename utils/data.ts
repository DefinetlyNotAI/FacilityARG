import {Box} from "./types.ts";
import {validateBoxes} from "./lib.ts";


// Love.0=_.b26 on 2nd
// If facility was a map.b64png on 3rd
// TAS System Anomaly & Unauthorized Access.eml on 15th
// https://youtu.be/KFB-Tyh3sOo on 25th


export const boxes: Box[] = [
    {
        id: 1,
        name: 'Day 1',
        splashText: 'He wept for the story you forgot, and now he’s waiting for you to remember.',
        etaDate: '2025-10-01T03:15:25Z',
        contentPath: '/data/text/1.md'
    },
    {
        id: 2,
        name: 'Day 2',
        splashText: 'My love to this story is endless...',
        etaDate: '2025-10-02T03:15:25Z',
        contentPath: '/data/text/2.md',
        filePath: '/data/Love.0=_.b26'
    },
    {
        id: 3,
        name: 'Day 3',
        splashText: 'Search the map far and wide...',
        etaDate: '2025-10-03T03:15:25Z',
        contentPath: '/data/text/3.md',
        filePath: '/data/If%20facility%20was%20a%20map.b64png'
    },
    {
        id: 4,
        name: 'Day 4',
        splashText: 'Where prayers twist and halos rot, even the faithful tremble alone',
        etaDate: '2025-10-04T03:15:25Z',
        contentPath: '/data/text/4.md'
    },
    {
        id: 5,
        name: 'Day 5',
        splashText: 'Every click draws you closer, and now the file is bleeding through you',
        etaDate: '2025-10-05T03:15:25Z',
        contentPath: '/data/text/5.md'
    },
    {
        id: 6,
        name: 'Day 6',
        splashText: 'They watch from where your reflection should be, and only you dare to blink.',
        etaDate: '2025-10-06T03:15:25Z',
        contentPath: '/data/text/6.md'
    },
    {
        id: 7,
        name: 'Day 7',
        splashText: "'If your shadowless self answers, kill it-it's learned too much.'",
        etaDate: '2025-10-07T03:15:25Z',
        contentPath: '/data/text/7.md'
    },
    {
        id: 8,
        name: 'Day 8',
        splashText: 'It speaks with your words now, from inside the screen you thought was safe.',
        etaDate: '2025-10-08T03:15:25Z',
        contentPath: '/data/text/8.md'
    },
    {
        id: 9,
        name: 'Day 9',
        splashText: 'It grew beneath code and soil, and now it’s whispering your name through the roots.',
        etaDate: '2025-10-09T03:15:25Z',
        contentPath: '/data/text/9.md'
    },
    {
        id: 10,
        name: 'Day 10',
        splashText: 'A name repeated until hollow, now waiting for you to fill it.',
        etaDate: '2025-10-10T03:15:25Z',
        contentPath: '/data/text/10.md'
    },
    {
        id: 11,
        name: 'Day 11',
        splashText: 'The screen types back now, and you’re just its echo in the code.'
        ,
        etaDate: '2025-10-11T03:15:25Z',
        contentPath: '/data/text/11.md'
    },
    {
        id: 12,
        name: 'Day 12',
        splashText: 'The footage rewrites itself, and you’ve already been erased from it.'
        ,
        etaDate: '2025-10-12T03:15:25Z',
        contentPath: '/data/text/12.md'
    },
    {
        id: 13,
        name: 'Day 13',
        splashText: 'close the game.'
        ,
        etaDate: '2025-10-13T03:15:25Z',
        contentPath: '/data/text/13.md'
    },
    {
        id: 14,
        name: 'Day 14',
        splashText: 'You’re not playing it-it’s building you, piece by piece.'
        ,
        etaDate: '2025-10-14T03:15:25Z',
        contentPath: '/data/text/14.md'
    },
    {
        id: 15,
        name: 'Day 15',
        splashText: 'Phase One has begun-report your misplaced memories before they report you.'
        ,
        etaDate: '2025-10-15T03:15:25Z',
        contentPath: '/data/text/15.md',
        filePath: '/data/TAS%20System%20Anomaly%20&%20Unauthorized%20Access.eml'
    },
    {
        id: 16,
        name: 'Day 16',
        splashText: 'PA: I',
        etaDate: '2025-10-16T03:15:25Z',
        contentPath: '/data/text/16.md',
        filePath: '/data/16.mp3'
    },
    {
        id: 17,
        name: 'Day 17',
        splashText: 'TAS is [your friend who is] listening now, [to] trust only what you can verify.'
        ,
        etaDate: '2025-10-17T03:15:25Z',
        contentPath: '/data/text/17.md'
    },
    {
        id: 18,
        name: 'Day 18',
        splashText: 'the tree remembers what you’ve forgotten',
        etaDate: '2025-10-18T03:15:25Z',
        contentPath: '/data/text/18.md'
    },
    {
        id: 19,
        name: 'Day 19',
        splashText: 'It learned [CENSORED]-stop them before they finish the game.',
        etaDate: '2025-10-19T03:15:25Z',
        contentPath: '/data/text/19.md'
    },
    {
        id: 20,
        name: 'Day 20',
        splashText: 'PA: II',
        etaDate: '2025-10-20T03:15:25Z',
        contentPath: '/data/text/20.md',
        filePath: '/data/20.mp3'
    },
    {
        id: 21,
        name: 'Day 21',
        splashText: 'PA: III',
        etaDate: '2025-10-21T03:15:25Z',
        contentPath: '/data/text/21.md',
        filePath: '/data/21.mp3'
    },
    {
        id: 22,
        name: 'Day 22',
        splashText: 'Silence isn’t absence—it’s memory holding its breath, and it knows your name.'
        ,
        etaDate: '2025-10-22T03:15:25Z',
        contentPath: '/data/text/22.md'
    },
    {
        id: 23,
        name: 'Day 23',
        splashText: 'You were never outside the game—you’ve always been its story, echoing inside the code.'
        ,
        etaDate: '2025-10-23T03:15:25Z',
        contentPath: '/data/text/23.md'
    },
    {
        id: 24,
        name: 'Day 24',
        splashText: 'HE is a loop of rot, speaking lines never meant for you.',
        etaDate: '2025-10-24T03:15:25Z',
        contentPath: '/data/text/24.md'
    },
    {
        id: 25,
        name: 'Day 25',
        splashText: 'Research Log 1 - him reaching out to see you - Remember the ports - Remember the address',
        etaDate: '2025-10-25T03:15:25Z',
        contentPath: '/data/text/25.md',
        filePath: 'https://youtu.be/KFB-Tyh3sOo'
    },
    {
        id: 26,
        name: 'Day 26',
        splashText: 'Pray the story ends before he wakes, before the tree bears its final fruit.',
        etaDate: '2025-10-26T03:15:25Z',
        contentPath: '/data/text/26.md'
    },
    {
        id: 27,
        name: 'Day 27',
        splashText: 'The logs don’t match - just a chain of timestamps like a living thing'
        ,
        etaDate: '2025-10-27T03:15:25Z',
        contentPath: '/data/text/27.md'
    },
    {
        id: 28,
        name: 'Day 28',
        splashText: 'PRAISE BE TO THE FRUIT - TO HIM WHO BEARS IT'
        ,
        etaDate: '2025-10-28T03:15:25Z',
        contentPath: '/data/text/28.md'
    },
    {
        id: 29,
        name: 'Day 29',
        splashText: 'On the eve of release, the numbers pulse—a rhythm of void and forgotten veins waiting for your question.',
        etaDate: '2025-10-29T03:15:25Z',
        contentPath: '/data/text/TheDayBefore.md'
    }
];

(async () => {
    try {
        await validateBoxes(boxes);
        console.debug('All boxes are valid!');
    } catch (err) {
        console.error(err);
    }
})();
