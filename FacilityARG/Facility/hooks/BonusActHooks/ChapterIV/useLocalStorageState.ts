import React, {useEffect, useState} from 'react';
import {deserializeFragments, serializeFragments} from '@/lib/client/utils/chapters';
import {FragmentsMap} from "@/types";

/**
 * Custom hook to sync FragmentsMap state with localStorage
 * @param key - localStorage key
 * @param initialValue - Initial value if nothing in localStorage
 */
export function useLocalStorageState(
    key: string,
    initialValue: FragmentsMap = {}
): [FragmentsMap, React.Dispatch<React.SetStateAction<FragmentsMap>>] {
    const [state, setState] = useState<FragmentsMap>(initialValue);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(key);
            if (raw) {
                setState(deserializeFragments(raw));
            }
        } catch (e) {
            console.warn(`Failed to load from localStorage key "${key}":`, e);
        } finally {
            setIsInitialized(true);
        }
    }, [key]);

    useEffect(() => {
        if (!isInitialized) return;
        try {
            localStorage.setItem(key, serializeFragments(state));
        } catch (e) {
            console.warn(`Failed to save to localStorage key "${key}":`, e);
        }
    }, [state, key, isInitialized]);

    return [state, setState];
}
