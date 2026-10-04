const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://tryphene:tryphene_dev_password@localhost:5432/tryphene'
});

async function run() {
  try {
    const hash = await bcrypt.hash('password123', 10);
    const res = await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hash, 'client@test.com']);
    console.log(`Updated ${res.rowCount} row(s) for client@test.com`);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
