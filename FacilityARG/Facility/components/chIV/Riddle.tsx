'use client';

import React, {useState} from 'react';
import {RiddleProps} from "@/types";


export const Riddle: React.FC<RiddleProps> = ({idx, prompt, expectedChunk, onResult}) => {
    const [answer, setAnswer] = useState('');
    const [correct, setCorrect] = useState<boolean | null>(null);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        const ok = answer.trim().toLowerCase() === expectedChunk;
        setCorrect(ok);
        onResult(idx, ok);
    }

    return (
        <div className="p-4 bg-gray-800 rounded border border-gray-700">
            <div className="text-sm text-gray-400 mb-2">{prompt}</div>
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder={`Riddle ${idx + 1} answer`}
                    className="bg-gray-900 text-white font-mono text-sm px-3 py-2 rounded flex-1"
                />
                <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-500 text-black font-mono px-3 py-1 rounded text-sm"
                >
                    Submit
                </button>
            </form>
            {correct === true && (
                <div className="mt-2 text-sm text-green-400">Correct!</div>
            )}
            {correct === false && (
                <div className="mt-2 text-sm text-red-400">Try again.</div>
            )}
        </div>
    );
}

