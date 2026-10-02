import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import pg from 'pg';
import { generateDynamicProject } from './simulator.js';

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'verde_super_secret_key_2026';

// PostgreSQL Client
const db = new pg.Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres.yjgskbdtnyzsmuzvnrsz:tryphen100%25@aws-0-eu-west-1.pooler.supabase.com:6543/postgres' });
db.connect().catch(console.error);

const usersDB = [
    { id: '1', email: 'admin@verde.com', passwordHash: bcrypt.hashSync('admin123', 10), role: 'SYS_ADMIN', name: 'System Admin' },
    { id: '2', email: 'pm@verde.com', passwordHash: bcrypt.hashSync('pm123', 10), role: 'PM', name: 'Alice Smith' }
];

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = usersDB.find(u => u.email === email);
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, role: user.role, name: user.name });
});

function requireRole(roles) {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(403).json({ error: 'Missing token' });
        try {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            if (!roles.includes(decoded.role)) return res.status(403).json({ error: 'Forbidden' });
            req.user = decoded;
            next();
        } catch (e) {
            return res.status(403).json({ error: 'Invalid token' });
        }
    };
}

app.get('/api/projects', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM projects ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/projects', requireRole(['SYS_ADMIN', 'PM']), async (req, res) => {
    const { id, name } = req.body;
    try {
        await db.query(
            'INSERT INTO projects (id, name, pm, status, sponsor, need) VALUES ($1, $2, $3, $4, $5, $6)',
            [id, name, req.user.name, 'FRESH DRAFT', 'TBD', 'TBD']
        );
        res.json({ success: true, id, name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/projects/:id', requireRole(['SYS_ADMIN', 'PM']), async (req, res) => {
    const { id } = req.params;
    const { sponsor, need } = req.body;
    try {
        await db.query(
            'UPDATE projects SET sponsor = COALESCE($1, sponsor), need = COALESCE($2, need) WHERE id = $3',
            [sponsor, need, id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/projects/:id/action', requireRole(['SYS_ADMIN']), async (req, res) => {
    const { id } = req.params;
    const { action } = req.body;
    let status = 'FRESH DRAFT';
    if (action === 'APPROVE') status = 'PHASE_1_APPROVED';
    if (action === 'TERMINATE') status = 'TERMINATED';
    
    try {
        await db.query('UPDATE projects SET status = $1 WHERE id = $2', [status, id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/projects/:id/binder', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ html: generateDynamicProject(result.rows[0]).binderHtml });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/projects/:id/audit', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ html: generateDynamicProject(result.rows[0]).auditHtml });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default app;
