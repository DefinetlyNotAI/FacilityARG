import {type ClassValue, clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';
import React from 'react';

/**
 * Converts a string with '/n' into JSX with <br/> tags.
 *
 * @param msg - Message string using '/n' as line breaks.
 * @returns Array of React nodes with <br> inserted.
 */
export function renderMsg(msg: string) {
    const parts = msg.split("/n");
    return parts.map((part, idx) => idx === 0 ? part : [<br key={idx}/>, part]);
}

/**
 * Merges multiple class name inputs using clsx and tailwind-merge.
 *
 * @param inputs - Array of class values (strings, undefined, or arrays).
 * @returns A single merged class string.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
