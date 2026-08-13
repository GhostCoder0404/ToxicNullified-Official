import React from 'react';
import { Shield, ShieldAlert, CheckCircle2, AlertTriangle, FileText, Ban } from 'lucide-react';

export default function Rules() {
  return (
    <div style={{ maxWidth: '1000px', margin: '3rem auto', padding: '0 1.5rem', minHeight: '80vh' }}>
      
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <div style={{
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'rgba(255, 42, 95, 0.15)', border: '2px solid var(--crimson)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto'
        }}>
          <ShieldAlert size={32} color="var(--crimson)" />
        </div>
        <h1 style={{ fontSize: '2.4rem', color: '#fff', marginBottom: '0.6rem' }}>
          OFFICIAL BGMI <span style={{ color: 'var(--crimson)' }}>RULES & TERMS</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '650px', margin: '0 auto' }}>
          ToxicNullified is committed to zero-tolerance fair play. Read our anti-cheat standards and match code of conduct.
        </p>
      </div>

      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--cyan)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={22} /> General Eligibility & Device Policy
        </h3>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem', color: 'var(--text-main)', fontSize: '0.95rem' }}>
          <li>• All players must compete using smartphones (iOS or Android). Emulators and triggers/controllers are strictly prohibited.</li>
          <li>• Minimum player account level of 40 required to prevent smurfing or fresh account hacks.</li>
          <li>• In-Game Character IDs must match the registration roster submitted prior to match start.</li>
          <li>• Roster updates can be requested via Discord support up to 2 hours before match lobby opens.</li>
        </ul>
      </div>

      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid var(--crimson)' }}>
        <h3 style={{ color: 'var(--crimson)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Ban size={22} color="var(--crimson)" /> Anti-Cheat Audit & POV Record Requirement
        </h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.95rem' }}>
          The tournament organizer reserves the right to request full match screen recording with internal/game sound from any squad or MVP player at any point during or after a match.
        </p>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem', color: 'var(--text-main)', fontSize: '0.95rem' }}>
          <li>• Failure to submit POV recording within 1 hour of referee request results in instant DQ and zero points awarded.</li>
          <li>• ESP, Wallhack, Aim Assist mods, iPad View configs, or GFX tool exploit leads to permanent organization ban.</li>
          <li>• Teaming up with opposing rosters results in match forfeiture for all involved teams.</li>
        </ul>
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <h3 style={{ color: 'var(--gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={22} color="var(--gold)" /> Prize Payout & Disconnect Policy
        </h3>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem', color: 'var(--text-main)', fontSize: '0.95rem' }}>
          <li>• Prize money will be transferred via UPI strictly to the verified winning team captain's phone/UPI ID.</li>
          <li>• In case of server crashes affecting more than 20 players, match will be remade at the tournament director's discretion.</li>
          <li>• Individual player disconnects or ping spikes will not cause a match restart.</li>
        </ul>
      </div>

    </div>
  );
}
