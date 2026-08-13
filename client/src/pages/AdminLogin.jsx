import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, KeyRound, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('toxic123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(username, password);
      if (res.success) {
        navigate('/admin');
      } else {
        setError(res.message || 'Invalid admin credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Connection error logging in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem'
    }}>
      <div className="glass-card fade-in" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '2.5rem',
        border: '1px solid var(--cyan)',
        boxShadow: '0 0 30px rgba(0, 243, 255, 0.15)'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'rgba(0, 243, 255, 0.15)', border: '2px solid var(--cyan)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto'
          }}>
            <Lock size={26} color="var(--cyan)" />
          </div>
          <h2 style={{ color: '#fff', fontSize: '1.6rem', marginBottom: '0.4rem' }}>
            ADMIN <span style={{ color: 'var(--cyan)' }}>LOGIN</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Authorized tournament organizer portal access.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255, 42, 95, 0.15)',
            border: '1px solid var(--crimson)',
            color: '#ff4d79',
            padding: '0.8rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.88rem'
          }}>
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.8rem' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
          >
            <ShieldCheck size={18} /> {loading ? 'Authenticating...' : 'Sign In to Admin Panel'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '0.6rem', borderRadius: '6px' }}>
          Default Credentials: username: <code>admin</code> | password: <code>toxic123</code>
        </div>

      </div>
    </div>
  );
}
