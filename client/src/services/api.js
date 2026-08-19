// In production: set VITE_API_BASE_URL to your Render backend URL (e.g. https://toxicnullified-api.onrender.com)
// In local dev: falls back to /api (proxied by Vite)
const rawApiUrl = import.meta.env.VITE_API_BASE_URL || '';
const cleanApiUrl = rawApiUrl.trim().replace(/\/+$/, '');
const API_BASE = cleanApiUrl
  ? (cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`)
  : '/api';

export const fetchTournaments = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/tournaments?${query}`);
  return res.json();
};

export const fetchTournamentById = async (id) => {
  const res = await fetch(`${API_BASE}/tournaments/${id}`);
  return res.json();
};

export const createTournament = async (tournamentData, token) => {
  const res = await fetch(`${API_BASE}/tournaments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(tournamentData)
  });
  return res.json();
};

export const updateTournament = async (id, tournamentData, token) => {
  const res = await fetch(`${API_BASE}/tournaments/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(tournamentData)
  });
  return res.json();
};

export const deleteTournament = async (id, token) => {
  const res = await fetch(`${API_BASE}/tournaments/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return res.json();
};

export const updateStandings = async (id, standingsData, token) => {
  const res = await fetch(`${API_BASE}/tournaments/${id}/points`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ standings: standingsData })
  });
  return res.json();
};

export const submitRegistration = async (formData) => {
  const res = await fetch(`${API_BASE}/registrations`, {
    method: 'POST',
    body: formData // FormData object for file uploads
  });
  return res.json();
};

export const fetchRegistrations = async (token, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/registrations?${query}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return res.json();
};

export const updateRegistrationStatus = async (id, status, token) => {
  const res = await fetch(`${API_BASE}/registrations/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
  return res.json();
};

export const fetchQRCode = async (upiId, name, amount) => {
  const query = new URLSearchParams({ upi: upiId, name, amount }).toString();
  const res = await fetch(`${API_BASE}/qrcode?${query}`);
  return res.json();
};

export const fetchAdminStats = async (token) => {
  const res = await fetch(`${API_BASE}/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return res.json();
};

export const loginAdmin = async (username, password) => {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, message: data.message || `Server returned status ${res.status}` };
    }
    return data;
  } catch (err) {
    console.error('API loginAdmin network error:', err);
    return {
      success: false,
      message: 'Unable to reach backend server. If Render server is sleeping (cold start), please wait 20-30 seconds and try again.'
    };
  }
};
