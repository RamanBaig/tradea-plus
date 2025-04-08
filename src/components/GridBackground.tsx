import { useEffect, useRef } from 'react';

export const GridBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    let animationFrame: number;

    const resize = () => {
      const { devicePixelRatio: ratio = 1 } = window;
      canvas.width = window.innerWidth * ratio;
      canvas.height = window.innerHeight * ratio;
      ctx.scale(ratio, ratio);
    };

    const draw = (timestamp: number) => {
      if (!canvas) return;

      const width = window.innerWidth;
      const height = window.innerHeight;
      
      ctx.clearRect(0, 0, width, height);
      
      // Grid settings
      const gridSize = 50;
      const lineWidth = 0.5;
      
      // Time-based animation
      const offset = (timestamp - timeRef.current) / 5000;
      timeRef.current = timestamp;

      // Draw grid
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 255, 157, 0.1)';
      ctx.lineWidth = lineWidth;

      // Vertical lines
      for (let x = 0; x <= width; x += gridSize) {
        const waveOffset = Math.sin(x / 200 + offset) * 2;
        ctx.moveTo(x + waveOffset, 0);
        ctx.lineTo(x + waveOffset, height);
      }

      // Horizontal lines
      for (let y = 0; y <= height; y += gridSize) {
        const waveOffset = Math.cos(y / 200 + offset) * 2;
        ctx.moveTo(0, y + waveOffset);
        ctx.lineTo(width, y + waveOffset);
      }

      ctx.stroke();

      // Add glow effect
      ctx.shadowBlur = 5;
      ctx.shadowColor = 'rgba(0, 255, 157, 0.2)';

      // Intersection points
      for (let x = 0; x <= width; x += gridSize) {
        for (let y = 0; y <= height; y += gridSize) {
          const xOffset = Math.sin(x / 200 + offset) * 2;
          const yOffset = Math.cos(y / 200 + offset) * 2;
          
          ctx.beginPath();
          ctx.fillStyle = 'rgba(0, 255, 157, 0.15)';
          ctx.arc(x + xOffset, y + yOffset, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrame = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    animationFrame = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 bg-transparent"
      style={{
        width: '100vw',
        height: '100vh',
      }}
    />
  );
};
