import React, { useState } from 'react';
import { X, Flame, Upload, CheckCircle2, AlertTriangle, ShieldCheck, CreditCard, UserCheck } from 'lucide-react';
import QRCodeDisplay from './QRCodeDisplay';
import { submitRegistration } from '../services/api';

export default function RegistrationModal({ tournament, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    team_name: '',
    team_tag: '',
    captain_name: '',
    captain_phone: '',
    captain_email: '',
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

    // Form Client-side Validation
    if (!formData.team_name.trim()) return setErrorMsg('Team Name is required');
    if (!formData.captain_name.trim()) return setErrorMsg('Captain Name is required');
    if (!formData.captain_phone.trim()) return setErrorMsg('Captain WhatsApp Phone Number is required');
    
    // Player validation
    if (!formData.player1_ign.trim() || !formData.player1_id.trim()) {
      return setErrorMsg('Player 1 (Captain) In-Game Name & In-Game ID are required');
    }
    if (!formData.player2_ign.trim() || !formData.player2_id.trim()) {
      return setErrorMsg('Player 2 In-Game Name & In-Game ID are required');
    }
    if (!formData.player3_ign.trim() || !formData.player3_id.trim()) {
      return setErrorMsg('Player 3 In-Game Name & In-Game ID are required');
    }
    if (!formData.player4_ign.trim() || !formData.player4_id.trim()) {
      return setErrorMsg('Player 4 In-Game Name & In-Game ID are required');
    }

    if (!formData.payment_ref.trim()) {
      return setErrorMsg('Payment Reference / UTR Number is required');
    }

    if (!formData.terms_accepted) {
      return setErrorMsg('You must read and accept the Terms & Conditions to proceed');
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('tournament_id', tournament.id);
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      if (logoFile) data.append('logo', logoFile);
      if (screenshotFile) data.append('payment_screenshot', screenshotFile);

      const res = await submitRegistration(data);

      if (res.success) {
        setSuccessReceipt(res);
        if (onSuccess) onSuccess(res);
      } else {
        setErrorMsg(res.message || 'Registration failed. Please check input values.');
      }
    } catch (err) {
      console.error('Registration submit error:', err);
      setErrorMsg('Network error submitting registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      background: 'rgba(4, 6, 10, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      
      <div className="glass-card fade-in" style={{
        width: '100%',
        maxWidth: '850px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        border: '1px solid var(--cyan)',
        boxShadow: '0 0 40px rgba(0, 243, 255, 0.2)',
        padding: '2rem'
      }}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={24} />
        </button>

        {/* Modal Header */}
        <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '1rem' }}>
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

        {/* SUCCESS RECEIPT VIEW */}
        {successReceipt ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{
              width: '70px', height: '70px', borderRadius: '50%',
              background: 'rgba(0, 255, 136, 0.15)', border: '2px solid #00ff88',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto'
            }}>
              <CheckCircle2 size={40} color="#00ff88" />
            </div>

            <h3 style={{ color: '#fff', fontSize: '1.6rem', marginBottom: '0.5rem' }}>
              Registration Submitted!
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Your team registration has been recorded and is currently under verification by tournament organizers.
            </p>

            <div style={{
              background: 'rgba(6, 8, 12, 0.8)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '1.2rem',
              maxWidth: '400px',
              margin: '0 auto 2rem auto',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Registration Ticket ID:</span>
                <span style={{ color: 'var(--gold)', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{successReceipt.registrationId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Team Name:</span>
                <span style={{ color: '#fff', fontWeight: 700 }}>{formData.team_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Status:</span>
                <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>Pending Review</span>
              </div>
            </div>

            <button onClick={onClose} className="btn-primary">
              Done & Return to Tournaments
            </button>
          </div>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleSubmit}>
            
            {errorMsg && (
              <div style={{
                background: 'rgba(255, 42, 95, 0.15)',
                border: '1px solid var(--crimson)',
                color: '#ff4d79',
                padding: '0.8rem 1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.9rem'
              }}>
                <AlertTriangle size={18} color="var(--crimson)" />
                {errorMsg}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              
              {/* LEFT COLUMN: Team & Player Info */}
              <div>
                <h4 style={{ color: 'var(--cyan)', marginBottom: '1rem', borderBottom: '1px solid rgba(0,243,255,0.2)', paddingBottom: '0.4rem' }}>
                  1. Team Information
                </h4>

                <div className="form-group">
                  <label className="form-label">Team Name *</label>
                  <input
                    type="text"
                    name="team_name"
                    value={formData.team_name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Soul Strikers"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <div className="form-group">
                    <label className="form-label">Team Tag / Abbr</label>
                    <input
                      type="text"
                      name="team_tag"
                      value={formData.team_tag}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="e.g. SSL"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Team Logo Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLogoFile(e.target.files[0])}
                      className="form-input"
                      style={{ padding: '0.4rem' }}
                    />
                  </div>
                </div>

                <h4 style={{ color: 'var(--cyan)', margin: '1.5rem 0 1rem 0', borderBottom: '1px solid rgba(0,243,255,0.2)', paddingBottom: '0.4rem' }}>
                  2. Captain & Player Lineup (4 Main + 1 Sub)
                </h4>

                <div className="form-group">
                  <label className="form-label">Captain Full Name *</label>
                  <input
                    type="text"
                    name="captain_name"
                    value={formData.captain_name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Captain's real name"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <div className="form-group">
                    <label className="form-label">WhatsApp Phone *</label>
                    <input
                      type="text"
                      name="captain_phone"
                      value={formData.captain_phone}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="+91 9876543210"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Captain Email</label>
                    <input
                      type="email"
                      name="captain_email"
                      value={formData.captain_email}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="captain@email.com"
                    />
                  </div>
                </div>

                {/* Player 1 (Captain) */}
                <div style={{ background: 'rgba(0, 243, 255, 0.05)', padding: '0.8rem', borderRadius: '8px', marginBottom: '0.8rem', border: '1px solid rgba(0,243,255,0.1)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--cyan)', fontWeight: 700 }}>Player 1 (Captain IGN & Character ID) *</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginTop: '0.4rem' }}>
                    <input type="text" name="player1_ign" value={formData.player1_ign} onChange={handleChange} className="form-input" placeholder="In-Game Name" required />
                    <input type="text" name="player1_id" value={formData.player1_id} onChange={handleChange} className="form-input" placeholder="Character ID (e.g. 512398471)" required />
                  </div>
                </div>

                {/* Player 2 */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.8rem', borderRadius: '8px', marginBottom: '0.8rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Player 2 IGN & Character ID *</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginTop: '0.4rem' }}>
                    <input type="text" name="player2_ign" value={formData.player2_ign} onChange={handleChange} className="form-input" placeholder="In-Game Name" required />
                    <input type="text" name="player2_id" value={formData.player2_id} onChange={handleChange} className="form-input" placeholder="Character ID" required />
                  </div>
                </div>

                {/* Player 3 */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.8rem', borderRadius: '8px', marginBottom: '0.8rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Player 3 IGN & Character ID *</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginTop: '0.4rem' }}>
                    <input type="text" name="player3_ign" value={formData.player3_ign} onChange={handleChange} className="form-input" placeholder="In-Game Name" required />
                    <input type="text" name="player3_id" value={formData.player3_id} onChange={handleChange} className="form-input" placeholder="Character ID" required />
                  </div>
                </div>

                {/* Player 4 */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.8rem', borderRadius: '8px', marginBottom: '0.8rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Player 4 IGN & Character ID *</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginTop: '0.4rem' }}>
                    <input type="text" name="player4_ign" value={formData.player4_ign} onChange={handleChange} className="form-input" placeholder="In-Game Name" required />
                    <input type="text" name="player4_id" value={formData.player4_id} onChange={handleChange} className="form-input" placeholder="Character ID" required />
                  </div>
                </div>

                {/* Optional Substitute */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Substitute Player (Optional)</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginTop: '0.4rem' }}>
                    <input type="text" name="sub_ign" value={formData.sub_ign} onChange={handleChange} className="form-input" placeholder="Sub IGN" />
                    <input type="text" name="sub_id" value={formData.sub_id} onChange={handleChange} className="form-input" placeholder="Sub ID" />
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Payment QR & Screenshot Upload */}
              <div>
                <h4 style={{ color: 'var(--gold)', marginBottom: '1rem', borderBottom: '1px solid rgba(255,183,0,0.2)', paddingBottom: '0.4rem' }}>
                  3. Payment & Verification
                </h4>

                <QRCodeDisplay
                  upiId="toxicnullified@upi"
                  amount={tournament?.entry_fee || 0}
                  title={tournament?.title}
                />

                <div style={{ marginTop: '1.2rem' }}>
                  <div className="form-group">
                    <label className="form-label">Payment UTR / Transaction Reference ID *</label>
                    <input
                      type="text"
                      name="payment_ref"
                      value={formData.payment_ref}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="e.g. UPI/2026/984712039 or 12-digit UTR"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Payment Screenshot Proof *</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setScreenshotFile(e.target.files[0])}
                      className="form-input"
                      style={{ padding: '0.4rem' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.3rem' }}>
                      Upload screenshot of your UPI app successful transaction screen.
                    </span>
                  </div>
                </div>

                {/* Terms Acceptance Box */}
                <div style={{
                  background: 'rgba(6, 8, 12, 0.8)',
                  border: '1px solid rgba(0, 243, 255, 0.2)',
                  padding: '1rem',
                  borderRadius: '8px',
                  margin: '1.5rem 0'
                }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="terms_accepted"
                      checked={formData.terms_accepted}
                      onChange={handleChange}
                      style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: 'var(--cyan)' }}
                      required
                    />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                      I agree to the <strong>ToxicNullified Official Tournament Rules</strong>, anti-cheat policy, and confirm that all player character IDs provided are accurate and mobile-only.
                    </span>
                  </label>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-accent"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.9rem' }}
                >
                  <Flame size={18} /> {submitting ? 'Submitting Registration...' : 'Complete & Confirm Entry'}
                </button>

              </div>

            </div>

          </form>
        )}

      </div>
    </div>
  );
}
