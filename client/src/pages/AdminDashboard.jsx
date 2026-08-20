import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Trophy, Users, DollarSign, Download, Plus, Trash2, Edit, Check, X, Eye,
  ShieldCheck, RefreshCw, BarChart2, FileSpreadsheet, Upload, Search, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  fetchAdminStats, fetchTournaments, fetchRegistrations, updateRegistrationStatus,
  createTournament, updateTournament, deleteTournament, updateStandings, fetchTournamentById
} from '../services/api';
import { db } from '../services/firebase';
import { collection, query as fbQuery, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default function AdminDashboard() {
  const { token, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalTournaments: 0,
    activeTournaments: 0,
    totalRegistrations: 0,
    pendingRegistrations: 0,
    approvedRegistrations: 0,
    totalRevenue: 0
  });

  // Tab State: 'registrations' | 'tournaments' | 'points'
  const [activeTab, setActiveTab] = useState('registrations');

  const [tournaments, setTournaments] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Toast notification state
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Filters
  const [regStatusFilter, setRegStatusFilter] = useState('All');
  const [selectedTourneyId, setSelectedTourneyId] = useState('');

  // Screenshot modal preview
  const [previewScreenshot, setPreviewScreenshot] = useState(null);

  // Tournament Create/Edit Modal state
  const [showTourneyModal, setShowTourneyModal] = useState(false);
  const [editingTourney, setEditingTourney] = useState(null);
  const [tourneyForm, setTourneyForm] = useState({
    title: '', game_mode: 'Squad TPP', format: 'Squad', prize_pool: 10000, entry_fee: 100, max_teams: 64, start_date: '', status: 'Registration Open', banner_url: '', rules_text: '', schedule_text: '', prize_breakdown_text: ''
  });

  // Live Points Table Editor state
  const [editingStandingsTourneyId, setEditingStandingsTourneyId] = useState('');
  const [standingsRows, setStandingsRows] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    loadDashboardData();
  }, [isAuthenticated, regStatusFilter, selectedTourneyId]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes = await fetchAdminStats(token);
      const tourneyRes = await fetchTournaments({ status: 'All' });
      const regRes = await fetchRegistrations(token, { status: regStatusFilter, tournament_id: selectedTourneyId });

      const tourneysList = tourneyRes.success ? tourneyRes.tournaments : [];
      const regsList = regRes.success ? regRes.registrations : [];

      setTournaments(tourneysList);
      setRegistrations(regsList);

      const activeCount = tourneysList.filter(t => t.status === 'Registration Open' || t.status === 'Ongoing').length;
      const pendingCount = regsList.filter(r => (r.status || '').toLowerCase() === 'pending').length;
      const approvedCount = regsList.filter(r => (r.status || '').toLowerCase() === 'approved').length;

      setStats({
        totalTournaments: tourneysList.length || (statsRes.success ? statsRes.stats.totalTournaments : 0),
        activeTournaments: activeCount || (statsRes.success ? statsRes.stats.activeTournaments : 0),
        totalRegistrations: regsList.length || (statsRes.success ? statsRes.stats.totalRegistrations : 0),
        pendingRegistrations: pendingCount || (statsRes.success ? statsRes.stats.pendingRegistrations : 0),
        approvedRegistrations: approvedCount || (statsRes.success ? statsRes.stats.approvedRegistrations : 0),
        totalRevenue: (statsRes.success && statsRes.stats.totalRevenue) || 0
      });
    } catch (err) {
      console.error('Admin load dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // REGISTRATION ACTIONS
  // -------------------------------------------------------------
  const handleStatusUpdate = async (regId, newStatus) => {
    try {
      if (newStatus === 'Rejected') {
        // Optimistic UI: immediately remove the row from local state
        setRegistrations(prev => prev.filter(r => r.id !== regId));

        // Also delete from Firebase Firestore if a mirrored doc exists
        try {
          const q = fbQuery(
            collection(db, 'registrations'),
            where('sqliteId', '==', regId)
          );
          const snapshot = await getDocs(q);
          const deletions = snapshot.docs.map(d => deleteDoc(doc(db, 'registrations', d.id)));
          await Promise.all(deletions);
        } catch (fbErr) {
          // Firebase deletion failure is non-fatal; SQLite record is already deleted
          console.warn('Firebase cleanup warning:', fbErr);
        }
      }

      const res = await updateRegistrationStatus(regId, newStatus, token);
      if (res.success) {
        // Reload everything to sync stats counters (totalRegistrations, approvedRegistrations, etc.)
        loadDashboardData();
        if (newStatus === 'Rejected') {
          showToast('Team rejected and permanently removed.', 'error');
        } else if (newStatus === 'Approved') {
          showToast('Team approved successfully!', 'success');
        }
      }
    } catch (err) {
      console.error('Status update error:', err);
      showToast('Action failed. Please try again.', 'error');
      // Revert optimistic UI on error
      loadDashboardData();
    }
  };

  // -------------------------------------------------------------
  // TOURNAMENT CRUD ACTIONS
  // -------------------------------------------------------------
  const openCreateTourneyModal = () => {
    setEditingTourney(null);
    setTourneyForm({
      title: '',
      game_mode: 'Squad TPP',
      format: 'Squad',
      prize_pool: 15000,
      entry_fee: 100,
      max_teams: 64,
      start_date: new Date().toISOString().slice(0, 16),
      reg_end_date: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 16),
      map_rotation: 'Erangel, Rondo & Miramar',
      organizer: 'ToxicNullified Official',
      status: 'Registration Open',
      banner_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
      poster_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      rules_text: 'Mobile devices only.\nNo emulators allowed.\nRecord clean POV video.',
      schedule_text: 'Day 1: Erangel & Miramar\nDay 2: Grand Finals 4 Matches',
      prize_breakdown_text: '1st Place: ₹ 8,000\n2nd Place: ₹ 4,000\n3rd Place: ₹ 3,000'
    });
    setShowTourneyModal(true);
  };

  const openEditTourneyModal = (t) => {
    setEditingTourney(t);
    setTourneyForm({
      title: t.title || '',
      game_mode: t.game_mode || 'Squad TPP',
      format: t.format || 'Squad',
      prize_pool: t.prize_pool || 0,
      entry_fee: t.entry_fee || 0,
      max_teams: t.max_teams || 64,
      start_date: t.start_date ? t.start_date.slice(0, 16) : '',
      reg_end_date: t.reg_end_date ? t.reg_end_date.slice(0, 16) : '',
      map_rotation: t.map_rotation || 'Erangel, Rondo & Miramar',
      organizer: t.organizer || 'ToxicNullified Official',
      status: t.status || 'Registration Open',
      banner_url: t.banner_url || '',
      poster_url: t.poster_url || t.banner_url || '',
      rules_text: Array.isArray(t.rules) ? t.rules.join('\n') : '',
      schedule_text: Array.isArray(t.schedule) ? t.schedule.map(s => `${s.day}: ${s.matches}`).join('\n') : '',
      prize_breakdown_text: Array.isArray(t.prize_breakdown) ? t.prize_breakdown.map(p => `${p.rank}: ${p.amount}`).join('\n') : ''
    });
    setShowTourneyModal(true);
  };

  const handleSaveTourney = async (e) => {
    e.preventDefault();
    const rules = tourneyForm.rules_text.split('\n').filter(r => r.trim());
    const schedule = tourneyForm.schedule_text.split('\n').filter(s => s.trim()).map(line => {
      const parts = line.split(':');
      return { day: parts[0] || 'Day Match', matches: parts[1] || line };
    });
    const prize_breakdown = tourneyForm.prize_breakdown_text.split('\n').filter(p => p.trim()).map(line => {
      const parts = line.split(':');
      return { rank: parts[0] || 'Place', amount: parts[1] || line };
    });

    const payload = {
      title: tourneyForm.title,
      game_mode: tourneyForm.game_mode,
      format: tourneyForm.format,
      prize_pool: Number(tourneyForm.prize_pool),
      entry_fee: Number(tourneyForm.entry_fee),
      max_teams: Number(tourneyForm.max_teams),
      start_date: tourneyForm.start_date,
      reg_end_date: tourneyForm.reg_end_date,
      map_rotation: tourneyForm.map_rotation,
      organizer: tourneyForm.organizer,
      status: tourneyForm.status,
      banner_url: tourneyForm.banner_url,
      poster_url: tourneyForm.poster_url,
      rules,
      schedule,
      prize_breakdown
    };

    try {
      if (editingTourney) {
        await updateTournament(editingTourney.id, payload, token);
        showToast('Tournament updated and saved to cloud database!', 'success');
      } else {
        await createTournament(payload, token);
        showToast('Tournament created and saved permanently to cloud database!', 'success');
      }
      setShowTourneyModal(false);
      loadDashboardData();
    } catch (err) {
      console.error('Save tournament error:', err);
      showToast('Failed to save tournament. Please try again.', 'error');
    }
  };

  const handleDeleteTourney = async (tId) => {
    if (!window.confirm('Are you sure you want to delete this tournament and all its registrations and standings?')) return;
    try {
      const res = await deleteTournament(tId, token);
      if (res.success) {
        showToast('Tournament deleted successfully.', 'success');
        await loadDashboardData();
      } else {
        alert('Failed to delete tournament: ' + (res.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Delete tournament error:', err);
      alert('Error deleting tournament. Please try again.');
    }
  };

  // -------------------------------------------------------------
  // POINTS TABLE LIVE EDITOR
  // -------------------------------------------------------------
  const loadStandingsForEdit = async (tId) => {
    setEditingStandingsTourneyId(tId);
    if (!tId) return;
    const res = await fetchTournamentById(tId);
    if (res.success) {
      if (res.standings && res.standings.length > 0) {
        setStandingsRows(res.standings);
      } else {
        // Default template rows
        setStandingsRows([
          { team_name: 'GodLike Esports', wwcd: 2, placement_pts: 30, kill_pts: 40 },
          { team_name: 'Team Soul', wwcd: 1, placement_pts: 25, kill_pts: 32 },
          { team_name: 'Team XSpark', wwcd: 1, placement_pts: 20, kill_pts: 28 },
          { team_name: 'Global Esports', wwcd: 0, placement_pts: 15, kill_pts: 22 }
        ]);
      }
    }
  };

  const handleStandingChange = (index, field, value) => {
    const updated = [...standingsRows];
    updated[index][field] = field === 'team_name' ? value : Number(value);
    setStandingsRows(updated);
  };

  const addStandingRow = () => {
    setStandingsRows(prev => [...prev, { team_name: `Team ${prev.length + 1}`, wwcd: 0, placement_pts: 0, kill_pts: 0 }]);
  };

  const removeStandingRow = (index) => {
    setStandingsRows(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveStandings = async () => {
    if (!editingStandingsTourneyId) return;
    try {
      const res = await updateStandings(editingStandingsTourneyId, standingsRows, token);
      if (res.success) {
        alert('Live Points Table updated successfully!');
      }
    } catch (err) {
      console.error('Save standings error:', err);
    }
  };

  // Export CSV helper
  const handleExportCSV = () => {
    window.open(`/api/export/registrations`, '_blank');
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '2rem auto 4rem auto', padding: '0 1.5rem', minHeight: '90vh' }}>

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          background: toast.type === 'success'
            ? 'linear-gradient(135deg, rgba(0,255,136,0.15), rgba(10,13,20,0.95))'
            : 'linear-gradient(135deg, rgba(255,50,80,0.2), rgba(10,13,20,0.95))',
          border: `1px solid ${toast.type === 'success' ? 'var(--green)' : 'var(--crimson)'}`,
          color: toast.type === 'success' ? 'var(--green)' : '#ff5070',
          padding: '0.9rem 1.5rem',
          borderRadius: '10px',
          fontFamily: 'var(--font-sub)',
          fontWeight: 700,
          fontSize: '0.95rem',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          animation: 'fadeIn 0.3s ease',
          maxWidth: '360px'
        }}>
          {toast.message}
        </div>
      )}

      {/* Top Admin Header Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        gap: '1rem'
      }} className="admin-header-bar">
        <div>
          <span className="badge badge-ongoing" style={{ marginBottom: '0.4rem' }}>
            <Lock size={12} /> Protected Admin Panel
          </span>
          <h1 style={{ color: '#fff', fontSize: '2.2rem' }}>
            TOURNAMENT <span style={{ color: 'var(--cyan)' }}>CONTROL CENTER</span>
          </h1>
        </div>

        <div className="admin-header-actions" style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <button onClick={handleExportCSV} className="btn-secondary">
            <Download size={16} /> Export Registrations (CSV)
          </button>
          <button onClick={openCreateTourneyModal} className="btn-accent">
            <Plus size={16} /> Create Tournament
          </button>
          <button onClick={logout} className="btn-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            Logout
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.2rem',
        marginBottom: '2.5rem'
      }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--cyan)' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>Total Tournaments</span>
            <Trophy size={20} />
          </div>
          <span style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', display: 'block', marginTop: '0.5rem', fontFamily: 'var(--font-heading)' }}>
            {stats.totalTournaments}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stats.activeTournaments} active currently</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--gold)' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>Total Registrations</span>
            <Users size={20} />
          </div>
          <span style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', display: 'block', marginTop: '0.5rem', fontFamily: 'var(--font-heading)' }}>
            {stats.totalRegistrations}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--gold)' }}>{stats.pendingRegistrations} pending review</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--green)' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>Approved Teams</span>
            <ShieldCheck size={20} />
          </div>
          <span style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', display: 'block', marginTop: '0.5rem', fontFamily: 'var(--font-heading)' }}>
            {stats.approvedRegistrations}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--green)' }}>Confirmed entries</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--cyan)' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>Total Revenue</span>
            <DollarSign size={20} />
          </div>
          <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--gold)', display: 'block', marginTop: '0.5rem', fontFamily: 'var(--font-heading)' }}>
            ₹ {Number(stats.totalRevenue).toLocaleString('en-IN')}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>From approved entry fees</span>
        </div>
      </div>

      {/* DASHBOARD TAB SELECTOR */}
      <div className="admin-tabs" style={{ display: 'flex', gap: '0.8rem', borderBottom: '1px solid rgba(0, 243, 255, 0.2)', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('registrations')}
          style={{
            background: activeTab === 'registrations' ? 'rgba(0, 243, 255, 0.15)' : 'none',
            border: 'none',
            borderBottom: activeTab === 'registrations' ? '2px solid var(--cyan)' : '2px solid transparent',
            color: activeTab === 'registrations' ? 'var(--cyan)' : 'var(--text-muted)',
            padding: '0.8rem 1.5rem',
            fontFamily: 'var(--font-heading)',
            cursor: 'pointer'
          }}
        >
          Team Registrations ({registrations.length})
        </button>

        <button
          onClick={() => setActiveTab('tournaments')}
          style={{
            background: activeTab === 'tournaments' ? 'rgba(0, 243, 255, 0.15)' : 'none',
            border: 'none',
            borderBottom: activeTab === 'tournaments' ? '2px solid var(--cyan)' : '2px solid transparent',
            color: activeTab === 'tournaments' ? 'var(--cyan)' : 'var(--text-muted)',
            padding: '0.8rem 1.5rem',
            fontFamily: 'var(--font-heading)',
            cursor: 'pointer'
          }}
        >
          Manage Tournaments ({tournaments.length})
        </button>

        <button
          onClick={() => setActiveTab('points')}
          style={{
            background: activeTab === 'points' ? 'rgba(0, 243, 255, 0.15)' : 'none',
            border: 'none',
            borderBottom: activeTab === 'points' ? '2px solid var(--cyan)' : '2px solid transparent',
            color: activeTab === 'points' ? 'var(--cyan)' : 'var(--text-muted)',
            padding: '0.8rem 1.5rem',
            fontFamily: 'var(--font-heading)',
            cursor: 'pointer'
          }}
        >
          Live Points Table Editor
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: TEAM REGISTRATIONS MANAGER */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'registrations' && (
        <div className="glass-card fade-in" style={{ padding: '1.5rem' }}>
          
          {/* Filters Bar */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={regStatusFilter}
              onChange={(e) => setRegStatusFilter(e.target.value)}
            >
              <option value="All">Filter Status: All</option>
              <option value="Pending">Filter Status: Pending Review</option>
              <option value="Approved">Filter Status: Approved</option>
              <option value="Rejected">Filter Status: Rejected</option>
            </select>

            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={selectedTourneyId}
              onChange={(e) => setSelectedTourneyId(e.target.value)}
            >
              <option value="">Filter Tournament: All Tournaments</option>
              {tournaments.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(0, 243, 255, 0.1)', color: 'var(--cyan)', fontFamily: 'var(--font-heading)' }}>
                  <th style={{ padding: '0.8rem' }}>Ticket ID</th>
                  <th style={{ padding: '0.8rem' }}>Tournament</th>
                  <th style={{ padding: '0.8rem' }}>Team & Tag</th>
                  <th style={{ padding: '0.8rem' }}>Captain & Contact</th>
                  <th style={{ padding: '0.8rem' }}>Player Lineup (IGNs / IDs)</th>
                  <th style={{ padding: '0.8rem' }}>Payment Ref / Screenshot</th>
                  <th style={{ padding: '0.8rem' }}>Status</th>
                  <th style={{ padding: '0.8rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.8rem', fontWeight: 800, color: 'var(--gold)', fontFamily: 'var(--font-heading)' }}>
                      TXN-{r.id.toString().padStart(5, '0')}
                    </td>
                    <td style={{ padding: '0.8rem', color: '#fff' }}>{r.tournament_title}</td>
                    <td style={{ padding: '0.8rem', fontWeight: 700, color: 'var(--cyan)' }}>
                      {r.team_name} {r.team_tag ? `[${r.team_tag}]` : ''}
                    </td>
                    <td style={{ padding: '0.8rem' }}>
                      <div>{r.captain_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.captain_phone}</div>
                    </td>
                    <td style={{ padding: '0.8rem', fontSize: '0.8rem' }}>
                      <div>1. {r.player1_ign} ({r.player1_id})</div>
                      <div>2. {r.player2_ign} ({r.player2_id})</div>
                      <div>3. {r.player3_ign} ({r.player3_id})</div>
                      <div>4. {r.player4_ign} ({r.player4_id})</div>
                    </td>
                    <td style={{ padding: '0.8rem' }}>
                      <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700 }}>{r.payment_ref}</div>
                      {r.payment_screenshot && (
                        <button
                          onClick={() => setPreviewScreenshot(`/${r.payment_screenshot}`)}
                          style={{
                            background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer',
                            fontSize: '0.75rem', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '0.2rem'
                          }}
                        >
                          <Eye size={12} /> View Screenshot Proof
                        </button>
                      )}
                    </td>
                    <td style={{ padding: '0.8rem' }}>
                      <span className={`badge ${r.status === 'Approved' ? 'badge-open' : r.status === 'Pending' ? 'badge-ongoing' : 'badge-completed'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.8rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleStatusUpdate(r.id, 'Approved')}
                          className="btn-secondary"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: 'var(--green)' }}
                          title="Approve Team"
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(r.id, 'Rejected')}
                          className="btn-danger"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                          title="Reject Team"
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: MANAGE TOURNAMENTS (CRUD) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'tournaments' && (
        <div className="glass-card fade-in" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ color: 'var(--cyan)' }}>Active & Historical Tournaments</h3>
            <button onClick={openCreateTourneyModal} className="btn-accent" style={{ fontSize: '0.85rem' }}>
              <Plus size={16} /> New Tournament
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(0, 243, 255, 0.1)', color: 'var(--cyan)', fontFamily: 'var(--font-heading)' }}>
                  <th style={{ padding: '0.8rem' }}>ID</th>
                  <th style={{ padding: '0.8rem' }}>Title</th>
                  <th style={{ padding: '0.8rem' }}>Format</th>
                  <th style={{ padding: '0.8rem' }}>Prize Pool</th>
                  <th style={{ padding: '0.8rem' }}>Entry Fee</th>
                  <th style={{ padding: '0.8rem' }}>Registered Slots</th>
                  <th style={{ padding: '0.8rem' }}>Status</th>
                  <th style={{ padding: '0.8rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tournaments.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.8rem', fontWeight: 700 }}>#{t.id}</td>
                    <td style={{ padding: '0.8rem', fontWeight: 700, color: '#fff' }}>{t.title}</td>
                    <td style={{ padding: '0.8rem' }}>{t.format} ({t.game_mode})</td>
                    <td style={{ padding: '0.8rem', color: 'var(--gold)', fontWeight: 700 }}>₹ {t.prize_pool}</td>
                    <td style={{ padding: '0.8rem' }}>{t.entry_fee === 0 ? 'Free' : `₹ ${t.entry_fee}`}</td>
                    <td style={{ padding: '0.8rem' }}>{t.registered_teams || 0} / {t.max_teams}</td>
                    <td style={{ padding: '0.8rem' }}>
                      <span className={`badge ${t.status === 'Registration Open' ? 'badge-open' : t.status === 'Ongoing' ? 'badge-ongoing' : 'badge-completed'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.8rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => openEditTourneyModal(t)}
                          className="btn-secondary"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          <Edit size={14} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTourney(t.id)}
                          className="btn-danger"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: LIVE POINTS TABLE EDITOR */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'points' && (
        <div className="glass-card fade-in" style={{ padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--gold)', marginBottom: '1rem' }}>Live Points Table Scores Manager</h3>
          
          <div className="form-group" style={{ maxWidth: '400px', marginBottom: '1.5rem' }}>
            <label className="form-label">Select Tournament to Edit Standings</label>
            <select
              className="form-select"
              value={editingStandingsTourneyId}
              onChange={(e) => loadStandingsForEdit(e.target.value)}
            >
              <option value="">-- Choose Tournament --</option>
              {tournaments.map(t => (
                <option key={t.id} value={t.id}>{t.title} ({t.status})</option>
              ))}
            </select>
          </div>

          {editingStandingsTourneyId && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h4 style={{ color: '#fff' }}>Match Standings Table Editor</h4>
                <button onClick={addStandingRow} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                  <Plus size={14} /> Add Team Row
                </button>
              </div>

              <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 183, 0, 0.1)', color: 'var(--gold)', fontFamily: 'var(--font-heading)' }}>
                      <th style={{ padding: '0.8rem' }}>Rank</th>
                      <th style={{ padding: '0.8rem' }}>Team Name</th>
                      <th style={{ padding: '0.8rem' }}>WWCD Count</th>
                      <th style={{ padding: '0.8rem' }}>Placement Points</th>
                      <th style={{ padding: '0.8rem' }}>Kill Points</th>
                      <th style={{ padding: '0.8rem' }}>Total Points</th>
                      <th style={{ padding: '0.8rem', textAlign: 'center' }}>Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standingsRows.map((row, idx) => {
                      const total = (Number(row.placement_pts) || 0) + (Number(row.kill_pts) || 0);
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '0.8rem', fontWeight: 800, color: 'var(--gold)' }}>#{idx + 1}</td>
                          <td style={{ padding: '0.8rem' }}>
                            <input
                              type="text"
                              value={row.team_name}
                              onChange={(e) => handleStandingChange(idx, 'team_name', e.target.value)}
                              className="form-input"
                              style={{ padding: '0.4rem' }}
                            />
                          </td>
                          <td style={{ padding: '0.8rem' }}>
                            <input
                              type="number"
                              value={row.wwcd}
                              onChange={(e) => handleStandingChange(idx, 'wwcd', e.target.value)}
                              className="form-input"
                              style={{ padding: '0.4rem', width: '80px' }}
                            />
                          </td>
                          <td style={{ padding: '0.8rem' }}>
                            <input
                              type="number"
                              value={row.placement_pts}
                              onChange={(e) => handleStandingChange(idx, 'placement_pts', e.target.value)}
                              className="form-input"
                              style={{ padding: '0.4rem', width: '90px' }}
                            />
                          </td>
                          <td style={{ padding: '0.8rem' }}>
                            <input
                              type="number"
                              value={row.kill_pts}
                              onChange={(e) => handleStandingChange(idx, 'kill_pts', e.target.value)}
                              className="form-input"
                              style={{ padding: '0.4rem', width: '90px' }}
                            />
                          </td>
                          <td style={{ padding: '0.8rem', fontWeight: 900, color: 'var(--cyan)', fontFamily: 'var(--font-sub)', fontSize: '1.1rem' }}>
                            {total}
                          </td>
                          <td style={{ padding: '0.8rem', textAlign: 'center' }}>
                            <button onClick={() => removeStandingRow(idx)} className="btn-danger" style={{ padding: '0.3rem 0.5rem' }}>
                              <X size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <button onClick={handleSaveStandings} className="btn-primary" style={{ padding: '0.8rem 2rem' }}>
                Save Live Points Table
              </button>
            </div>
          )}

        </div>
      )}

      {/* SCREENSHOT PREVIEW MODAL */}
      {previewScreenshot && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
        }}>
          <div style={{ position: 'relative', background: '#0a0d14', border: '1px solid var(--cyan)', borderRadius: '12px', padding: '1.5rem', maxWidth: '600px', width: '100%' }}>
            <button onClick={() => setPreviewScreenshot(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h4 style={{ color: 'var(--cyan)', marginBottom: '1rem' }}>Payment Screenshot Verification</h4>
            <img src={previewScreenshot} alt="Payment Proof" style={{ width: '100%', borderRadius: '8px', maxHeight: '70vh', objectFit: 'contain' }} />
          </div>
        </div>
      )}

      {/* CREATE/EDIT TOURNAMENT MODAL */}
      {showTourneyModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 250, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
        }}>
          <div className="glass-card" style={{ maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--cyan)' }}>{editingTourney ? 'Edit Tournament' : 'Create New Tournament'}</h3>
              <button onClick={() => setShowTourneyModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveTourney}>
              <div className="form-group">
                <label className="form-label">Tournament Title</label>
                <input type="text" value={tourneyForm.title} onChange={e => setTourneyForm({ ...tourneyForm, title: e.target.value })} className="form-input" required />
              </div>

              <div className="admin-form-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
                <div className="form-group">
                  <label className="form-label">Game Mode</label>
                  <input type="text" value={tourneyForm.game_mode} onChange={e => setTourneyForm({ ...tourneyForm, game_mode: e.target.value })} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Format</label>
                  <select value={tourneyForm.format} onChange={e => setTourneyForm({ ...tourneyForm, format: e.target.value })} className="form-select">
                    <option value="Squad">Squad</option>
                    <option value="Duo">Duo</option>
                    <option value="Solo">Solo</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select value={tourneyForm.status} onChange={e => setTourneyForm({ ...tourneyForm, status: e.target.value })} className="form-select">
                    <option value="Registration Open">Registration Open</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
                <div className="form-group">
                  <label className="form-label">Prize Pool (₹)</label>
                  <input type="number" value={tourneyForm.prize_pool} onChange={e => setTourneyForm({ ...tourneyForm, prize_pool: e.target.value })} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Entry Fee (₹)</label>
                  <input type="number" value={tourneyForm.entry_fee} onChange={e => setTourneyForm({ ...tourneyForm, entry_fee: e.target.value })} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Slots</label>
                  <input type="number" value={tourneyForm.max_teams} onChange={e => setTourneyForm({ ...tourneyForm, max_teams: e.target.value })} className="form-input" />
                </div>
              </div>

              <div className="admin-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div className="form-group">
                  <label className="form-label">Match Start Date & Time</label>
                  <input type="datetime-local" value={tourneyForm.start_date} onChange={e => setTourneyForm({ ...tourneyForm, start_date: e.target.value })} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Registration Deadline</label>
                  <input type="datetime-local" value={tourneyForm.reg_end_date} onChange={e => setTourneyForm({ ...tourneyForm, reg_end_date: e.target.value })} className="form-input" />
                </div>
              </div>

              <div className="admin-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div className="form-group">
                  <label className="form-label">Organizer / Host Name</label>
                  <input type="text" value={tourneyForm.organizer} onChange={e => setTourneyForm({ ...tourneyForm, organizer: e.target.value })} className="form-input" placeholder="ToxicNullified Official" />
                </div>
                <div className="form-group">
                  <label className="form-label">Map Rotation</label>
                  <input type="text" value={tourneyForm.map_rotation} onChange={e => setTourneyForm({ ...tourneyForm, map_rotation: e.target.value })} className="form-input" placeholder="Erangel, Rondo & Miramar" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Official Poster Image URL (Portrait Image on Right)</label>
                <input type="url" value={tourneyForm.poster_url} onChange={e => setTourneyForm({ ...tourneyForm, poster_url: e.target.value })} className="form-input" placeholder="https://..." />
              </div>

              <div className="form-group">
                <label className="form-label">Cover Banner Image URL (Horizontal Image)</label>
                <input type="url" value={tourneyForm.banner_url} onChange={e => setTourneyForm({ ...tourneyForm, banner_url: e.target.value })} className="form-input" placeholder="https://..." />
              </div>

              <div className="form-group">
                <label className="form-label">Rules (One per line)</label>
                <textarea rows={3} value={tourneyForm.rules_text} onChange={e => setTourneyForm({ ...tourneyForm, rules_text: e.target.value })} className="form-textarea" />
              </div>

              <div className="form-group">
                <label className="form-label">Schedule Timeline (e.g. Day 1: Erangel)</label>
                <textarea rows={2} value={tourneyForm.schedule_text} onChange={e => setTourneyForm({ ...tourneyForm, schedule_text: e.target.value })} className="form-textarea" />
              </div>

              <div className="form-group">
                <label className="form-label">Prize Breakdown (e.g. 1st Place: ₹ 10000)</label>
                <textarea rows={2} value={tourneyForm.prize_breakdown_text} onChange={e => setTourneyForm({ ...tourneyForm, prize_breakdown_text: e.target.value })} className="form-textarea" />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}>
                Save & Publish Tournament
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
