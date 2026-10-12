'use client';
import React, {useEffect, useRef, useState} from 'react';
import {cmdData, exeTitle, files, sysConfigDefaults} from '@/lib/client/data/tree98';
import {getIcon} from "@/components/tree98/icons";
import {DirItem} from "@/types";


const resolvePath = (base: string[], targetPath?: string): DirItem | null => {
    const fullPath = [...base];
    if (targetPath) {
        const parts = targetPath.replace(/\\$/, '').split('\\');
        for (const part of parts) {
            if (part === '..') fullPath.pop();
            else fullPath.push(part);
        }
    }
    let current: any = files.find(d => d.name === fullPath[0]);
    for (let i = 1; i < fullPath.length; i++) {
        current = current?.children?.find(
            (item: any) => item.name.toLowerCase() === fullPath[i].toLowerCase() && item.type === 'folder'
        );
        if (!current) return null;
    }
    return current;
};

const listDir = (dir: DirItem): string[] => {
    if (!dir?.children?.length) return ['<Empty Directory>'];
    const boxTop = cmdData.listDir.top;
    const files = dir.children.map(item =>
        `│ ${item.name.padEnd(28, '\u00A0')}│`
    );
    const boxBottom = cmdData.listDir.bottom;
    return [boxTop, ...files, boxBottom];
};

export const CMD: React.FC = () => {
    const [history, setHistory] = useState<string[]>(cmdData.history.useStateBegin);
    const [input, setInput] = useState('');
    const [inputHistory, setInputHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number | null>(null);
    const [path, setPath] = useState(['C:']);
    const [variables, setVariables] = useState<{ [key: string]: string }>({});
    const terminalRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const getPrompt = () => path.join('\\') + '>';

    const highlightText = (text: string) => {
        return text.split(/(\*[^*]+\*)/g).map((part, i) => {
            if (part.startsWith('*') && part.endsWith('*')) {
                return <span key={i} style={{background: 'yellow', color: 'black'}}>{part.slice(1, -1)}</span>;
            }
            return <span key={i}>{part}</span>;
        });
    };

    const handlePipe = (raw: string): string[] => {
        const parts = raw.split('|').map(p => p.trim());
        let output: string[] = [];
        for (let i = 0; i < parts.length; i++) {
            const cmd = i === 0 ? parts[i] : parts[i] + ' ' + output.join(' ');
            output = handleSingleCommand(cmd);
        }
        return output;
    };

    const evaluateExpression = (expr: string, vars: Record<string, any>): number => {
        const replaced = expr.replace(/\$([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, varName) => {
            const val = vars[varName];
            if (val === undefined) throw new Error(cmdData.messages.varNotFound(varName));
            return val;
        });

        if (!/^[\d\s()+\-*/.]+$/.test(replaced)) {
            throw new Error(cmdData.messages.failedRegexSafety);
        }

        return Function(`"use strict"; return (${replaced})`)();
    };

    const replaceVars = (input: string, vars: Record<string, any>): string => {
        return input.replace(/\$([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, varName) => {
            const val = vars[varName];
            return val !== undefined ? val : `$${varName}`;
        });
    };

    const handleSingleCommand = (raw: string): string[] => {
        let input = raw.trim();

        // 1. Assignment: $var = expr
        const assignMatch = input.match(/^\$([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
        if (assignMatch) {
            const [, key, val] = assignMatch;
            try {
                let evaluated;
                // Check for quoted string assignment
                if (/^(['"]).*\1$/.test(val.trim())) {
                    evaluated = val.trim().slice(1, -1);
                } else {
                    evaluated = evaluateExpression(val, variables);
                }
                setVariables(prev => ({...prev, [key]: String(evaluated)}));
                return [cmdData.messages.varSet(key)];
            } catch (err) {
                return [cmdData.messages.errorExpression(err)];
            }
        }

        // 2. Variable retrieval: $var
        if (/^\$[a-zA-Z_][a-zA-Z0-9_]*$/.test(raw.trim())) {
            const varName = raw.trim().slice(1);
            const val = variables[varName];
            return val !== undefined
                ? [`${val}`]
                : [cmdData.messages.varNotFound(val)];
        }

        // 3. Replace vars in the command string (used in expressions or commands)
        input = replaceVars(input, variables);

        // 4. Built-in commands
        const [cmdRaw, ...args] = input.split(/\s+/);
        const cmd = cmdRaw.toLowerCase();
        const commandMap = cmdData.commandMap({
            setHistory,
            setPath,
            path,
            resolvePath,
            listDir,
            variables,
            evaluateExpression,
        });
        if (commandMap[cmd]) return commandMap[cmd](args);

        if (cmdRaw.startsWith('*') && cmdRaw.endsWith('*')) return [cmdRaw];

        // 5. Fallback
        if (!cmdRaw || /^\d+(\.\d+)?$/.test(cmdRaw)) {
            return [cmdData.messages.disabled];
        } else {
            return [cmdData.messages.commandNotFound(cmdRaw)];
        }
    };

    const handleCommand = (raw: string): string[] =>
        raw.includes('|') ? handlePipe(raw) : handleSingleCommand(raw);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const output = handleCommand(input);
        setInputHistory(prev => [...prev, input]);
        setHistoryIndex(null);
        setHistory(prev => [...prev, `${getPrompt()} ${input}`, ...output]);
        setInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowUp') {
            if (inputHistory.length === 0) return;
            e.preventDefault();
            const newIndex = historyIndex === null ? inputHistory.length - 1 : Math.max(historyIndex - 1, 0);
            setHistoryIndex(newIndex);
            setInput(inputHistory[newIndex]);
        } else if (e.key === 'ArrowDown') {
            if (inputHistory.length === 0 || historyIndex === null) return;
            e.preventDefault();
            const newIndex = Math.min(historyIndex + 1, inputHistory.length - 1);
            setHistoryIndex(newIndex);
            setInput(inputHistory[newIndex]);
        }
    };

    useEffect(() => {
        terminalRef.current?.scrollTo(0, terminalRef.current.scrollHeight);
    }, [history]);

    return (
        <div className="flex flex-col h-full bg-black text-green-400"
             style={{fontFamily: sysConfigDefaults.fonts.system}}>
            <div className="flex items-center p-2 border-b bg-gray-900 gap-2">
                <div className="w-8 h-8">{getIcon('run')}</div>
                <span className="text-xs flex-1">{exeTitle.CommandPrompt}</span>
            </div>
            <div className="flex-1 p-4 overflow-auto bg-black text-sm font-mono" ref={terminalRef}
                 style={{userSelect: 'text', WebkitUserSelect: 'text'}}>
                {history.map((line, i) => (
                    <div key={i} style={{whiteSpace: 'pre-wrap'}}>{highlightText(line)}</div>
                ))}
                <form onSubmit={handleSubmit} className="flex mt-1">
                    <span>{getPrompt()}&nbsp;</span>
                    <input
                        ref={inputRef}
                        autoFocus
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="bg-black text-green-400 font-mono outline-none flex-1"
                        spellCheck={false}
                        autoComplete="off"
                    />
                </form>
            </div>
        </div>
    );
};
