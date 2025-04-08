import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  twinkleSpeed: number;
  brightness: number;
}

interface Planet {
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
  glowColor: string;
  rotation: number;
  rotationSpeed: number;
}

interface Asteroid {
  x: number;
  y: number;
  size: number;
  speed: number;
  angle: number;
  rotationSpeed: number;
  rotation: number;
}

export const SpaceBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use higher resolution for sharper rendering
    const scale = window.devicePixelRatio || 1;
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth * scale;
      canvas.height = window.innerHeight * scale;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    updateCanvasSize();

    const ctx = canvas.getContext('2d', {
      alpha: false,
      willReadFrequently: false
    });
    if (!ctx) return;

    // Scale all drawing operations
    ctx.scale(scale, scale);

    const handleResize = () => {
      updateCanvasSize();
      ctx.scale(scale, scale);
    };

    window.addEventListener('resize', handleResize);

    // Adjust object counts and sizes for better visuals
    const stars: Star[] = Array.from({ length: 100 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 0.3 + Math.random() * 1, // Smaller stars
      twinkleSpeed: 0.0003 + Math.random() * 0.0005, // Slower twinkling
      brightness: Math.random()
    }));

    // Reduce planets and make them more subtle
    const planets: Planet[] = Array.from({ length: 1 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 20 + Math.random() * 15,
      speed: 0.0005 + Math.random() * 0.001,
      color: `hsla(${210 + Math.random() * 40}, 70%, 50%, 0.15)`, // Blue-ish tones
      glowColor: `hsla(${210 + Math.random() * 40}, 70%, 60%, 0.1)`,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.0001
    }));

    // Reduce asteroids and make them more subtle
    const asteroids: Asteroid[] = Array.from({ length: 3 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 1 + Math.random() * 2,
      speed: 0.002 + Math.random() * 0.004,
      angle: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.0005,
      rotation: Math.random() * Math.PI * 2
    }));

    let lastTime = 0;
    const animate = (timestamp: number) => {
      const deltaTime = timestamp - lastTime;
      if (deltaTime < 16.67) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      lastTime = timestamp;

      // Create a gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
      gradient.addColorStop(0, '#0f172a'); // Darker blue at top
      gradient.addColorStop(1, '#1e293b'); // Lighter blue at bottom
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      // Draw stars with improved visual effect
      ctx.save();
      stars.forEach(star => {
        star.brightness += star.twinkleSpeed;
        if (star.brightness > 1 || star.brightness < 0) star.twinkleSpeed *= -1;
        
        const alpha = 0.2 + star.brightness * 0.4; // More subtle stars
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Add subtle glow to brighter stars
        if (star.brightness > 0.8) {
          const glow = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, star.size * 4
          );
          glow.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.2})`);
          glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.restore();

      // Draw planets with simplified effects
      planets.forEach(planet => {
        planet.x += planet.speed;
        if (planet.x > canvas.width + planet.size) planet.x = -planet.size;

        ctx.save();
        ctx.translate(planet.x, planet.y);
        ctx.rotate(planet.rotation);
        ctx.fillStyle = planet.color;
        ctx.beginPath();
        ctx.arc(0, 0, planet.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw asteroids with simplified rendering
      ctx.fillStyle = '#8b8b8b';
      asteroids.forEach(asteroid => {
        asteroid.x += Math.cos(asteroid.angle) * asteroid.speed;
        asteroid.y += Math.sin(asteroid.angle) * asteroid.speed;

        if (asteroid.x < -asteroid.size) asteroid.x = canvas.width + asteroid.size;
        if (asteroid.x > canvas.width + asteroid.size) asteroid.x = -asteroid.size;
        if (asteroid.y < -asteroid.size) asteroid.y = canvas.height + asteroid.size;
        if (asteroid.y > canvas.height + asteroid.size) asteroid.y = -asteroid.size;

        ctx.save();
        ctx.translate(asteroid.x, asteroid.y);
        ctx.rotate(asteroid.rotation);
        ctx.beginPath();
        ctx.moveTo(-asteroid.size, 0);
        ctx.lineTo(-asteroid.size/2, -asteroid.size);
        ctx.lineTo(asteroid.size/2, -asteroid.size/2);
        ctx.lineTo(asteroid.size, 0);
        ctx.lineTo(asteroid.size/2, asteroid.size/2);
        ctx.lineTo(-asteroid.size/2, asteroid.size);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 w-full h-full bg-gradient-to-b from-[#0f172a] to-[#1e293b] z-0" />
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full"
        style={{
          backgroundColor: 'transparent',
          imageRendering: 'auto',
          zIndex: 1,
          transform: 'translateZ(0)',
          willChange: 'transform',
          mixBlendMode: 'screen'
        }}
      />
      {/* Add subtle gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-t from-[#0f172a]/50 to-transparent pointer-events-none z-[2]" />
    </>
  );
};