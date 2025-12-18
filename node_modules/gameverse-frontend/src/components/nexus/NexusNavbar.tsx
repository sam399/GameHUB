import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { useAuth } from '../../contexts/AuthContext';
import { reviewService } from '../../services/reviewService';
import Notifications from '../notifications/Notifications';
import ThemeToggle from '../common/ThemeToggle';
import { useSoundEffects } from '../nexus/SoundSystem';
import './NexusNavbar.css';

interface NavLinkData {
  to: string;
  label: string;
  icon?: string;
  requiresAuth?: boolean;
  badge?: number;
}

const NexusNavbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [activeLink, setActiveLink] = useState<string>('');
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const { user, logout } = useAuth();
  const { playHover, playClick } = useSoundEffects();
  const [myReviewsCount, setMyReviewsCount] = useState<number | null>(null);

  useEffect(() => {
    setActiveLink(window.location.pathname);
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadCount = async () => {
      if (!user) {
        setMyReviewsCount(null);
        return;
      }
      try {
        const resp = await reviewService.getUserReviews();
        if (!mounted) return;
        setMyReviewsCount(resp.data.reviews.length);
      } catch (err) {
        console.warn('Failed to load user reviews count', err);
      }
    };

    loadCount();
    return () => { mounted = false; };
  }, [user]);

  const close = () => setOpen(false);

  const handleLogout = async () => {
    playClick();
    try {
      await logout();
    } finally {
      close();
    }
  };

  const handleLinkHover = (e: React.MouseEvent<HTMLAnchorElement>) => {
    playHover();
    
    const target = e.currentTarget;
    const icon = target.querySelector('.nav-link-icon');
    
    if (icon) {
      gsap.to(icon, {
        x: 5,
        duration: 0.3,
        ease: 'power2.out'
      });
    }

    // Scanline effect
    const scanline = target.querySelector('.nav-link-scanline');
    if (scanline) {
      gsap.fromTo(scanline,
        { x: '-100%' },
        { x: '200%', duration: 0.6, ease: 'power2.out' }
      );
    }
  };

  const handleLinkLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    const icon = target.querySelector('.nav-link-icon');
    
    if (icon) {
      gsap.to(icon, {
        x: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  };

  const handleLinkClick = (path: string) => {
    playClick();
    setActiveLink(path);
    close();
  };

  const navLinks: NavLinkData[] = [
    { to: '/', label: 'Home', icon: '🏠' },
    { to: '/games', label: 'Library', icon: '🎮' },
    { to: '/feed', label: 'Feed', icon: '📰' },
    ...(user ? [
      { to: '/forum', label: 'Forum', icon: '💬' },
      { to: '/reviews', label: 'My Reviews', icon: '⭐', badge: myReviewsCount || undefined }
    ] : [])
  ];

  if (user && ['admin', 'moderator'].includes(user.role)) {
    navLinks.push({ to: '/admin/dashboard', label: 'Admin', icon: '🛡️' });
  }

  return (
    <header className="nexus-navbar">
      <div className="navbar-background-effect" />
      <div className="navbar-scanline" />
      
      <div className="navbar-container">
        {/* Logo */}
        <Link 
          to="/" 
          className="nexus-brand"
          onClick={() => handleLinkClick('/')}
          onMouseEnter={() => playHover()}
        >
          <div className="brand-logo">
            <span className="logo-icon">🎮</span>
            <div className="logo-glow" />
          </div>
          <div className="brand-text-container">
            <span className="brand-text">
              {'GameVerse'.split('').map((char, i) => (
                <span key={i} className="brand-char" style={{ animationDelay: `${i * 0.05}s` }}>
                  {char}
                </span>
              ))}
            </span>
            <div className="brand-underline" />
          </div>
        </Link>

        {/* Mobile toggle */}
        <button
          ref={toggleRef}
          className={`nexus-nav-toggle ${open ? 'open' : ''}`}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => {
            playClick();
            setOpen((s) => !s);
          }}
        >
          <span className="toggle-line" />
          <span className="toggle-line" />
          <span className="toggle-line" />
          <div className="toggle-glow" />
        </button>

        {/* Navigation */}
        <nav ref={navRef} className={`nexus-nav-links ${open ? 'open' : ''}`}>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nexus-nav-link ${activeLink === link.to ? 'active' : ''}`}
              onClick={() => handleLinkClick(link.to)}
              onMouseEnter={handleLinkHover}
              onMouseLeave={handleLinkLeave}
            >
              {link.icon && <span className="nav-link-icon">{link.icon}</span>}
              <span className="nav-link-text">{link.label}</span>
              {link.badge !== undefined && link.badge > 0 && (
                <span className="nav-link-badge">{link.badge}</span>
              )}
              <div className="nav-link-scanline" />
              <div className="nav-link-glow" />
            </Link>
          ))}

          {/* Auth actions */}
          {!user ? (
            <Link
              to="/login"
              className="nexus-nav-link nexus-auth-link"
              onClick={() => handleLinkClick('/login')}
              onMouseEnter={handleLinkHover}
              onMouseLeave={handleLinkLeave}
            >
              <span className="nav-link-icon">🎮</span>
              <span className="nav-link-text">Resume Game</span>
              <div className="nav-link-scanline" />
              <div className="nav-link-glow" />
            </Link>
          ) : (
            <>
              {/* Notifications */}
              <div className="nexus-notifications-wrapper">
                <Notifications />
              </div>

              {/* User Menu */}
              <div className="nexus-user-menu">
                <button 
                  className="user-avatar-btn"
                  onMouseEnter={() => playHover()}
                >
                  {user.profile?.avatar ? (
                    <img src={user.profile.avatar} alt={user.username} className="user-avatar" />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="avatar-ring" />
                  <div className="avatar-glow" />
                </button>
                
                <div className="user-dropdown">
                  <Link 
                    to="/profile" 
                    className="dropdown-item"
                    onClick={() => handleLinkClick('/profile')}
                    onMouseEnter={() => playHover()}
                  >
                    <span className="dropdown-icon">📊</span>
                    <span>Character Sheet</span>
                  </Link>
                  <Link 
                    to="/reviews" 
                    className="dropdown-item"
                    onClick={() => handleLinkClick('/reviews')}
                    onMouseEnter={() => playHover()}
                  >
                    <span className="dropdown-icon">⭐</span>
                    <span>My Reviews</span>
                  </Link>
                  <button 
                    className="dropdown-item" 
                    onClick={handleLogout}
                    onMouseEnter={() => playHover()}
                  >
                    <span className="dropdown-icon">🚪</span>
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Theme Toggle */}
          <div className="nexus-theme-toggle">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
};

export default NexusNavbar;
