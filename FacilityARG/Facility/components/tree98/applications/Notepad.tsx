import React, {useState} from 'react';
import {sysConfigDefaults} from '@/lib/client/data/tree98';

export const Notepad: React.FC = () => {
    const [text, setText] = useState('');
    const [filename, setFilename] = useState('Untitled');

    const downloadFile = (filename: string, content: string) => {
        const element = document.createElement('a');
        const file = new Blob([content], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const uploadFile = (): Promise<string> => {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.txt';
            input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target?.result as string || '');
                    reader.readAsText(file);
                }
            };
            input.click();
        });
    };

    const handleSave = () => {
        downloadFile(`${filename}.txt`, text);
    };

    const handleOpen = async () => {
        try {
            const content = await uploadFile();
            setText(content);
            setFilename('Opened File');
        } catch (err) {
            console.error('Failed to open file:', err);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="border-b p-1 text-xs bg-gray-100 flex gap-4">
                <button onClick={handleOpen} className="hover:bg-gray-200 px-2 py-1">Upload</button>
                <button onClick={handleSave} className="hover:bg-gray-200 px-2 py-1">Save</button>
            </div>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 p-2 border-none outline-none resize-none bg-white text-black"
                style={{fontFamily: sysConfigDefaults.fonts.mono, fontSize: '12px'}}
                placeholder="Type your text here..."
            />
        </div>
    );
};
