"use client";

import { useEffect, useRef } from "react";

interface SegmentationMask {
    color: string;
    opacity: number;
    coordinates: { x: number; y: number }[];
}

interface ImageCanvasProps {
    imageUrl: string;
    segmentationMasks?: SegmentationMask[];
}

export default function ImageCanvas({
    imageUrl,
    segmentationMasks = [],
}: ImageCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const image = imageRef.current;
        if (!canvas || !image) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const drawCanvas = () => {
            // Set canvas size to match image
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw the image
            ctx.drawImage(image, 0, 0);

            // Draw segmentation masks
            segmentationMasks.forEach((mask) => {
                ctx.fillStyle = mask.color;
                ctx.globalAlpha = mask.opacity;

                // Simple polygon fill for demonstration
                if (mask.coordinates.length > 0) {
                    ctx.beginPath();
                    ctx.moveTo(mask.coordinates[0].x, mask.coordinates[0].y);
                    mask.coordinates.forEach((coord) => {
                        ctx.lineTo(coord.x, coord.y);
                    });
                    ctx.closePath();
                    ctx.fill();
                }

                ctx.globalAlpha = 1.0;
            });
        };

        image.onload = drawCanvas;
        if (image.complete) {
            drawCanvas();
        }
    }, [imageUrl, segmentationMasks]);

    return (
        <div className="relative w-full rounded-xl overflow-hidden bg-card">
            <img
                ref={imageRef}
                src={imageUrl}
                alt="Analysis result"
                className="absolute inset-0 w-full h-full object-contain opacity-0"
                crossOrigin="anonymous"
            />
            <canvas
                ref={canvasRef}
                className="w-full h-auto max-h-[400px] object-contain"
            />
        </div>
    );
}
