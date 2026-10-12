'use client';

import {useChapterAccess, useFailed} from "@/hooks";
import {specialVXText} from "@/lib/client/data/chapters/V&X";
import {ChapterTemplateProps} from "@/types";
import {useEffect, useRef} from "react";
import styles from "@/styles/ChaptersXandV.module.css";
import {chapter} from "@/lib/client/data/chapters";

export function ChapterTemplate({chapterId, chapterData, redirectLink}: ChapterTemplateProps) {
    const {isCurrentlySolved} = useChapterAccess();
    const isAllFailed = useFailed(chapterId);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const VioletLeafCount = 350;
        const VioletEmberCount = 200;

        class VioletLeaf {
            x = 0;
            height = 0;
            amplitude = 0;
            frequency = 0;
            phase = 0;
            swayOffset = 0;

            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * width;
                this.height = 100 + Math.random() * 200;
                this.amplitude = 20 + Math.random() * 30;
                this.frequency = 0.02 + Math.random() * 0.04;
                this.phase = Math.random() * Math.PI * 2;
                this.swayOffset = Math.random() * Math.PI * 2;
            }

            draw(ctx: CanvasRenderingContext2D, time: number) {
                const yBase = height;
                ctx.beginPath();
                ctx.moveTo(this.x, yBase);

                const steps = 25;
                for (let i = 0; i <= steps; i++) {
                    const t = i / steps;
                    const y = yBase - t * this.height;
                    const sway = Math.sin(t * Math.PI * 2 + time * this.frequency + this.phase) * this.amplitude;
                    const curve = Math.sin(time * 0.01 + this.swayOffset) * 5;
                    ctx.lineTo(this.x + sway + curve, y);
                }

                const grad = ctx.createLinearGradient(this.x, yBase - this.height, this.x, yBase);
                grad.addColorStop(0, "rgba(138,43,226,0.9)");
                grad.addColorStop(0.3, "rgba(75,0,130,0.6)");
                grad.addColorStop(0.7, "rgba(25,0,50,0.3)");
                grad.addColorStop(1, "rgba(0,0,0,0)");
                ctx.fillStyle = grad;
                ctx.fill();
            }
        }

        class VioletEmber {
            x = 0;
            y = 0;
            size = 1;
            speedY = 0;
            alpha = 0;

            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * width;
                this.y = height + Math.random() * 100;
                this.size = 1 + Math.random() * 3;
                this.speedY = -0.2 - Math.random() * 0.5;
                this.alpha = 0.1 + Math.random() * 0.2;
            }

            draw(ctx: CanvasRenderingContext2D) {
                ctx.fillStyle = `rgba(138,43,226,${this.alpha})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                this.y += this.speedY;
                if (this.y < -10) this.reset();
            }
        }

        const VioletLeafs = Array.from({length: VioletLeafCount}, () => new VioletLeaf());
        const VioletEmbers = Array.from({length: VioletEmberCount}, () => new VioletEmber());

        function animate(time: number) {
            ctx!.clearRect(0, 0, width, height);
            ctx!.fillStyle = "rgba(0,0,0,0.25)";
            ctx!.fillRect(0, 0, width, height);

            const t = time * 0.002;
            for (const leaf of VioletLeafs) leaf.draw(ctx!, t);
            for (const ember of VioletEmbers) ember.draw(ctx!);
            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", resize);
        return () => window.removeEventListener("resize", resize);
    }, []);

    const VioletCanvas = <canvas ref={canvasRef} className={styles.canvas}/>;

    if (isCurrentlySolved === null) {
        return (
            <div className={styles.container}>
                {VioletCanvas}
                <div className={styles.loadingWrapper}>
                    <div className={styles.loadingText}>
                        {chapter.loading}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {VioletCanvas}
            <div className={styles.content}>
                <h1 className={styles.header}>{chapterData.text.header}</h1>
                <p className={styles.subHeader}>{chapterData.text.subHeader}</p>
                <p className={styles.quote}>{specialVXText.quote}</p>

                <div style={{marginTop: "3rem"}}>
                    <a
                        href={redirectLink}
                        aria-label="See Me"
                        className={styles.downloadButton}
                    >
                        <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14m7-7H5"/>
                        </svg>
                        <span>{specialVXText.narrator}</span>
                    </a>
                </div>

                {!isCurrentlySolved && !isAllFailed && (
                    <div className={styles.reminder}>
                        <p className={styles.reminderText}>{chapterData.text.questReminder}</p>
                        <p className={styles.reminderSub}>{specialVXText.reminderSub}</p>
                    </div>
                )}

                {isAllFailed && (
                    <div className={styles.failedSection}>
                        <p className={styles.failedTitle}>{specialVXText.failedTitle}</p>
                        <p className={styles.failedText}>{specialVXText.failedText}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
