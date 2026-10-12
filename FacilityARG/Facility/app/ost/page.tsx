"use client";

import React, {useEffect, useRef, useState} from 'react';
import {
    Download,
    Info,
    Menu,
    Pause,
    Play,
    Repeat,
    Repeat1,
    Repeat2,
    RotateCcw,
    RotateCw,
    Shuffle,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX
} from 'lucide-react';
import styles from '@/styles/OST.module.css';
import {BACKGROUND_AUDIO, DISPLAY_NAMES, TRACK_NAMES} from "@/audio";
import {Track} from "@/types";

function extractTracks(): Track[] {
    const trackMap = new Map<string, string[]>();

    const processEntry = (key: string, path: string) => {
        if (!trackMap.has(path)) {
            trackMap.set(path, []);
        }
        trackMap.get(path)!.push(key);
    };

    Object.entries(BACKGROUND_AUDIO).forEach(([key, value]) => {
        if (typeof value === 'string') {
            processEntry(key, value);
        } else if (typeof value === 'object') {
            Object.entries(value).forEach(([subKey, subValue]) => {
                processEntry(`${key}.${subKey}`, subValue as string);
            });
        }
    });

    return Array.from(trackMap.entries()).map(([path, usedIn]) => {
        const filename = path.split('/').pop() || '';
        const title = TRACK_NAMES[filename] || filename.replace('.mp3', '');
        return {path, title, usedIn};
    });
}

export default function OSTPlayer() {
    const tracks = React.useMemo(() => extractTracks(), []);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [loopMode, setLoopMode] = useState<'none' | 'all' | 'one'>('none');
    const [isShuffle, setIsShuffle] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    // token to serialize/cancel in-flight play() attempts to avoid AbortError
    const playTokenRef = useRef(0);

    // avoid SSR/client hydration mismatch: only render randomized particles on the client
    const [showParticles, setShowParticles] = useState(false);
    // particle data is generated once on client mount to keep positions stable across re-renders
    type Particle = { left: number; top: number; delay: number; duration: number; scale: number; opacity: number };
    const [particles, setParticles] = useState<Particle[]>([]);
    useEffect(() => {
        // only run on client
        setShowParticles(true);
        const generate = (n: number) =>
            Array.from({length: n}).map(() => ({
                left: Math.random() * 100,
                top: Math.random() * 100,
                delay: Math.random() * 6,
                duration: 6 + Math.random() * 12,
                scale: 0.4 + Math.random() * 1.2,
                opacity: 0.3 + Math.random() * 0.7,
            }));
        setParticles(generate(60));
    }, []);

    const currentTrack = tracks[currentTrackIndex];

    // Visualizer: deterministic server render, randomized after hydration
    const BAR_COUNT = 32;
    const [barsHeights, setBarsHeights] = useState<number[]>(
        Array.from({length: BAR_COUNT}, () => 50) // stable value for SSR
    );
    useEffect(() => {
        // generate randomized heights only on client after hydration
        const heights = Array.from({length: BAR_COUNT}, () => 20 + Math.random() * 80);
        setBarsHeights(heights);
    }, []);

    // Sync audio element events
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const handleEnded = () => {
            if (loopMode === 'one') {
                audio.currentTime = 0;
                // use tokened play to avoid races
                const token = ++playTokenRef.current;
                audio.play().catch((err) => {
                    if (playTokenRef.current !== token) return;
                    console.error(err);
                });
            } else if (loopMode === 'all' || currentTrackIndex < tracks.length - 1) {
                handleNext();
            } else {
                setIsPlaying(false);
            }
        };

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [currentTrackIndex, loopMode, tracks.length]);

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    // When the current track changes: load the new source and reset progress.
    // Use a token/safe play attempt instead of unconditionally pausing to avoid play() AbortError.
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        // cancel any pending play attempts for the previous audio
        playTokenRef.current++;

        // set source explicitly and load
        try {
            audio.src = currentTrack.path;
            audio.load();
        } catch (e) {
            // ignore load errors
        }
        audio.currentTime = 0;
        setCurrentTime(0);

        if (isPlaying) {
            // attempt to play, but guard with a token so we can ignore races
            const token = ++playTokenRef.current;
            audio.play().catch((err) => {
                if (playTokenRef.current !== token) return; // was canceled by subsequent action
                console.warn('Autoplay prevented or play failed on track change:', err);
                setIsPlaying(false);
            });
        }
    }, [currentTrackIndex]);

    // When the user toggles play/pause: do not reset currentTime - only play or pause the element.
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            // tokened play: increment token and attempt to play; if a later action increments the token,
            // the catch handler will ignore the error from this attempt.
            const token = ++playTokenRef.current;
            audio.play().catch((err) => {
                if (playTokenRef.current !== token) return;
                console.warn('Play failed:', err);
                setIsPlaying(false);
            });
        } else {
            // cancel any pending play attempts and pause immediately
            playTokenRef.current++;
            audio.pause();
        }
    }, [isPlaying]);

    const togglePlay = () => {
        setIsPlaying((prev) => !prev);
    };

    const handleNext = () => {
        if (isShuffle) {
            const randomIndex = Math.floor(Math.random() * tracks.length);
            setCurrentTrackIndex(randomIndex);
        } else {
            setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
        }
        setCurrentTime(0);
        // request play for the next track
        setIsPlaying(true);
    };

    const handlePrevious = () => {
        if (currentTime > 3) {
            if (audioRef.current) audioRef.current.currentTime = 0;
        } else {
            setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
            setCurrentTime(0);
            setIsPlaying(true);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(e.target.value);
        setCurrentTime(newTime);
        if (audioRef.current) audioRef.current.currentTime = newTime;
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        setIsMuted(false);
    };

    const skipForward = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 5, duration);
        }
    };

    const skipBackward = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 5, 0);
        }
    };

    const toggleLoop = () => {
        setLoopMode((prev) => {
            if (prev === 'none') return 'all';
            if (prev === 'all') return 'one';
            return 'none';
        });
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = currentTrack.path;
        link.download = `${currentTrack.title}.mp3`;
        link.click();
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const selectTrack = (index: number) => {
        setCurrentTrackIndex(index);
        setCurrentTime(0);
        // start playback of the selected track
        setIsPlaying(true);
        setShowMenu(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.player}>
                {/* Ambient particles layer (behind content). Color changes for creepy tracks. */}
                {showParticles && particles.length > 0 && (
                    <div className={styles.particles}>
                        {particles.map((p, i) => (
                            <span
                                key={i}
                                className={styles.particle}
                                style={{
                                    left: `${p.left}%`,
                                    top: `${p.top}%`,
                                    animationDuration: `${p.duration}s`,
                                    animationDelay: `${p.delay}s`,
                                    // set CSS variable for per-particle scale
                                    ['--p-scale' as any]: p.scale,
                                    opacity: p.opacity,
                                }}
                            />
                        ))}
                    </div>
                )}

                <div className={styles.display}>
                    <div className={styles.trackInfo}>
                        <div className={styles.trackTitle}>{currentTrack.title}</div>
                        <div className={styles.trackSubtitle}>
                            Track {currentTrackIndex + 1} of {tracks.length}
                        </div>
                    </div>

                    <div className={styles.visualizer}>
                        {Array.from({length: BAR_COUNT}).map((_, i) => (
                            <div
                                key={i}
                                className={`${styles.bar} ${isPlaying ? styles.barActive : ''}`}
                                style={{
                                    animationDelay: `${i * 0.05}s`,
                                    height: `${barsHeights[i]}%`,
                                }}
                            />
                        ))}
                    </div>
                </div>

                <div className={styles.progressSection}>
                    <span className={styles.time}>{formatTime(currentTime)}</span>
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className={styles.progressBar}
                    />
                    <span className={styles.time}>{formatTime(duration)}</span>
                </div>

                <div className={styles.controls}>
                    <div className={styles.secondaryControls}>
                        <button
                            onClick={() => setIsShuffle(!isShuffle)}
                            className={`${styles.controlBtn} ${isShuffle ? styles.active : ''}`}
                            title="Shuffle"
                        >
                            <Shuffle size={18}/>
                        </button>
                        <button onClick={toggleLoop}
                                className={`${styles.controlBtn} ${loopMode !== 'none' ? styles.active : ''}`}
                                title="Loop">
                            {loopMode === 'none' && <Repeat size={18}/>}
                            {loopMode === 'all' && <Repeat2 size={18}/>}
                            {loopMode === 'one' && <Repeat1 size={18}/>}
                        </button>
                        <button onClick={() => setShowInfo(!showInfo)} className={styles.controlBtn} title="Info">
                            <Info size={18}/>
                        </button>
                        <button onClick={() => setShowMenu(!showMenu)} className={styles.controlBtn} title="Menu">
                            <Menu size={18}/>
                        </button>
                    </div>

                    <div className={styles.mainControls}>
                        <button onClick={handlePrevious} className={styles.controlBtn} title="Previous">
                            <SkipBack size={24}/>
                        </button>
                        <button onClick={skipBackward} className={styles.controlBtn} title="Rewind 5s">
                            <RotateCcw size={20}/>
                        </button>
                        <button onClick={togglePlay} className={styles.playBtn} title={isPlaying ? 'Pause' : 'Play'}>
                            {isPlaying ? <Pause size={32}/> : <Play size={32}/>}
                        </button>
                        <button onClick={skipForward} className={styles.controlBtn} title="Forward 5s">
                            <RotateCw size={20}/>
                        </button>
                        <button onClick={handleNext} className={styles.controlBtn} title="Next">
                            <SkipForward size={24}/>
                        </button>
                    </div>

                    <div className={styles.volumeSection}>
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className={styles.controlBtn}
                            title={isMuted ? 'Unmute' : 'Mute'}
                        >
                            {isMuted ? <VolumeX size={18}/> : <Volume2 size={18}/>}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={handleVolumeChange}
                            className={styles.volumeBar}
                        />
                        <button onClick={handleDownload} className={styles.controlBtn} title="Download">
                            <Download size={18}/>
                        </button>
                    </div>
                </div>

                {showInfo && (
                    <div className={styles.infoPanel}>
                        <div className={styles.infoPanelHeader}>
                            <h3>Used In</h3>
                            <button onClick={() => setShowInfo(false)} className={styles.closeBtn}>×</button>
                        </div>
                        <div className={styles.usedInList}>
                            {currentTrack.usedIn.map((location, idx) => (
                                <div key={idx} className={styles.usedInItem}>
                                    {DISPLAY_NAMES[location] || location}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {showMenu && (
                    <div className={styles.menuPanel}>
                        <div className={styles.infoPanelHeader}>
                            <h3>Track List</h3>
                            <button onClick={() => setShowMenu(false)} className={styles.closeBtn}>×</button>
                        </div>
                        <div className={styles.trackList}>
                            {tracks.map((track, idx) => (
                                <div
                                    key={idx}
                                    className={`${styles.trackItem} ${idx === currentTrackIndex ? styles.trackItemActive : ''}`}
                                    onClick={() => selectTrack(idx)}
                                >
                                    <span className={styles.trackNumber}>{idx + 1}</span>
                                    <span className={styles.trackName}>{track.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* make sure audio element is last so it's always in the DOM */}
                <audio ref={audioRef}/>
            </div>
        </div>
    );
}
