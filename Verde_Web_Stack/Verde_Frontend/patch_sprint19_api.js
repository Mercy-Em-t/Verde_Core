const fs = require('fs');
let code = fs.readFileSync('backend/src/server.js', 'utf8');

const apiPatch = `

// --- Sprint 19 API Extensions ---
const multer = require('multer');
const path = require('path');
// Ensure uploads dir exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, {recursive: true});

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadDir) },
  filename: function (req, file, cb) { cb(null, Date.now() + '-' + file.originalname) }
});
const upload = multer({ storage: storage });

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

// 1. Provision Client
app.post('/api/auth/provision', auth, roles('admin', 'consultant'), async (req, res) => {
  const { email, name, projectId, leadId } = req.body;
  if (!email || !name) return res.status(400).json({error: 'email and name required'});
  
  // Generate random password
  const tempPassword = Math.random().toString(36).slice(-8);
  const hash = await bcrypt.hash(tempPassword, 10);
  
  try {
    const q = await pool.query(
      'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
      [email, hash, name, 'client']
    );
    const clientId = q.rows[0].id;
    
    // Link to project/lead
    if (projectId) await pool.query('UPDATE projects SET client_id = $1 WHERE id = $2', [clientId, projectId]);
    if (leadId) await pool.query('UPDATE leads SET client_id = $1 WHERE id = $2', [clientId, leadId]);
    
    res.json({
      success: true,
      user: q.rows[0],
      tempPassword,
      draftEmail: \`Dear \${name},\\n\\nYour client portal account has been created.\\nLogin URL: http://localhost:8091/login.html\\nEmail: \${email}\\nPassword: \${tempPassword}\\n\\nPlease log in to view your project updates.\\n\\nBest,\\nTryphen Emurugat Team\`
    });
  } catch(e) {
    res.status(500).json({error: e.message});
  }
});

// 2. Documents
app.post('/api/projects/:id/documents', auth, upload.single('file'), async (req, res) => {
  const { phase, title, visibility } = req.body;
  if (!req.file || !title) return res.status(400).json({error: 'file and title required'});
  
  const url = '/uploads/' + req.file.filename;
  const q = await pool.query(
    'INSERT INTO documents (project_id, phase_number, title, url, visibility, uploaded_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [req.params.id, phase || null, title, url, visibility || 'client', req.user.sub]
  );
  res.json(q.rows[0]);
});

app.get('/api/projects/:id/documents', auth, async (req, res) => {
  const q = await pool.query('SELECT * FROM documents WHERE project_id = $1 ORDER BY created_at DESC', [req.params.id]);
  res.json({documents: q.rows});
});

// 3. Communications
app.post('/api/projects/:id/communications', auth, async (req, res) => {
  const { body, type, phase } = req.body;
  if (!body) return res.status(400).json({error: 'body required'});
  
  const q = await pool.query(
    'INSERT INTO communications (project_id, phase_number, author_id, body, type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [req.params.id, phase || null, req.user.sub, body, type || 'general']
  );
  res.json(q.rows[0]);
});

app.get('/api/projects/:id/communications', auth, async (req, res) => {
  const q = await pool.query('SELECT c.*, u.name as author_name, u.role as author_role FROM communications c LEFT JOIN users u ON c.author_id = u.id WHERE c.project_id = $1 ORDER BY c.created_at DESC', [req.params.id]);
  res.json({communications: q.rows});
});

// 4. Phase Gates
app.get('/api/projects/:id/phases', auth, async (req, res) => {
  const q = await pool.query('SELECT * FROM project_phases WHERE project_id = $1 ORDER BY phase_number', [req.params.id]);
  res.json({phases: q.rows});
});

app.post('/api/projects/:id/phases', auth, roles('admin', 'consultant'), async (req, res) => {
  const { phase_number, name, status } = req.body;
  const q = await pool.query(
    'INSERT INTO project_phases (project_id, phase_number, name, status) VALUES ($1, $2, $3, $4) ON CONFLICT (project_id, phase_number) DO UPDATE SET status = EXCLUDED.status, name = EXCLUDED.name, updated_at = now() RETURNING *',
    [req.params.id, phase_number, name, status || 'Not Started']
  );
  res.json(q.rows[0]);
});

app.post('/api/projects/:id/phases/:phaseNumber/signoff', auth, roles('client'), async (req, res) => {
  // Client approves phase
  const q = await pool.query(
    "UPDATE project_phases SET status = 'Completed', signoff_date = now(), updated_at = now() WHERE project_id = $1 AND phase_number = $2 RETURNING *",
    [req.params.id, req.params.phaseNumber]
  );
  
  // Create an automatic communication record
  await pool.query(
    "INSERT INTO communications (project_id, phase_number, author_id, body, type) VALUES ($1, $2, $3, $4, $5)",
    [req.params.id, req.params.phaseNumber, req.user.sub, 'Phase signed off by client.', 'signoff_approval']
  );
  
  res.json(q.rows[0]);
});
`;

code = code.replace("app.use((err,req,res,next)=>{console.error(err);res.status(500).json({error:'Internal server error'})});", apiPatch + "\napp.use((err,req,res,next)=>{console.error(err);res.status(500).json({error:'Internal server error'})});");
fs.writeFileSync('backend/src/server.js', code);
console.log('Sprint 19 API endpoints added');
