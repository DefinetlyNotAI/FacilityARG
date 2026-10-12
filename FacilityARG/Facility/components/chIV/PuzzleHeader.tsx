'use client';

import React from 'react';
import {PuzzleHeaderProps} from "@/types";

/**
 * Reusable puzzle page header component
 */
export const PuzzleHeader: React.FC<PuzzleHeaderProps> = ({
                                                              title,
                                                              subtitle,
                                                              className = '',
                                                          }) => {
    return (
        <div className={`text-center mb-6 ${className}`}>
            <h1 className="text-white font-mono text-3xl font-bold">{title}</h1>
            {subtitle && (
                <p className="text-gray-400 font-mono text-sm mt-2">{subtitle}</p>
            )}
        </div>
    );
};

