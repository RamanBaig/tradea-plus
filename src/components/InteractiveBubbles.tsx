import { useEffect, useRef } from 'react';

interface Bubble {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  opacity: number;
  strokeOpacity: number;
  speed: number; // Add this new property
}

export const InteractiveBubbles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubbles = useRef<Bubble[]>([]);
  const mousePos = useRef({ x: 0, y: 0 });
  const requestRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialize bubbles with constant speed
    bubbles.current = Array.from({ length: 10 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 0.5; // Constant speed between 1-1.5
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 20 + Math.random() * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        opacity: 0.05 + Math.random() * 0.1,
        strokeOpacity: 0.2 + Math.random() * 0.3,
        speed // Store original speed
      };
    });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      bubbles.current.forEach(bubble => {
        // Calculate distance from mouse
        const dx = mousePos.current.x - bubble.x;
        const dy = mousePos.current.y - bubble.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Update position
        bubble.x += bubble.vx;
        bubble.y += bubble.vy;

        // Bounce off walls with energy conservation
        if (bubble.x - bubble.size < 0 || bubble.x + bubble.size > canvas.width) {
          bubble.vx = -bubble.vx;
          // Reset position if stuck
          if (bubble.x - bubble.size < 0) bubble.x = bubble.size;
          if (bubble.x + bubble.size > canvas.width) bubble.x = canvas.width - bubble.size;
        }
        if (bubble.y - bubble.size < 0 || bubble.y + bubble.size > canvas.height) {
          bubble.vy = -bubble.vy;
          // Reset position if stuck
          if (bubble.y - bubble.size < 0) bubble.y = bubble.size;
          if (bubble.y + bubble.size > canvas.height) bubble.y = canvas.height - bubble.size;
        }

        // Normalize velocity to maintain constant speed
        const currentSpeed = Math.sqrt(bubble.vx * bubble.vx + bubble.vy * bubble.vy);
        bubble.vx = (bubble.vx / currentSpeed) * bubble.speed;
        bubble.vy = (bubble.vy / currentSpeed) * bubble.speed;

        // Repel from mouse
        if (distance < 100) {
          const angle = Math.atan2(dy, dx);
          const repelForce = (100 - distance) * 0.01;
          bubble.vx -= Math.cos(angle) * repelForce;
          bubble.vy -= Math.sin(angle) * repelForce;
          
          // Re-normalize speed after repulsion
          const newSpeed = Math.sqrt(bubble.vx * bubble.vx + bubble.vy * bubble.vy);
          bubble.vx = (bubble.vx / newSpeed) * bubble.speed;
          bubble.vy = (bubble.vy / newSpeed) * bubble.speed;
        }

        // Draw bubble
        ctx.beginPath();
        // Fill gradient
        const fillGradient = ctx.createRadialGradient(
          bubble.x, bubble.y, 0,
          bubble.x, bubble.y, bubble.size
        );
        fillGradient.addColorStop(0, `rgba(0, 255, 157, ${bubble.opacity})`);
        fillGradient.addColorStop(1, 'rgba(0, 255, 157, 0)');
        
        ctx.fillStyle = fillGradient;
        ctx.strokeStyle = `rgba(0, 255, 157, ${bubble.strokeOpacity})`;
        ctx.lineWidth = 1;
        ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = {
        x: e.clientX,
        y: e.clientY
      };
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
};
