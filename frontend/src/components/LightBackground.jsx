// components/LightBackground.jsx
import React, { useEffect, useRef } from 'react';

const LightBackground = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;

    const particles = [];
    const numParticles = 15;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const createParticle = () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 80 + 40,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.3 + 0.1,
      hue: Math.random() * 10 + 55, // Pure yellow range (55-65)
    });

    const initParticles = () => {
      particles.length = 0;
      for (let i = 0; i < numParticles; i++) {
        particles.push(createParticle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((particle) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Bounce off edges
        if (particle.x <= 0 || particle.x >= width) particle.speedX *= -1;
        if (particle.y <= 0 || particle.y >= height) particle.speedY *= -1;

        // Keep particles in bounds
        particle.x = Math.max(0, Math.min(width, particle.x));
        particle.y = Math.max(0, Math.min(height, particle.y));

        // Create gradient
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size
        );
        
        gradient.addColorStop(0, `hsla(${particle.hue}, 40%, 75%, ${particle.opacity})`);
        gradient.addColorStop(0.5, `hsla(${particle.hue}, 30%, 65%, ${particle.opacity * 0.6})`);
        gradient.addColorStop(1, `hsla(${particle.hue}, 20%, 55%, 0)`);

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    resize();
    initParticles();
    animate();

    window.addEventListener('resize', () => {
      resize();
      initParticles();
    });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ 
        background: 'linear-gradient(135deg, #FEF3C7 0%, #FCD34D 50%, #F59E0B 100%)',
        opacity: 0.6
      }}
    />
  );
};

export default LightBackground;