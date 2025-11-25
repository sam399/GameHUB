import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { reviewService } from '../services/reviewService';
import Notifications from './notifications/Notifications';

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const { user, logout } = useAuth();

  const close = () => setOpen(false);
  const [myReviewsCount, setMyReviewsCount] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;

    const navEl = navRef.current;
    if (!navEl) return;

    const focusable = Array.from(
      navEl.querySelectorAll<HTMLElement>('a, button, [tabindex]:not([tabindex="-1"])')
    ).filter((el) => !el.hasAttribute('disabled'));

    // focus first element when opened
    focusable[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }

      if (e.key === 'Tab') {
        // focus trap
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

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

  // close menu when navigating (for links that call close)
  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      close();
    }
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner" style={{ position: 'relative' }}>
        <Link to="/" className="brand" onClick={close}>
          <span className="logo">🎮</span>
          <span className="brand-text">GameVerse</span>
        </Link>

        <button
          ref={toggleRef}
          className={`nav-toggle ${open ? 'open' : ''}`}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen((s) => !s)}
        >
          <span className="hamburger" />
        </button>

        <nav ref={navRef} className={`nav-links ${open ? 'open' : ''}`} role="navigation">
          <Link to="/" className="nav-link" onClick={close}>Library</Link>
          <Link to="/featured" className="nav-link" onClick={close}>Featured</Link>
          {user ? (
            <>
              <Link to="/forum" className="nav-link" onClick={close}>Forum</Link>
              <Link to="/reviews" className="nav-link" onClick={close}>
                My Reviews {typeof myReviewsCount === 'number' && (
                  <span className="badge">{myReviewsCount}</span>
                )}
              </Link>
              {user && ['admin', 'moderator'].includes(user.role) && (
                <Link to="/admin/dashboard" className="nav-link" onClick={close}>Admin</Link>
              )}
              <div style={{ display: 'inline-flex', alignItems: 'center', marginLeft: 10 }}>
                <Notifications />
              </div>
            </>
          ) : (
            <Link to="/login" className="nav-link small-muted" onClick={close}>Login</Link>
          )}

          {/* Desktop user menu (avatar + dropdown) */}
          {user && (
            <div className="user-menu">
              <button className="user-avatar-btn" aria-haspopup="true" aria-expanded={open} onClick={() => setOpen((s) => !s)}>
                {user.profile?.avatar ? (
                  <img src={user.profile.avatar} alt={user.username} className="user-avatar" />
                ) : (
                  <div className="avatar-placeholder">{user.username.charAt(0).toUpperCase()}</div>
                )}
              </button>
              <div className={`user-dropdown ${open ? 'open' : ''}`} role="menu">
                <Link to="/profile" className="dropdown-item" onClick={close}>Profile</Link>
                <Link to="/reviews" className="dropdown-item" onClick={close}>My Reviews</Link>
                <button className="dropdown-item" onClick={handleLogout}>Logout</button>
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
