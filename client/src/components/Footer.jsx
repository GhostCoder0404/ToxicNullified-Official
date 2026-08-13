import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, ShieldCheck, Youtube, MessageSquare, Award, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: '#040609',
      borderTop: '1px solid rgba(0, 243, 255, 0.15)',
      marginTop: '4rem',
      padding: '4rem 1.5rem 2rem 1.5rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2.5rem',
        paddingBottom: '3rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        
        {/* Col 1: Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <Trophy size={26} color="var(--cyan)" />
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 900, color: '#fff' }}>
              TOXIC<span style={{ color: 'var(--cyan)' }}>NULLIFIED</span>
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
            Official BGMI Esports Tournament Platform. Hosting daily scrims, weekly cups, and major prize pool championships with 100% verified anti-cheat integrity.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" style={{
              width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255, 42, 95, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff2a5f', border: '1px solid rgba(255, 42, 95, 0.3)'
            }}>
              <Youtube size={18} />
            </a>
            <a href="https://discord.com" target="_blank" rel="noreferrer" style={{
              width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(0, 243, 255, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f3ff', border: '1px solid rgba(0, 243, 255, 0.3)'
            }}>
              <MessageSquare size={18} />
            </a>
          </div>
        </div>

        {/* Col 2: Quick Links */}
        <div>
          <h4 style={{ color: 'var(--cyan)', marginBottom: '1rem', fontFamily: 'var(--font-heading)', fontSize: '1rem' }}>
            Quick Navigation
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <li><Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.95rem' }}>Home Landing</Link></li>
            <li><Link to="/tournaments" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.95rem' }}>Upcoming Tournaments</Link></li>
            <li><Link to="/rules" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.95rem' }}>Rules & Anti-Cheat</Link></li>
            <li><Link to="/admin/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.95rem' }}>Organizer Admin Login</Link></li>
          </ul>
        </div>

        {/* Col 3: Fair Play Guarantee */}
        <div>
          <h4 style={{ color: 'var(--gold)', marginBottom: '1rem', fontFamily: 'var(--font-heading)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} /> Anti-Cheat Policy
          </h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
            ToxicNullified enforces strict fair play policies. Emulator usage, third-party software, and unsportsmanlike behavior result in immediate tournament disqualification and prize forfeiture.
          </p>
        </div>

      </div>

      {/* Copyright */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        paddingTop: '1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.85rem'
      }}>
        <div>
          &copy; {new Date().getFullYear()} ToxicNullified Official. All Rights Reserved. Not affiliated with Krafton Inc. BGMI is a trademark of Krafton.
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
          <Link to="/rules" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Terms & Conditions</Link>
          <Link to="/rules" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}
