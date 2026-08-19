import React, { useState, useEffect } from 'react';
import { Search, Filter, Trophy, ArrowUpDown, Flame } from 'lucide-react';
import TournamentCard from '../components/TournamentCard';
import RegistrationModal from '../components/RegistrationModal';
import { fetchTournaments } from '../services/api';

export default function Tournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [statusFilter, setStatusFilter] = useState('All');
  const [formatFilter, setFormatFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');

  const [selectedTournament, setSelectedTournament] = useState(null);

  const loadData = () => {
    setLoading(true);
    fetchTournaments({ status: statusFilter, format: formatFilter, search: searchQuery })
      .then(res => {
        if (res.success) {
          let list = [...res.tournaments];
          
          // Sorting
          if (sortBy === 'prize_desc') {
            list.sort((a, b) => b.prize_pool - a.prize_pool);
          } else if (sortBy === 'prize_asc') {
            list.sort((a, b) => a.prize_pool - b.prize_pool);
          } else if (sortBy === 'date_asc') {
            list.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
          } else {
            // default date_desc
            list.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
          }

          setTournaments(list);
        }
      })
      .catch(err => console.error('Tournaments load error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, formatFilter, searchQuery, sortBy]);

  return (
    <div style={{ maxWidth: '1200px', margin: '3rem auto', padding: '0 1.5rem', minHeight: '80vh' }}>
      
      {/* Header Banner */}
      <div style={{ marginBottom: '2.5rem' }}>
        <span className="badge badge-open" style={{ marginBottom: '0.5rem' }}>
          Official BGMI Competitive Arena
        </span>
        <h1 style={{ fontSize: '2.4rem', color: '#fff', marginBottom: '0.6rem' }}>
          BGMI TOURNAMENTS & <span style={{ color: 'var(--cyan)' }}>CHAMPIONSHIPS</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '700px' }}>
          Filter by prize pool, game format, or tournament status. Register your squad and claim your spot on the live points table.
        </p>
      </div>

      {/* FILTER & SEARCH CONTROL BAR */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.2rem',
          alignItems: 'center'
        }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.3rem' }}
              placeholder="Search tournament name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">Status: All Statuses</option>
              <option value="Registration Open">Status: Registration Open</option>
              <option value="Ongoing">Status: Ongoing</option>
              <option value="Completed">Status: Completed</option>
            </select>
          </div>

          {/* Format Filter */}
          <div>
            <select
              className="form-select"
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
            >
              <option value="All">Format: All Formats (Solo/Duo/Squad)</option>
              <option value="Squad">Format: Squad</option>
              <option value="Duo">Format: Duo</option>
              <option value="Solo">Format: Solo</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date_desc">Sort: Newest First</option>
              <option value="date_asc">Sort: Oldest First</option>
              <option value="prize_desc">Sort: Prize Pool (High to Low)</option>
              <option value="prize_asc">Sort: Prize Pool (Low to High)</option>
            </select>
          </div>

        </div>
      </div>

      {/* TOURNAMENT CARDS GRID */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading tournaments data...
        </div>
      ) : tournaments.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Trophy size={48} color="var(--text-muted)" style={{ opacity: 0.4, marginBottom: '1rem' }} />
          <h3 style={{ color: '#fff', fontFamily: 'var(--font-heading)' }}>No Tournaments Found</h3>
          <p style={{ marginTop: '0.4rem' }}>Try clearing or adjusting your search filters above.</p>
        </div>
      ) : (
        <div className="tournament-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.8rem'
        }}>
          {tournaments.map((t) => (
            <TournamentCard
              key={t.id}
              tournament={t}
              onRegisterClick={(tourney) => setSelectedTournament(tourney)}
            />
          ))}
        </div>
      )}

      {/* REGISTRATION MODAL */}
      {selectedTournament && (
        <RegistrationModal
          tournament={selectedTournament}
          onClose={() => setSelectedTournament(null)}
          onSuccess={() => {
            setSelectedTournament(null);
            loadData();
          }}
        />
      )}

    </div>
  );
}
