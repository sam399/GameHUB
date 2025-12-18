import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { Game } from '../../types';
import { useSoundEffects } from '../nexus/SoundSystem';
import './NexusGameCard.css';

interface NexusGameCardProps {
  game: Game;
}

export const NexusGameCard: React.FC<NexusGameCardProps> = ({ game }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const { playHover } = useSoundEffects();

  // Generate video URL from game data if available
  const videoUrl = game.trailerUrl || game.videoUrl || null;

  useEffect(() => {
    if (isHovered && videoUrl && videoRef.current) {
      // Preload video
      videoRef.current.load();
    }
  }, [isHovered, videoUrl]);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovered(true);
    playHover();

    if (!cardRef.current) return;

    // Scale and lift card
    gsap.to(cardRef.current, {
      scale: 1.1,
      z: 50,
      rotationY: 0,
      duration: 0.4,
      ease: 'back.out(1.5)'
    });

    // Glow effect
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        opacity: 1,
        scale: 1.2,
        duration: 0.4
      });
    }

    // Play video if available
    if (videoUrl && videoRef.current && videoLoaded) {
      videoRef.current.play().catch(() => {
        // Ignore autoplay errors
      });
      
      gsap.to(videoRef.current, {
        opacity: 1,
        duration: 0.3
      });
      
      if (imageRef.current) {
        gsap.to(imageRef.current, {
          opacity: 0,
          duration: 0.3
        });
      }
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);

    if (!cardRef.current) return;

    gsap.to(cardRef.current, {
      scale: 1,
      z: 0,
      rotationY: -5,
      duration: 0.4,
      ease: 'power2.out'
    });

    if (glowRef.current) {
      gsap.to(glowRef.current, {
        opacity: 0,
        scale: 1,
        duration: 0.4
      });
    }

    // Stop and reset video
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      
      gsap.to(videoRef.current, {
        opacity: 0,
        duration: 0.2
      });
    }

    if (imageRef.current) {
      gsap.to(imageRef.current, {
        opacity: 1,
        duration: 0.2
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isHovered) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    gsap.to(cardRef.current, {
      rotationY: x * 10,
      rotationX: -y * 10,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const formatPrice = (price?: number, isFree?: boolean) => {
    if (isFree || !price) return 'Free';
    return `$${price.toFixed(2)}`;
  };

  const renderRating = (rating?: number | { average: number; count: number }) => {
    const ratingValue = typeof rating === 'object' ? rating.average : (rating || 0);
    return '★'.repeat(Math.round(ratingValue)) + '☆'.repeat(5 - Math.round(ratingValue));
  };

  // Determine game's brand color for glow
  const brandColor = game.brandColor || '#00f7ff';

  return (
    <div 
      ref={cardRef}
      className="nexus-game-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{ '--brand-color': brandColor } as React.CSSProperties}
    >
      <Link to={`/games/${game._id}`} className="card-link">
        <div className="card-media-container">
          {/* Glow effect */}
          <div ref={glowRef} className="card-glow" />
          
          {/* Static image */}
          <img 
            ref={imageRef}
            src={game.images?.cover || '/placeholder-game.jpg'} 
            alt={game.title}
            className="card-image"
          />
          
          {/* Video overlay (if available) */}
          {videoUrl && (
            <video
              ref={videoRef}
              className="card-video"
              loop
              muted
              playsInline
              onLoadedData={() => setVideoLoaded(true)}
            >
              <source src={videoUrl} type="video/mp4" />
              <source src={videoUrl.replace('.mp4', '.webm')} type="video/webm" />
            </video>
          )}

          {/* Holographic overlay */}
          <div className="card-holographic-overlay" />
          
          {/* Scan line effect */}
          <div className="card-scanline" />

          {game.featured && (
            <div className="featured-badge-nexus">
              <span>FEATURED</span>
              <div className="badge-glow" />
            </div>
          )}
        </div>
        
        <div className="card-content">
          <div className="card-header">
            <h3 className="card-title">
              {game.title.split('').map((char, i) => (
                <span 
                  key={i} 
                  className="title-char"
                  style={{ animationDelay: `${i * 0.02}s` }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </h3>
            <div className="title-underline" />
          </div>
          
          <p className="card-developer">{game.developer}</p>
          
          <div className="card-genres">
            {game.genre.slice(0, 2).map((genre, index) => (
              <span key={index} className="genre-tag-nexus">
                <span className="tag-border" />
                <span className="tag-text">{genre}</span>
                <span className="tag-glow" />
              </span>
            ))}
          </div>
          
          <div className="card-platforms">
            {game.platforms.slice(0, 3).map((platform, index) => (
              <span key={index} className="platform-icon-nexus" title={platform}>
                {platform.slice(0, 3).toUpperCase()}
              </span>
            ))}
          </div>
          
          <div className="card-footer">
            <div className="card-rating">
              <span className="stars-nexus">{renderRating(game.rating)}</span>
              <span className="rating-count">({typeof game.rating === 'object' ? game.rating.count : 0})</span>
            </div>
            <div className="card-price">
              <span className="price-value">{formatPrice(game.price, game.isFree)}</span>
              <div className="price-glow" />
            </div>
          </div>
        </div>

        {/* Border effect */}
        <div className="card-border-effect" />
      </Link>
    </div>
  );
};
