'use client';

import React from 'react';
import {StageContainerProps} from "@/types";


/**
 * Reusable stage container component
 * Wraps stage content with title and instruction
 */
export const StageContainer: React.FC<StageContainerProps> = ({
                                                                  title,
                                                                  instruction,
                                                                  children,
                                                                  className = '',
                                                              }) => {
    return (
        <div className={`bg-gray-900 border border-gray-800 p-6 rounded ${className}`}>
            <h2 className="font-mono text-lg text-white mb-2">{title}</h2>
            {instruction && (
                <p className="text-sm text-gray-400 mb-4">{instruction}</p>
            )}
            {children}
        </div>
    );
};

