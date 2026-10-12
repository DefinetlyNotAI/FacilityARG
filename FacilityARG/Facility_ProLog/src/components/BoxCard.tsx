import { Lock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BoxCardProps {
    id: number;
    name: string;
    splashText: string;
    etaDate: string;
    isUnlocked: boolean;
}

export function BoxCard({ id, name, splashText, etaDate, isUnlocked }: BoxCardProps) {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (!isUnlocked) {
            const calculateTimeLeft = () => {
                const now = new Date();
                const target = new Date(etaDate);
                const diff = target.getTime() - now.getTime();

                if (diff <= 0) {
                    setTimeLeft('Unlocking...');
                    return;
                }

                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
            };

            calculateTimeLeft();
            const interval = setInterval(calculateTimeLeft, 1000);
            return () => clearInterval(interval);
        }
    }, [etaDate, isUnlocked]);

    const handleClick = () => {
        if (isUnlocked) {
            window.location.href = `/day/${id}`;
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`
        bg-neutral-900 border-2 rounded-lg overflow-hidden
        transition-all duration-300 flex flex-col h-64
        ${isUnlocked
                ? 'border-red-900 hover:border-red-700 hover:shadow-lg hover:shadow-red-900/50 cursor-pointer hover:scale-105'
                : 'border-neutral-800 cursor-default opacity-75'
            }
      `}
        >
            <div className="bg-neutral-950 px-4 py-3 border-b-2 border-neutral-800">
                <h3 className="text-red-100 font-bold text-lg tracking-wider">{name}</h3>
            </div>

            <div className="flex-1 flex items-center justify-center p-6">
                {isUnlocked ? (
                    <p className="text-red-200 text-center italic text-sm leading-relaxed">
                        {splashText}
                    </p>
                ) : (
                    <Lock className="w-16 h-16 text-neutral-700" />
                )}
            </div>

            <div className="bg-neutral-950 px-4 py-3 border-t-2 border-neutral-800 text-center">
                {isUnlocked ? (
                    <div className="text-red-300 text-2xl">:)</div>
                ) : (
                    <div className="text-neutral-500 text-sm font-mono">{timeLeft}</div>
                )}
            </div>
        </div>
    );
}
