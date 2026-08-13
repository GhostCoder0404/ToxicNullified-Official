import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Calendar, Users, Shield, ArrowRight, Flame } from 'lucide-react';

export default function TournamentCard({ tournament, onRegisterClick }) {
  const {
    id, title, game_mode, format, prize_pool, entry_fee,
    max_teams, registered_teams, start_date, status, banner_url
  } = tournament;

  const filledPercent = Math.min(100, Math.round(((registered_teams || 0) / (max_teams || 64)) * 100));

  const getBadgeClass = (st) => {
    if (st === 'Registration Open') return 'badge-open';
    if (st === 'Ongoing') return 'badge-ongoing';
    return 'badge-completed';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBA';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="glass-card" style={{
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative'
    }}>
      
      {/* Banner Header */}
      <div style={{
        height: '160px',
        position: 'relative',
        backgroundImage: `url(${banner_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(10, 13, 20, 1) 0%, rgba(10, 13, 20, 0.4) 60%, rgba(0, 0, 0, 0.2) 100%)'
        }} />
        
        {/* Status Badge */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 2 }}>
          <span className={`badge ${getBadgeClass(status)}`}>
            {status}
          </span>
        </div>

        {/* Format Badge */}
        <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 2 }}>
          <span style={{
            background: 'rgba(0, 0, 0, 0.65)',
            color: 'var(--cyan)',
            border: '1px solid rgba(0, 243, 255, 0.3)',
            padding: '0.2rem 0.6rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700
          }}>
            {format || 'Squad'} ({game_mode})
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          fontSize: '1.15rem',
          color: '#fff',
          marginBottom: '0.8rem',
          lineHeight: 1.3
        }}>
          {title}
        </h3>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.8rem',
          background: 'rgba(6, 8, 12, 0.6)',
          padding: '0.8rem',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          marginBottom: '1rem'
        }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
              Prize Pool
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gold)', fontFamily: 'var(--font-sub)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Trophy size={16} color="var(--gold)" /> ₹ {Number(prize_pool).toLocaleString('en-IN')}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
              Entry Fee
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: entry_fee === 0 ? 'var(--green)' : 'var(--cyan)', fontFamily: 'var(--font-sub)' }}>
              {entry_fee === 0 ? 'FREE ENTRY' : `₹ ${entry_fee}`}
            </span>
          </div>
        </div>

        {/* Info Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={14} color="var(--cyan)" />
            <span>{formatDate(start_date)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={14} color="var(--cyan)" />
              <span>Slots: {registered_teams || 0} / {max_teams || 64} Teams</span>
            </div>
            <span style={{ color: filledPercent >= 100 ? 'var(--crimson)' : 'var(--cyan)', fontWeight: 700, fontSize: '0.8rem' }}>
              {filledPercent}% Filled
            </span>
          </div>

          {/* Slot Progress Bar */}
          <div style={{
            width: '100%',
            height: '6px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '3px',
            overflow: 'hidden',
            marginTop: '0.2rem'
          }}>
            <div style={{
              width: `${filledPercent}%`,
              height: '100%',
              background: filledPercent >= 100 ? 'linear-gradient(90deg, #ff2a5f, #ff8800)' : 'linear-gradient(90deg, #00f3ff, #00ff88)',
              borderRadius: '3px',
              transition: 'width 0.5s ease'
            }} />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: 'auto', display: 'flex', gap: '0.6rem' }}>
          <Link
            to={`/tournaments/${id}`}
            className="btn-secondary"
            style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem', padding: '0.65rem 0.5rem' }}
          >
            View Details
          </Link>

          {status === 'Registration Open' && filledPercent < 100 && (
            <button
              onClick={() => onRegisterClick && onRegisterClick(tournament)}
              className="btn-primary"
              style={{ padding: '0.65rem 1rem', fontSize: '0.85rem' }}
            >
              <Flame size={15} /> Register
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
