const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const { run, query, get, initSchema } = require('./models/db');
const { verifyToken, JWT_SECRET } = require('./middleware/auth');
const upload = require('./middleware/upload');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ToxicNullified API', timestamp: new Date().toISOString() });
});

// -------------------------------------------------------------
// AUTH ENDPOINTS
// -------------------------------------------------------------
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password required' });
    }

    const user = await get(`SELECT * FROM users WHERE username = ?`, [username]);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/api/auth/me', verifyToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

// -------------------------------------------------------------
// TOURNAMENT ENDPOINTS
// -------------------------------------------------------------
app.get('/api/tournaments', async (req, res) => {
  try {
    const { status, format, search } = req.query;
    let sql = `SELECT * FROM tournaments WHERE 1=1`;
    const params = [];

    if (status && status !== 'All') {
      sql += ` AND status = ?`;
      params.push(status);
    }
    if (format && format !== 'All') {
      sql += ` AND format = ?`;
      params.push(format);
    }
    if (search) {
      sql += ` AND (title LIKE ? OR game_mode LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY id DESC`;
    const tournaments = await query(sql, params);

    // Parse JSON fields safely
    const formatted = tournaments.map(t => ({
      ...t,
      rules: t.rules ? JSON.parse(t.rules) : [],
      schedule: t.schedule ? JSON.parse(t.schedule) : [],
      prize_breakdown: t.prize_breakdown ? JSON.parse(t.prize_breakdown) : []
    }));

    res.json({ success: true, tournaments: formatted });
  } catch (err) {
    console.error('Fetch tournaments error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch tournaments' });
  }
});

app.get('/api/tournaments/:id', async (req, res) => {
  try {
    const tId = req.params.id;
    const tournament = await get(`SELECT * FROM tournaments WHERE id = ?`, [tId]);

    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    const standings = await query(
      `SELECT * FROM standings WHERE tournament_id = ? ORDER BY rank ASC, total_pts DESC`,
      [tId]
    );

    const registrationCount = await get(
      `SELECT COUNT(*) as count FROM registrations WHERE tournament_id = ? AND status != 'Rejected'`,
      [tId]
    );

    res.json({
      success: true,
      tournament: {
        ...tournament,
        rules: tournament.rules ? JSON.parse(tournament.rules) : [],
        schedule: tournament.schedule ? JSON.parse(tournament.schedule) : [],
        prize_breakdown: tournament.prize_breakdown ? JSON.parse(tournament.prize_breakdown) : [],
        registered_teams: registrationCount ? registrationCount.count : 0
      },
      standings
    });
  } catch (err) {
    console.error('Fetch tournament detail error:', err);
    res.status(500).json({ success: false, message: 'Error retrieving tournament detail' });
  }
});

app.post('/api/tournaments', verifyToken, async (req, res) => {
  try {
    const {
      title, game_mode, format, prize_pool, entry_fee, max_teams,
      start_date, status, banner_url, rules, schedule, prize_breakdown
    } = req.body;

    if (!title || !prize_pool || !start_date) {
      return res.status(400).json({ success: false, message: 'Title, prize pool, and start date are required' });
    }

    const result = await run(
      `INSERT INTO tournaments (title, game_mode, format, prize_pool, entry_fee, max_teams, start_date, status, banner_url, rules, schedule, prize_breakdown)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        game_mode || 'Squad TPP',
        format || 'Squad',
        Number(prize_pool),
        Number(entry_fee) || 0,
        Number(max_teams) || 64,
        start_date,
        status || 'Registration Open',
        banner_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
        JSON.stringify(rules || []),
        JSON.stringify(schedule || []),
        JSON.stringify(prize_breakdown || [])
      ]
    );

    res.json({ success: true, message: 'Tournament created successfully', tournamentId: result.lastID });
  } catch (err) {
    console.error('Create tournament error:', err);
    res.status(500).json({ success: false, message: 'Failed to create tournament' });
  }
});

app.put('/api/tournaments/:id', verifyToken, async (req, res) => {
  try {
    const tId = req.params.id;
    const {
      title, game_mode, format, prize_pool, entry_fee, max_teams,
      start_date, status, banner_url, rules, schedule, prize_breakdown
    } = req.body;

    await run(
      `UPDATE tournaments SET
        title = ?, game_mode = ?, format = ?, prize_pool = ?, entry_fee = ?,
        max_teams = ?, start_date = ?, status = ?, banner_url = ?,
        rules = ?, schedule = ?, prize_breakdown = ?
       WHERE id = ?`,
      [
        title, game_mode, format, Number(prize_pool), Number(entry_fee),
        Number(max_teams), start_date, status, banner_url,
        JSON.stringify(rules || []), JSON.stringify(schedule || []), JSON.stringify(prize_breakdown || []),
        tId
      ]
    );

    res.json({ success: true, message: 'Tournament updated successfully' });
  } catch (err) {
    console.error('Update tournament error:', err);
    res.status(500).json({ success: false, message: 'Failed to update tournament' });
  }
});

app.delete('/api/tournaments/:id', verifyToken, async (req, res) => {
  try {
    const tId = req.params.id;
    await run(`DELETE FROM standings WHERE tournament_id = ?`, [tId]);
    await run(`DELETE FROM registrations WHERE tournament_id = ?`, [tId]);
    await run(`DELETE FROM tournaments WHERE id = ?`, [tId]);
    res.json({ success: true, message: 'Tournament and associated data deleted successfully' });
  } catch (err) {
    console.error('Delete tournament error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete tournament' });
  }
});

// Update Standings / Live Points Table
app.put('/api/tournaments/:id/points', verifyToken, async (req, res) => {
  try {
    const tId = req.params.id;
    const { standings } = req.body; // Array of team standings

    if (!Array.isArray(standings)) {
      return res.status(400).json({ success: false, message: 'Standings must be an array' });
    }

    // Clear existing standings and re-insert
    await run(`DELETE FROM standings WHERE tournament_id = ?`, [tId]);

    for (let i = 0; i < standings.length; i++) {
      const item = standings[i];
      const rank = i + 1;
      const wwcd = Number(item.wwcd) || 0;
      const placement = Number(item.placement_pts) || 0;
      const kills = Number(item.kill_pts) || 0;
      const total = placement + kills;

      await run(
        `INSERT INTO standings (tournament_id, rank, team_name, logo_url, wwcd, placement_pts, kill_pts, total_pts)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [tId, rank, item.team_name, item.logo_url || '', wwcd, placement, kills, total]
      );
    }

    res.json({ success: true, message: 'Standings updated successfully' });
  } catch (err) {
    console.error('Update standings error:', err);
    res.status(500).json({ success: false, message: 'Failed to update standings' });
  }
});

// -------------------------------------------------------------
// REGISTRATION ENDPOINTS
// -------------------------------------------------------------
app.post(
  '/api/registrations',
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'payment_screenshot', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const {
        tournament_id, team_name, team_tag, captain_name, captain_phone, captain_email,
        player1_ign, player1_id, player2_ign, player2_id, player3_ign, player3_id,
        player4_ign, player4_id, sub_ign, sub_id, payment_ref, terms_accepted
      } = req.body;

      if (!tournament_id || !team_name || !captain_name || !captain_phone || !player1_ign || !player1_id || !payment_ref) {
        return res.status(400).json({ success: false, message: 'Missing required team or player fields' });
      }

      if (terms_accepted !== 'true' && terms_accepted !== true) {
        return res.status(400).json({ success: false, message: 'You must accept the Terms & Conditions to register' });
      }

      // File handling
      let logo_url = '';
      let payment_screenshot = '';

      if (req.files && req.files.logo && req.files.logo[0]) {
        logo_url = 'uploads/' + req.files.logo[0].filename;
      }
      if (req.files && req.files.payment_screenshot && req.files.payment_screenshot[0]) {
        payment_screenshot = 'uploads/' + req.files.payment_screenshot[0].filename;
      }

      const result = await run(
        `INSERT INTO registrations (
          tournament_id, team_name, team_tag, captain_name, captain_phone, captain_email,
          player1_ign, player1_id, player2_ign, player2_id, player3_ign, player3_id,
          player4_ign, player4_id, sub_ign, sub_id, payment_ref, payment_screenshot, logo_url, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tournament_id, team_name, team_tag || '', captain_name, captain_phone, captain_email || '',
          player1_ign, player1_id, player2_ign || '', player2_id || '', player3_ign || '', player3_id || '',
          player4_ign || '', player4_id || '', sub_ign || '', sub_id || '', payment_ref,
          payment_screenshot, logo_url, 'Pending'
        ]
      );

      // Increment registered teams count
      await run(`UPDATE tournaments SET registered_teams = registered_teams + 1 WHERE id = ?`, [tournament_id]);

      res.json({
        success: true,
        message: 'Registration submitted successfully!',
        registrationId: 'TXN-' + result.lastID.toString().padStart(5, '0'),
        ticketNumber: result.lastID
      });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ success: false, message: 'Failed to process team registration' });
    }
  }
);

app.get('/api/registrations', verifyToken, async (req, res) => {
  try {
    const { status, tournament_id } = req.query;
    let sql = `
      SELECT r.*, t.title as tournament_title, t.entry_fee
      FROM registrations r
      JOIN tournaments t ON r.tournament_id = t.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'All') {
      sql += ` AND r.status = ?`;
      params.push(status);
    }
    if (tournament_id) {
      sql += ` AND r.tournament_id = ?`;
      params.push(tournament_id);
    }

    sql += ` ORDER BY r.id DESC`;
    const list = await query(sql, params);

    res.json({ success: true, registrations: list });
  } catch (err) {
    console.error('Fetch registrations error:', err);
    res.status(500).json({ success: false, message: 'Error fetching team registrations' });
  }
});

app.patch('/api/registrations/:id/status', verifyToken, async (req, res) => {
  try {
    const regId = req.params.id;
    const { status } = req.body; // Approved, Rejected, Pending

    if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    await run(`UPDATE registrations SET status = ? WHERE id = ?`, [status, regId]);

    res.json({ success: true, message: `Registration status updated to ${status}` });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ success: false, message: 'Failed to update registration status' });
  }
});

// -------------------------------------------------------------
// QR CODE GENERATION ENDPOINT
// -------------------------------------------------------------
app.get('/api/qrcode', async (req, res) => {
  try {
    const upiId = req.query.upi || 'toxicnullified@upi';
    const name = req.query.name || 'ToxicNullified Official';
    const amount = req.query.amount || '0';

    const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&am=${encodeURIComponent(amount)}&cu=INR`;
    const qrDataUrl = await QRCode.toDataURL(upiString, { margin: 1, width: 250, color: { dark: '#00f3ff', light: '#0a0d14' } });

    res.json({ success: true, upiString, qrDataUrl, upiId });
  } catch (err) {
    console.error('QR code generation error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate payment QR code' });
  }
});

// -------------------------------------------------------------
// DASHBOARD STATS & EXPORT ENDPOINTS
// -------------------------------------------------------------
app.get('/api/stats', verifyToken, async (req, res) => {
  try {
    const totalTournaments = await get(`SELECT COUNT(*) as count FROM tournaments`);
    const activeTournaments = await get(`SELECT COUNT(*) as count FROM tournaments WHERE status = 'Registration Open' OR status = 'Ongoing'`);
    const totalRegistrations = await get(`SELECT COUNT(*) as count FROM registrations`);
    const pendingRegistrations = await get(`SELECT COUNT(*) as count FROM registrations WHERE status = 'Pending'`);
    const approvedRegistrations = await get(`SELECT COUNT(*) as count FROM registrations WHERE status = 'Approved'`);
    
    // Total Revenue calculation from approved registrations
    const revenueObj = await get(`
      SELECT SUM(t.entry_fee) as total
      FROM registrations r
      JOIN tournaments t ON r.tournament_id = t.id
      WHERE r.status = 'Approved'
    `);

    res.json({
      success: true,
      stats: {
        totalTournaments: totalTournaments.count,
        activeTournaments: activeTournaments.count,
        totalRegistrations: totalRegistrations.count,
        pendingRegistrations: pendingRegistrations.count,
        approvedRegistrations: approvedRegistrations.count,
        totalRevenue: revenueObj.total || 0
      }
    });
  } catch (err) {
    console.error('Fetch stats error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve stats' });
  }
});

app.get('/api/export/registrations', verifyToken, async (req, res) => {
  try {
    const list = await query(`
      SELECT r.id, t.title as Tournament, r.team_name, r.team_tag, r.captain_name, r.captain_phone, r.captain_email,
             r.player1_ign, r.player1_id, r.player2_ign, r.player2_id, r.player3_ign, r.player3_id,
             r.player4_ign, r.player4_id, r.sub_ign, r.sub_id, r.payment_ref, r.status, r.created_at
      FROM registrations r
      JOIN tournaments t ON r.tournament_id = t.id
      ORDER BY r.id DESC
    `);

    if (list.length === 0) {
      return res.status(404).send('No registration data available to export');
    }

    const headers = Object.keys(list[0]).join(',');
    const rows = list.map(row => Object.values(row).map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(','));
    const csvContent = [headers, ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="toxicnullified_registrations.csv"');
    res.send(csvContent);
  } catch (err) {
    console.error('Export CSV error:', err);
    res.status(500).send('Failed to generate export file');
  }
});

// Initialize DB and start express app
initSchema().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 ToxicNullified API Server running on port ${PORT}`);
  });
});
