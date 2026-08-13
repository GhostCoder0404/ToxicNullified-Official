import React from 'react';
import { Trophy, Flame, Shield, Award } from 'lucide-react';

export default function PointsTable({ standings = [] }) {
  if (!standings || standings.length === 0) {
    return (
      <div style={{
        padding: '3rem',
        textAlign: 'center',
        background: 'rgba(10, 13, 20, 0.5)',
        borderRadius: '12px',
        border: '1px border var(--border-color)',
        color: 'var(--text-muted)'
      }}>
        <Trophy size={40} color="var(--text-muted)" style={{ opacity: 0.5, marginBottom: '0.8rem' }} />
        <h4 style={{ fontFamily: 'var(--font-heading)', color: '#fff' }}>Standings Not Updated Yet</h4>
        <p style={{ fontSize: '0.9rem', marginTop: '0.3rem' }}>
          Points table will be live updated as soon as match results are confirmed.
        </p>
      </div>
    );
  }

  const getRankBadge = (rank) => {
    if (rank === 1) return { color: '#ffb700', bg: 'rgba(255, 183, 0, 0.15)', label: '1st (WWCD)' };
    if (rank === 2) return { color: '#e2e8f0', bg: 'rgba(226, 232, 240, 0.15)', label: '2nd' };
    if (rank === 3) return { color: '#cd7f32', bg: 'rgba(205, 127, 50, 0.15)', label: '3rd' };
    return { color: 'var(--text-muted)', bg: 'transparent', label: `#${rank}` };
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left',
        fontSize: '0.95rem'
      }}>
        <thead>
          <tr style={{
            background: 'rgba(0, 243, 255, 0.08)',
            borderBottom: '2px solid rgba(0, 243, 255, 0.2)',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.85rem',
            color: 'var(--cyan)'
          }}>
            <th style={{ padding: '0.9rem 1rem' }}>Rank</th>
            <th style={{ padding: '0.9rem 1rem' }}>Team Name</th>
            <th style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>WWCD 🏆</th>
            <th style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>Placement Pts</th>
            <th style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>Kill Pts 🎯</th>
            <th style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>Total Points</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team, idx) => {
            const badge = getRankBadge(idx + 1);
            return (
              <tr key={team.id || idx} style={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                background: idx % 2 === 0 ? 'rgba(15, 20, 30, 0.4)' : 'rgba(20, 26, 38, 0.2)',
                transition: 'background 0.2s ease'
              }}>
                {/* Rank */}
                <td style={{ padding: '0.9rem 1rem', fontWeight: 800 }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    background: badge.bg,
                    color: badge.color,
                    fontFamily: 'var(--font-sub)',
                    minWidth: '36px'
                  }}>
                    {idx + 1 === 1 ? <Trophy size={16} color="#ffb700" style={{ marginRight: '4px' }} /> : null}
                    {idx + 1}
                  </span>
                </td>

                {/* Team Name */}
                <td style={{ padding: '0.9rem 1rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-sub)', fontSize: '1.05rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: 'rgba(0, 243, 255, 0.1)', border: '1px solid rgba(0, 243, 255, 0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem'
                    }}>
                      <Shield size={14} color="var(--cyan)" />
                    </div>
                    {team.team_name}
                  </div>
                </td>

                {/* WWCD */}
                <td style={{ padding: '0.9rem 1rem', textAlign: 'center', fontWeight: 700, color: team.wwcd > 0 ? 'var(--gold)' : 'var(--text-muted)' }}>
                  {team.wwcd || 0}
                </td>

                {/* Placement Pts */}
                <td style={{ padding: '0.9rem 1rem', textAlign: 'center', color: 'var(--text-main)' }}>
                  {team.placement_pts || 0}
                </td>

                {/* Kill Pts */}
                <td style={{ padding: '0.9rem 1rem', textAlign: 'center', color: 'var(--crimson)', fontWeight: 700 }}>
                  {team.kill_pts || 0}
                </td>

                {/* Total Points */}
                <td style={{ padding: '0.9rem 1rem', textAlign: 'right', fontWeight: 900, fontSize: '1.1rem', color: 'var(--cyan)', fontFamily: 'var(--font-sub)' }}>
                  {team.total_pts || (team.placement_pts + team.kill_pts)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
