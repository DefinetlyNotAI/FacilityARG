'use client';

import React from 'react';
import {Stage, StageNavigationProps} from "@/types";

/**
 * Reusable stage navigation component for puzzle pages
 * Shows locked/unlocked stages with navigation buttons
 */
export const StageNavigation: React.FC<StageNavigationProps> = ({
                                                                    stages,
                                                                    currentStageIndex,
                                                                    unlockedStage,
                                                                    onStageChange,
                                                                    className = '',
                                                                }) => {
    return (
        <div className={`mb-4 flex gap-2 justify-center ${className}`}>
            {stages.map((s: Stage, i: number) => {
                const locked = i > unlockedStage;
                return (
                    <button
                        key={i}
                        onClick={() => {
                            if (!locked) onStageChange(i);
                        }}
                        disabled={locked}
                        className={`px-3 py-1 font-mono text-sm rounded ${
                            i === currentStageIndex
                                ? 'bg-gray-700 text-white'
                                : locked
                                    ? 'bg-gray-800 text-gray-600'
                                    : 'bg-gray-600 text-black'
                        }`}
                    >
                        {locked ? `🔒 Stage ${s.stage}` : `Stage ${s.stage}`}
                    </button>
                );
            })}
        </div>
    );
};

