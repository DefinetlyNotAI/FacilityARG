import React from 'react';
import {startMenu, sysConfigDefaults} from '@/lib/client/data/tree98';
import {StartMenuProps} from '@/types';
import {getIcon} from "@/components/tree98/icons";


export const StartMenu: React.FC<StartMenuProps> = ({onAction}) => (
    <div
        className="absolute bottom-8 left-0 w-64 bg-gray-200 border-2 border-gray-400 shadow-lg"
        style={{fontFamily: sysConfigDefaults.fonts.system}}
    >
        <div className="bg-blue-600 text-white p-2 text-sm font-bold">
            tree98
        </div>
        <div className="p-1">
            {startMenu.map((item, index) => (
                <div
                    key={index}
                    className="p-2 hover:bg-blue-100 cursor-pointer text-sm flex items-center"
                    onClick={() => 'action' in item && onAction(item.action)}
                >
                    <div className="w-4 h-4 mr-2">
                        {getIcon(item.icon)}
                    </div>
                    {item.name}
                </div>
            ))}
        </div>
    </div>
);
