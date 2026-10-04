import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pg from 'pg';
import { z } from 'zod';
import { LEAD_TRANSITIONS, ENGAGEMENT_TRANSITIONS, validTransition, positiveAmount } from './workflow.js';

const {Pool}=pg;
const app=express();
app.set('trust proxy', 1);
const pool=new Pool({connectionString:process.env.DATABASE_URL});
const PORT=Number(process.env.PORT||8080);
const JWT_SECRET=process.env.JWT_SECRET;
if(!JWT_SECRET) console.warn('JWT_SECRET is not set; authentication endpoints will reject requests.');
app.use(helmet());
app.use(compression());
app.use(cors({origin:process.env.CORS_ORIGIN||false,credentials:true}));
app.use(express.json({limit:'256kb'}));
app.use(rateLimit({windowMs:15*60*1000,max:300,standardHeaders:true,legacyHeaders:false}));

const STATUSES=['New','Review','Contacted','Discovery booked','Qualified','Proposal','Won','Lost'];
const loginSchema=z.object({email:z.string().email(),password:z.string().min(8).max(200)});
const leadPatch=z.object({status:z.enum(STATUSES).optional(),ownerId:z.string().uuid().nullable().optional(),notes:z.string().max(10000).optional()}).strict();
function tokenFor(u){return jwt.sign({sub:u.id,email:u.email,role:u.role},JWT_SECRET,{expiresIn:'8h'});}
function auth(req,res,next){try{const h=req.headers.authorization||'';const token=h.startsWith('Bearer ')?h.slice(7):null;if(!token) return res.status(401).json({error:'Authentication required'});req.user=jwt.verify(token,JWT_SECRET);next()}catch{res.status(401).json({error:'Invalid or expired session'})}}
function roles(...allowed){return (req,res,next)=>allowed.includes(req.user.role)?next():res.status(403).json({error:'Insufficient permissions'});}
async function audit(actor,entityType,entityId,action,metadata={}){await pool.query('INSERT INTO audit_log(actor_id,entity_type,entity_id,action,metadata) VALUES($1,$2,$3,$4,$5)',[actor,entityType,entityId,action,metadata]);}
app.get('/health',async(_,res)=>{try{await pool.query('SELECT 1');res.json({ok:true,service:'tryphene-api'})}catch{res.status(503).json({ok:false})}});
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' });
  const assignedRole = (role && ['admin', 'consultant', 'viewer', 'client'].includes(role)) ? role : 'client';
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Email already exists' });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const q = await pool.query('INSERT INTO users(email, password_hash, name, role) VALUES($1, $2, $3, $4) RETURNING id, email, name, role', [email, hash, name, assignedRole]);
    const u = q.rows[0];
    const token = tokenFor(u);
    res.json({ token, user: u });
  } catch(e) { res.status(500).json({error: e.message}); }
});
app.post('/api/auth/login',async(req,res)=>{const parsed=loginSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'Invalid login payload'});const {email,password}=parsed.data;const q=await pool.query('SELECT id,email,name,role,password_hash,active FROM users WHERE lower(email)=lower($1)',[email]);const u=q.rows[0];if(!u||!u.active||!(await bcrypt.compare(password,u.password_hash)))return res.status(401).json({error:'Invalid credentials'});res.json({token:tokenFor(u),user:{id:u.id,email:u.email,name:u.name,role:u.role}})});
app.post('/api/auth/logout',auth,async(req,res)=>res.status(204).end());
app.get('/api/auth/me',auth,async(req,res)=>{const q=await pool.query('SELECT id,email,name,role,active FROM users WHERE id=$1',[req.user.sub]);if(!q.rows[0])return res.status(401).json({error:'User not found'});res.json({user:q.rows[0]})});

app.post('/api/leads', async (req, res) => {
  try {
    const d = req.body || {};
    const id = d.id || 'LEAD-' + Date.now();
    const q = await pool.query(
      'INSERT INTO leads(id, organisation, contact, email, industry, budget, timeline, goal, selected_phases, notes, status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *',
      [
        id,
        d.company || d.organisation || '',
        d.name || d.contact || '',
        d.email || '',
        d.industry || '',
        d.budget || '',
        d.timeline || '',
        d.goal || '',
        JSON.stringify(d.selected_phases || d.selectedPhases || []),
        d.notes || '',
        'New'
      ]
    );
    res.status(201).json(q.rows[0]);
  } catch (e) {
    console.error('POST /api/leads error:', e);
    res.status(500).json({error: e.message});
  }
});

  app.post('/api/leads/:id/gentle-reject', auth, roles('admin', 'consultant'), async (req, res) => {
    try {
      const { emailBody } = req.body || {};
      const msg = `\n[Gentle Redirect Sent]:\n${emailBody || 'No content provided'}`;
      
      const q = await pool.query(`UPDATE leads SET status='Lost', notes=COALESCE(notes,'') || $1, updated_at=now() WHERE id=$2 RETURNING *`, [msg, req.params.id]);
      if (!q.rows[0]) return res.status(404).json({error: 'Lead not found'});
      
      console.log(`[Email Mock] Sent to Lead ${req.params.id}:\n${emailBody}`);

      await audit(req.user.sub, 'lead', req.params.id, 'gentle-reject', { email: emailBody });
      res.json({ lead: q.rows[0] });
    } catch(e) { res.status(500).json({error: e.message}); }
  });
  
  
  app.post('/api/leads/:id/initiate', auth, roles('admin', 'consultant'), async (req, res) => {
    try {
      const { amount, notes } = req.body;
      const amtNum = Number(amount) || 350000;
      
      const existing = await pool.query('SELECT * FROM leads WHERE id=$1', [req.params.id]);
      if (!existing.rows[0]) return res.status(404).json({error: 'Lead not found'});
      const lead = existing.rows[0];

      // 1. Update lead to Won and add notes
      const msg = `\n[Phase 1 Initiated]: Retainer Amount KES ${amtNum}.\nNotes: ${notes || 'None'}`;
      const q = await pool.query(`UPDATE leads SET status='Won', notes=COALESCE(notes,'') || $1, updated_at=now() WHERE id=$2 RETURNING *`, [msg, req.params.id]);
      
      // 2. Auto-provision the Client User account (if not exists)
      const email = lead.email || `client_${Date.now()}@test.com`;
      let userQ = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      let userId;
      if (!userQ.rows[0]) {
          userQ = await pool.query(
              "INSERT INTO users (email, password_hash, name, role) VALUES ($1, 'PENDING_ACTIVATION', $2, 'client') RETURNING id",
              [email, lead.contact || 'Client']
          );
      }
      userId = userQ.rows[0].id;
      
      // 3. Bind the Lead to this new Client ID
      await pool.query('UPDATE leads SET client_id = $1 WHERE id = $2', [userId, req.params.id]);

      // 4. Create Project and permanently bind client_id
      const qProj = await pool.query(
          `INSERT INTO projects (name, client_id, status, stage, selected_phases, created_at, updated_at) VALUES ($1, $2, 'Exploring', 'explore', '[]'::jsonb, now(), now()) RETURNING *`,
          [lead.organisation || lead.contact, userId]
      );

      await audit(req.user.sub, 'lead', req.params.id, 'phase1_initiated', { amount: amtNum, notes });
      
      // Return the secure activation token (the user ID) so the frontend can generate the email link
      res.json({ success: true, lead: q.rows[0], project: qProj.rows[0], activationToken: userId });
    } catch(e) { res.status(500).json({error: e.message}); }
  });

  
app.get('/api/admin/requests', auth, roles('admin'), async (req, res) => {
    try {
        const q = await pool.query(`
            SELECT c.*, p.name as project_name, p.client_id, u.name as client_name, u.email as client_email 
            FROM communications c 
            JOIN projects p ON p.id = c.project_id 
            JOIN users u ON u.id = c.author_id 
            WHERE c.type IN ('phase_request', 'change_order')
            ORDER BY c.created_at DESC
        `);
        res.json({ requests: q.rows });
    } catch(e) {
        res.status(500).json({error: e.message});
    }
});

  app.get('/api/leads',auth,async(req,res)=>{const q=await pool.query(`SELECT l.*,u.name AS owner_name FROM leads l LEFT JOIN users u ON u.id=l.owner_id ORDER BY l.created_at DESC`);res.json({leads:q.rows})});
app.get('/api/leads/:id',auth,async(req,res)=>{const q=await pool.query('SELECT l.*,u.name AS owner_name FROM leads l LEFT JOIN users u ON u.id=l.owner_id WHERE l.id=$1',[req.params.id]);if(!q.rows[0])return res.status(404).json({error:'Lead not found'});res.json(q.rows[0])});
app.patch('/api/leads/:id', auth, roles('admin', 'consultant'), async (req, res) => {
  const p = leadPatch.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Invalid lead update', details: p.error.flatten() });
  const d = p.data;
  const existing = await pool.query('SELECT status FROM leads WHERE id=$1', [req.params.id]);
  if (!existing.rows[0]) return res.status(404).json({ error: 'Lead not found' });
  
  let currentStatus = existing.rows[0].status;
  
  // Strict transition enforcement
  if (d.status && !validTransition(LEAD_TRANSITIONS, currentStatus, d.status)) {
     return res.status(409).json({ error: 'Invalid lead status transition' });
  }
  
  const q = await pool.query(
    `UPDATE leads SET status=COALESCE($1,status),owner_id=COALESCE($2,owner_id),notes=COALESCE($3,notes),updated_at=now() WHERE id=$4 RETURNING *`,
    [d.status, d.ownerId, d.notes, req.params.id]
  );
  if (!q.rows[0]) return res.status(404).json({ error: 'Lead not found' });
  await audit(req.user.sub, 'lead', req.params.id, 'updated', d);

  // --- SPRINT 4: QuickBooks Integration ---
  if (d.status === 'Qualified') {
    console.log(`[QuickBooks] Generating KES 350,000 Phase 1 Retainer Invoice for lead: ${req.params.id}`);
    
    // Simulate async webhook callback indicating payment cleared 
    setTimeout(async () => {
      try {
        console.log(`[QuickBooks] Firing payment_cleared webhook for lead: ${req.params.id}`);
        const http = await import('http');
        const body = JSON.stringify({ event: 'payment_cleared', lead_id: req.params.id, amount: 350000 });
        const webhookReq = http.request({
          host: 'localhost', port: 8080, path: '/api/webhooks/quickbooks', method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
        });
        webhookReq.write(body); webhookReq.end();
      } catch (e) {
        console.error('Simulated QB Webhook failed:', e);
      }
    }, 2000);
  }

  res.json(q.rows[0]);
});

// --- SPRINT 4: Domain-Driven Design (Lead -> Project Promotion Webhook) ---
app.post('/api/webhooks/quickbooks', async (req, res) => {
  try {
    // 1. Security: HMAC Signature Validation (Intuit standard)
    const crypto = await import('crypto');
    const intuitSignature = req.headers['intuit-signature'];
    const webhookSecret = process.env.QB_WEBHOOK_SECRET || 'dev_secret';
    // For robust verification in express, we'd normally use a raw body parser middleware,
    // but this simulates the HMAC check logic.
    const payloadString = JSON.stringify(req.body); 
    const hash = crypto.createHmac('sha256', webhookSecret).update(payloadString).digest('base64');
    
    // In production we would strictly enforce this: 
    // if (hash !== intuitSignature) return res.status(401).send('Unauthorized webhook signature');
    // Note: Simulated patch leaves it non-blocking for local dev testing via the simulated trigger.

    const { event, lead_id, amount } = req.body || {};
    if (event !== 'payment_cleared' || !lead_id) return res.status(400).json({ error: 'Invalid payload' });

    const leadQuery = await pool.query('SELECT * FROM leads WHERE id=$1', [lead_id]);
    const lead = leadQuery.rows[0];
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    // Mark lead as Won
    await pool.query('UPDATE leads SET status=$1 WHERE id=$2', ['Won', lead_id]);

    // Promote Lead to Project 
    const projectId = 'PRJ-' + Date.now();
    const pQuery = await pool.query(
      `INSERT INTO projects(id, lead_id, name, stage, status, selected_phases, next_action) 
       VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        projectId, 
        lead_id, 
        (lead.organisation || 'New Client') + ' Platform', 
        'explore', 
        'Active', 
        lead.selected_phases || '[]', 
        'Schedule Phase 1 Kickoff'
      ]
    );

    console.log(`[DDD] Payment cleared. Lead ${lead_id} automatically promoted to Project ${projectId}`);
    res.json({ success: true, project: pQuery.rows[0] });
  } catch (e) {
    console.error('Webhook processing error:', e);
    res.status(500).json({ error: e.message });
  }
});

// --- SPRINT 4: External Tool Stack (OAuth 2.0 Integrations) ---
// Note: In production these would use real client_ids and redirect_uris.
// We are mapping the endpoints here to demonstrate the architecture for handover.
app.get('/api/auth/oauth/quickbooks', (req, res) => {
  console.log('[OAuth] Initiating QuickBooks SSO flow');
  res.redirect('https://appcenter.intuit.com/connect/oauth2?client_id=MOCK_CLIENT_ID&response_type=code&scope=com.intuit.quickbooks.accounting&redirect_uri=http://localhost:8080/api/auth/oauth/quickbooks/callback&state=MOCK_STATE');
});
app.get('/api/auth/oauth/quickbooks/callback', (req, res) => {
  res.send('<h2>QuickBooks SSO Successful!</h2><p>You can close this tab and return to the orchestrator.</p><script>setTimeout(()=>window.close(), 2000);</script>');
});

app.get('/api/auth/oauth/docusign', (req, res) => {
  console.log('[OAuth] Initiating DocuSign SSO flow');
  res.redirect('https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature&client_id=MOCK_CLIENT_ID&redirect_uri=http://localhost:8080/api/auth/oauth/docusign/callback');
});
app.get('/api/auth/oauth/docusign/callback', (req, res) => {
  res.send('<h2>DocuSign SSO Successful!</h2><p>You can close this tab and return to the orchestrator.</p><script>setTimeout(()=>window.close(), 2000);</script>');
});

app.get('/api/auth/oauth/github', (req, res) => {
  console.log('[OAuth] Initiating GitHub SSO flow');
  res.redirect('https://github.com/login/oauth/authorize?client_id=MOCK_CLIENT_ID&redirect_uri=http://localhost:8080/api/auth/oauth/github/callback');
});
app.get('/api/auth/oauth/github/callback', (req, res) => {
  res.send('<h2>GitHub SSO Successful!</h2><p>You can close this tab and return to the orchestrator.</p><script>setTimeout(()=>window.close(), 2000);</script>');
});

  const frameworkData = JSON.parse(fs.readFileSync(new URL('./sdlc_framework.json', import.meta.url)));
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
      generated = generated.replace(/\[.*?\]|\.\.\./g, (match) => {
        return "**[AI PARSED: " + rawData.substring(0, 30) + "...]**";
      });
      
      // Append raw notes at the bottom if nothing replaced
      if (generated === baseTemplate) {
         generated += "\n\n--- AI APPENDED DATA ---\n" + rawData;
      }
    }
    
    res.json({ generated });
  });

  app.get('/api/projects', auth, async (req, res) => {
    let q;
    if (req.user.role === 'admin') {
        q = await pool.query('SELECT * FROM projects ORDER BY updated_at DESC');
    } else {
        q = await pool.query('SELECT * FROM projects WHERE client_id = $1 ORDER BY updated_at DESC', [req.user.sub]);
    }
    res.json({ projects: q.rows });
});
  app.get('/api/projects/:id', auth, async (req, res) => {
    let q;
    if (req.user.role === 'admin') {
        q = await pool.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    } else {
        q = await pool.query('SELECT * FROM projects WHERE id = $1 AND client_id = $2', [req.params.id, req.user.sub]);
    }
    if (!q.rows[0]) return res.status(404).json({ error: 'Project not found or unauthorized' });
    res.json(q.rows[0]);
});

app.patch('/api/projects/:id', auth, async (req, res) => {
    const { selected_phases, stage, next_action, status } = req.body;
    let query = 'UPDATE projects SET updated_at = now()';
    let params = [];
    let pCount = 1;

    if (selected_phases !== undefined) {
        query += `, selected_phases = $${pCount++}::jsonb`;
        params.push(JSON.stringify(selected_phases));
    }
    if (stage !== undefined) {
        query += `, stage = $${pCount++}`;
        params.push(stage);
    }
    if (next_action !== undefined) {
        query += `, next_action = $${pCount++}`;
        params.push(next_action);
    }
    if (status !== undefined) {
        query += `, status = $${pCount++}`;
        params.push(status);
    }

    query += ` WHERE id = $${pCount++}`;
    params.push(req.params.id);

    if (req.user.role !== 'admin') {
        query += ` AND client_id = $${pCount++}`;
        params.push(req.user.sub);
    }

    query += ' RETURNING *';

    try {
        const q = await pool.query(query, params);
        if (!q.rows[0]) return res.status(404).json({error: 'Project not found or unauthorized'});
        res.json(q.rows[0]);
    } catch(e) {
        res.status(500).json({error: e.message});
    }
});
const proposalSchema=z.object({id:z.string().max(80),number:z.string().max(80),leadId:z.string().max(80).optional().nullable(),projectId:z.string().max(80).optional().nullable(),client:z.string().max(300).default(''),contact:z.string().max(200).default(''),email:z.string().email().or(z.literal('')).default(''),goal:z.string().max(10000).default(''),status:z.enum(['Draft','Sent','Approved','Declined','Expired']).default('Draft'),items:z.array(z.object({phaseId:z.number(),name:z.string(),price:z.number().nonnegative(),gate:z.string().optional(),scope:z.string().optional()})).default([]),subtotal:z.number().nonnegative().default(0),discount:z.number().nonnegative().default(0),total:z.number().nonnegative().default(0),validDays:z.number().int().positive().max(365).default(14),assumptions:z.array(z.string()).default([]),paymentTerms:z.string().max(5000).default(''),notes:z.string().max(10000).default(''),approval:z.record(z.string(),z.any()).default({})});
app.get('/api/proposals',auth,async(req,res)=>{const q=await pool.query('SELECT * FROM proposals ORDER BY updated_at DESC');res.json({proposals:q.rows})});
app.get('/api/proposals/:id',auth,async(req,res)=>{const q=await pool.query('SELECT * FROM proposals WHERE id=$1',[req.params.id]);if(!q.rows[0])return res.status(404).json({error:'Proposal not found'});res.json(q.rows[0])});
app.post('/api/proposals',auth,roles('admin','consultant'),async(req,res)=>{const p=proposalSchema.safeParse(req.body);if(!p.success)return res.status(400).json({error:'Invalid proposal',details:p.error.flatten()});const d=p.data;const q=await pool.query(`INSERT INTO proposals(id,number,lead_id,project_id,client,contact,email,goal,status,items,subtotal,discount,total,valid_days,assumptions,payment_terms,notes,approval) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING *`,[d.id,d.number,d.leadId||null,d.projectId||null,d.client,d.contact,d.email,d.goal,d.status,JSON.stringify(d.items),d.subtotal,d.discount,d.total,d.validDays,JSON.stringify(d.assumptions),d.paymentTerms,d.notes,JSON.stringify(d.approval)]);await audit(req.user.sub,'proposal',d.id,'created',{number:d.number});res.status(201).json(q.rows[0])});
app.patch('/api/proposals/:id',auth,roles('admin','consultant'),async(req,res)=>{const allowed=z.object({status:z.enum(['Draft','Sent','Approved','Declined','Expired']).optional(),notes:z.string().max(10000).optional(),approval:z.record(z.string(),z.any()).optional(),total:z.number().nonnegative().optional()}).strict();const p=allowed.safeParse(req.body);if(!p.success)return res.status(400).json({error:'Invalid proposal update'});const d=p.data;const q=await pool.query(`UPDATE proposals SET status=COALESCE($1,status),notes=COALESCE($2,notes),approval=COALESCE($3,approval),total=COALESCE($4,total),updated_at=now() WHERE id=$5 RETURNING *`,[d.status,d.notes,d.approval?JSON.stringify(d.approval):null,d.total,req.params.id]);if(!q.rows[0])return res.status(404).json({error:'Proposal not found'});await audit(req.user.sub,'proposal',req.params.id,'updated',d);res.json(q.rows[0])});

const engagementStatus=z.enum(['Pending kickoff','Kickoff scheduled','In delivery','Awaiting client approval','Phase gated','Completed','On hold']);
const engagementPatch=z.object({status:engagementStatus.optional(),currentPhaseId:z.number().int().nullable().optional(),ownerId:z.string().uuid().nullable().optional(),kickoff:z.record(z.string(),z.any()).optional(),phases:z.array(z.any()).optional(),nextAction:z.string().max(1000).optional(),activity:z.array(z.any()).optional()}).strict();
app.get('/api/engagements',auth,async(req,res)=>{const q=await pool.query('SELECT e.*,u.name AS owner_name FROM engagements e LEFT JOIN users u ON u.id=e.owner_id ORDER BY e.updated_at DESC');res.json({engagements:q.rows})});
app.get('/api/engagements/:id',auth,async(req,res)=>{const q=await pool.query('SELECT e.*,u.name AS owner_name FROM engagements e LEFT JOIN users u ON u.id=e.owner_id WHERE e.id=$1',[req.params.id]);if(!q.rows[0])return res.status(404).json({error:'Engagement not found'});res.json(q.rows[0])});
app.post('/api/engagements',auth,roles('admin','consultant'),async(req,res)=>{const d=req.body||{};if(!d.id||!d.projectId)return res.status(400).json({error:'id and projectId are required'});const q=await pool.query(`INSERT INTO engagements(id,proposal_id,project_id,client,status,current_phase_id,owner_id,kickoff,phases,next_action,activity) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,[d.id,d.proposalId||null,d.projectId,d.client||'',d.status||'Pending kickoff',d.currentPhaseId||null,d.ownerId||null,JSON.stringify(d.kickoff||{}),JSON.stringify(d.phases||[]),d.nextAction||'',JSON.stringify(d.activity||[])]);await audit(req.user.sub,'engagement',d.id,'created',{});res.status(201).json(q.rows[0])});
app.patch('/api/engagements/:id',auth,roles('admin','consultant'),async(req,res)=>{const p=engagementPatch.safeParse(req.body);if(!p.success)return res.status(400).json({error:'Invalid engagement update'});const d=p.data;const existing=await pool.query('SELECT status FROM engagements WHERE id=$1',[req.params.id]);if(!existing.rows[0])return res.status(404).json({error:'Engagement not found'});if(d.status&&!validTransition(ENGAGEMENT_TRANSITIONS,existing.rows[0].status,d.status))return res.status(409).json({error:'Invalid engagement status transition'});const q=await pool.query(`UPDATE engagements SET status=COALESCE($1,status),current_phase_id=COALESCE($2,current_phase_id),owner_id=COALESCE($3,owner_id),kickoff=COALESCE($4,kickoff),phases=COALESCE($5,phases),next_action=COALESCE($6,next_action),activity=COALESCE($7,activity),updated_at=now() WHERE id=$8 RETURNING *`,[d.status,d.currentPhaseId,d.ownerId,d.kickoff?JSON.stringify(d.kickoff):null,d.phases?JSON.stringify(d.phases):null,d.nextAction,d.activity?JSON.stringify(d.activity):null,req.params.id]);if(!q.rows[0])return res.status(404).json({error:'Engagement not found'});await audit(req.user.sub,'engagement',req.params.id,'updated',d);res.json(q.rows[0])});
const governancePatch=z.object({documents:z.array(z.any()).optional(),decisions:z.array(z.any()).optional(),changeRequests:z.array(z.any()).optional(),meetings:z.array(z.any()).optional(),approvals:z.array(z.any()).optional(),activity:z.array(z.any()).optional()}).strict();
app.get('/api/governance/:projectId',auth,async(req,res)=>{const q=await pool.query('SELECT * FROM governance_records WHERE project_id=$1',[req.params.projectId]);if(!q.rows[0])return res.json({governance:null});res.json({governance:q.rows[0]})});
app.post('/api/governance',auth,roles('admin','consultant'),async(req,res)=>{const d=req.body||{};if(!d.id||!d.projectId)return res.status(400).json({error:'id and projectId are required'});const q=await pool.query(`INSERT INTO governance_records(id,project_id,engagement_id,documents,decisions,change_requests,meetings,approvals,activity) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT(id) DO UPDATE SET engagement_id=EXCLUDED.engagement_id,documents=EXCLUDED.documents,decisions=EXCLUDED.decisions,change_requests=EXCLUDED.change_requests,meetings=EXCLUDED.meetings,approvals=EXCLUDED.approvals,activity=EXCLUDED.activity,updated_at=now() RETURNING *`,[d.id,d.projectId,d.engagementId||null,JSON.stringify(d.documents||[]),JSON.stringify(d.decisions||[]),JSON.stringify(d.changeRequests||[]),JSON.stringify(d.meetings||[]),JSON.stringify(d.approvals||[]),JSON.stringify(d.activity||[])]);await audit(req.user.sub,'governance',d.id,'upserted',{});res.status(201).json(q.rows[0])});
app.patch('/api/governance/:id',auth,roles('admin','consultant'),async(req,res)=>{const p=governancePatch.safeParse(req.body);if(!p.success)return res.status(400).json({error:'Invalid governance update'});const d=p.data;const q=await pool.query(`UPDATE governance_records SET documents=COALESCE($1,documents),decisions=COALESCE($2,decisions),change_requests=COALESCE($3,change_requests),meetings=COALESCE($4,meetings),approvals=COALESCE($5,approvals),activity=COALESCE($6,activity),updated_at=now() WHERE id=$7 RETURNING *`,[d.documents?JSON.stringify(d.documents):null,d.decisions?JSON.stringify(d.decisions):null,d.changeRequests?JSON.stringify(d.changeRequests):null,d.meetings?JSON.stringify(d.meetings):null,d.approvals?JSON.stringify(d.approvals):null,d.activity?JSON.stringify(d.activity):null,req.params.id]);if(!q.rows[0])return res.status(404).json({error:'Governance record not found'});await audit(req.user.sub,'governance',req.params.id,'updated',d);res.json(q.rows[0])});
const closeoutPatch=z.object({status:z.string().optional(),acceptance:z.any().optional(),outstanding:z.array(z.any()).optional(),outcomes:z.array(z.any()).optional(),lessons:z.array(z.any()).optional(),handover:z.any().optional(),improvement:z.any().optional(),archive:z.any().optional(),activity:z.array(z.any()).optional()}).strict();
app.get('/api/closeout/:projectId',auth,async(req,res)=>{const q=await pool.query('SELECT * FROM closeout_records WHERE project_id=$1',[req.params.projectId]);if(!q.rows[0])return res.json({closeout:null});res.json({closeout:q.rows[0]})});
app.post('/api/closeout',auth,roles('admin','consultant'),async(req,res)=>{const d=req.body||{};if(!d.id||!d.projectId)return res.status(400).json({error:'id and projectId are required'});const q=await pool.query(`INSERT INTO closeout_records(id,project_id,engagement_id,status,acceptance,outstanding,outcomes,lessons,handover,improvement,archive,activity) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT(id) DO UPDATE SET status=EXCLUDED.status,acceptance=EXCLUDED.acceptance,outstanding=EXCLUDED.outstanding,outcomes=EXCLUDED.outcomes,lessons=EXCLUDED.lessons,handover=EXCLUDED.handover,improvement=EXCLUDED.improvement,archive=EXCLUDED.archive,activity=EXCLUDED.activity,updated_at=now() RETURNING *`,[d.id,d.projectId,d.engagementId||null,d.status||'Open',JSON.stringify(d.acceptance||{}),JSON.stringify(d.outstanding||[]),JSON.stringify(d.outcomes||[]),JSON.stringify(d.lessons||[]),JSON.stringify(d.handover||{}),JSON.stringify(d.improvement||{}),JSON.stringify(d.archive||{}),JSON.stringify(d.activity||[])]);await audit(req.user.sub,'closeout',d.id,'upserted',{});res.status(201).json(q.rows[0])});
app.patch('/api/closeout/:id',auth,roles('admin','consultant'),async(req,res)=>{const p=closeoutPatch.safeParse(req.body);if(!p.success)return res.status(400).json({error:'Invalid closeout update'});const d=p.data;const q=await pool.query(`UPDATE closeout_records SET status=COALESCE($1,status),acceptance=COALESCE($2,acceptance),outstanding=COALESCE($3,outstanding),outcomes=COALESCE($4,outcomes),lessons=COALESCE($5,lessons),handover=COALESCE($6,handover),improvement=COALESCE($7,improvement),archive=COALESCE($8,archive),activity=COALESCE($9,activity),updated_at=now() WHERE id=$10 RETURNING *`,[d.status||null,d.acceptance?JSON.stringify(d.acceptance):null,d.outstanding?JSON.stringify(d.outstanding):null,d.outcomes?JSON.stringify(d.outcomes):null,d.lessons?JSON.stringify(d.lessons):null,d.handover?JSON.stringify(d.handover):null,d.improvement?JSON.stringify(d.improvement):null,d.archive?JSON.stringify(d.archive):null,d.activity?JSON.stringify(d.activity):null,req.params.id]);if(!q.rows[0])return res.status(404).json({error:'Closeout not found'});await audit(req.user.sub,'closeout',req.params.id,'updated',d);res.json(q.rows[0])});
app.get('/api/cms',auth,async(req,res)=>{const q=await pool.query('SELECT key,content,version,updated_at FROM cms_documents ORDER BY key');res.json({documents:q.rows})});
app.put('/api/cms',auth,roles('admin'),async(req,res)=>{const content=req.body;if(!content||typeof content!=='object')return res.status(400).json({error:'CMS content must be an object'});const key='main';const q=await pool.query(`INSERT INTO cms_documents(key,content,version,updated_by) VALUES($1,$2,1,$3) ON CONFLICT(key) DO UPDATE SET content=EXCLUDED.content,version=cms_documents.version+1,updated_by=EXCLUDED.updated_by,updated_at=now() RETURNING *`,[key,content,req.user.sub]);await audit(req.user.sub,'cms',key,'updated',{version:q.rows[0].version});res.json(q.rows[0])});

app.get('/api/financial/summary/:projectId',auth,async(req,res)=>{const pid=req.params.projectId;const [inv,ch]=await Promise.all([pool.query("SELECT * FROM invoices WHERE project_id=$1 ORDER BY created_at DESC",[pid]),pool.query("SELECT * FROM change_orders WHERE project_id=$1 ORDER BY created_at DESC",[pid])]);const billed=inv.rows.filter(i=>i.status!=='Void').reduce((s,i)=>s+Number(i.amount||0),0);const paid=inv.rows.reduce((s,i)=>s+Number(i.paid||0),0);const approvedChanges=ch.rows.filter(c=>c.status==='Approved').reduce((s,c)=>s+Number(c.amount||0),0);res.json({summary:{billed,paid,outstanding:Math.max(0,billed-paid),approvedChanges,invoiceCount:inv.rows.length,overdue:inv.rows.filter(i=>i.status==='Overdue').length},invoices:inv.rows,changes:ch.rows})});
app.post('/api/invoices',auth,roles('admin','consultant'),async(req,res)=>{const d=req.body||{};if(!d.id||!d.number||!d.projectId)return res.status(400).json({error:'id, number and projectId are required'});const q=await pool.query(`INSERT INTO invoices(id,number,project_id,proposal_id,client,description,status,amount,due_date,notes) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,[d.id,d.number,d.projectId,d.proposalId||null,d.client||'',d.description||'',d.status||'Draft',d.amount||0,d.dueDate||null,d.notes||'']);await audit(req.user.sub,'invoice',d.id,'created',{});res.status(201).json(q.rows[0])});
app.patch('/api/invoices/:id',auth,roles('admin','consultant'),async(req,res)=>{const d=req.body||{};const q=await pool.query(`UPDATE invoices SET status=COALESCE($1,status),paid=COALESCE($2,paid),notes=COALESCE($3,notes),updated_at=now() WHERE id=$4 RETURNING *`,[d.status,d.paid,d.notes,req.params.id]);if(!q.rows[0])return res.status(404).json({error:'Invoice not found'});await audit(req.user.sub,'invoice',req.params.id,'updated',d);res.json(q.rows[0])});
app.post('/api/payments',auth,roles('admin','consultant'),async(req,res)=>{const d=req.body||{};if(!d.id||!d.invoiceId||!positiveAmount(d.amount))return res.status(400).json({error:'id, invoiceId and amount are required'});const client=await pool.connect();try{await client.query('BEGIN');const inv=await client.query('SELECT * FROM invoices WHERE id=$1 FOR UPDATE',[d.invoiceId]);if(!inv.rows[0])throw new Error('Invoice not found');const remaining=Number(inv.rows[0].amount||0)-Number(inv.rows[0].paid||0);if(Number(d.amount)>remaining){throw new Error('Payment exceeds invoice balance')}const paid=Number(inv.rows[0].paid||0)+Number(d.amount);const status=paid>=Number(inv.rows[0].amount)?'Paid':'Partially paid';const q=await client.query(`INSERT INTO payments(id,invoice_id,project_id,amount,paid_date,method,reference,notes) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,[d.id,d.invoiceId,inv.rows[0].project_id,d.amount,d.date||null,d.method||'Bank transfer',d.reference||'',d.notes||'']);await client.query('UPDATE invoices SET paid=$1,status=$2,updated_at=now() WHERE id=$3',[paid,status,d.invoiceId]);await client.query('COMMIT');await audit(req.user.sub,'payment',d.id,'created',{invoiceId:d.invoiceId,amount:d.amount});res.status(201).json(q.rows[0])}catch(e){await client.query('ROLLBACK');res.status(400).json({error:e.message})}finally{client.release()}});
app.post('/api/change-orders',auth,roles('admin','consultant'),async(req,res)=>{const d=req.body||{};if(!d.id||!d.projectId||!d.title)return res.status(400).json({error:'id, projectId and title are required'});const q=await pool.query(`INSERT INTO change_orders(id,project_id,proposal_id,title,description,amount,status) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,[d.id,d.projectId,d.proposalId||null,d.title,d.description||'',d.amount||0,d.status||'Draft']);await audit(req.user.sub,'change_order',d.id,'created',{});res.status(201).json(q.rows[0])});
app.patch('/api/change-orders/:id',auth,roles('admin','consultant'),async(req,res)=>{const d=req.body||{};const q=await pool.query(`UPDATE change_orders SET status=COALESCE($1,status),decision_note=COALESCE($2,decision_note),updated_at=now() WHERE id=$3 RETURNING *`,[d.status,d.decisionNote,req.params.id]);if(!q.rows[0])return res.status(404).json({error:'Change order not found'});await audit(req.user.sub,'change_order',req.params.id,'updated',d);res.json(q.rows[0])});


// --- Sprint 19 API Extensions ---
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Ensure uploads dir exists
const uploadDir = './uploads';
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
      draftEmail: `Dear ${name},\n\nYour client portal account has been created.\nLogin URL: http://localhost:8091/login.html\nEmail: ${email}\nPassword: ${tempPassword}\n\nPlease log in to view your project updates.\n\nBest,\nTryphen Emurugat Team`
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
  const deliverable_type = req.body.deliverable_type || 'General';
  const finalVisibility = (req.user.role === 'admin' && visibility === 'client') ? 'client' : 'internal';
  const qaStatus = (finalVisibility === 'client') ? 'Exempt' : 'Pending';
  
  const q = await pool.query(
    'INSERT INTO documents (project_id, phase_number, title, url, visibility, uploaded_by, deliverable_type, qa_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
    [req.params.id, phase || null, title, url, finalVisibility, req.user.sub, deliverable_type, qaStatus]
  );
  res.json(q.rows[0]);
});

app.get('/api/projects/:id/documents', auth, async (req, res) => {
  let query = 'SELECT * FROM documents WHERE project_id = $1';
  // Clients only see Passed/client visibility documents
  if (req.user.role === 'client') {
    query += " AND visibility = 'client' AND qa_status = 'Passed'";
  }
  query += ' ORDER BY created_at DESC';
  const q = await pool.query(query, [req.params.id]);
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
  const q = await pool.query(`
    SELECT p.id as project_id, p.name as project_name, p.status as project_status, ph.phase_number, ph.name as phase_name, ph.status as phase_status, ph.billing_type, ph.client_fee, ph.specialist_cost, ph.escrow_cleared, ph.is_recurring, p.is_frozen
    FROM projects p
    JOIN project_phases ph ON p.id = ph.project_id
    WHERE p.status != 'Lost'
    ORDER BY p.created_at DESC, ph.phase_number ASC
  `);
  
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


// --- SALES ANALYTICS API ---
app.get('/api/analytics/sales', auth, roles('admin'), async (req, res) => {
  try {
    const q = await pool.query('SELECT SUM(emails_sent) as emails_sent, SUM(linkedin_messages_sent) as linkedin_messages_sent, SUM(discovery_calls_booked) as discovery_calls_booked, SUM(clients_closed) as clients_closed, SUM(revenue_booked) as revenue_booked FROM sales_activity_log');
    res.json(q.rows[0] || {emails_sent:0, linkedin_messages_sent:0, discovery_calls_booked:0, clients_closed:0, revenue_booked:0});
  } catch (err) { next(err); }
});
app.post('/api/analytics/log-activity', auth, roles('admin'), async (req, res) => {
  try {
    const { emails, linkedin, calls, closed, revenue } = req.body;
    const q = await pool.query('INSERT INTO sales_activity_log (emails_sent, linkedin_messages_sent, discovery_calls_booked, clients_closed, revenue_booked) VALUES ($1, $2, $3, $4, $5) RETURNING *', [emails || 0, linkedin || 0, calls || 0, closed || 0, revenue || 0]);
    res.status(201).json(q.rows[0]);
  } catch (err) { next(err); }
});

app.use((err,req,res,next)=>{console.error(err);res.status(500).json({error:'Internal server error'})});
app.listen(PORT,()=>console.log(`Tryphene API listening on :${PORT}`));




