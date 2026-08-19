import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, Shield, Flame, User, Menu, X, ShieldAlert, Lock, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Tournaments', path: '/tournaments' },
    { name: 'Rules & Terms', path: '/rules' },
    { name: 'Creators', path: '/creators' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(6, 8, 12, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(0, 243, 255, 0.15)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0.8rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #00f3ff, #ff2a5f)',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(0, 243, 255, 0.4)'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              background: '#0a0d14',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Trophy size={22} color="#00f3ff" />
            </div>
          </div>
          <div>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.25rem',
              fontWeight: 900,
              color: '#fff',
              letterSpacing: '1px'
            }}>
              TOXIC<span style={{ color: 'var(--cyan)' }}>NULLIFIED</span>
            </span>
            <span style={{
              display: 'block',
              fontSize: '0.65rem',
              color: 'var(--gold)',
              fontFamily: 'var(--font-sub)',
              letterSpacing: '2px',
              marginTop: '-3px'
            }}>
              OFFICIAL BGMI ESPORTS
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav style={{ display: 'none', gap: '2rem', alignItems: 'center' }} className="desktop-nav">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                textDecoration: 'none',
                fontFamily: 'var(--font-sub)',
                fontSize: '1.05rem',
                fontWeight: 600,
                color: isActive(link.path) ? 'var(--cyan)' : 'var(--text-muted)',
                transition: 'color 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                borderBottom: isActive(link.path) ? '2px solid var(--cyan)' : '2px solid transparent',
                paddingBottom: '0.2rem'
              }}
            >
              {link.name}
            </Link>
          ))}

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link
                to="/admin"
                style={{
                  textDecoration: 'none',
                  fontFamily: 'var(--font-sub)',
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  color: isActive('/admin') ? 'var(--cyan)' : 'var(--text-muted)',
                  transition: 'color 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  borderBottom: isActive('/admin') ? '2px solid var(--cyan)' : '2px solid transparent',
                  paddingBottom: '0.2rem'
                }}
              >
                <Lock size={15} /> Admin Dashboard
              </Link>
              <button
                onClick={logout}
                className="btn-secondary"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                title="Logout Admin"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              to="/admin/login"
              style={{
                textDecoration: 'none',
                fontFamily: 'var(--font-sub)',
                fontSize: '1.05rem',
                fontWeight: 600,
                color: isActive('/admin/login') ? 'var(--cyan)' : 'var(--text-muted)',
                transition: 'color 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                borderBottom: isActive('/admin/login') ? '2px solid var(--cyan)' : '2px solid transparent',
                paddingBottom: '0.2rem'
              }}
            >
              <Lock size={15} /> Admin Login
            </Link>
          )}

          <Link to="/tournaments" className="btn-primary">
            <Flame size={16} /> Join Tournament
          </Link>
        </nav>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-main)',
            cursor: 'pointer',
            padding: '0.5rem'
          }}
          className="mobile-toggle"
        >
          {mobileMenuOpen ? <X size={26} color="var(--cyan)" /> : <Menu size={26} />}
        </button>

      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div style={{
          background: 'rgba(10, 13, 20, 0.95)',
          borderBottom: '1px solid var(--border-color)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.2rem'
        }}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                textDecoration: 'none',
                fontFamily: 'var(--font-heading)',
                fontSize: '1.1rem',
                color: isActive(link.path) ? 'var(--cyan)' : 'var(--text-main)'
              }}
            >
              {link.name}
            </Link>
          ))}

          {isAuthenticated ? (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                textDecoration: 'none',
                fontFamily: 'var(--font-heading)',
                fontSize: '1.1rem',
                color: isActive('/admin') ? 'var(--cyan)' : 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Lock size={18} /> Admin Dashboard
            </Link>
          ) : (
            <Link
              to="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                textDecoration: 'none',
                fontFamily: 'var(--font-heading)',
                fontSize: '1.1rem',
                color: isActive('/admin/login') ? 'var(--cyan)' : 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Lock size={18} /> Admin Login
            </Link>
          )}

          <Link
            to="/tournaments"
            onClick={() => setMobileMenuOpen(false)}
            className="btn-primary"
            style={{ justifyContent: 'center' }}
          >
            <Flame size={18} /> Register Team
          </Link>
        </div>
      )}

      {/* Media query styling for responsive nav */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
}
