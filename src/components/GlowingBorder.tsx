import { useEffect, useRef } from 'react';

export const GlowingBorder = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const progressRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      const { innerWidth, innerHeight, devicePixelRatio = 1 } = window;
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
      canvas.width = Math.floor(innerWidth * devicePixelRatio);
      canvas.height = Math.floor(innerHeight * devicePixelRatio);
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };

    const drawBorder = (timestamp: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = window.innerWidth;
      const height = window.innerHeight;
      const progress = (timestamp * 0.0001) % 1; // Reduced from 0.00015 to 0.0001 for slower speed
      progressRef.current = progress;

      // Enhanced static border with even stronger glow
      ctx.strokeStyle = 'rgba(0, 255, 157, 0.6)'; // Higher opacity
      ctx.lineWidth = 3; // Even thicker line
      ctx.shadowColor = 'rgba(0, 255, 157, 0.8)'; // Higher glow opacity
      ctx.shadowBlur = 25; // Larger glow spread
      ctx.strokeRect(0, 0, width, height);

      // Calculate beam position
      const perimeter = 2 * (width + height);
      const distance = progress * perimeter;
      const beamLength = 250; // Longer beam

      // Enhanced traveling beam with maximum values
      ctx.strokeStyle = 'rgba(0, 255, 157, 1)'; // Full opacity
      ctx.shadowColor = 'rgba(0, 255, 157, 1)'; // Full glow opacity
      ctx.shadowBlur = 30; // Maximum glow spread
      ctx.lineWidth = 4; // Much thicker line
      ctx.lineCap = 'round';

      ctx.beginPath();
      let start, end;

      if (distance < width) {
        // Top edge
        start = { x: distance, y: 0 };
        end = { x: Math.min(distance + beamLength, width), y: 0 };
      } else if (distance < width + height) {
        // Right edge
        const d = distance - width;
        start = { x: width, y: d };
        end = { x: width, y: Math.min(d + beamLength, height) };
      } else if (distance < 2 * width + height) {
        // Bottom edge
        const d = distance - (width + height);
        start = { x: width - d, y: height };
        end = { x: Math.max(width - (d + beamLength), 0), y: height };
      } else {
        // Left edge
        const d = distance - (2 * width + height);
        start = { x: 0, y: height - d };
        end = { x: 0, y: Math.max(height - (d + beamLength), 0) };
      }

      // Enhanced beam gradient
      const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
      gradient.addColorStop(0, 'rgba(0, 255, 157, 0)');
      gradient.addColorStop(0.5, 'rgba(0, 255, 157, 1)'); // Full opacity at center
      gradient.addColorStop(1, 'rgba(0, 255, 157, 0)');
      ctx.strokeStyle = gradient;

      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      animationRef.current = requestAnimationFrame(drawBorder);
    };

    resize();
    window.addEventListener('resize', resize);
    animationRef.current = requestAnimationFrame(drawBorder);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 1,
        width: '100vw',
        height: '100vh',
      }}
    />
  );
};
