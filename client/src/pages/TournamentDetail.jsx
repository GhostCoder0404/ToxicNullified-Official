import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Trophy, Calendar, Users, Shield, Flame, CheckCircle, ChevronDown, ChevronUp, Clock,
  Award, FileText, ListOrdered, ArrowLeft, Maximize2, X, MapPin, Gamepad2, AlertCircle, Grid, Layers
} from 'lucide-react';
import PointsTable from '../components/PointsTable';
import RegistrationModal from '../components/RegistrationModal';
import { fetchTournamentById } from '../services/api';

export default function TournamentDetail() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab state: 'format' | 'groups' | 'overview' | 'prizepool' | 'standings' | 'schedule' | 'rules'
  const [activeTab, setActiveTab] = useState('format');

  // Interactive Stage Timeline & Groups state
  const [expandedRoundIdx, setExpandedRoundIdx] = useState(0);
  const [selectedGroupIdx, setSelectedGroupIdx] = useState(0);

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
    status, banner_url, poster_url, rules, schedule, prize_breakdown,
    rounds_format, groups_data
  } = tournament;

  const defaultRounds = [
    {
      name: 'Qualifiers Round 1',
      dates: '6th - 9th May 2026',
      status: 'Upcoming',
      description: 'All registered teams divided into groups. Top 12 teams per group advance to Round 2.',
      map_schedule: 'Erangel & Miramar',
      qualifying_slots: 'Top 12 Teams Advance'
    },
    {
      name: 'Qualifiers Round 2',
      dates: '11th - 14th May 2026',
      status: 'Upcoming',
      description: '32 Teams competing in 4 matches. Top 8 teams advance directly to Semi Finals.',
      map_schedule: 'Erangel, Rondo & Miramar',
      qualifying_slots: 'Top 8 to Semi Finals'
    },
    {
      name: 'Qualifiers Round 3',
      dates: '16th - 19th May 2026',
      status: 'Upcoming',
      description: 'Quarter finals round for qualifying teams.',
      map_schedule: 'Erangel & Miramar',
      qualifying_slots: 'Top 12 Advance'
    },
    {
      name: 'Qualifiers Round 4',
      dates: '28th - 31st May 2026',
      status: 'Upcoming',
      description: 'Playoffs stage for high seed contenders.',
      map_schedule: 'Erangel, Rondo & Miramar',
      qualifying_slots: 'Top 10 Advance'
    },
    {
      name: 'Survival Stage',
      dates: '2nd - 5th June, 2026',
      status: 'Upcoming',
      description: 'Wildcard battle stage for bottom bracket teams.',
      map_schedule: 'Erangel & Miramar',
      qualifying_slots: 'Top 4 Wildcards'
    },
    {
      name: 'Semi Finals',
      dates: '9th - 12th June, 2026',
      status: 'Upcoming',
      description: 'Top 24 Teams divided into 3 groups (A vs B, B vs C, A vs C).',
      map_schedule: 'Erangel, Rondo, Miramar',
      qualifying_slots: 'Top 16 to Grand Finals'
    },
    {
      name: 'Last Chance',
      dates: '13th - 14th June, 2026',
      status: 'Upcoming',
      description: 'Final decider match for remaining 2 final slots.',
      map_schedule: 'Erangel & Miramar',
      qualifying_slots: 'Top 2 Advance'
    },
    {
      name: 'Grand Finals',
      dates: '19th - 21st June, 2026',
      status: 'Upcoming',
      description: 'Final 16 Teams compete over 3 Days (18 Matches Total) for the ₹ 15,000 Prize Pool.',
      map_schedule: 'All Maps (6 Matches / Day)',
      qualifying_slots: 'Champion Title & Trophy'
    }
  ];

  const activeRounds = Array.isArray(rounds_format) && rounds_format.length > 0 ? rounds_format : defaultRounds;
  const activeGroups = Array.isArray(groups_data) ? groups_data : [];

  const filledPercent = Math.min(100, Math.round(((registered_teams || 0) / (max_teams || 64)) * 100));
  const officialPoster = poster_url || banner_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80';
  const coverBanner = banner_url || officialPoster;

  return (
    <div style={{ maxWidth: '1280px', margin: '2rem auto 4rem auto', padding: '0 1.5rem' }}>
      
      {/* ------------------------------------------------------------- */}
      {/* HEADER SECTION */}
      {/* ------------------------------------------------------------- */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/tournaments" style={{ color: 'var(--cyan)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Back to Tournaments
        </Link>
      </div>

      {/* DUAL COLUMN SPLIT SCREEN: SPECIFICATIONS LEFT & POSTER RIGHT */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', marginBottom: '2.5rem' }} className="tourney-detail-grid">

        {/* LEFT COLUMN */}
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
              <span className={`badge ${status === 'Registration Open' ? 'badge-open' : status === 'Ongoing' ? 'badge-ongoing' : 'badge-completed'}`}>
                {status}
              </span>
              <span style={{ background: 'rgba(0, 243, 255, 0.1)', color: 'var(--cyan)', border: '1px solid rgba(0, 243, 255, 0.3)', padding: '0.2rem 0.7rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                {game_mode} ({format})
              </span>
            </div>

            <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)', color: '#fff', margin: '0 0 1rem 0', lineHeight: 1.2 }}>
              {title}
            </h1>

            {/* Quick Stats Banner */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '1rem',
              background: 'rgba(6, 8, 12, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '1.2rem',
              marginBottom: '1.8rem'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase' }}>Prize Pool</span>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '1.4rem', fontWeight: 900, color: 'var(--gold)', fontFamily: 'var(--font-heading)' }}>
                  ₹ {Number(prize_pool).toLocaleString('en-IN')}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Entry Fee</span>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                  {entry_fee === 0 ? 'FREE' : `₹ ${entry_fee}`}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Slots Filled</span>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '1.2rem', fontWeight: 800, color: 'var(--cyan)' }}>
                  {registered_teams || 0} / {max_teams}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Match Date</span>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                  {start_date ? new Date(start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA'}
                </p>
              </div>
            </div>

            {/* Slot Registration Meter */}
            <div style={{ marginBottom: '1.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Registration Capacity</span>
                <span style={{ color: filledPercent >= 90 ? 'var(--crimson)' : 'var(--cyan)', fontWeight: 700 }}>
                  {filledPercent}% Slots Reserved
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${filledPercent}%`,
                  height: '100%',
                  background: filledPercent >= 90 ? 'var(--crimson)' : 'linear-gradient(90deg, var(--cyan), var(--green))',
                  borderRadius: '4px',
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>
          </div>

          {/* Registration Gate & T&C Acceptance */}
          {status === 'Registration Open' && filledPercent < 100 ? (
            <div style={{ background: 'rgba(0, 243, 255, 0.04)', border: '1px solid rgba(0, 243, 255, 0.2)', borderRadius: '12px', padding: '1.2rem' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', cursor: 'pointer', marginBottom: '1rem' }}>
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
                  justifyContent: 'center',
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

        {/* RIGHT COLUMN: POSTER */}
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
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${officialPoster})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(16px) brightness(0.35)',
              transform: 'scale(1.15)'
            }} />
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
            />
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
          onClick={() => setActiveTab('format')}
          style={{
            background: activeTab === 'format' ? 'rgba(0, 243, 255, 0.15)' : 'none',
            border: 'none',
            borderBottom: activeTab === 'format' ? '2px solid var(--cyan)' : '2px solid transparent',
            color: activeTab === 'format' ? 'var(--cyan)' : 'var(--text-muted)',
            padding: '0.8rem 1.2rem',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Layers size={16} /> Format & Stages Roadmap
        </button>

        <button
          onClick={() => setActiveTab('groups')}
          style={{
            background: activeTab === 'groups' ? 'rgba(192, 132, 252, 0.15)' : 'none',
            border: 'none',
            borderBottom: activeTab === 'groups' ? '2px solid #c084fc' : '2px solid transparent',
            color: activeTab === 'groups' ? '#c084fc' : 'var(--text-muted)',
            padding: '0.8rem 1.2rem',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Grid size={16} /> Team Groups & Divisions ({activeGroups.length})
        </button>

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
          <FileText size={16} /> Specifications
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
          <ListOrdered size={16} /> Live Points Table
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
          <Shield size={16} /> Rules
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB CONTENT AREAS */}
      {/* ------------------------------------------------------------- */}

      {/* 1. FORMAT & STAGES TAB */}
      {activeTab === 'format' && (
        <div className="glass-card fade-in" style={{ padding: '2rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ color: 'var(--cyan)', margin: 0, fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Layers size={22} /> Tournament Format & Stage Roadmap
              </h3>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.3rem', display: 'block' }}>
                Click on any round stage below to reveal match maps, schedules, and qualification rules.
              </span>
            </div>
          </div>

          <div style={{ position: 'relative', paddingLeft: '2rem' }}>
            <div style={{
              position: 'absolute',
              left: '11px',
              top: '20px',
              bottom: '20px',
              width: '2px',
              background: 'linear-gradient(to bottom, var(--crimson), var(--cyan))',
              boxShadow: '0 0 10px rgba(255, 70, 85, 0.5)',
              zIndex: 1
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {activeRounds.map((round, idx) => {
                const isExpanded = expandedRoundIdx === idx;
                return (
                  <div key={idx} style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: '-2rem',
                      top: '18px',
                      transform: 'translateX(-50%)',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: round.status === 'Completed' ? 'var(--green)' : round.status === 'Ongoing' ? 'var(--cyan)' : 'var(--crimson)',
                      boxShadow: round.status === 'Completed' ? '0 0 10px var(--green)' : round.status === 'Ongoing' ? '0 0 10px var(--cyan)' : '0 0 10px var(--crimson)',
                      border: '2px solid #0a0d14',
                      zIndex: 2
                    }} />

                    <div
                      onClick={() => setExpandedRoundIdx(isExpanded ? null : idx)}
                      style={{
                        background: isExpanded ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.04)',
                        border: isExpanded ? '1px solid var(--cyan)' : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        padding: '1.2rem 1.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: isExpanded ? '0 0 25px rgba(0, 243, 255, 0.15)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          <h4 style={{ color: '#ffffff', margin: 0, fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                            {round.name}
                          </h4>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          <span style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#cbd5e1', padding: '0.4rem 0.9rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            {round.dates}
                          </span>
                          {isExpanded ? <ChevronUp size={18} color="var(--cyan)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div style={{
                          marginTop: '1.2rem',
                          paddingTop: '1rem',
                          borderTop: '1px dashed rgba(255, 255, 255, 0.1)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.8rem'
                        }}>
                          <p style={{ color: '#e2e8f0', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>{round.description}</p>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8rem', marginTop: '0.4rem' }}>
                            {round.map_schedule && (
                              <div style={{ background: 'rgba(6, 8, 12, 0.6)', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid rgba(0, 243, 255, 0.15)' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--cyan)', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Map Rotation</span>
                                <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>{round.map_schedule}</span>
                              </div>
                            )}
                            {round.qualifying_slots && (
                              <div style={{ background: 'rgba(6, 8, 12, 0.6)', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid rgba(255, 183, 0, 0.15)' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Qualification Rule</span>
                                <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>{round.qualifying_slots}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. GROUPS & DIVISIONS TAB */}
      {activeTab === 'groups' && (
        <div className="glass-card fade-in" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#c084fc', margin: 0, fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Grid size={22} /> Official Team Groups & Divisions
            </h3>
          </div>

          {activeGroups && activeGroups.length > 0 ? (
            <div>
              <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '0.8rem', marginBottom: '1.5rem' }}>
                {activeGroups.map((group, gIdx) => (
                  <button
                    key={gIdx}
                    onClick={() => setSelectedGroupIdx(gIdx)}
                    style={{
                      background: selectedGroupIdx === gIdx ? 'linear-gradient(135deg, #a855f7, #6366f1)' : 'rgba(255, 255, 255, 0.05)',
                      border: selectedGroupIdx === gIdx ? '1px solid #c084fc' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      padding: '0.6rem 1.4rem',
                      borderRadius: '30px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Shield size={16} /> {group.name} ({group.teams ? group.teams.length : 0} Teams)
                  </button>
                ))}
              </div>

              {activeGroups[selectedGroupIdx] && (
                <div>
                  <h4 style={{ color: '#ffffff', marginBottom: '1rem' }}>Roster — {activeGroups[selectedGroupIdx].name}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.2rem' }}>
                    {activeGroups[selectedGroupIdx].teams.map((team, tIdx) => (
                      <div key={tIdx} style={{ background: 'rgba(10, 13, 20, 0.8)', border: '1px solid rgba(192, 132, 252, 0.2)', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img src={team.logo_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=150&q=80'} style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #c084fc' }} alt="logo" />
                        <div>
                          <h5 style={{ color: '#ffffff', margin: 0 }}>{team.team_name}</h5>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Captain: {team.captain_name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Group divisions will be published soon.</div>
          )}
        </div>
      )}

      {/* 3. OVERVIEW TAB */}
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
