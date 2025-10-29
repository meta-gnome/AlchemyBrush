
import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { BrushSettings } from '../types';

interface CanvasProps {
  settings: BrushSettings;
  isMirrored: boolean;
  activeShapes: string[];
}

export interface CanvasHandle {
  clear: () => void;
  download: () => void;
}

export const Canvas = forwardRef<CanvasHandle, CanvasProps>(({ settings, isMirrored, activeShapes }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const shapeCache = useRef<HTMLCanvasElement[]>([]);

  // Expose clear and download methods to parent component
  useImperativeHandle(ref, () => ({
    clear() {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        ctx.fillStyle = '#111827'; // bg-gray-900
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    },
    download() {
      const canvas = canvasRef.current;
      if (canvas) {
        const link = document.createElement('a');
        link.download = 'alchemy-brush-art.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    },
  }));

  // Pre-render shapes when color or active shapes change for performance
  useEffect(() => {
    if (activeShapes.length === 0) {
        shapeCache.current = [];
        return;
    }
    const promises = activeShapes.map(svgString => {
        return new Promise<HTMLCanvasElement>((resolve) => {
            const coloredSvg = svgString.replace(/currentColor/g, settings.color);
            const img = new Image();
            const svgBlob = new Blob([coloredSvg], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);
            
            img.onload = () => {
                const shapeCanvas = document.createElement('canvas');
                const shapeCtx = shapeCanvas.getContext('2d');
                shapeCanvas.width = 100;
                shapeCanvas.height = 100;
                shapeCtx?.drawImage(img, 0, 0, 100, 100);
                URL.revokeObjectURL(url);
                resolve(shapeCanvas);
            };
            img.onerror = (err) => {
                URL.revokeObjectURL(url);
                console.error("SVG shape failed to load", err);
                // Resolve with an empty canvas to not break Promise.all
                resolve(document.createElement('canvas'));
            };
            img.src = url;
        });
    });

    Promise.all(promises).then(canvases => {
        shapeCache.current = canvases.filter(c => c.width > 0);
    });
  }, [settings.color, activeShapes]);


  // Effect for resizing the canvas, runs only once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeObserver = new ResizeObserver(entries => {
      window.requestAnimationFrame(() => {
        if (!Array.isArray(entries) || !entries.length) {
          return;
        }
        const entry = entries[0];
        const { width, height } = entry.contentRect;

        if (canvas.width === width && canvas.height === height) return;
        
        // Preserve drawing
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        if (canvas.width > 0 && canvas.height > 0) {
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;
          tempCtx?.drawImage(canvas, 0, 0);
        }
        
        // Resize
        canvas.width = width;
        canvas.height = height;
        
        // Redraw background and preserved drawing
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, width, height);
        if (tempCanvas.width > 0) {
          ctx.drawImage(tempCanvas, 0, 0);
        }
      });
    });
    
    resizeObserver.observe(parent);

    // Set initial size
    const { width, height } = parent.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, width, height);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Effect for drawing logic and event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const drawShape = (x: number, y: number) => {
      const ctx = canvas.getContext('2d');
      if (!ctx || shapeCache.current.length === 0) return;

      const shapeIndex = Math.floor(Math.random() * shapeCache.current.length);
      const shapeImage = shapeCache.current[shapeIndex];

      if (!shapeImage || shapeImage.width === 0) return;

      const size = Math.random() * settings.size + (settings.size / 5);
      const angle = Math.random() * Math.PI * 2;

      ctx.save();
      ctx.globalAlpha = settings.opacity;
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.drawImage(shapeImage, -size / 2, -size / 2, size, size);
      ctx.restore();
    };
    
    const handleDraw = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (!isDrawing.current) return;

      const rect = canvas.getBoundingClientRect();
      let x: number, y: number;
      if (e instanceof MouseEvent) {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
      } else {
        if (e.touches.length === 0) return;
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
      }
      
      drawShape(x, y);

      if (isMirrored) {
        drawShape(canvas.width - x, y);
      }
    };

    const startDrawing = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      isDrawing.current = true;
      handleDraw(e);
    };

    const stopDrawing = () => {
      isDrawing.current = false;
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', handleDraw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', handleDraw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', handleDraw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', handleDraw);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [settings, isMirrored]); // Re-attach listeners if settings change

  return <canvas ref={canvasRef} className="w-full h-full" />;
});
