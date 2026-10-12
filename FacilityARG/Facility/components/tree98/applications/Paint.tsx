import React, {useEffect, useRef, useState} from 'react';
import {Tool} from "@/types";


export const Paint: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentColor, setCurrentColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(2);
    const [tool, setTool] = useState<Tool>('brush');
    const [startPos, setStartPos] = useState<{ x: number, y: number } | null>(null);

    // Helper to get mouse position relative to canvas
    const getPos = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return {x: 0, y: 0};
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    // Draw preview shapes on overlay canvas
    const drawPreview = (start: { x: number, y: number }, end: { x: number, y: number }) => {
        const overlay = overlayRef.current;
        if (!overlay) return;
        const ctx = overlay.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, overlay.width, overlay.height);
        ctx.save();
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = brushSize;
        ctx.setLineDash([4, 2]);
        if (tool === 'line') {
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        } else if (tool === 'rectangle') {
            ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
        } else if (tool === 'square') {
            const size = Math.max(Math.abs(end.x - start.x), Math.abs(end.y - start.y));
            const width = end.x > start.x ? size : -size;
            const height = end.y > start.y ? size : -size;
            ctx.strokeRect(start.x, start.y, width, height);
        } else if (tool === 'circle') {
            const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
            ctx.beginPath();
            ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
            ctx.stroke();
        }
        ctx.restore();
    };

    // Clear overlay canvas
    const clearOverlay = () => {
        const overlay = overlayRef.current;
        if (!overlay) return;
        const ctx = overlay.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, overlay.width, overlay.height);
    };

    useEffect(() => {
        const resizeCanvas = () => {
            const canvas = canvasRef.current;
            const overlay = overlayRef.current;
            if (canvas && overlay) {
                const parent = canvas.parentElement;
                if (parent) {
                    const rect = parent.getBoundingClientRect();
                    canvas.width = rect.width;
                    canvas.height = rect.height;
                    overlay.width = rect.width;
                    overlay.height = rect.height;
                }
            }
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    const startDrawing = (e: React.MouseEvent) => {
        const pos = getPos(e);
        if (tool === 'brush') {
            setIsDrawing(true);
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.strokeStyle = currentColor;
                    ctx.lineWidth = brushSize;
                    ctx.lineCap = 'round';
                    ctx.beginPath();
                    ctx.moveTo(pos.x, pos.y);
                }
            }
        } else {
            setIsDrawing(true);
            setStartPos(pos);
        }
    };

    const uploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const canvas = canvasRef.current;
        const file = e.target.files?.[0];
        if (canvas && file) {
            const ctx = canvas.getContext('2d');
            const reader = new FileReader();
            reader.onload = () => {
                const img = new window.Image();
                img.onload = () => {
                    if (ctx) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    }
                };
                img.src = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const draw = (e: React.MouseEvent) => {
        if (!isDrawing) return;
        const pos = getPos(e);
        if (tool === 'brush') {
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.lineTo(pos.x, pos.y);
                    ctx.stroke();
                }
            }
        } else if (
            (tool === 'line' || tool === 'rectangle' || tool === 'square' || tool === 'circle') &&
            startPos
        ) {
            drawPreview(startPos, pos);
        }
    };

    const endDrawing = (e: React.MouseEvent) => {
        if (!isDrawing) return;
        setIsDrawing(false);
        const pos = getPos(e);
        if (tool === 'brush') {
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.closePath();
                }
            }
        } else if (startPos) {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.save();
            ctx.strokeStyle = currentColor;
            ctx.lineWidth = brushSize;
            ctx.setLineDash([]);
            if (tool === 'line') {
                ctx.beginPath();
                ctx.moveTo(startPos.x, startPos.y);
                ctx.lineTo(pos.x, pos.y);
                ctx.stroke();
            } else if (tool === 'rectangle') {
                ctx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
            } else if (tool === 'square') {
                const size = Math.max(Math.abs(pos.x - startPos.x), Math.abs(pos.y - startPos.y));
                const width = pos.x > startPos.x ? size : -size;
                const height = pos.y > startPos.y ? size : -size;
                ctx.strokeRect(startPos.x, startPos.y, width, height);
            } else if (tool === 'circle') {
                const radius = Math.sqrt(Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2));
                ctx.beginPath();
                ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
                ctx.stroke();
            }
            ctx.restore();
            clearOverlay();
        }
        setStartPos(null);
    };

    // Simple flood fill
    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    const saveImage = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const link = document.createElement('a');
            link.download = 'painting.png';
            link.href = canvas.toDataURL();
            link.click();
        }
    };

    useEffect(() => {
        clearOverlay();
    }, [tool]);

    const colors = ['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff'];

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="border-b p-1 text-xs bg-gray-100 flex gap-4">
                <button onClick={clearCanvas} className="hover:bg-gray-200 px-2 py-1">Clear</button>
                <button onClick={saveImage} className="hover:bg-gray-200 px-2 py-1">Save</button>
                <label className="hover:bg-gray-200 px-2 py-1 cursor-pointer">
                    Upload
                    <input
                        type="file"
                        accept="image/*"
                        onChange={uploadImage}
                        style={{display: 'none'}}
                    />
                </label>
            </div>
            <div className="flex flex-1">
                <div className="w-24 border-r p-2 bg-gray-100 flex flex-col gap-4">
                    {/* Tool Sidebar */}
                    <div>
                        <div className="text-xs mb-2">Tools:</div>
                        <div className="flex flex-col gap-2">
                            <button
                                className={`px-2 py-1 rounded ${tool === 'brush' ? 'bg-blue-200' : ''}`}
                                onClick={() => setTool('brush')}
                            >Brush
                            </button>
                            <button
                                className={`px-2 py-1 rounded ${tool === 'line' ? 'bg-blue-200' : ''}`}
                                onClick={() => setTool('line')}
                            >Line
                            </button>
                            <button
                                className={`px-2 py-1 rounded ${tool === 'rectangle' ? 'bg-blue-200' : ''}`}
                                onClick={() => setTool('rectangle')}
                            >Rectangle
                            </button>
                            <button
                                className={`px-2 py-1 rounded ${tool === 'square' ? 'bg-blue-200' : ''}`}
                                onClick={() => setTool('square')}
                            >Square
                            </button>
                            <button
                                className={`px-2 py-1 rounded ${tool === 'circle' ? 'bg-blue-200' : ''}`}
                                onClick={() => setTool('circle')}
                            >Circle
                            </button>
                        </div>
                    </div>
                    <div>
                        <div className="text-xs mb-2">Colors:</div>
                        <div className="grid grid-cols-2 gap-1">
                            {colors.map(color => (
                                <div
                                    key={color}
                                    className={`w-6 h-6 border cursor-pointer ${currentColor === color ? 'border-2 border-black' : ''}`}
                                    style={{backgroundColor: color}}
                                    onClick={() => setCurrentColor(color)}
                                />
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs mb-2">Brush:</div>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={brushSize}
                            onChange={(e) => setBrushSize(Number(e.target.value))}
                            className="w-full"
                        />
                        <div className="text-xs text-center">{brushSize}px</div>
                    </div>
                </div>
                <div className="flex-1 p-2 relative">
                    <canvas
                        ref={canvasRef}
                        width={500}
                        height={350}
                        className="border bg-white cursor-crosshair absolute top-0 left-0"
                        style={{zIndex: 1}}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={endDrawing}
                        onMouseLeave={endDrawing}
                    />
                    <canvas
                        ref={overlayRef}
                        width={500}
                        height={350}
                        className="absolute top-0 left-0 pointer-events-none"
                        style={{zIndex: 2}}
                    />
                </div>
            </div>
        </div>
    );
};
