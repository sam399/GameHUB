import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const { user, logout } = useAuth();

  const close = () => setOpen(false);

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
              <Link to="/profile" className="nav-link" onClick={close}>Profile</Link>
              <button className="nav-link" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <Link to="/login" className="nav-link small-muted" onClick={close}>Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
