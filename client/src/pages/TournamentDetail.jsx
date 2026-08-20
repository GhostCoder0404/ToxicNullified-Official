import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Trophy, Calendar, Users, Shield, Flame, CheckCircle, ChevronDown, Clock,
  Award, FileText, ListOrdered, ArrowLeft, Maximize2, X, MapPin, Gamepad2, AlertCircle
} from 'lucide-react';
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

  // Terms acceptance checkbox state & modal states
  const [tcAccepted, setTcAccepted] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);
  const [showPosterLightbox, setShowPosterLightbox] = useState(false);

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
        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid rgba(0, 243, 255, 0.2)', borderTopColor: 'var(--cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1rem', fontFamily: 'var(--font-heading)' }}>Loading Official Tournament Details...</p>
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
    registered_teams, start_date, reg_end_date, map_rotation, organizer,
    status, banner_url, poster_url, rules, schedule, prize_breakdown
  } = tournament;

  const filledPercent = Math.min(100, Math.round(((registered_teams || 0) / (max_teams || 64)) * 100));
  const officialPoster = poster_url || banner_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80';
  const coverBanner = banner_url || officialPoster;

  return (
    <div style={{ maxWidth: '1280px', margin: '2rem auto 4rem auto', padding: '0 1.5rem' }}>
      
      {/* Back Button */}
      <Link to="/tournaments" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', fontFamily: 'var(--font-sub)', fontWeight: 600 }}>
        <ArrowLeft size={16} /> Back to Tournaments Overview
      </Link>

      {/* ------------------------------------------------------------- */}
      {/* MAIN TWO-COLUMN HERO SECTION (LEFT OVERVIEW | RIGHT POSTER) */}
      {/* ------------------------------------------------------------- */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem',
        alignItems: 'start',
        marginBottom: '2.5rem'
      }}>

        {/* LEFT COLUMN: OVERVIEW, FORMAT, DATES & REGISTRATION */}
        <div className="glass-card" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
          
          {/* Header Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center', marginBottom: '1.2rem' }}>
            <span className={`badge ${status === 'Registration Open' ? 'badge-open' : status === 'Ongoing' ? 'badge-ongoing' : 'badge-completed'}`}>
              {status}
            </span>
            <span style={{ background: 'rgba(0, 243, 255, 0.1)', color: 'var(--cyan)', border: '1px solid rgba(0, 243, 255, 0.3)', padding: '0.25rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
              {format || 'Squad'} ({game_mode || 'Squad TPP'})
            </span>
            <span style={{ background: 'rgba(255, 183, 0, 0.1)', color: 'var(--gold)', border: '1px solid rgba(255, 183, 0, 0.3)', padding: '0.25rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
              Hosted by: {organizer || 'ToxicNullified Official'}
            </span>
          </div>

          {/* Tournament Title */}
          <h1 style={{ fontSize: '2.4rem', color: '#fff', lineHeight: 1.2, marginBottom: '1.5rem', fontFamily: 'var(--font-heading)', textShadow: '0 0 20px rgba(0, 243, 255, 0.2)' }}>
            {title}
          </h1>

          {/* KEY METRICS GRID (Prize Pool, Entry, Match Date, Registration Deadline) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1rem',
            background: 'rgba(6, 8, 12, 0.75)',
            padding: '1.2rem',
            borderRadius: '12px',
            border: '1px solid rgba(0, 243, 255, 0.15)',
            marginBottom: '1.8rem'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                Total Prize Pool
              </span>
              <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--gold)', fontFamily: 'var(--font-heading)', display: 'block', marginTop: '0.2rem' }}>
                ₹ {Number(prize_pool).toLocaleString('en-IN')}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                Entry Fee
              </span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: entry_fee === 0 ? 'var(--green)' : 'var(--cyan)', fontFamily: 'var(--font-heading)', display: 'block', marginTop: '0.2rem' }}>
                {entry_fee === 0 ? 'FREE ENTRY' : `₹ ${entry_fee}`}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                Match Date & Time
              </span>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem' }}>
                <Calendar size={15} color="var(--cyan)" />
                {new Date(start_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                Reg. Deadline
              </span>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--crimson)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem' }}>
                <Clock size={15} color="var(--crimson)" />
                {reg_end_date ? new Date(reg_end_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Until Slots Fill'}
              </span>
            </div>
          </div>

          {/* MATCH FORMAT & SPECIFICATIONS LIST */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.8rem'
          }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.9rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Gamepad2 size={14} color="var(--cyan)" /> Format & Mode
              </span>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', marginTop: '0.2rem', display: 'block' }}>
                {format} ({game_mode})
              </span>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.9rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={14} color="var(--cyan)" /> Map Rotation
              </span>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', marginTop: '0.2rem', display: 'block' }}>
                {map_rotation || 'Erangel, Rondo & Miramar'}
              </span>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.9rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Shield size={14} color="var(--green)" /> Device Policy
              </span>
              <span style={{ color: 'var(--green)', fontWeight: 700, fontSize: '0.95rem', marginTop: '0.2rem', display: 'block' }}>
                Mobile Only (No Emulators)
              </span>
            </div>
          </div>

          {/* SLOTS CAPACITY PROGRESS BAR */}
          <div style={{ marginBottom: '1.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Users size={16} color="var(--cyan)" /> Registered Squads Status
              </span>
              <span style={{ color: 'var(--cyan)', fontWeight: 800 }}>
                {registered_teams} / {max_teams} Teams ({filledPercent}% Filled)
              </span>
            </div>
            <div style={{ height: '10px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{
                width: `${filledPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #00f3ff, #00ff88)',
                boxShadow: '0 0 10px rgba(0, 243, 255, 0.5)'
              }} />
            </div>
          </div>

          {/* TERMS CHECKBOX & REGISTRATION BUTTON */}
          {status === 'Registration Open' && filledPercent < 100 ? (
            <div style={{
              background: 'rgba(0, 243, 255, 0.04)',
              border: '1px solid rgba(0, 243, 255, 0.25)',
              borderRadius: '12px',
              padding: '1.2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={tcAccepted}
                  onChange={(e) => setTcAccepted(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--cyan)', marginTop: '2px', flexShrink: 0 }}
                />
                <span style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.4 }}>
                  I confirm that our squad members agree to the <strong>Official BGMI Format</strong>, anti-cheat policy, map schedule, and <strong>Tournament Rules</strong>.
                </span>
              </label>

              <button
                disabled={!tcAccepted}
                onClick={() => setShowRegModal(true)}
                className="btn-accent"
                style={{
                  width: '100%',
                  justify: 'center',
                  padding: '1rem',
                  fontSize: '1.1rem',
                  letterSpacing: '1px',
                  opacity: tcAccepted ? 1 : 0.45,
                  cursor: tcAccepted ? 'pointer' : 'not-allowed',
                  boxShadow: tcAccepted ? '0 0 25px rgba(0, 243, 255, 0.4)' : 'none'
                }}
              >
                <Flame size={20} /> REGISTER SQUAD NOW
              </button>
            </div>
          ) : (
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '1rem',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}>
              <AlertCircle size={20} color="var(--gold)" style={{ marginBottom: '0.4rem' }} />
              <p style={{ margin: 0, fontWeight: 600 }}>
                {filledPercent >= 100 ? 'Registration Slots Full for this Tournament.' : `Registration is currently ${status}.`}
              </p>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: OFFICIAL TOURNAMENT POSTER FRAME */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--cyan)', fontFamily: 'var(--font-heading)', fontWeight: 700, letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Award size={16} /> OFFICIAL POSTER
            </span>
            <button
              onClick={() => setShowPosterLightbox(true)}
              style={{
                background: 'rgba(0, 243, 255, 0.1)',
                border: '1px solid rgba(0, 243, 255, 0.3)',
                color: 'var(--cyan)',
                padding: '0.3rem 0.7rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontWeight: 600
              }}
            >
              <Maximize2 size={13} /> View Fullscreen
            </button>
          </div>

          {/* Poster Image Container */}
          <div
            onClick={() => setShowPosterLightbox(true)}
            style={{
              position: 'relative',
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px solid rgba(0, 243, 255, 0.25)',
              cursor: 'pointer',
              boxShadow: '0 0 25px rgba(0, 0, 0, 0.5)',
              flex: 1,
              minHeight: '380px',
              background: '#06080c'
            }}
          >
            {/* Blurred backdrop background */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${officialPoster})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(16px) brightness(0.35)',
              transform: 'scale(1.15)'
            }} />

            {/* Crisp foreground poster fitting 100% perfectly without cropping */}
            <img
              src={officialPoster}
              alt={`${title} Official Poster`}
              style={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
                transition: 'transform 0.4s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />

            {/* Hover overlay hint */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(10, 13, 20, 0.9) 0%, transparent 60%)',
              display: 'flex',
              alignItems: 'flex-end',
              padding: '1.2rem',
              pointerEvents: 'none'
            }}>
              <div>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Maximize2 size={14} color="var(--cyan)" /> Click to Enlarge Poster
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', marginTop: '0.2rem' }}>
                  ToxicNullified Official Esports Graphic
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* TABBED SECTIONS NAVIGATION */}
      {/* ------------------------------------------------------------- */}
      <div className="detail-tabs" style={{
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
          <FileText size={16} /> Specifications & Overview
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

      {/* ------------------------------------------------------------- */}
      {/* TAB CONTENT AREAS */}
      {/* ------------------------------------------------------------- */}

      {/* 1. OVERVIEW & FORMAT TAB */}
      {activeTab === 'overview' && (
        <div className="glass-card fade-in" style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--cyan)', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>
            Official Tournament Specifications
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: 'rgba(6, 8, 12, 0.6)', padding: '1.2rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Game Title</span>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', marginTop: '0.3rem' }}>Battlegrounds Mobile India (BGMI)</p>
            </div>
            <div style={{ background: 'rgba(6, 8, 12, 0.6)', padding: '1.2rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Match Format</span>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', marginTop: '0.3rem' }}>{format} ({game_mode})</p>
            </div>
            <div style={{ background: 'rgba(6, 8, 12, 0.6)', padding: '1.2rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Map Rotation</span>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', marginTop: '0.3rem' }}>{map_rotation || 'Erangel, Rondo & Miramar'}</p>
            </div>
            <div style={{ background: 'rgba(6, 8, 12, 0.6)', padding: '1.2rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Device Policy</span>
              <p style={{ color: 'var(--green)', fontWeight: 800, fontSize: '1.1rem', marginTop: '0.3rem' }}>Mobile Only (No Emulators)</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. PRIZE POOL TAB */}
      {activeTab === 'prizepool' && (
        <div className="glass-card fade-in" style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--gold)', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>
            Official Prize Pool Breakdown
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {prize_breakdown && prize_breakdown.length > 0 ? (
              prize_breakdown.map((pb, idx) => (
                <div key={idx} style={{
                  background: idx === 0 ? 'linear-gradient(135deg, rgba(255,183,0,0.15), rgba(10,13,20,0.85))' : 'rgba(6, 8, 12, 0.6)',
                  border: idx === 0 ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '1.8rem',
                  textAlign: 'center',
                  boxShadow: idx === 0 ? '0 0 20px rgba(255, 183, 0, 0.2)' : 'none'
                }}>
                  <Trophy size={36} color={idx === 0 ? 'var(--gold)' : idx === 1 ? '#e2e8f0' : '#cd7f32'} style={{ marginBottom: '0.8rem' }} />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                    {pb.rank}
                  </span>
                  <span style={{ fontSize: '1.6rem', fontWeight: 900, color: idx === 0 ? 'var(--gold)' : 'var(--cyan)', fontFamily: 'var(--font-heading)', display: 'block', marginTop: '0.4rem' }}>
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
            <h3 style={{ color: 'var(--cyan)', fontFamily: 'var(--font-heading)' }}>Participating Teams & Live Points Table</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Updated live by referees</span>
          </div>
          <PointsTable standings={standings} />
        </div>
      )}

      {/* 4. SCHEDULE TAB */}
      {activeTab === 'schedule' && (
        <div className="glass-card fade-in" style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--cyan)', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>
            Match Timeline & Schedule
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {schedule && schedule.length > 0 ? (
              schedule.map((item, idx) => (
                <div key={idx} style={{
                  background: 'rgba(6, 8, 12, 0.6)',
                  borderLeft: '4px solid var(--cyan)',
                  padding: '1.2rem 1.5rem',
                  borderRadius: '0 10px 10px 0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>
                    <h4 style={{ color: '#fff', fontSize: '1.15rem', marginBottom: '0.2rem', fontFamily: 'var(--font-heading)' }}>{item.day}</h4>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Map Rotations: {item.matches}</span>
                  </div>
                  <span className="badge badge-open">
                    {item.date || 'Official Match Day'}
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
          <h3 style={{ color: 'var(--crimson)', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>
            Rules, Code of Conduct & Anti-Cheat Terms
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.9rem', padding: 0 }}>
            {rules && rules.length > 0 ? (
              rules.map((rule, idx) => (
                <li key={idx} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.9rem',
                  background: 'rgba(6, 8, 12, 0.5)',
                  padding: '1rem 1.2rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.05)',
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
            fetchTournamentById(id).then(res => {
              if (res.success) setTournament(res.tournament);
            });
          }}
        />
      )}

      {/* FULLSCREEN POSTER LIGHTBOX MODAL */}
      {showPosterLightbox && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0, 0, 0, 0.92)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
        }}>
          <div style={{ position: 'relative', maxWidth: '900px', width: '100%', textAlign: 'center' }}>
            <button
              onClick={() => setShowPosterLightbox(false)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#fff',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
            <img
              src={officialPoster}
              alt={`${title} Official Poster Fullscreen`}
              style={{
                maxWidth: '100%',
                maxHeight: '85vh',
                borderRadius: '12px',
                boxShadow: '0 0 40px rgba(0, 243, 255, 0.3)',
                border: '1px solid rgba(0, 243, 255, 0.4)'
              }}
            />
            <p style={{ color: 'var(--text-muted)', marginTop: '0.8rem', fontSize: '0.9rem' }}>
              {title} • Official Esports Poster
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

