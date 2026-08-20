import { db } from './firebase';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query as fsQuery,
  where,
  serverTimestamp
} from 'firebase/firestore';

// In production: set VITE_API_BASE_URL to your Render backend URL (e.g. https://toxicnullified-api.onrender.com)
// In local dev: falls back to /api (proxied by Vite)
const rawApiUrl = import.meta.env.VITE_API_BASE_URL || '';
const cleanApiUrl = rawApiUrl.trim().replace(/\/+$/, '');
const API_BASE = cleanApiUrl
  ? (cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`)
  : '/api';

export const fetchTournaments = async (params = {}) => {
  let apiTournaments = [];
  try {
    const queryStr = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/tournaments?${queryStr}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.tournaments)) {
        apiTournaments = data.tournaments;
      }
    }
  } catch (err) {
    console.warn('Backend API fetchTournaments offline/error, falling back to Firebase Firestore:', err.message);
  }

  let firestoreTournaments = [];
  try {
    const snapshot = await getDocs(collection(db, 'tournaments'));
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      firestoreTournaments.push({
        id: docSnap.id,
        firestoreId: docSnap.id,
        ...data,
        rules: Array.isArray(data.rules) ? data.rules : (typeof data.rules === 'string' ? JSON.parse(data.rules || '[]') : []),
        schedule: Array.isArray(data.schedule) ? data.schedule : (typeof data.schedule === 'string' ? JSON.parse(data.schedule || '[]') : []),
        prize_breakdown: Array.isArray(data.prize_breakdown) ? data.prize_breakdown : (typeof data.prize_breakdown === 'string' ? JSON.parse(data.prize_breakdown || '[]') : []),
      });
    });
  } catch (fsErr) {
    console.warn('Firestore fetchTournaments warning:', fsErr.message);
  }

  // Merge tournaments: prioritize Firestore as primary persistent cloud store
  const map = new Map();
  // Add API tournaments
  apiTournaments.forEach(t => map.set(String(t.id), t));

  // Merge with Firestore tournaments
  firestoreTournaments.forEach(t => {
    const existingKey = Array.from(map.keys()).find(k => {
      const item = map.get(k);
      return (t.id && String(item.id) === String(t.id)) || (t.title && item.title === t.title);
    });

    if (existingKey) {
      map.set(existingKey, { ...map.get(existingKey), ...t });
    } else {
      map.set(String(t.id), t);
    }
  });

  let merged = Array.from(map.values());

  // Apply filters
  if (params.status && params.status !== 'All') {
    merged = merged.filter(t => t.status === params.status);
  }
  if (params.format && params.format !== 'All') {
    merged = merged.filter(t => t.format === params.format);
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    merged = merged.filter(t =>
      (t.title && t.title.toLowerCase().includes(q)) ||
      (t.game_mode && t.game_mode.toLowerCase().includes(q))
    );
  }

  return { success: true, tournaments: merged };
};

export const fetchTournamentById = async (id) => {
  let tournament = null;
  let standings = [];

  // 1. Try API first
  try {
    const res = await fetch(`${API_BASE}/tournaments/${id}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.tournament) {
        tournament = data.tournament;
        standings = data.standings || [];
      }
    }
  } catch (err) {
    console.warn('Backend API fetchTournamentById network error:', err.message);
  }

  // 2. Fallback to Firestore if missing or offline
  if (!tournament) {
    try {
      const docRef = doc(db, 'tournaments', String(id));
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        tournament = {
          id: docSnap.id,
          firestoreId: docSnap.id,
          ...data,
          rules: Array.isArray(data.rules) ? data.rules : [],
          schedule: Array.isArray(data.schedule) ? data.schedule : [],
          prize_breakdown: Array.isArray(data.prize_breakdown) ? data.prize_breakdown : [],
          registered_teams: data.registered_teams || 0
        };
        standings = data.standings || [];
      } else {
        const q = fsQuery(collection(db, 'tournaments'), where('id', '==', String(id)));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const docItem = snapshot.docs[0];
          const data = docItem.data();
          tournament = {
            id: docItem.id,
            firestoreId: docItem.id,
            ...data,
            rules: Array.isArray(data.rules) ? data.rules : [],
            schedule: Array.isArray(data.schedule) ? data.schedule : [],
            prize_breakdown: Array.isArray(data.prize_breakdown) ? data.prize_breakdown : [],
            registered_teams: data.registered_teams || 0
          };
          standings = data.standings || [];
        }
      }
    } catch (fsErr) {
      console.warn('Firestore fetchTournamentById warning:', fsErr.message);
    }
  }

  if (tournament) {
    return { success: true, tournament, standings };
  }

  return { success: false, message: 'Tournament not found' };
};

export const createTournament = async (tournamentData, token) => {
  let createdId = null;

  // 1. Save to backend API if available
  try {
    const res = await fetch(`${API_BASE}/tournaments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(tournamentData)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        createdId = data.tournamentId;
      }
    }
  } catch (err) {
    console.warn('API createTournament offline/error, writing directly to Firestore:', err.message);
  }

  // 2. Always persist directly to Firebase Firestore
  try {
    const docRef = await addDoc(collection(db, 'tournaments'), {
      ...tournamentData,
      id: createdId ? String(createdId) : 'TRN-' + Date.now(),
      registered_teams: 0,
      created_at: serverTimestamp()
    });
    if (!createdId) {
      createdId = docRef.id;
    }
    await updateDoc(docRef, { firestoreId: docRef.id, id: String(createdId) });
  } catch (fsErr) {
    console.warn('Firestore createTournament save warning:', fsErr.message);
  }

  return { success: true, message: 'Tournament created and saved to cloud database', tournamentId: createdId };
};

export const updateTournament = async (id, tournamentData, token) => {
  // 1. API Update
  try {
    await fetch(`${API_BASE}/tournaments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(tournamentData)
    });
  } catch (err) {
    console.warn('API updateTournament error:', err.message);
  }

  // 2. Firestore Update
  try {
    const docRef = doc(db, 'tournaments', String(id));
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await updateDoc(docRef, tournamentData);
    } else {
      const q = fsQuery(collection(db, 'tournaments'), where('id', '==', String(id)));
      const snapshot = await getDocs(q);
      snapshot.forEach(async (dSnap) => {
        await updateDoc(doc(db, 'tournaments', dSnap.id), tournamentData);
      });
    }
  } catch (fsErr) {
    console.warn('Firestore updateTournament warning:', fsErr.message);
  }

  return { success: true, message: 'Tournament updated successfully' };
};

export const deleteTournament = async (id, token) => {
  // 1. API Delete
  try {
    await fetch(`${API_BASE}/tournaments/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (err) {
    console.warn('API deleteTournament error:', err.message);
  }

  // 2. Firestore Delete
  try {
    const docRef = doc(db, 'tournaments', String(id));
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await deleteDoc(docRef);
    } else {
      const q = fsQuery(collection(db, 'tournaments'), where('id', '==', String(id)));
      const snapshot = await getDocs(q);
      snapshot.forEach(async (dSnap) => {
        await deleteDoc(doc(db, 'tournaments', dSnap.id));
      });
    }
  } catch (fsErr) {
    console.warn('Firestore deleteTournament warning:', fsErr.message);
  }

  return { success: true, message: 'Tournament deleted successfully' };
};

export const updateStandings = async (id, standingsData, token) => {
  // 1. API Update
  try {
    await fetch(`${API_BASE}/tournaments/${id}/points`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ standings: standingsData })
    });
  } catch (err) {
    console.warn('API updateStandings error:', err.message);
  }

  // 2. Firestore Update
  try {
    const docRef = doc(db, 'tournaments', String(id));
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await updateDoc(docRef, { standings: standingsData });
    } else {
      const q = fsQuery(collection(db, 'tournaments'), where('id', '==', String(id)));
      const snapshot = await getDocs(q);
      snapshot.forEach(async (dSnap) => {
        await updateDoc(doc(db, 'tournaments', dSnap.id), { standings: standingsData });
      });
    }
  } catch (fsErr) {
    console.warn('Firestore updateStandings warning:', fsErr.message);
  }

  return { success: true, message: 'Standings updated successfully' };
};

export const submitRegistration = async (formData) => {
  const res = await fetch(`${API_BASE}/registrations`, {
    method: 'POST',
    body: formData // FormData object for file uploads
  });
  return res.json();
};

export const fetchRegistrations = async (token, params = {}) => {
  let apiRegistrations = [];
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/registrations?${query}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.registrations)) {
        apiRegistrations = data.registrations;
      }
    }
  } catch (err) {
    console.warn('Backend API fetchRegistrations network error, falling back to Firestore:', err.message);
  }

  let firestoreRegistrations = [];
  try {
    const snapshot = await getDocs(collection(db, 'registrations'));
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      firestoreRegistrations.push({
        id: docSnap.id,
        firestoreId: docSnap.id,
        tournament_title: data.tournament_title || 'BGMI Championship',
        ...data
      });
    });
  } catch (fsErr) {
    console.warn('Firestore fetchRegistrations warning:', fsErr.message);
  }

  // Merge registrations
  const map = new Map();
  apiRegistrations.forEach(r => map.set(String(r.id), r));
  firestoreRegistrations.forEach(r => {
    const existingKey = Array.from(map.keys()).find(k => {
      const item = map.get(k);
      return (r.id && String(item.id) === String(r.id)) || (r.team_name && item.team_name === r.team_name);
    });
    if (existingKey) {
      map.set(existingKey, { ...map.get(existingKey), ...r });
    } else {
      map.set(String(r.id), r);
    }
  });

  let merged = Array.from(map.values());
  if (params.status && params.status !== 'All') {
    merged = merged.filter(r => (r.status || '').toLowerCase() === params.status.toLowerCase());
  }
  if (params.tournament_id) {
    merged = merged.filter(r => String(r.tournament_id) === String(params.tournament_id));
  }

  return { success: true, registrations: merged };
};

export const updateRegistrationStatus = async (id, status, token) => {
  try {
    const res = await fetch(`${API_BASE}/registrations/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('API updateRegistrationStatus error:', err.message);
  }

  // Also update Firestore
  try {
    const docRef = doc(db, 'registrations', String(id));
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      if (status === 'Rejected') {
        await deleteDoc(docRef);
      } else {
        await updateDoc(docRef, { status });
      }
    } else {
      const q = fsQuery(collection(db, 'registrations'), where('sqliteId', '==', id));
      const snapshot = await getDocs(q);
      snapshot.forEach(async (dSnap) => {
        if (status === 'Rejected') {
          await deleteDoc(doc(db, 'registrations', dSnap.id));
        } else {
          await updateDoc(doc(db, 'registrations', dSnap.id), { status });
        }
      });
    }
  } catch (fsErr) {
    console.warn('Firestore updateRegistrationStatus warning:', fsErr.message);
  }

  return { success: true, message: `Registration status updated to ${status}` };
};

export const fetchQRCode = async (upiId, name, amount) => {
  try {
    const query = new URLSearchParams({ upi: upiId, name, amount }).toString();
    const res = await fetch(`${API_BASE}/qrcode?${query}`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('API fetchQRCode error:', err.message);
  }
  return { success: false, message: 'Failed to fetch QR code' };
};

export const fetchAdminStats = async (token) => {
  try {
    const res = await fetch(`${API_BASE}/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('API fetchAdminStats error:', err.message);
  }
  return {
    success: true,
    stats: {
      totalTournaments: 0,
      activeTournaments: 0,
      totalRegistrations: 0,
      pendingRegistrations: 0,
      approvedRegistrations: 0,
      totalRevenue: 0
    }
  };
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

