const bcrypt = require('bcryptjs');
const { run, get, initSchema } = require('./models/db');

const seedData = async () => {
  try {
    await initSchema();

    // Seed / Update Admin User only — tournaments are managed exclusively via Admin Panel
    const hashedPassword = process.env.ADMIN_PASSWORD
      ? await bcrypt.hash(process.env.ADMIN_PASSWORD, 10)
      : '$2a$10$k/2YhjFjM0SsA/fpqtkhcOxr7kVWMqBp5sN3I0d.QQgkya4Zu3dUK';

    const existingAdmin = await get(`SELECT * FROM users WHERE username = ?`, ['admin']);
    if (!existingAdmin) {
      await run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, [
        'admin',
        hashedPassword,
        'admin'
      ]);
      console.log('Admin user created.');
    } else {
      await run(`UPDATE users SET password = ? WHERE username = ?`, [hashedPassword, 'admin']);
      console.log('Admin user password updated.');
    }

    console.log('Database schema ready. No dummy tournament data seeded.');
  } catch (err) {
    console.error('Error during setup:', err);
  }
};

seedData().then(() => {
  process.exit(0);
});
