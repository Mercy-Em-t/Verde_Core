const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: 'postgresql://tryphene:replace-with-a-long-random-password@db:5432/tryphene' });

async function createAdmin() {
  const email = 'admin@tryphen.com';
  const password = 'password123';
  const name = 'Admin';
  
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    // Check if exists
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (res.rows.length === 0) {
      await pool.query('INSERT INTO users(email, password_hash, name, role) VALUES($1, $2, $3, $4)', [email, hash, name, 'admin']);
      console.log('Created admin user: admin@tryphen.com / password123');
    } else {
      // update password
      await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hash, email]);
      console.log('Updated admin user password: admin@tryphen.com / password123');
    }
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

createAdmin();
