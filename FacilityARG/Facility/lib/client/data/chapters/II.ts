// Chapter II data
export const linksChapterII = {
    timeShallStrikeEXE: "/static/chapters/II/time_shall_strike.exe",
    images: {
        // Human, robot, and blackness
        '3': '/static/chapters/images/3.png',
        // 15 flowers
        '15': '/static/chapters/images/15.png',
        // 25 graves
        '25': '/static/chapters/images/25.png',
        // A Tree
        'TREE': '/static/chapters/images/tree.png',
        // Darkness
        'VESSEL': '/static/chapters/images/vessel.png',
        // Upside-down black tree
        'TR33': '/static/chapters/images/tr33.png',
        // Clock
        '1033333013': '/static/chapters/images/clock.png',
        // Melted Clock
        '3h-15m-10th-utc': '/static/chapters/images/melted.jpeg',
    },
}


export const chIIData = {
    utcPage: {
        timeWindow: {
            hour: 3,
            minuteStart: 15,
            minuteEnd: 40,
            day: 10,
        },
        images: {
            meltedClock: '3h-15m-10th-utc',
        },
        accessText: {
            title: 'Access Required',
            description: 'A 10-digit number instructed you to come here when the clock strikes me',
            inputPlaceholder: 'Enter password',
            error: 'Incorrect password',
            submit: 'Submit',
        },
        timeWindowText: {
            tooLateEarly: 'TOO LATE OR TOO EARLY',
            message: 'TIME IS NOT REAL HERE',
        },
        successText: {
            emojis: [':)', ':)', ':)'],
            downloadButton: 'Download time itself',
        },
    },
    // NOTE: This chapter was already solved
    // BUT these paths should have not been in client-side code,
    // I will not update this to be server-side due to this already being solved.
    chapterIIPaths: [
        {path: '3', image: linksChapterII.images['3'], caption: 'YOU - ME - IT'},
        {
            path: '15',
            image: linksChapterII.images['15'],
            caption: 'They sprout, and bloom from their insides, imagine if we could do that?'
        },
        {
            path: '25',
            image: linksChapterII.images['25'],
            caption: 'If your days feel wasted, reclaim them and return to the world as twenty six anew.'
        },
        {path: 'TREE', image: linksChapterII.images['TREE'], caption: 'Ignore the past, find the me with three\'s'},
        {path: 'VESSEL', image: linksChapterII.images['VESSEL'], caption: 'Curious or plain suicidal'},
        {
            path: 'TR33',
            image: linksChapterII.images['TR33'],
            caption: '1gN0r3 tH3 fUtuR3, @ URL tH3 nUmB3r$ 0f Th1$ t3xT'
        },
        {
            path: '1033333013',
            image: linksChapterII.images['1033333013'],
            caption: 'When the clock strikes the link, go to /3h-15m-10th-utc in this chapter, you have one shot at this, a 25 min gap'
        },
    ],
    root: {
        startDate: new Date('2025-12-06T00:00:00Z'),
        linksCount: 8,
        text: {
            countdown: {
                descriptionLines: [
                    'There are 8 links.',
                    '4 are numbers, 2 are foliage, one is you, and one is time.',
                ],
                note: 'Each page must be screenshotted and sent to me complete to see.',
            },
            complete: {
                title: 'QUEST COMPLETE',
                message: 'You have navigated the paths. The journey continues...',
            },
        },
    }
};
