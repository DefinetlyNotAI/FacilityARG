import {useEffect, useRef} from 'react';
import { Lock, Download } from 'lucide-react';
import {getBoxById, useFileContent} from "../../utils/lib.ts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";


export function DayPage() {
    const audioRef = useRef<HTMLAudioElement>(null);
    const boxId = parseInt(window.location.pathname.split('/').pop() || '0');

    const box = getBoxById(boxId);
    const isUnlocked = box ? new Date(box.etaDate) <= new Date() : false;
    const fileContent = useFileContent(box?.contentPath) || "Loading content...";

    useEffect(() => {
        if (box) {
            const playAudio = () => {
                if (audioRef.current) {
                    audioRef.current.play().catch(() => {
                        // Wait for user interaction if autoplay fails
                        const resumeAudio = () => {
                            audioRef.current?.play();
                            window.removeEventListener('click', resumeAudio);
                        };
                        window.addEventListener('click', resumeAudio);
                    });
                }
            };

            if (isUnlocked) {
                document.title = box.name;
                if (audioRef.current) {
                    audioRef.current.src = '/mus/retrospect.mp3';
                    audioRef.current.loop = true;
                    playAudio();
                }
            } else {
                document.title = 'Wait for the sapling to grow';
                if (audioRef.current) {
                    audioRef.current.src = '/mus/3OClock.mp3';
                    audioRef.current.loop = true;
                    playAudio();
                }
            }
        }
    }, [box, isUnlocked]);

    if (!box) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-red-300 text-xl">| Log not found |</div>
            </div>
        );
    }

    if (!isUnlocked) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-8">
                <audio ref={audioRef} />
                <div className="max-w-2xl w-full bg-neutral-900 border-4 border-red-950 rounded-lg p-12 text-center space-y-8">
                    <Lock className="w-32 h-32 mx-auto text-neutral-700" />
                    <p className="text-red-200 text-2xl font-bold tracking-wide leading-relaxed">
                        The sapling has not yet grown.
                        <br />
                        Patience is a virtue the facility demands.
                        <br />
                        Return when the clock permits.
                    </p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="bg-red-950 hover:bg-red-900 text-red-100 px-8 py-4 rounded-lg border-2 border-red-900 hover:border-red-700 transition-all font-bold tracking-wide"
                    >
                        Return to Main
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-red-100 p-8">
            <audio ref={audioRef} />
            <div className="max-w-4xl mx-auto">
                <div className="bg-neutral-900 border-4 border-red-950 rounded-lg overflow-hidden">
                    <div className="bg-neutral-950 border-b-4 border-red-950 px-8 py-6">
                        <h1 className="text-3xl font-bold text-red-100 tracking-wider mb-2">
                            {box.name}
                        </h1>
                        <div className="text-red-300 text-sm font-mono">
                            FACILITY LOG - ENTRY #{box.id.toString().padStart(4, '0')}
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="border-l-4 border-red-900 pl-6 py-4 bg-neutral-950">
                            <div className="text-red-400 text-xs font-mono mb-2 tracking-widest">
                                [CLASSIFIED DOCUMENT]
                            </div>

                            <div className="prose prose-invert max-w-none font-mono text-sm leading-relaxed">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkBreaks]}
                                    rehypePlugins={[rehypeRaw]}
                                >
                                    {fileContent}
                                </ReactMarkdown>
                            </div>
                        </div>

                        {box.filePath && (
                            <div className="pt-6 border-t-2 border-neutral-800">
                                <a
                                    href={box.filePath}
                                    target={box.filePath.startsWith('http') ? '_blank' : undefined}
                                    rel={box.filePath.startsWith('http') ? 'noopener noreferrer' : undefined}
                                    download={!box.filePath.startsWith('http')}
                                    className="inline-flex items-center gap-3 bg-red-950 hover:bg-red-900 text-red-100 px-6 py-3 rounded-lg border-2 border-red-900 hover:border-red-700 transition-all font-bold tracking-wide"
                                >
                                    <Download className="w-5 h-5" />
                                    Access Attached Resource
                                </a>
                            </div>
                        )}

                        <div className="pt-8">
                            <button
                                onClick={() => window.location.href = '/'}
                                className="bg-neutral-950 hover:bg-neutral-800 text-red-100 px-6 py-3 rounded-lg border-2 border-neutral-800 hover:border-neutral-700 transition-all font-bold tracking-wide"
                            >
                                Return to Main
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
