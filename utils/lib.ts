import {Box} from "./types";
import {boxes} from "./data";

export function validateBoxes(boxes: Box[]): void {
    const errors: string[] = [];
    const ids = new Set<number>();
    const names = new Set<string>();

    if (boxes.length === 0) {
        errors.push('Box array cannot be empty');
    }

    boxes.forEach((box, index) => {
        if (box.id < 1) {
            errors.push(`Box at index ${index}: id must be a positive number`);
        }

        if (ids.has(box.id)) {
            errors.push(`Box at index ${index}: duplicate id ${box.id} found`);
        }
        ids.add(box.id);

        if (!box.name || box.name.trim() === '') {
            errors.push(`Box at index ${index}: name is required and must be a non-empty string`);
        }

        if (names.has(box.name)) {
            errors.push(`Box at index ${index}: duplicate name "${box.name}" found`);
        }
        names.add(box.name);

        if (!box.splashText || box.splashText.trim() === '') {
            errors.push(`Box at index ${index}: splashText is required and must be a non-empty string`);
        }

        if (!box.etaDate) {
            errors.push(`Box at index ${index}: etaDate is required and must be a string`);
        } else {
            const date = new Date(box.etaDate);
            if (isNaN(date.getTime())) {
                errors.push(`Box at index ${index}: etaDate "${box.etaDate}" is not a valid date`);
            }
        }

        if (!box.content || box.content.trim() === '') {
            errors.push(`Box at index ${index}: content is required and must be a non-empty string`);
        }

        if (box.filePath !== undefined && (box.filePath.trim() === '')) {
            errors.push(`Box at index ${index}: filePath must be a non-empty string or undefined`);
        }
    });

    if (errors.length > 0) {
        throw new Error('Box validation failed:\n' + errors.join('\n'));
    }
}

export function getBoxById(id: number): Box | undefined {
    return boxes.find(box => box.id === id);
}

export function getUnlockedBoxes(currentTime: Date = new Date()): Box[] {
    return boxes.filter(box => new Date(box.etaDate) <= currentTime);
}

export function getAllBoxes(): Box[] {
    return [...boxes];
}
