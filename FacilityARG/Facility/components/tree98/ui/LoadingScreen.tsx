import React from 'react';
import {sysConfigDefaults} from '@/lib/client/data/tree98';
import {LoadingScreenProps} from "@/types";


export const LoadingScreen: React.FC<LoadingScreenProps> = ({loadingProgress}) => (
    <div
        className="w-full h-screen bg-black text-white flex flex-col items-center justify-center"
        style={{fontFamily: sysConfigDefaults.fonts.mono}}
    >
        <div className="text-lg mb-8">Starting tree98...</div>
        <div className="w-64 h-4 border border-white bg-black">
            <div
                className="h-full bg-blue-600 transition-all duration-100"
                style={{width: `${loadingProgress}%`}}
            />
        </div>
        <div className="text-sm mt-4">{loadingProgress}%</div>
    </div>
);
