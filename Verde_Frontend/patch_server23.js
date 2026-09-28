const fs = require('fs');
let code = fs.readFileSync('backend/src/server.js', 'utf8');

const newLeadEndpoint = `
app.post('/api/leads', async (req, res) => {
  const { name, email, phone, company, project_description, budget, timeline, company_size, funding_status, estimated_budget } = req.body;
  const budgetNum = Number(estimated_budget) || 0;
  
  // Qualification Logic
  const is_unqualified = (company_size === '1-10' || budgetNum < 300000);
  
  try {
    const q = await pool.query(
      'INSERT INTO leads (name, email, phone, company, project_description, budget, timeline, company_size, funding_status, estimated_budget, is_unqualified) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [name, email, phone, company, project_description, budget, timeline, company_size, funding_status, budgetNum, is_unqualified]
    );
    res.status(201).json(q.rows[0]);
  } catch(e) {
    console.error(e);
    res.status(500).json({error: e.message});
  }
});
`;

// we replace the existing app.post('/api/leads') entirely. We'll use regex.
code = code.replace(/app\.post\('\/api\/leads'[\s\S]*?res\.status\(500\)\.json\(\{error: e\.message\}\);\s*\}\s*\});/, newLeadEndpoint.trim());

// Also make sure the GET /api/leads endpoint returns the new fields
code = code.replace(/SELECT\s+\*\s+FROM\s+leads\s+ORDER\s+BY\s+created_at\s+DESC/, 'SELECT * FROM leads ORDER BY created_at DESC');

fs.writeFileSync('backend/src/server.js', code);
console.log('Patched /api/leads successfully');
