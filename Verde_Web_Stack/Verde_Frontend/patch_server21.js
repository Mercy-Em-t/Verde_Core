const fs = require('fs');
let code = fs.readFileSync('backend/src/server.js', 'utf8');

if (!code.includes('/api/projects/:id/freeze')) {
  const newEndpoints = `
app.patch('/api/projects/:id/freeze', auth, roles('admin'), async (req, res) => {
  const { is_frozen } = req.body;
  const q = await pool.query('UPDATE projects SET is_frozen = $1, updated_at = now() WHERE id = $2 RETURNING *', [!!is_frozen, req.params.id]);
  res.json(q.rows[0]);
});

app.patch('/api/projects/:id/infrastructure', auth, roles('admin'), async (req, res) => {
  const { github_url, staging_url, production_url } = req.body;
  const q = await pool.query('UPDATE projects SET github_url = $1, staging_url = $2, production_url = $3, updated_at = now() WHERE id = $4 RETURNING *', [github_url, staging_url, production_url, req.params.id]);
  res.json(q.rows[0]);
});

app.patch('/api/projects/:id/phases/:phaseNumber/escrow', auth, roles('admin'), async (req, res) => {
  const { escrow_cleared } = req.body;
  const q = await pool.query('UPDATE project_phases SET escrow_cleared = $1, updated_at = now() WHERE project_id = $2 AND phase_number = $3 RETURNING *', [!!escrow_cleared, req.params.id, req.params.phaseNumber]);
  res.json(q.rows[0]);
});

app.patch('/api/projects/:id/phases/:phaseNumber/recurring', auth, roles('admin'), async (req, res) => {
  const { is_recurring } = req.body;
  const q = await pool.query('UPDATE project_phases SET is_recurring = $1, updated_at = now() WHERE project_id = $2 AND phase_number = $3 RETURNING *', [!!is_recurring, req.params.id, req.params.phaseNumber]);
  res.json(q.rows[0]);
});

const PORT = process.env.PORT || 8080;
`;
  code = code.replace('const PORT = process.env.PORT || 8080;', newEndpoints);
  
  // also fix the ledger query
  code = code.replace(/SELECT\s+p\.id as project_id,\s*p\.name as project_name,\s*p\.status as project_status,\s*ph\.phase_number,\s*ph\.name as phase_name,\s*ph\.status as phase_status,\s*ph\.billing_type,\s*ph\.client_fee,\s*ph\.specialist_cost/g,
    "SELECT p.id as project_id, p.name as project_name, p.status as project_status, ph.phase_number, ph.name as phase_name, ph.status as phase_status, ph.billing_type, ph.client_fee, ph.specialist_cost, ph.escrow_cleared, ph.is_recurring, p.is_frozen");

  fs.writeFileSync('backend/src/server.js', code);
  console.log("Patched server.js successfully");
} else {
  console.log("Already patched.");
}
