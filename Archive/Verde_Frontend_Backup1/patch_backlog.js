const fs = require('fs');

// 1. server.js - inject /api/leads
let serverJs = fs.readFileSync('backend/src/server.js', 'utf8');
if (!serverJs.includes("app.post('/api/leads'")) {
  const insertStr = `
  app.post('/api/leads', async (req, res) => {
    try {
      const d = req.body || {};
      const id = d.id || 'LEAD-' + Date.now();
      const is_unqualified = (d.company_size === 'Under 10' || d.funding_status === 'Bootstrapped' || String(d.budget).includes('Under'));
      
      const q = await pool.query(
        'INSERT INTO leads(id, org, industry, stage, budget, timeline, docs, goal, selected_phases, status, company_size, funding_status, estimated_budget, is_unqualified) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *',
        [id, d.org||'', d.industry||'', d.stage||'', d.budget||'', d.timeline||'', d.docs||'', d.goal||'', JSON.stringify(d.selectedPhases||[]), 'New', d.company_size||'', d.funding_status||'', d.budget||'', is_unqualified]
      );
      res.status(201).json(q.rows[0]);
    } catch (e) {
      console.error(e);
      res.status(500).json({error: e.message});
    }
  });

  app.post('/api/leads/:id/gentle-reject', auth, roles('admin', 'consultant'), async (req, res) => {
    try {
      const q = await pool.query("UPDATE leads SET status='Lost', notes=COALESCE(notes,'') || '\n[Gentle Redirect Sent]', updated_at=now() WHERE id=$1 RETURNING *", [req.params.id]);
      if (!q.rows[0]) return res.status(404).json({error: 'Lead not found'});
      await audit(req.user.sub, 'lead', req.params.id, 'gentle-reject', {});
      res.json(q.rows[0]);
    } catch(e) { res.status(500).json({error: e.message}); }
  });
  `;
  serverJs = serverJs.replace("app.get('/api/leads'", insertStr + "\n  app.get('/api/leads'");
  fs.writeFileSync('backend/src/server.js', serverJs);
  console.log('Patched server.js');
}

// 2. start-project.html
let startHtml = fs.readFileSync('start-project.html', 'utf8');
if (!startHtml.includes('company_size')) {
  startHtml = startHtml.replace(
    '<div class="field"><label>Approximate budget',
    '<div class="field"><label>Company Size</label><select id="company_size"><option>Under 10</option><option>11-50</option><option>51-200</option><option>200+</option></select></div><div class="field"><label>Funding Status</label><select id="funding_status"><option>Bootstrapped</option><option>Seed / Angel</option><option>Series A+</option><option>Profitable / Institutional</option></select></div><div class="field"><label>Approximate budget'
  );
  startHtml = startHtml.replace(
    /const data=\{org:org\.value.*?\n.*?const p=await TM\.qualify\(data\);\n.*?const scored.*?;\n.*?const lead=TMCRM\.create\(\{.*?\}\);/,
    `const data={org:org.value,industry:industry.value,stage:stage.value,budget:budget.value,timeline:timeline.value,docs:docs.value,goal:goal.value,company_size:document.getElementById('company_size').value,funding_status:document.getElementById('funding_status').value};
 const p=await TM.qualify(data);
 const scored=typeof TM.scoreLead==='function'?TM.scoreLead(data):{score:null,route:"Nurture / discovery",signals:[]};
 
 fetch('/api/leads', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({...data, selectedPhases: p.selectedPhases}) }).catch(e=>console.error(e));
 const lead=TMCRM.create({id:p.id, ...data, selectedPhases:p.selectedPhases, status:"New", score:scored.score, route:scored.route, signals:scored.signals});`
  );
  fs.writeFileSync('start-project.html', startHtml);
  console.log('Patched start-project.html');
}

// 3. admin.html
let adminHtml = fs.readFileSync('admin.html', 'utf8');

// Fix radar embedded in map
if (adminHtml.includes('<div id="admin-intelligence-radar" class="mb-8 grid')) {
  // We need to pull it out of the lead loop
  const radarBlock = `<div id="admin-intelligence-radar" class="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- Capacity Radar -->
    <div class="bg-slate-900 border border-slate-700 p-6 rounded-xl shadow-lg relative overflow-hidden" 
id="capacity-radar-card">
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-bold text-white"><i class="fa-solid fa-gauge-high text-indigo-400 mr-2"></i> Capacity 
Radar</h3>
        <button onclick="setCapacityLimit()" class="text-xs text-slate-400 hover:text-white"><i class="fa-solid 
fa-gear"></i> Set Limit</button>
      </div>
      <div id="capacity-content" class="text-slate-300 text-sm">Loading telemetry...</div>
    </div>
  
    <!-- Pipeline Drought Predictor -->
    <div class="bg-slate-900 border border-slate-700 p-6 rounded-xl shadow-lg relative overflow-hidden" 
id="drought-predictor-card">
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-bold text-white"><i class="fa-solid fa-water text-blue-400 mr-2"></i> Pipeline Predictor</h3>
        <button onclick="snoozeDrought()" class="text-xs text-slate-400 hover:text-white" id="snooze-btn"><i 
class="fa-solid fa-bell-slash"></i> Snooze</button>
      </div>
      <div id="drought-content" class="text-slate-300 text-sm">Loading telemetry...</div>
    </div>
  </div>`;
  
  // replace exact string if it matches
  let oldRenderLeads = adminHtml.match(/async function renderLeads\(\)\{.*?\}\}`\}/s);
  if (oldRenderLeads) {
     let newRenderLeads = oldRenderLeads[0].replace(radarBlock, ''); // remove from map
     newRenderLeads = newRenderLeads.replace('leads.innerHTML=`<h1>Leads</h1>', 'leads.innerHTML=`<h1>Leads</h1>' + radarBlock.replace(/\n/g, ' '));
     
     // also add UNQUALIFIED badge
     newRenderLeads = newRenderLeads.replace('<span class="pill">${esc(x.status)}</span>', '<span class="pill">${esc(x.status)}</span>${x.is_unqualified ? \'<span class="pill" style="background:#FEE2E2;color:#991B1B;margin-left:8px">[UNQUALIFIED]</span>\' : \'\'}');

     adminHtml = adminHtml.replace(oldRenderLeads[0], newRenderLeads);
  }
}

// Add gentle redirect to detail
if (!adminHtml.includes('gentleRedirect')) {
  let oldDetail = adminHtml.match(/function detail\(x\)\{.*?\}\}/s);
  if (oldDetail) {
    let newDetail = oldDetail[0].replace(
      '<button class="btn" onclick="assignOwner(\'${x.id}\')">Save owner</button>',
      '<button class="btn" onclick="assignOwner(\'${x.id}\')">Save owner</button>${x.is_unqualified && x.status !== \'Lost\' ? `<button class="btn" style="color:red;border-color:red;margin-left:8px" onclick="gentleRedirect(\'${x.id}\')"><i class="fa-solid fa-paper-plane"></i> Gentle Redirect</button>` : \'\'}'
    );
    adminHtml = adminHtml.replace(oldDetail[0], newDetail);
    
    // add function
    adminHtml = adminHtml.replace('async function assignOwner', `async function gentleRedirect(id) {
      if(confirm('Send Gentle Redirect email and mark as Lost?')) {
        if(window.TMAPI && TMAPI.enabled()) {
           await fetch('/api/leads/'+id+'/gentle-reject', {method:'POST', headers:{'Authorization':'Bearer '+localStorage.getItem('tm_api_token_v1')}});
           await TMCRM.transition(id, 'Lost', 'Gentle Redirect sent to lead');
        }
        render();
        selectLead(id);
      }
    }\nasync function assignOwner`);
  }
  fs.writeFileSync('admin.html', adminHtml);
  console.log('Patched admin.html');
}
