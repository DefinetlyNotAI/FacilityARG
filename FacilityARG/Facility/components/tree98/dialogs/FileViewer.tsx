import React from 'react';
import {sysConfigDefaults} from '@/lib/client/data/tree98';
import {FileViewerProps} from "@/types";


export const FileViewer: React.FC<FileViewerProps> = ({item}) => (
    <div className="p-4 h-full overflow-auto" style={{fontFamily: sysConfigDefaults.fonts.mono, fontSize: '12px'}}>
        <pre className="whitespace-pre-wrap text-black">{item.content}</pre>
    </div>
);
