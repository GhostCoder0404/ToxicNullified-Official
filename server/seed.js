const bcrypt = require('bcryptjs');
const { run, get, initSchema } = require('./models/db');

const seedData = async () => {
  try {
    await initSchema();

    if (!process.env.ADMIN_PASSWORD) {
      console.warn('⚠️ [SECURITY] ADMIN_PASSWORD env variable is not set! Skipping admin seed.');
      return;
    }

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    const existingAdmin = await get(`SELECT * FROM users WHERE username = ?`, ['admin']);
    if (!existingAdmin) {
      await run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, [
        'admin',
        hashedPassword,
        'admin'
      ]);
      console.log('Admin user created from ADMIN_PASSWORD env variable.');
    } else {
      await run(`UPDATE users SET password = ? WHERE username = ?`, [hashedPassword, 'admin']);
      console.log('Admin user password updated from ADMIN_PASSWORD env variable.');
    }

    console.log('Database schema ready. No dummy tournament data seeded.');
  } catch (err) {
    console.error('Error during setup:', err);
  }
};

seedData().then(() => {
  process.exit(0);
});
