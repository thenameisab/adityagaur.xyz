'use client';
import { useEffect, useRef } from 'react';

export default function CanvasMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let time = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      // Axiom-style very subtle fine lines
      ctx.strokeStyle = isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.05)';
      ctx.lineWidth = 1;

      // Draw topographic waves
      const lines = 45;
      for (let i = 0; i < lines; i++) {
        ctx.beginPath();
        for (let x = 0; x <= width; x += 20) {
          // Complex sine wave interference pattern for generative look
          const y = (height / 2) 
            + Math.sin(x * 0.002 + time + i * 0.05) * 150 
            + Math.cos(x * 0.005 - time * 0.3 + i * 0.08) * 80
            + (i - lines/2) * 15;
          
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      time += 0.002;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas id="canvas-container" ref={canvasRef} />;
}
