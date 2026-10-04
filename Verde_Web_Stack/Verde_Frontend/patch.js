const fs = require('fs');
let code = fs.readFileSync('backend/src/server.js', 'utf8');

const authCode = \
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' });
  const assignedRole = (role && ['admin', 'consultant', 'viewer'].includes(role)) ? role : 'client';
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = ', [email]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Email already exists' });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const q = await pool.query('INSERT INTO users(email, password_hash, name, role) VALUES(, , , ) RETURNING id, email, name, role', [email, hash, name, assignedRole]);
    const u = q.rows[0];
    const token = tokenFor(u);
    res.json({ token, user: u });
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  try {
    const q = await pool.query('SELECT id, email, password_hash, name, role FROM users WHERE email =  AND active = true', [email]);
    if (q.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const u = q.rows[0];
    const match = await bcrypt.compare(password, u.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    const token = tokenFor(u);
    res.json({ token, user: { id: u.id, email: u.email, name: u.name, role: u.role } });
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const q = await pool.query('SELECT id, email, name, role FROM users WHERE id =  AND active = true', [req.user.sub]);
    if (q.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ user: q.rows[0] });
  } catch(e) { res.status(500).json({error: e.message}); }
});
\;

code = code.replace('app.listen(PORT', authCode + '\napp.listen(PORT');
fs.writeFileSync('backend/src/server.js', code);
console.log('Added auth endpoints');
\;
