import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './DroneCursor.css';

interface CursorPosition {
  x: number;
  y: number;
}

interface TrailPoint extends CursorPosition {
  id: number;
  timestamp: number;
}

export const DroneCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLCanvasElement>(null);
  const [isClicking, setIsClicking] = useState(false);
  const [velocity, setVelocity] = useState(0);
  const positionRef = useRef<CursorPosition>({ x: 0, y: 0 });
  const lastPositionRef = useRef<CursorPosition>({ x: 0, y: 0 });
  const trailPointsRef = useRef<TrailPoint[]>([]);

  useEffect(() => {
    const cursor = cursorRef.current;
    const canvas = trailRef.current;
    if (!cursor || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX;
      const newY = e.clientY;

      // Calculate velocity
      const dx = newX - lastPositionRef.current.x;
      const dy = newY - lastPositionRef.current.y;
      const currentVelocity = Math.sqrt(dx * dx + dy * dy);
      setVelocity(currentVelocity);

      lastPositionRef.current = { x: newX, y: newY };
      positionRef.current = { x: newX, y: newY };

      // Animate cursor position
      gsap.to(cursor, {
        x: newX,
        y: newY,
        duration: 0.2,
        ease: 'power2.out'
      });

      // Add trail point
      trailPointsRef.current.push({
        x: newX,
        y: newY,
        id: Date.now(),
        timestamp: Date.now()
      });

      // Limit trail points
      if (trailPointsRef.current.length > 50) {
        trailPointsRef.current.shift();
      }
    };

    // Mouse down handler
    const handleMouseDown = () => {
      setIsClicking(true);
      
      // Create pulse effect
      const pulse = document.createElement('div');
      pulse.className = 'cursor-pulse';
      pulse.style.left = `${positionRef.current.x}px`;
      pulse.style.top = `${positionRef.current.y}px`;
      document.body.appendChild(pulse);

      gsap.to(pulse, {
        scale: 3,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => pulse.remove()
      });

      // Cursor scale animation
      gsap.to(cursor, {
        scale: 0.8,
        duration: 0.1,
        ease: 'power2.out'
      });
    };

    // Mouse up handler
    const handleMouseUp = () => {
      setIsClicking(false);
      gsap.to(cursor, {
        scale: 1,
        duration: 0.2,
        ease: 'elastic.out(1, 0.3)'
      });
    };

    // Animate trail
    const animateTrail = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const now = Date.now();
      trailPointsRef.current = trailPointsRef.current.filter(
        point => now - point.timestamp < 500
      );

      if (trailPointsRef.current.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = '#00f7ff';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        for (let i = 0; i < trailPointsRef.current.length; i++) {
          const point = trailPointsRef.current[i];
          const age = now - point.timestamp;
          const opacity = 1 - (age / 500);
          
          ctx.globalAlpha = opacity * 0.6;
          
          if (i === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        }
        
        ctx.stroke();

        // Add sparks for high velocity
        if (velocity > 5) {
          for (let i = 0; i < Math.min(3, velocity / 10); i++) {
            const lastPoint = trailPointsRef.current[trailPointsRef.current.length - 1];
            if (lastPoint) {
              const angle = Math.random() * Math.PI * 2;
              const distance = Math.random() * 20;
              const sparkX = lastPoint.x + Math.cos(angle) * distance;
              const sparkY = lastPoint.y + Math.sin(angle) * distance;
              
              ctx.beginPath();
              ctx.arc(sparkX, sparkY, 1, 0, Math.PI * 2);
              ctx.fillStyle = '#ff00e5';
              ctx.globalAlpha = Math.random() * 0.5;
              ctx.fill();
            }
          }
        }
      }

      requestAnimationFrame(animateTrail);
    };
    animateTrail();

    // Event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [velocity]);

  return (
    <>
      <canvas
        ref={trailRef}
        className="cursor-trail-canvas"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 9998
        }}
      />
      <div
        ref={cursorRef}
        className={`drone-cursor ${isClicking ? 'clicking' : ''}`}
      >
        <div className="drone-body">
          <div className="drone-core" />
          <div className="drone-ring" />
          <div className="drone-glow" />
        </div>
        <div className="exhaust-container">
          <div className="exhaust-particle" />
          <div className="exhaust-particle" />
          <div className="exhaust-particle" />
        </div>
      </div>
    </>
  );
};
