'use client';
import React from 'react';
import {sysConfigDefaults} from '@/lib/client/data/tree98';

export const BlueScreen: React.FC = () => (
    <div
        className="w-full h-screen"
        style={{
            backgroundColor: '#0000AA',
            fontFamily: sysConfigDefaults.fonts.mono,
            color: '#FFFFFF',
            fontSize: '14px',
            padding: '20px',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            textShadow: '1px 1px #000',
        }}
    >
        <div>
            {sysConfigDefaults.sysMessages.bsodContent}
        </div>
    </div>
);
