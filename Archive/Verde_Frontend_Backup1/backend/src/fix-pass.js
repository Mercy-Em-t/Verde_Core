const {Pool} = require('pg');
const bcrypt = require('bcryptjs');
const pool = new Pool({connectionString: 'postgresql://tryphene:replace-with-a-long-random-password@db:5432/tryphene'});
bcrypt.hash('password123', 10)
  .then(hash => pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hash, 'memurugat@gmail.com']))
  .then(() => { console.log('done'); process.exit(0); });
