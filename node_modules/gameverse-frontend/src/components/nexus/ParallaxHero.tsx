import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { useSoundEffects } from './SoundSystem';
import './ParallaxHero.css';

interface ParallaxHeroProps {
  game?: {
    title: string;
    description: string;
    image: string;
    videoUrl?: string;
  };
  onPlayClick?: () => void;
}

export const ParallaxHero: React.FC<ParallaxHeroProps> = ({ 
  game = {
    title: 'Enter the Nexus',
    description: 'Connect to infinite gaming universes',
    image: '/hero-character.png'
  },
  onPlayClick 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLDivElement>(null);
  const backgroundLayerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { playClick, playWhoosh } = useSoundEffects();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      
      setMousePosition({ x, y });

      // Parallax effect
      if (characterRef.current) {
        gsap.to(characterRef.current, {
          x: -x * 50,
          y: -y * 30,
          rotationY: x * 15,
          rotationX: -y * 10,
          duration: 0.5,
          ease: 'power2.out'
        });
      }

      if (backgroundLayerRef.current) {
        gsap.to(backgroundLayerRef.current, {
          x: -x * 100,
          y: -y * 60,
          duration: 0.8,
          ease: 'power2.out'
        });
      }

      if (particlesRef.current) {
        gsap.to(particlesRef.current, {
          x: -x * 30,
          y: -y * 20,
          duration: 0.6,
          ease: 'power2.out'
        });
      }
    };

    container.addEventListener('mousemove', handleMouseMove);

    // Character idle animation
    if (characterRef.current) {
      gsap.to(characterRef.current, {
        y: '+=15',
        duration: 3,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true
      });
    }

    // Particle animation
    const particles = particlesRef.current?.querySelectorAll('.hero-particle');
    particles?.forEach((particle, index) => {
      gsap.to(particle, {
        y: `${Math.random() > 0.5 ? '+' : '-'}=${Math.random() * 100 + 50}`,
        x: `${Math.random() > 0.5 ? '+' : '-'}=${Math.random() * 50 + 20}`,
        opacity: Math.random() * 0.5 + 0.3,
        duration: Math.random() * 3 + 2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: index * 0.2
      });
    });

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleButtonHover = () => {
    if (!buttonRef.current) return;

    gsap.to(buttonRef.current, {
      scale: 1.1,
      duration: 0.3,
      ease: 'back.out(2)'
    });

    // Button electricity effect
    const button = buttonRef.current;
    for (let i = 0; i < 3; i++) {
      const spark = document.createElement('div');
      spark.className = 'button-spark';
      button.appendChild(spark);

      const angle = (Math.PI * 2 / 3) * i;
      const distance = 60;
      
      gsap.to(spark, {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => spark.remove()
      });
    }
  };

  const handleButtonLeave = () => {
    if (!buttonRef.current) return;

    gsap.to(buttonRef.current, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const handleButtonClick = () => {
    playClick();
    playWhoosh();

    if (buttonRef.current) {
      // Shockwave effect
      const shockwave = document.createElement('div');
      shockwave.className = 'button-shockwave';
      buttonRef.current.appendChild(shockwave);

      gsap.to(shockwave, {
        scale: 3,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => shockwave.remove()
      });

      // Button press animation
      gsap.to(buttonRef.current, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      });
    }

    onPlayClick?.();
  };

  return (
    <div ref={containerRef} className="parallax-hero">
      {/* Background Layer */}
      <div ref={backgroundLayerRef} className="hero-background-layer">
        <div className="hero-grid-overlay" />
        <div className="hero-gradient-orb orb-1" />
        <div className="hero-gradient-orb orb-2" />
      </div>

      {/* Particles Layer */}
      <div ref={particlesRef} className="hero-particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="hero-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
            }}
          />
        ))}
      </div>

      {/* Character Layer */}
      <div ref={characterRef} className="hero-character">
        <div className="character-glow" />
        <div className="character-image-container">
          {game.image && (
            <img 
              src={game.image} 
              alt={game.title}
              className="character-image"
              onError={(e) => {
                // Fallback to gradient if image fails
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          {/* Fallback gradient character */}
          <div className="character-fallback">
            <div className="character-silhouette" />
          </div>
        </div>
        <div className="character-particles">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="character-particle" />
          ))}
        </div>
      </div>

      {/* Content Layer */}
      <div className="hero-content">
        <div className="hero-title-container">
          <h1 className="hero-title">
            {game.title.split('').map((char, i) => (
              <span 
                key={i} 
                className="hero-title-char"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h1>
          <div className="hero-title-glow" />
        </div>

        <p className="hero-description">{game.description}</p>

        <button
          ref={buttonRef}
          className="hero-cta-button"
          onMouseEnter={handleButtonHover}
          onMouseLeave={handleButtonLeave}
          onClick={handleButtonClick}
        >
          <span className="button-text">PLAY NOW</span>
          <div className="button-border" />
          <div className="button-glow" />
        </button>
      </div>

      {/* Scanlines effect */}
      <div className="hero-scanlines" />
    </div>
  );
};
