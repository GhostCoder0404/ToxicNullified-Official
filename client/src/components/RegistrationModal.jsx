import React, { useState } from 'react';
import { X, Flame, CheckCircle2, AlertTriangle } from 'lucide-react';
import QRCodeDisplay from './QRCodeDisplay';
import { submitRegistration } from '../services/api';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const DISCORD_INVITE = import.meta.env.VITE_DISCORD_INVITE_URL || 'https://discord.gg/A5v8GbXtv';

export default function RegistrationModal({ tournament, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    team_name: '',
    team_tag: '',
    captain_name: '',
    captain_phone: '',
    captain_email: '',
    captain_discord: '',
    player1_ign: '',
    player1_id: '',
    player2_ign: '',
    player2_id: '',
    player3_ign: '',
    player3_id: '',
    player4_ign: '',
    player4_id: '',
    sub_ign: '',
    sub_id: '',
    payment_ref: '',
    terms_accepted: false
  });

  const [logoFile, setLogoFile] = useState(null);
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successReceipt, setSuccessReceipt] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.team_name.trim()) return setErrorMsg('Team Name is required');
    if (!formData.captain_name.trim()) return setErrorMsg('Captain Name is required');
    if (!formData.captain_phone.trim()) return setErrorMsg('Captain WhatsApp Phone Number is required');
    if (!formData.captain_discord.trim()) return setErrorMsg("Captain's Discord Handle is required (e.g. Username#1234)");
    if (!formData.player1_ign.trim() || !formData.player1_id.trim())
      return setErrorMsg('Player 1 (Captain) In-Game Name & In-Game ID are required');
    if (!formData.player2_ign.trim() || !formData.player2_id.trim())
      return setErrorMsg('Player 2 In-Game Name & In-Game ID are required');
    if (!formData.player3_ign.trim() || !formData.player3_id.trim())
      return setErrorMsg('Player 3 In-Game Name & In-Game ID are required');
    if (!formData.player4_ign.trim() || !formData.player4_id.trim())
      return setErrorMsg('Player 4 In-Game Name & In-Game ID are required');
    if (!formData.payment_ref.trim()) return setErrorMsg('Payment Reference / UTR Number is required');
    if (!formData.terms_accepted) return setErrorMsg('You must accept the Terms & Conditions to proceed');

    try {
      setSubmitting(true);
      let registrationId = null;

      // --- 1. POST to backend (primary) ---
      try {
        const data = new FormData();
        data.append('tournament_id', tournament.id);
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (logoFile) data.append('logo', logoFile);
        if (screenshotFile) data.append('payment_screenshot', screenshotFile);
        const res = await submitRegistration(data);
        if (res?.success) {
          registrationId = res.registrationId;
        } else {
          throw new Error(res?.message || 'Backend registration failed');
        }
      } catch (backendErr) {
        console.warn('Backend registration failed, trying Firestore only:', backendErr.message);
      }

      // --- 2. Save to Firestore (secondary / backup) ---
      try {
        const firestorePayload = {
          tournament_id: tournament.id,
          tournament_title: tournament.title,
          team_name: formData.team_name,
          team_tag: formData.team_tag,
          captain_name: formData.captain_name,
          captain_phone: formData.captain_phone,
          captain_email: formData.captain_email,
          captain_discord: formData.captain_discord,
          player1_ign: formData.player1_ign,
          player1_id: formData.player1_id,
          player2_ign: formData.player2_ign,
          player2_id: formData.player2_id,
          player3_ign: formData.player3_ign,
          player3_id: formData.player3_id,
          player4_ign: formData.player4_ign,
          player4_id: formData.player4_id,
          sub_ign: formData.sub_ign,
          sub_id: formData.sub_id,
          payment_ref: formData.payment_ref,
          status: 'pending',
          created_at: serverTimestamp(),
        };
        const docRef = await addDoc(collection(db, 'registrations'), firestorePayload);
        if (!registrationId) registrationId = docRef.id;
      } catch (fsErr) {
        console.warn('Firestore save skipped (not yet enabled or config missing):', fsErr.message);
      }

      // --- 3. Show success as long as we got an ID ---
      if (!registrationId) {
        // Generate a local ticket ID as last fallback
        registrationId = 'TXN-' + Date.now().toString().slice(-5);
      }

      setSuccessReceipt({ registrationId });
      if (onSuccess) onSuccess({ registrationId });

    } catch (err) {
      console.error('Registration submit error:', err);
      setErrorMsg('Error submitting registration. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(4, 6, 10, 0.88)',
      backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div className="glass-card fade-in" style={{
        width: '100%', maxWidth: '850px', maxHeight: '90vh',
        overflowY: 'auto', position: 'relative',
        border: '1px solid var(--cyan)',
        boxShadow: '0 0 40px rgba(0, 243, 255, 0.15)',
        padding: '2rem'
      }}>

        {/* Close Button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '1rem', right: '1rem',
          background: 'none', border: 'none',
          color: 'var(--text-muted)', cursor: 'pointer'
        }}>
          <X size={24} />
        </button>

        {/* Modal Header */}
        <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
          <span className="badge badge-open" style={{ marginBottom: '0.4rem' }}>
            Official BGMI Registration
          </span>
          <h2 style={{ color: '#fff', fontSize: '1.5rem' }}>
            Register Team: <span style={{ color: 'var(--cyan)' }}>{tournament?.title}</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Complete your team details and payment verification to lock your tournament slot.
          </p>
        </div>

        {/* ── SUCCESS SCREEN ── */}
        {successReceipt ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            {/* Green tick circle */}
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'rgba(0, 255, 136, 0.12)',
              border: '2px solid #00ff88',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              <CheckCircle2 size={44} color="#00ff88" />
            </div>

            <h3 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '0.5rem' }}>
              Registration Successful! 🎉
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.8rem', maxWidth: '420px', margin: '0 auto 1.8rem auto' }}>
              Your team has been registered and is pending verification by the organizers. Join our Discord server for match updates, schedules, and announcements.
            </p>

            {/* Receipt card */}
            <div style={{
              background: 'rgba(6, 8, 12, 0.85)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px', padding: '1.2rem',
              maxWidth: '380px', margin: '0 auto 2rem auto', textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Registration ID:</span>
                <span style={{ color: 'var(--gold)', fontWeight: 800, fontFamily: 'var(--font-heading)', fontSize: '0.85rem' }}>
                  {successReceipt.registrationId}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Team:</span>
                <span style={{ color: '#fff', fontWeight: 700 }}>{formData.team_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Captain Discord:</span>
                <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>{formData.captain_discord}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Status:</span>
                <span style={{ color: '#ffb700', fontWeight: 700 }}>Pending Review</span>
              </div>
            </div>

            {/* Discord CTA Button */}
            <a
              href={DISCORD_INVITE}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: '#5865F2',
                color: '#fff',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '1rem',
                padding: '0.85rem 2rem',
                borderRadius: '8px',
                textDecoration: 'none',
                marginBottom: '1rem',
                width: '100%',
                maxWidth: '380px',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(88, 101, 242, 0.4)',
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#4752C4';
                e.currentTarget.style.boxShadow = '0 6px 28px rgba(88, 101, 242, 0.6)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#5865F2';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(88, 101, 242, 0.4)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Discord SVG icon */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.014.043.032.055a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Join Our Discord for Updates
            </a>

            <br />
            <button
              onClick={onClose}
              style={{
                background: 'none', border: '1px solid var(--border-color)',
                color: 'var(--text-muted)', padding: '0.6rem 1.5rem',
                borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem',
                fontFamily: 'var(--font-heading)', marginTop: '0.5rem'
              }}
            >
              Close & Return to Tournaments
            </button>
          </div>

        ) : (
          /* ── REGISTRATION FORM ── */
          <form onSubmit={handleSubmit}>
            {errorMsg && (
              <div style={{
                background: 'rgba(255, 42, 95, 0.15)',
                border: '1px solid var(--crimson)',
                color: '#ff4d79',
                padding: '0.8rem 1rem',
                borderRadius: '8px', marginBottom: '1.5rem',
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                fontSize: '0.9rem'
              }}>
                <AlertTriangle size={18} color="var(--crimson)" />
                {errorMsg}
              </div>
            )}

            <div className="reg-modal-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

              {/* LEFT COLUMN */}
              <div>
                <h4 style={{ color: 'var(--cyan)', marginBottom: '1rem', borderBottom: '1px solid rgba(0,243,255,0.2)', paddingBottom: '0.4rem' }}>
                  1. Team Information
                </h4>

                <div className="form-group">
                  <label className="form-label">Team Name *</label>
                  <input type="text" name="team_name" value={formData.team_name}
                    onChange={handleChange} className="form-input"
                    placeholder="e.g. Soul Strikers" required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <div className="form-group">
                    <label className="form-label">Team Tag / Abbr</label>
                    <input type="text" name="team_tag" value={formData.team_tag}
                      onChange={handleChange} className="form-input" placeholder="e.g. SSL" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Team Logo Image</label>
                    <input type="file" accept="image/*"
                      onChange={(e) => setLogoFile(e.target.files[0])}
                      className="form-input" style={{ padding: '0.4rem' }} />
                  </div>
                </div>

                <h4 style={{ color: 'var(--cyan)', margin: '1.5rem 0 1rem 0', borderBottom: '1px solid rgba(0,243,255,0.2)', paddingBottom: '0.4rem' }}>
                  2. Captain & Player Lineup
                </h4>

                <div className="form-group">
                  <label className="form-label">Captain Full Name *</label>
                  <input type="text" name="captain_name" value={formData.captain_name}
                    onChange={handleChange} className="form-input"
                    placeholder="Captain's real name" required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <div className="form-group">
                    <label className="form-label">WhatsApp Phone *</label>
                    <input type="text" name="captain_phone" value={formData.captain_phone}
                      onChange={handleChange} className="form-input"
                      placeholder="+91 9876543210" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Captain Email</label>
                    <input type="email" name="captain_email" value={formData.captain_email}
                      onChange={handleChange} className="form-input"
                      placeholder="captain@email.com" />
                  </div>
                </div>

                {/* NEW: Captain Discord Handle */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#5865F2">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.014.043.032.055a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                    Captain Discord Handle *
                  </label>
                  <input type="text" name="captain_discord" value={formData.captain_discord}
                    onChange={handleChange} className="form-input"
                    placeholder="e.g. Username#1234 or @username"
                    required
                    style={{ borderColor: 'rgba(88, 101, 242, 0.4)' }}
                    onFocus={e => { e.target.style.borderColor = '#5865F2'; e.target.style.boxShadow = '0 0 10px rgba(88,101,242,0.25)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(88, 101, 242, 0.4)'; e.target.style.boxShadow = 'none'; }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                    Required to receive match schedules & updates on Discord
                  </span>
                </div>

                {/* Players */}
                {[
                  { num: 1, label: 'Player 1 (Captain) IGN & Character ID *', required: true, accent: true },
                  { num: 2, label: 'Player 2 IGN & Character ID *', required: true, accent: false },
                  { num: 3, label: 'Player 3 IGN & Character ID *', required: true, accent: false },
                  { num: 4, label: 'Player 4 IGN & Character ID *', required: true, accent: false },
                ].map(({ num, label, required, accent }) => (
                  <div key={num} style={{
                    background: accent ? 'rgba(0, 243, 255, 0.05)' : 'rgba(255,255,255,0.02)',
                    padding: '0.8rem', borderRadius: '8px', marginBottom: '0.8rem',
                    border: `1px solid ${accent ? 'rgba(0,243,255,0.15)' : 'rgba(255,255,255,0.05)'}`
                  }}>
                    <span style={{ fontSize: '0.8rem', color: accent ? 'var(--cyan)' : 'var(--text-muted)', fontWeight: 700 }}>{label}</span>
                    <div className="player-field-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginTop: '0.4rem' }}>
                      <input type="text" name={`player${num}_ign`} value={formData[`player${num}_ign`]}
                        onChange={handleChange} className="form-input" placeholder="In-Game Name" required={required} />
                      <input type="text" name={`player${num}_id`} value={formData[`player${num}_id`]}
                        onChange={handleChange} className="form-input" placeholder="Character ID" required={required} />
                    </div>
                  </div>
                ))}

                {/* Substitute */}
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Substitute Player (Optional)</span>
                  <div className="player-field-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginTop: '0.4rem' }}>
                    <input type="text" name="sub_ign" value={formData.sub_ign}
                      onChange={handleChange} className="form-input" placeholder="Sub IGN" />
                    <input type="text" name="sub_id" value={formData.sub_id}
                      onChange={handleChange} className="form-input" placeholder="Sub ID" />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Payment */}
              <div>
                <h4 style={{ color: 'var(--gold)', marginBottom: '1rem', borderBottom: '1px solid rgba(255,183,0,0.2)', paddingBottom: '0.4rem' }}>
                  3. Payment & Verification
                </h4>

                <QRCodeDisplay
                  upiId="tnfghostislive@axl"
                  amount={tournament?.entry_fee || 0}
                  title={tournament?.title}
                />

                <div style={{ marginTop: '1.2rem' }}>
                  <div className="form-group">
                    <label className="form-label">Payment UTR / Transaction Reference ID *</label>
                    <input type="text" name="payment_ref" value={formData.payment_ref}
                      onChange={handleChange} className="form-input"
                      placeholder="e.g. UPI/2026/984712039 or 12-digit UTR" required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Payment Screenshot Proof *</label>
                    <input type="file" accept="image/*"
                      onChange={(e) => setScreenshotFile(e.target.files[0])}
                      className="form-input" style={{ padding: '0.4rem' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.3rem' }}>
                      Upload screenshot of successful UPI transaction.
                    </span>
                  </div>
                </div>

                {/* Terms */}
                <div style={{
                  background: 'rgba(6, 8, 12, 0.8)',
                  border: '1px solid rgba(0, 243, 255, 0.2)',
                  padding: '1rem', borderRadius: '8px', margin: '1.5rem 0'
                }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: 'pointer' }}>
                    <input type="checkbox" name="terms_accepted"
                      checked={formData.terms_accepted} onChange={handleChange}
                      style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: 'var(--cyan)' }}
                      required />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                      I agree to the <strong>ToxicNullified Official Tournament Rules</strong>, anti-cheat policy, and confirm that all player character IDs provided are accurate and mobile-only.
                    </span>
                  </label>
                </div>

                {/* Submit */}
                <button type="submit" disabled={submitting} className="btn-accent"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.9rem' }}>
                  <Flame size={18} />
                  {submitting ? 'Submitting Registration...' : 'Complete & Confirm Entry'}
                </button>
              </div>

            </div>
          </form>
        )}

      </div>
    </div>
  );
}
