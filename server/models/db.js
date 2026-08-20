const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../toxicnullified.db');
const uploadsDir = path.resolve(__dirname, '../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Helper wrapper for async operations
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const initSchema = async () => {
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      game_mode TEXT DEFAULT 'Squad TPP',
      format TEXT DEFAULT 'Squad',
      prize_pool INTEGER NOT NULL,
      entry_fee INTEGER DEFAULT 0,
      max_teams INTEGER DEFAULT 64,
      registered_teams INTEGER DEFAULT 0,
      start_date TEXT NOT NULL,
      reg_end_date TEXT,
      map_rotation TEXT DEFAULT 'Erangel, Rondo & Miramar',
      organizer TEXT DEFAULT 'ToxicNullified Official',
      status TEXT DEFAULT 'Upcoming',
      banner_url TEXT,
      poster_url TEXT,
      rules TEXT,
      schedule TEXT,
      prize_breakdown TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Safely alter table to add any missing new columns for existing databases
  try { await run(`ALTER TABLE tournaments ADD COLUMN reg_end_date TEXT`); } catch (e) {}
  try { await run(`ALTER TABLE tournaments ADD COLUMN map_rotation TEXT DEFAULT 'Erangel, Rondo & Miramar'`); } catch (e) {}
  try { await run(`ALTER TABLE tournaments ADD COLUMN organizer TEXT DEFAULT 'ToxicNullified Official'`); } catch (e) {}
  try { await run(`ALTER TABLE tournaments ADD COLUMN poster_url TEXT`); } catch (e) {}

  await run(`
    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL,
      team_name TEXT NOT NULL,
      team_tag TEXT,
      captain_name TEXT NOT NULL,
      captain_phone TEXT NOT NULL,
      captain_email TEXT NOT NULL,
      player1_ign TEXT NOT NULL,
      player1_id TEXT NOT NULL,
      player2_ign TEXT NOT NULL,
      player2_id TEXT NOT NULL,
      player3_ign TEXT NOT NULL,
      player3_id TEXT NOT NULL,
      player4_ign TEXT NOT NULL,
      player4_id TEXT NOT NULL,
      sub_ign TEXT,
      sub_id TEXT,
      payment_ref TEXT NOT NULL,
      payment_screenshot TEXT,
      logo_url TEXT,
      status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(tournament_id) REFERENCES tournaments(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS standings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL,
      rank INTEGER NOT NULL,
      team_name TEXT NOT NULL,
      logo_url TEXT,
      wwcd INTEGER DEFAULT 0,
      placement_pts INTEGER DEFAULT 0,
      kill_pts INTEGER DEFAULT 0,
      total_pts INTEGER DEFAULT 0,
      FOREIGN KEY(tournament_id) REFERENCES tournaments(id)
    )
  `);

  console.log('Database tables verified / created successfully.');

  // Auto-ensure Admin User exists ONLY if ADMIN_PASSWORD environment variable is set
  try {
    if (process.env.ADMIN_PASSWORD) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      const existingAdmin = await get(`SELECT * FROM users WHERE username = ?`, ['admin']);
      if (!existingAdmin) {
        await run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, ['admin', hashedPassword, 'admin']);
        console.log('✅ Admin user ("admin") created from ADMIN_PASSWORD environment variable.');
      } else {
        await run(`UPDATE users SET password = ? WHERE username = ?`, [hashedPassword, 'admin']);
        console.log('✅ Admin user password synced with ADMIN_PASSWORD environment variable.');
      }
    } else {
      console.warn('⚠️ [SECURITY] ADMIN_PASSWORD env variable is not set. Admin user creation skipped.');
    }
  } catch (adminErr) {
    console.error('Error seeding admin user:', adminErr);
  }
};

module.exports = {
  db,
  query,
  run,
  get,
  initSchema
};
