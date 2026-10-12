import {useEffect, useState} from 'react';

/**
 * Custom hook to safely set a value only on the client side
 * Prevents hydration mismatches when using random/time-based values
 * @param generator - Function to generate the client-side value
 */
export function useClientSideValue<T>(generator: () => T): T | null {
    const [value, setValue] = useState<T | null>(null);

    useEffect(() => {
        setValue(generator());
    }, []);

    return value;
}

