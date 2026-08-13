import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Trophy, Calendar, Users, Shield, Flame, CheckCircle, ChevronDown, Clock, Award, FileText, ListOrdered, ArrowLeft } from 'lucide-react';
import PointsTable from '../components/PointsTable';
import RegistrationModal from '../components/RegistrationModal';
import { fetchTournamentById } from '../services/api';

export default function TournamentDetail() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab state: 'overview' | 'prizepool' | 'standings' | 'schedule' | 'rules'
  const [activeTab, setActiveTab] = useState('overview');

  // Terms acceptance checkbox state
  const [tcAccepted, setTcAccepted] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchTournamentById(id)
      .then(res => {
        if (res.success) {
          setTournament(res.tournament);
          setStandings(res.standings || []);
        }
      })
      .catch(err => console.error('Fetch tournament detail error:', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--text-muted)' }}>
        Loading tournament details...
      </div>
    );
  }

  if (!tournament) {
    return (
      <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '3rem', textAlign: 'center' }} className="glass-card">
        <h2>Tournament Not Found</h2>
        <p style={{ margin: '1rem 0', color: 'var(--text-muted)' }}>The requested tournament does not exist or has been removed.</p>
        <Link to="/tournaments" className="btn-primary">
          Back to All Tournaments
        </Link>
      </div>
    );
  }

  const {
    title, game_mode, format, prize_pool, entry_fee, max_teams,
    registered_teams, start_date, status, banner_url, rules, schedule, prize_breakdown
  } = tournament;

  const filledPercent = Math.min(100, Math.round(((registered_teams || 0) / (max_teams || 64)) * 100));

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto 4rem auto', padding: '0 1.5rem' }}>
      
      {/* Back Button */}
      <Link to="/tournaments" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', fontFamily: 'var(--font-sub)', fontWeight: 600 }}>
        <ArrowLeft size={16} /> Back to Tournaments Overview
      </Link>

      {/* BANNER & HERO CARD */}
      <div className="glass-card" style={{ overflow: 'hidden', marginBottom: '2rem' }}>
        <div style={{
          height: '240px',
          backgroundImage: `url(${banner_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(10, 13, 20, 1) 0%, rgba(10, 13, 20, 0.4) 60%, rgba(0, 0, 0, 0.2) 100%)'
          }} />

          <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 2, display: 'flex', gap: '0.8rem' }}>
            <span className={`badge ${status === 'Registration Open' ? 'badge-open' : status === 'Ongoing' ? 'badge-ongoing' : 'badge-completed'}`}>
              {status}
            </span>
            <span style={{ background: 'rgba(0,0,0,0.7)', color: 'var(--cyan)', padding: '0.2rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', fontFamily: 'var(--font-heading)' }}>
              {format} ({game_mode})
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div style={{ padding: '2rem' }}>
          <h1 style={{ fontSize: '2.2rem', color: '#fff', marginBottom: '1rem' }}>
            {title}
          </h1>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            background: 'rgba(6, 8, 12, 0.6)',
            padding: '1.2rem',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            marginBottom: '1.5rem'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                Total Prize Pool
              </span>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--gold)', fontFamily: 'var(--font-heading)' }}>
                ₹ {Number(prize_pool).toLocaleString('en-IN')}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                Entry Fee
              </span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: entry_fee === 0 ? 'var(--green)' : 'var(--cyan)', fontFamily: 'var(--font-heading)' }}>
                {entry_fee === 0 ? 'FREE ENTRY' : `₹ ${entry_fee}`}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                Start Date & Time
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-sub)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                <Calendar size={18} color="var(--cyan)" />
                {new Date(start_date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                Slots Registered
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--cyan)', fontFamily: 'var(--font-sub)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                <Users size={18} color="var(--cyan)" />
                {registered_teams} / {max_teams} Teams ({filledPercent}%)
              </span>
            </div>
          </div>

          {/* Slots Progress bar */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${filledPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #00f3ff, #00ff88)'
              }} />
            </div>
          </div>

          {/* Terms & Conditions Gating Box */}
          {status === 'Registration Open' && filledPercent < 100 && (
            <div style={{
              background: 'rgba(0, 243, 255, 0.05)',
              border: '1px solid rgba(0, 243, 255, 0.3)',
              borderRadius: '10px',
              padding: '1.2rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem'
            }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={tcAccepted}
                    onChange={(e) => setTcAccepted(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--cyan)' }}
                  />
                  <span style={{ fontSize: '0.95rem', color: '#fff', fontWeight: 600 }}>
                    I have read and agree to all Tournament Format details, Rules & Terms and Conditions.
                  </span>
                </label>
              </div>

              <button
                disabled={!tcAccepted}
                onClick={() => setShowRegModal(true)}
                className="btn-accent"
                style={{
                  padding: '0.8rem 1.8rem',
                  fontSize: '1rem',
                  opacity: tcAccepted ? 1 : 0.4,
                  cursor: tcAccepted ? 'pointer' : 'not-allowed'
                }}
              >
                <Flame size={18} /> Register Squad Now
              </button>
            </div>
          )}

        </div>
      </div>

      {/* TABBED SECTIONS NAVIGATION */}
      <div style={{
        display: 'flex',
        gap: '0.6rem',
        borderBottom: '1px solid rgba(0, 243, 255, 0.2)',
        marginBottom: '2rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem'
      }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            background: activeTab === 'overview' ? 'rgba(0, 243, 255, 0.15)' : 'none',
            border: 'none',
            borderBottom: activeTab === 'overview' ? '2px solid var(--cyan)' : '2px solid transparent',
            color: activeTab === 'overview' ? 'var(--cyan)' : 'var(--text-muted)',
            padding: '0.8rem 1.2rem',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FileText size={16} /> Overview & Format
        </button>

        <button
          onClick={() => setActiveTab('prizepool')}
          style={{
            background: activeTab === 'prizepool' ? 'rgba(0, 243, 255, 0.15)' : 'none',
            border: 'none',
            borderBottom: activeTab === 'prizepool' ? '2px solid var(--cyan)' : '2px solid transparent',
            color: activeTab === 'prizepool' ? 'var(--cyan)' : 'var(--text-muted)',
            padding: '0.8rem 1.2rem',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Award size={16} /> Prize Breakdown
        </button>

        <button
          onClick={() => setActiveTab('standings')}
          style={{
            background: activeTab === 'standings' ? 'rgba(0, 243, 255, 0.15)' : 'none',
            border: 'none',
            borderBottom: activeTab === 'standings' ? '2px solid var(--cyan)' : '2px solid transparent',
            color: activeTab === 'standings' ? 'var(--cyan)' : 'var(--text-muted)',
            padding: '0.8rem 1.2rem',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <ListOrdered size={16} /> Live Points Table ({standings.length})
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          style={{
            background: activeTab === 'schedule' ? 'rgba(0, 243, 255, 0.15)' : 'none',
            border: 'none',
            borderBottom: activeTab === 'schedule' ? '2px solid var(--cyan)' : '2px solid transparent',
            color: activeTab === 'schedule' ? 'var(--cyan)' : 'var(--text-muted)',
            padding: '0.8rem 1.2rem',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Clock size={16} /> Schedule & Timeline
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          style={{
            background: activeTab === 'rules' ? 'rgba(0, 243, 255, 0.15)' : 'none',
            border: 'none',
            borderBottom: activeTab === 'rules' ? '2px solid var(--cyan)' : '2px solid transparent',
            color: activeTab === 'rules' ? 'var(--cyan)' : 'var(--text-muted)',
            padding: '0.8rem 1.2rem',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Shield size={16} /> Rules & Terms
        </button>
      </div>

      {/* TAB CONTENT AREAS */}

      {/* 1. OVERVIEW & FORMAT TAB */}
      {activeTab === 'overview' && (
        <div className="glass-card fade-in" style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--cyan)', marginBottom: '1rem' }}>Tournament Match Specifications</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: 'rgba(6, 8, 12, 0.6)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Game Title</span>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>Battlegrounds Mobile India (BGMI)</p>
            </div>
            <div style={{ background: 'rgba(6, 8, 12, 0.6)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Match Format</span>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>{format} ({game_mode})</p>
            </div>
            <div style={{ background: 'rgba(6, 8, 12, 0.6)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Map Rotation</span>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>Erangel, Miramar, Sanhok, Vikendi</p>
            </div>
            <div style={{ background: 'rgba(6, 8, 12, 0.6)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Device Policy</span>
              <p style={{ color: 'var(--green)', fontWeight: 700, fontSize: '1.1rem' }}>Mobile Only (No Emulators)</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. PRIZE POOL TAB */}
      {activeTab === 'prizepool' && (
        <div className="glass-card fade-in" style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--gold)', marginBottom: '1.5rem' }}>Prize Pool Breakdown</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {prize_breakdown && prize_breakdown.length > 0 ? (
              prize_breakdown.map((pb, idx) => (
                <div key={idx} style={{
                  background: idx === 0 ? 'linear-gradient(135deg, rgba(255,183,0,0.15), rgba(10,13,20,0.8))' : 'rgba(6, 8, 12, 0.6)',
                  border: idx === 0 ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  padding: '1.5rem',
                  textAlign: 'center'
                }}>
                  <Trophy size={32} color={idx === 0 ? 'var(--gold)' : idx === 1 ? '#e2e8f0' : '#cd7f32'} style={{ marginBottom: '0.5rem' }} />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>
                    {pb.rank}
                  </span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 900, color: idx === 0 ? 'var(--gold)' : 'var(--cyan)', fontFamily: 'var(--font-heading)', display: 'block', marginTop: '0.4rem' }}>
                    {pb.amount}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Prize distribution details will be announced soon.</p>
            )}
          </div>
        </div>
      )}

      {/* 3. LIVE POINTS TABLE TAB */}
      {activeTab === 'standings' && (
        <div className="glass-card fade-in" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: 'var(--cyan)' }}>Participating Teams & Live Points Table</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Updated live by referees</span>
          </div>
          <PointsTable standings={standings} />
        </div>
      )}

      {/* 4. SCHEDULE TAB */}
      {activeTab === 'schedule' && (
        <div className="glass-card fade-in" style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--cyan)', marginBottom: '1.5rem' }}>Tournament Match Timeline</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {schedule && schedule.length > 0 ? (
              schedule.map((item, idx) => (
                <div key={idx} style={{
                  background: 'rgba(6, 8, 12, 0.6)',
                  borderLeft: '4px solid var(--cyan)',
                  padding: '1.2rem',
                  borderRadius: '0 8px 8px 0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>
                    <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.2rem' }}>{item.day}</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Map Rotations: {item.matches}</span>
                  </div>
                  <span className="badge badge-open">
                    {item.date}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Schedule details to be published.</p>
            )}
          </div>
        </div>
      )}

      {/* 5. RULES TAB */}
      {activeTab === 'rules' && (
        <div className="glass-card fade-in" style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--crimson)', marginBottom: '1.5rem' }}>Rules, Terms & Code of Conduct</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {rules && rules.length > 0 ? (
              rules.map((rule, idx) => (
                <li key={idx} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.8rem',
                  background: 'rgba(6, 8, 12, 0.4)',
                  padding: '0.8rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.04)',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem'
                }}>
                  <Shield size={18} color="var(--crimson)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{rule}</span>
                </li>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Standard BGMI tournament rules apply.</p>
            )}
          </ul>
        </div>
      )}

      {/* REGISTRATION MODAL */}
      {showRegModal && (
        <RegistrationModal
          tournament={tournament}
          onClose={() => setShowRegModal(false)}
          onSuccess={() => {
            setShowRegModal(false);
            fetchTournamentById(id).then(res => {
              if (res.success) setTournament(res.tournament);
            });
          }}
        />
      )}

    </div>
  );
}
