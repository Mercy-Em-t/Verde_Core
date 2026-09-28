const fs = require('fs');

let serverJs = fs.readFileSync('backend/src/server.js', 'utf8');

const endpoints = `
  const frameworkData = require('./sdlc_framework.json');
  app.get('/api/framework', auth, (req, res) => {
    res.json(frameworkData);
  });

  app.get('/api/projects/:id/workspace/:stepId', auth, async (req, res) => {
    try {
      const q = await pool.query('SELECT * FROM project_artifacts WHERE project_id=$1 AND step_id=$2', [req.params.id, req.params.stepId]);
      res.json(q.rows[0] || {});
    } catch(e) { res.status(500).json({error: e.message}); }
  });

  app.post('/api/projects/:id/workspace/:stepId', auth, async (req, res) => {
    try {
      const { raw_material, generated_template, week_id } = req.body;
      const q = await pool.query(
        'INSERT INTO project_artifacts(project_id, week_id, step_id, raw_material, generated_template, updated_at) VALUES($1,$2,$3,$4,$5,now()) ON CONFLICT(project_id, step_id) DO UPDATE SET raw_material=EXCLUDED.raw_material, generated_template=EXCLUDED.generated_template, updated_at=now() RETURNING *',
        [req.params.id, week_id || 0, req.params.stepId, raw_material || '', generated_template || '']
      );
      res.json(q.rows[0]);
    } catch(e) { res.status(500).json({error: e.message}); }
  });

  app.post('/api/ai/generate-template', auth, async (req, res) => {
    // Stubbed AI compilation logic
    const { stepId, rawData, baseTemplate } = req.body;
    
    // Simulate thinking delay
    await new Promise(r => setTimeout(r, 1500));
    
    // Dummy heuristics to inject the rawData into the template
    let generated = baseTemplate;
    
    if (rawData && rawData.length > 5) {
      // Find the first [Placeholder] or ... and replace it with a simulated parsed insight
      generated = generated.replace(/\\\[.*?\\]|\\.\\.\\./g, (match) => {
        return "**[AI PARSED: " + rawData.substring(0, 30) + "...]**";
      });
      
      // Append raw notes at the bottom if nothing replaced
      if (generated === baseTemplate) {
         generated += "\\n\\n--- AI APPENDED DATA ---\\n" + rawData;
      }
    }
    
    res.json({ generated });
  });
`;

if (!serverJs.includes('/api/framework')) {
  serverJs = serverJs.replace("app.get('/api/projects'", endpoints + "\n  app.get('/api/projects'");
  fs.writeFileSync('backend/src/server.js', serverJs);
  console.log("Patched server.js with workspace endpoints");
}
