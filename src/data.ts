export interface Box {
    id: number;
    name: string;
    splashText: string;
    etaDate: string;
    content: string;
    filePath?: string;
}

function validateBoxes(boxes: Box[]): void {
    const errors: string[] = [];
    const ids = new Set<number>();
    const names = new Set<string>();

    if (boxes.length === 0) {
        errors.push('Box array cannot be empty');
    }

    boxes.forEach((box, index) => {
        if (typeof box.id !== 'number' || box.id < 1) {
            errors.push(`Box at index ${index}: id must be a positive number`);
        }

        if (ids.has(box.id)) {
            errors.push(`Box at index ${index}: duplicate id ${box.id} found`);
        }
        ids.add(box.id);

        if (!box.name || typeof box.name !== 'string' || box.name.trim() === '') {
            errors.push(`Box at index ${index}: name is required and must be a non-empty string`);
        }

        if (names.has(box.name)) {
            errors.push(`Box at index ${index}: duplicate name "${box.name}" found`);
        }
        names.add(box.name);

        if (!box.splashText || typeof box.splashText !== 'string' || box.splashText.trim() === '') {
            errors.push(`Box at index ${index}: splashText is required and must be a non-empty string`);
        }

        if (!box.etaDate || typeof box.etaDate !== 'string') {
            errors.push(`Box at index ${index}: etaDate is required and must be a string`);
        } else {
            const date = new Date(box.etaDate);
            if (isNaN(date.getTime())) {
                errors.push(`Box at index ${index}: etaDate "${box.etaDate}" is not a valid date`);
            }
        }

        if (!box.content || typeof box.content !== 'string' || box.content.trim() === '') {
            errors.push(`Box at index ${index}: content is required and must be a non-empty string`);
        }

        if (box.filePath !== undefined && (typeof box.filePath !== 'string' || box.filePath.trim() === '')) {
            errors.push(`Box at index ${index}: filePath must be a non-empty string or undefined`);
        }
    });

    if (errors.length > 0) {
        throw new Error('Box validation failed:\n' + errors.join('\n'));
    }
}

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
        etaDate: '2025-10-05T03:00:00Z',
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

export function getBoxById(id: number): Box | undefined {
    return boxes.find(box => box.id === id);
}

export function getUnlockedBoxes(currentTime: Date = new Date()): Box[] {
    return boxes.filter(box => new Date(box.etaDate) <= currentTime);
}

export function getAllBoxes(): Box[] {
    return [...boxes];
}
