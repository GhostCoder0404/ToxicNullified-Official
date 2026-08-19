import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Flame, Shield, ArrowRight, Award, Users, Crosshair, Star, CheckCircle, Zap } from 'lucide-react';
import TournamentCard from '../components/TournamentCard';
import RegistrationModal from '../components/RegistrationModal';
import { fetchTournaments } from '../services/api';

export default function Home() {
  const [featuredTournaments, setFeaturedTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournaments({ status: 'All' })
      .then(res => {
        if (res.success) {
          setFeaturedTournaments(res.tournaments.slice(0, 3));
        }
      })
      .catch(err => console.error('Fetch home tournaments error:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh' }}>
      
      {/* ------------------------------------------------------------- */}
      {/* HERO SECTION */}
      {/* ------------------------------------------------------------- */}
      <section style={{
        position: 'relative',
        padding: '5rem 1.5rem 6rem 1.5rem',
        backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(0, 243, 255, 0.15) 0%, rgba(6, 8, 12, 0.95) 70%), url("https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderBottom: '1px solid rgba(0, 243, 255, 0.15)'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(6,8,12,0.7) 0%, rgba(6,8,12,0.95) 100%)'
        }} />

        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2,
          textAlign: 'center'
        }}>
          
          {/* Top Tagline Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(0, 243, 255, 0.1)',
            border: '1px solid rgba(0, 243, 255, 0.4)',
            padding: '0.4rem 1.2rem',
            borderRadius: '30px',
            marginBottom: '1.5rem',
            boxShadow: '0 0 20px rgba(0, 243, 255, 0.2)'
          }}>
            <Zap size={16} color="var(--cyan)" />
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              Official BGMI Tournament Platform
            </span>
          </div>

          {/* Main Title */}
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: '1.2rem',
            color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>
            DOMINATE THE <span style={{ color: 'var(--cyan)', textShadow: '0 0 25px var(--cyan-glow)' }}>BATTLEGROUNDS</span>
          </h1>

          <p style={{
            maxWidth: '750px',
            margin: '0 auto 2.5rem auto',
            fontSize: '1.15rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6
          }}>
            Welcome to <strong>ToxicNullified Official</strong>. Compete against India's elite squad lineups, win real cash prize pools, and track live match standings with verified anti-cheat integrity.
          </p>

          {/* Call to Actions */}
          <div style={{ display: 'flex', gap: '1.2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/tournaments" className="btn-primary" style={{ padding: '0.9rem 2.2rem', fontSize: '1.05rem' }}>
              <Flame size={20} /> Browse Tournaments
            </Link>
            <Link to="/creators" className="btn-accent" style={{ 
              padding: '0.9rem 2.2rem', 
              fontSize: '1.05rem',
              background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
              boxShadow: '0 0 15px rgba(168, 85, 247, 0.4)',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Users size={20} /> Meet the Creators
            </Link>
            <Link to="/rules" className="btn-secondary" style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }}>
              <Shield size={20} /> Rules & Guidelines
            </Link>
          </div>

          {/* Live Stats Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            maxWidth: '900px',
            margin: '4rem auto 0 auto',
            padding: '1.5rem',
            background: 'rgba(15, 20, 30, 0.8)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0, 243, 255, 0.2)',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)'
          }} className="hero-stats-bar">
            <div>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--gold)', fontFamily: 'var(--font-heading)' }}>
                ₹ 5,00,000+
              </span>
              <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-sub)' }}>
                Total Distributed Prize Pool
              </span>
            </div>

            <div>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--cyan)', fontFamily: 'var(--font-heading)' }}>
                150+
              </span>
              <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-sub)' }}>
                Registered Esports Teams
              </span>
            </div>

            <div>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--green)', fontFamily: 'var(--font-heading)' }}>
                100%
              </span>
              <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-sub)' }}>
                Verified Anti-Cheat Fair Play
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* FEATURED TOURNAMENTS SECTION */}
      {/* ------------------------------------------------------------- */}
      <section style={{ maxWidth: '1200px', margin: '4rem auto', padding: '0 1.5rem' }}>
        <div className="section-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <span style={{ color: 'var(--cyan)', fontFamily: 'var(--font-heading)', fontSize: '0.85rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              Action Ready
            </span>
            <h2 style={{ color: '#fff', fontSize: '2rem' }}>
              Featured <span style={{ color: 'var(--cyan)' }}>Tournaments</span>
            </h2>
          </div>

          <Link to="/tournaments" style={{ color: 'var(--cyan)', textDecoration: 'none', fontFamily: 'var(--font-sub)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            View All Tournaments <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading tournaments...
          </div>
        ) : (
          <div className="tournament-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.8rem'
          }}>
            {featuredTournaments.map((t) => (
              <TournamentCard
                key={t.id}
                tournament={t}
                onRegisterClick={(tourney) => setSelectedTournament(tourney)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------- */}
      {/* WHY TOXICNULLIFIED HIGHLIGHTS */}
      {/* ------------------------------------------------------------- */}
      <section style={{
        background: 'rgba(10, 13, 20, 0.6)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '5rem 1.5rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ color: '#fff', fontSize: '2.2rem', marginBottom: '0.8rem' }}>
              WHY CHOOSE <span style={{ color: 'var(--cyan)' }}>TOXICNULLIFIED</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
              Built by BGMI gamers for BGMI gamers. Standardized rules, seamless payments, and transparent match scoring.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{
                width: '50px', height: '50px', borderRadius: '10px',
                background: 'rgba(0, 243, 255, 0.15)', border: '1px solid rgba(0, 243, 255, 0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.2rem'
              }}>
                <Shield size={26} color="var(--cyan)" />
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.6rem' }}>Strict Anti-Cheat</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                Every player POV is audited by tournament referees. Emulators, iPad view hacks, and config scripts are instantly banned.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{
                width: '50px', height: '50px', borderRadius: '10px',
                background: 'rgba(255, 183, 0, 0.15)', border: '1px solid rgba(255, 183, 0, 0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.2rem'
              }}>
                <Trophy size={26} color="var(--gold)" />
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.6rem' }}>Instant Prize Payouts</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                Winning team payouts are processed via direct UPI transfer within 24 hours of Grand Finals match calculation.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{
                width: '50px', height: '50px', borderRadius: '10px',
                background: 'rgba(255, 42, 95, 0.15)', border: '1px solid rgba(255, 42, 95, 0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.2rem'
              }}>
                <Crosshair size={26} color="var(--crimson)" />
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.6rem' }}>Live Points Table</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                Real-time standings updated match-by-match so fans and participating rosters can track WWCDs, placement, and kill points.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* REGISTRATION MODAL IF TRIGGERED */}
      {selectedTournament && (
        <RegistrationModal
          tournament={selectedTournament}
          onClose={() => setSelectedTournament(null)}
          onSuccess={() => setSelectedTournament(null)}
        />
      )}

    </div>
  );
}
