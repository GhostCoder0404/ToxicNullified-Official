import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Youtube, Instagram, Twitter, ArrowRight, Play, Shield, Crosshair, Flame, Zap } from 'lucide-react';

const creators = [
  {
    key: 'ghost',
    displayName: 'GHOST',
    subtitle: 'CLAN LEADER',
    role: 'Leader',
    ingameName: 'TNFGHOSTISLIVE',
    ingameId: '55500709873',
    title: 'Collection Level 64',
    tier: 'Ace ★5',
    tierMode: 'TPP Squad',
    description:
      'The founding force behind ToxicNullified. Ghost leads every tournament lobby with ruthless precision and unmatched game-sense across Erangel and Miramar. 5 years of competitive BGMI dominance.',
    stats: {
      rating: '6,669',
      rank: 'Top 9%',
      achievement: '8,405',
      played: '5 Years',
    },
    socials: { youtube: '#', instagram: '#', twitter: '#' },
    image: '/characters/ghost.png',
    accent: '#a855f7',
    accentGlow: 'rgba(168, 85, 247, 0.35)',
    accentBg: 'rgba(168, 85, 247, 0.12)',
    accentBorder: 'rgba(168, 85, 247, 0.4)',
  },
  {
    key: 'zero',
    displayName: 'ZERO',
    subtitle: 'CO-LEADER',
    role: 'Co‑Leader',
    ingameName: 'DaRK△ZERO',
    ingameId: '5135314227',
    title: 'Elite Collector II',
    tier: 'Crown IV',
    tierMode: 'TPP Squad',
    description:
      'The strategic backbone of ToxicNullified. Zero\'s rotation calls and zone reads have carried the clan through countless Grand Finals. A Vanguard V Ultimate Royale veteran.',
    stats: {
      rating: '5,673',
      rank: 'Top 19%',
      achievement: '6,325',
      played: '7 Years',
    },
    socials: { youtube: '#', instagram: '#', twitter: '#' },
    image: '/characters/zero.png',
    accent: '#00f3ff',
    accentGlow: 'rgba(0, 243, 255, 0.35)',
    accentBg: 'rgba(0, 243, 255, 0.12)',
    accentBorder: 'rgba(0, 243, 255, 0.4)',
  },
  {
    key: 'baba',
    displayName: 'BABA',
    subtitle: 'CO-LEADER',
    role: 'Co‑Leader',
    ingameName: 'BABA | 420\'s H',
    ingameId: '5985012980',
    title: 'Vanguard V · Ultimate Royale',
    tier: 'Crown I',
    tierMode: 'TPP Squad',
    description:
      'The aggressive fragger of the squad. Baba\'s close-range combat and clutch plays in final circles have become legendary across the BGMI competitive scene.',
    stats: {
      rating: '6,193',
      rank: 'Top 13%',
      achievement: '7,170',
      played: '7 Years',
    },
    socials: { youtube: '#', instagram: '#', twitter: '#' },
    image: '/characters/baba.png',
    accent: '#ff2a5f',
    accentGlow: 'rgba(255, 42, 95, 0.35)',
    accentBg: 'rgba(255, 42, 95, 0.12)',
    accentBorder: 'rgba(255, 42, 95, 0.4)',
  },
];

export default function Creators() {
  const [activeIndex, setActiveIndex] = useState(0);
  const c = creators[activeIndex];

  return (
    <section
      style={{
        minHeight: '100vh',
        background: 'var(--bg-darker)',
        color: 'var(--text-main)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient background glows */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `
            radial-gradient(ellipse 60% 50% at 70% 50%, ${c.accentGlow} 0%, transparent 70%),
            radial-gradient(ellipse 40% 60% at 20% 80%, rgba(0,0,0,0.6) 0%, transparent 60%)
          `,
          transition: 'background 0.6s ease',
        }}
      />

      {/* Subtle grid overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.03,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Right-side vertical nav dots */}
      <div
        className="creators-dots"
        style={{
          position: 'fixed',
          right: '2rem',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          zIndex: 20,
        }}
      >
        {creators.map((cr, idx) => (
          <button
            key={cr.key}
            onClick={() => setActiveIndex(idx)}
            aria-label={`Show ${cr.ingameName}`}
            style={{
              width: idx === activeIndex ? '14px' : '10px',
              height: idx === activeIndex ? '14px' : '10px',
              borderRadius: '50%',
              border: `2px solid ${idx === activeIndex ? c.accent : 'rgba(255,255,255,0.2)'}`,
              background: idx === activeIndex ? c.accent : 'transparent',
              boxShadow: idx === activeIndex ? `0 0 12px ${c.accentGlow}` : 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* ─── MAIN LAYOUT ─── */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          minHeight: 'calc(100vh - 70px)',
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '3rem 2rem',
          alignItems: 'center',
          gap: '0',
        }}
        className="creators-grid"
      >
        {/* ─── LEFT: TEXT CONTENT ─── */}
        <div style={{ padding: '2rem 1rem 2rem 2rem', zIndex: 3 }} className="creators-info">
          {/* Role tag */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: c.accent,
              fontFamily: 'var(--font-heading)',
              fontSize: '0.8rem',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              marginBottom: '0.6rem',
            }}
          >
            <span style={{ width: '30px', height: '2px', background: c.accent, display: 'inline-block' }} />
            {c.subtitle}
            <span style={{ width: '30px', height: '2px', background: c.accent, display: 'inline-block' }} />
          </div>

          {/* Big name */}
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(3rem, 7vw, 5.5rem)',
              fontWeight: 900,
              lineHeight: 1,
              color: '#fff',
              letterSpacing: '4px',
              marginBottom: '0.3rem',
              textShadow: `0 0 40px ${c.accentGlow}`,
            }}
          >
            {c.displayName}
          </h1>

          {/* IGN subtitle */}
          <p
            style={{
              fontFamily: 'var(--font-sub)',
              fontSize: '1.3rem',
              fontWeight: 700,
              color: c.accent,
              letterSpacing: '2px',
              marginBottom: '0.3rem',
            }}
          >
            {c.ingameName}
          </p>

          {/* Tier & Title */}
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
            <span style={{
              background: c.accentBg,
              border: `1px solid ${c.accentBorder}`,
              color: c.accent,
              fontFamily: 'var(--font-heading)',
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.25rem 0.7rem',
              borderRadius: '4px',
              letterSpacing: '1px',
            }}>
              {c.tier} · {c.tierMode}
            </span>
            <span style={{
              color: 'var(--gold)',
              fontFamily: 'var(--font-sub)',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}>
              {c.title}
            </span>
          </div>

          {/* UID */}
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            marginBottom: '1.2rem',
          }}>
            UID: {c.ingameId}
          </p>

          {/* Description */}
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '1rem',
              lineHeight: 1.7,
              maxWidth: '440px',
              marginBottom: '2rem',
            }}
          >
            {c.description}
          </p>

          {/* Stats row like the reference (Faction / Role / Rank / Affiliation) */}
          <div
            style={{
              display: 'flex',
              gap: '0',
              background: 'rgba(15, 20, 30, 0.7)',
              border: `1px solid ${c.accentBorder}`,
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '2rem',
              maxWidth: '480px',
            }}
            className="creators-stats-bar"
          >
            {[
              { icon: <Zap size={16} />, label: 'SEASON RATING', value: c.stats.rating },
              { icon: <Crosshair size={16} />, label: 'SEASON RANK', value: c.stats.rank },
              { icon: <Shield size={16} />, label: 'ACHIEVEMENT', value: c.stats.achievement },
              { icon: <Flame size={16} />, label: 'PLAYED FOR', value: c.stats.played },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  padding: '0.8rem 0.6rem',
                  textAlign: 'center',
                  borderRight: i < 3 ? `1px solid ${c.accentBorder}` : 'none',
                }}
              >
                <div style={{ color: c.accent, marginBottom: '0.3rem', display: 'flex', justifyContent: 'center' }}>
                  {stat.icon}
                </div>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.6rem',
                    color: 'var(--text-muted)',
                    letterSpacing: '1px',
                    fontFamily: 'var(--font-heading)',
                    marginBottom: '0.2rem',
                  }}
                >
                  {stat.label}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-sub)',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: '#fff',
                  }}
                >
                  {stat.value}
                </span>
              </div>
            ))}
          </div>

          {/* Action buttons like reference */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <Link
              to="/tournaments"
              style={{
                background: `linear-gradient(135deg, ${c.accent}, ${c.accent}cc)`,
                color: '#fff',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '0.85rem',
                padding: '0.75rem 1.8rem',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: `0 0 20px ${c.accentGlow}`,
                transition: 'all 0.3s ease',
                letterSpacing: '1px',
              }}
            >
              VIEW TOURNAMENTS <ArrowRight size={16} />
            </Link>
            <a
              href={c.socials.youtube}
              target="_blank"
              rel="noreferrer"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: '#fff',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '0.85rem',
                padding: '0.75rem 1.8rem',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                border: '1px solid rgba(255,255,255,0.15)',
                letterSpacing: '1px',
                transition: 'all 0.3s ease',
              }}
            >
              WATCH STREAM <Play size={16} />
            </a>
          </div>

          {/* Social links */}
          <div>
            <span
              style={{
                fontSize: '0.7rem',
                fontFamily: 'var(--font-heading)',
                color: 'var(--text-muted)',
                letterSpacing: '2px',
                display: 'block',
                marginBottom: '0.6rem',
              }}
            >
              FOLLOW {c.displayName}
            </span>
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              {[
                { icon: <Instagram size={18} />, href: c.socials.instagram },
                { icon: <Twitter size={18} />, href: c.socials.twitter },
                { icon: <Youtube size={18} />, href: c.socials.youtube },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: c.accentBg,
                    border: `1px solid ${c.accentBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: c.accent,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ─── RIGHT: CHARACTER IMAGE ─── */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
          }}
          className="creators-image-wrap"
        >
          {/* Glow behind character */}
          <div
            style={{
              position: 'absolute',
              width: '80%',
              height: '80%',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${c.accentGlow} 0%, transparent 70%)`,
              filter: 'blur(60px)',
              pointerEvents: 'none',
            }}
          />
          <img
            key={c.key}
            src={c.image}
            alt={c.ingameName}
            style={{
              position: 'relative',
              maxHeight: '75vh',
              maxWidth: '100%',
              objectFit: 'contain',
              filter: `drop-shadow(0 0 30px ${c.accentGlow})`,
              transition: 'opacity 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* ─── BOTTOM: Character selector tabs ─── */}
      <div
        style={{
          position: 'absolute',
          bottom: '1.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '0.6rem',
          zIndex: 20,
          background: 'rgba(10, 13, 20, 0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '0.5rem',
        }}
        className="creators-tab-bar"
      >
        {creators.map((cr, idx) => (
          <button
            key={cr.key}
            onClick={() => setActiveIndex(idx)}
            style={{
              background: idx === activeIndex ? c.accentBg : 'transparent',
              border: idx === activeIndex ? `1px solid ${c.accentBorder}` : '1px solid transparent',
              borderRadius: '8px',
              padding: '0.5rem 1.5rem',
              cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '1.5px',
              color: idx === activeIndex ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.3s ease',
            }}
          >
            {cr.displayName}
          </button>
        ))}
      </div>

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 900px) {
          .creators-grid {
            grid-template-columns: 1fr !important;
            text-align: center;
            padding: 2rem 1.2rem !important;
          }
          .creators-info {
            padding: 1rem !important;
            order: 2;
          }
          .creators-info p,
          .creators-info > div:first-child {
            margin-left: auto;
            margin-right: auto;
          }
          .creators-image-wrap {
            order: 1;
            max-height: 45vh;
          }
          .creators-image-wrap img {
            max-height: 40vh !important;
          }
          .creators-stats-bar {
            margin-left: auto !important;
            margin-right: auto !important;
          }
          .creators-dots {
            right: 0.8rem !important;
          }
          .creators-tab-bar {
            position: relative !important;
            bottom: auto !important;
            left: auto !important;
            transform: none !important;
            justify-content: center;
            margin: 1rem auto 2rem auto;
          }
        }
        @media (max-width: 480px) {
          .creators-stats-bar {
            flex-wrap: wrap !important;
          }
          .creators-stats-bar > div {
            flex: 1 1 45% !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(255,255,255,0.06);
          }
          .creators-tab-bar button {
            padding: 0.4rem 0.8rem !important;
            font-size: 0.7rem !important;
          }
        }
      `}</style>
    </section>
  );
}
