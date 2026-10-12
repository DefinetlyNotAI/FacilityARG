import {useEffect, useState} from 'react';
import {AlertTriangle, X} from 'lucide-react';
import styles from '@/styles/Codex.module.css';
import {CodexOverlay, OverlaySystemProps} from "@/types";


export function OverlaySystem({overlays, currentLine, hoveredKeyword}: OverlaySystemProps) {
    const [activeOverlay, setActiveOverlay] = useState<CodexOverlay | null>(null);
    const [dismissedOverlays, setDismissedOverlays] = useState<Set<string>>(new Set());

    useEffect(() => {
        const triggered = overlays.find(overlay => {
            if (dismissedOverlays.has(overlay.id)) return false;

            if (overlay.triggerLine !== undefined && currentLine !== undefined) {
                return currentLine === overlay.triggerLine;
            }

            if (overlay.triggerKeyword && hoveredKeyword) {
                return overlay.triggerKeyword.toLowerCase() === hoveredKeyword.toLowerCase();
            }

            return false;
        });

        if (triggered && !activeOverlay) {
            setActiveOverlay(triggered);

            if (triggered.duration) {
                setTimeout(() => {
                    dismissOverlay(triggered.id);
                }, triggered.duration);
            }
        }
    }, [overlays, currentLine, hoveredKeyword, dismissedOverlays, activeOverlay]);

    const dismissOverlay = (id: string) => {
        setActiveOverlay(null);
        setDismissedOverlays(prev => new Set([...prev, id]));
    };

    if (!activeOverlay) return null;

    const getOverlayStyle = () => {
        switch (activeOverlay.type) {
            case 'warning':
                return 'border-red-900/60 bg-red-950/90';
            case 'glitch':
                return `border-purple-900/60 bg-purple-950/90 ${styles.glitchEffect}`;
            case 'revelation':
                return 'border-amber-600/60 bg-amber-950/90';
            default:
                return 'border-amber-900/60 bg-black/90';
        }
    };

    return (
        <div
            className={`${styles.animateFadeIn} fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4`}>
            <div
                className={`relative max-w-2xl w-full p-6 sm:p-8 rounded-lg border-2 ${getOverlayStyle()} shadow-2xl max-h-[90vh] overflow-y-auto`}
            >
                <button
                    onClick={() => dismissOverlay(activeOverlay.id)}
                    className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded transition-colors"
                    aria-label="Close overlay"
                >
                    <X className="w-5 h-5 text-amber-100"/>
                </button>

                <div className="flex items-start gap-3 sm:gap-4 mb-4">
                    {activeOverlay.type === 'warning' && (
                        <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-400 flex-shrink-0 mt-1"/>
                    )}
                    <h2 className="text-xl sm:text-2xl font-bold text-amber-100">{activeOverlay.title}</h2>
                </div>

                <div className="text-sm sm:text-base text-amber-50 leading-relaxed whitespace-pre-wrap">
                    {activeOverlay.content}
                </div>

                <button
                    onClick={() => dismissOverlay(activeOverlay.id)}
                    className="mt-6 px-6 py-2 bg-amber-900/40 border border-amber-700/60 rounded hover:bg-amber-900/60 transition-all duration-300 text-amber-100 text-sm sm:text-base"
                >
                    Continue
                </button>
            </div>
        </div>
    );
}
