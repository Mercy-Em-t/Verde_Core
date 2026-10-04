const fs = require('fs');
let code = fs.readFileSync('backend/src/server.js', 'utf8');

const sprint20Patch = `

// --- Sprint 20 API Extensions ---

// 1. QA Rubrics
app.get('/api/qa/rubrics', auth, async (req, res) => {
  const q = await pool.query('SELECT * FROM qa_rubrics ORDER BY phase_number ASC');
  res.json({rubrics: q.rows});
});

app.post('/api/qa/rubrics', auth, roles('admin'), async (req, res) => {
  const { phase_number, deliverable_type, criteria } = req.body;
  if (!phase_number || !deliverable_type) return res.status(400).json({error: 'missing fields'});
  const q = await pool.query(
    'INSERT INTO qa_rubrics (phase_number, deliverable_type, criteria) VALUES ($1, $2, $3) ON CONFLICT (phase_number, deliverable_type) DO UPDATE SET criteria = EXCLUDED.criteria RETURNING *',
    [phase_number, deliverable_type, JSON.stringify(criteria || [])]
  );
  res.json(q.rows[0]);
});

// 2. Document Review (QA Check)
app.post('/api/documents/:id/review', auth, roles('admin', 'consultant'), async (req, res) => {
  const { results, status } = req.body; // status: 'Passed' or 'Failed'
  const docId = req.params.id;
  
  if (!['Passed', 'Failed'].includes(status)) return res.status(400).json({error: 'Invalid status'});

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Insert Review
    const rev = await client.query(
      'INSERT INTO document_reviews (document_id, reviewer_id, results, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [docId, req.user.sub, JSON.stringify(results || []), status]
    );
    
    // Update Document
    // If Passed, visibility becomes client so they can see it. If Failed, it stays internal.
    const visibility = status === 'Passed' ? 'client' : 'internal';
    await client.query(
      'UPDATE documents SET qa_status = $1, visibility = $2, updated_at = now() WHERE id = $3',
      [status, visibility, docId]
    );
    
    await client.query('COMMIT');
    res.json(rev.rows[0]);
  } catch(e) {
    await client.query('ROLLBACK');
    res.status(500).json({error: e.message});
  } finally {
    client.release();
  }
});

// 3. Financial Ledger (Monthly Revenue Tracker)
app.get('/api/financial/ledger', auth, roles('admin', 'consultant'), async (req, res) => {
  // We want to join projects, phases, and get financials.
  const q = await pool.query(\`
    SELECT 
      p.id as project_id, p.name as project_name, p.status as project_status,
      ph.phase_number, ph.name as phase_name, ph.status as phase_status, ph.billing_type,
      ph.client_fee, ph.specialist_cost
    FROM projects p
    JOIN project_phases ph ON p.id = ph.project_id
    WHERE p.status != 'Lost'
    ORDER BY p.created_at DESC, ph.phase_number ASC
  \`);
  
  res.json({ ledger: q.rows });
});

// Update Phase financials
app.patch('/api/projects/:id/phases/:phaseNumber/financials', auth, roles('admin'), async (req, res) => {
  const { client_fee, specialist_cost, billing_type } = req.body;
  const q = await pool.query(
    'UPDATE project_phases SET client_fee = $1, specialist_cost = $2, billing_type = $3, updated_at = now() WHERE project_id = $4 AND phase_number = $5 RETURNING *',
    [client_fee || 0, specialist_cost || 0, billing_type || '', req.params.id, req.params.phaseNumber]
  );
  res.json(q.rows[0]);
});
`;

// Now we need to modify the document fetching and uploading
// Current document fetch:
// app.get('/api/projects/:id/documents', auth, async (req, res) => {
//   const q = await pool.query('SELECT * FROM documents WHERE project_id = $1 ORDER BY created_at DESC', [req.params.id]);
//   res.json({documents: q.rows});
// });

// Change to filter by role
code = code.replace(
  "app.get('/api/projects/:id/documents', auth, async (req, res) => {\n  const q = await pool.query('SELECT * FROM documents WHERE project_id = $1 ORDER BY created_at DESC', [req.params.id]);\n  res.json({documents: q.rows});\n});",
  `app.get('/api/projects/:id/documents', auth, async (req, res) => {
  let query = 'SELECT * FROM documents WHERE project_id = $1';
  // Clients only see Passed/client visibility documents
  if (req.user.role === 'client') {
    query += " AND visibility = 'client' AND qa_status = 'Passed'";
  }
  query += ' ORDER BY created_at DESC';
  const q = await pool.query(query, [req.params.id]);
  res.json({documents: q.rows});
});`
);

// Modify document upload to accept deliverable_type and set default visibility to internal / qa_status to Pending
// Original: 
// const q = await pool.query(
//     'INSERT INTO documents (project_id, phase_number, title, url, visibility, uploaded_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
//     [req.params.id, phase || null, title, url, visibility || 'client', req.user.sub]
//   );
code = code.replace(
  `const q = await pool.query(
    'INSERT INTO documents (project_id, phase_number, title, url, visibility, uploaded_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [req.params.id, phase || null, title, url, visibility || 'client', req.user.sub]
  );`,
  `const deliverable_type = req.body.deliverable_type || 'General';
  const finalVisibility = (req.user.role === 'admin' && visibility === 'client') ? 'client' : 'internal';
  const qaStatus = (finalVisibility === 'client') ? 'Exempt' : 'Pending';
  
  const q = await pool.query(
    'INSERT INTO documents (project_id, phase_number, title, url, visibility, uploaded_by, deliverable_type, qa_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
    [req.params.id, phase || null, title, url, finalVisibility, req.user.sub, deliverable_type, qaStatus]
  );`
);

code = code.replace("app.use((err,req,res,next)=>{console.error(err);res.status(500).json({error:'Internal server error'})});", sprint20Patch + "\napp.use((err,req,res,next)=>{console.error(err);res.status(500).json({error:'Internal server error'})});");

fs.writeFileSync('backend/src/server.js', code);
console.log('Sprint 20 API endpoints added');
