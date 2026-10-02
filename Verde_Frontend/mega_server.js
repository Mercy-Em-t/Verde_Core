import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import { generateProject, generateEmptyProject, generateDynamicProject } from './simulator.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.static(path.join(__dirname, '../Verde_React_Dashboard/dist')));
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'verde_super_secret_key_2026';

// WebSocket Real-Time Telemetry
io.on('connection', (socket) => {
    console.log(`📡 Client connected: ${socket.id}`);
    socket.on('disconnect', () => console.log(`Client disconnected: ${socket.id}`));
});

// Mock Database replacing Prisma to fix binary path issues
const usersDB = [
    { id: '1', email: 'admin@verde.com', passwordHash: bcrypt.hashSync('admin123', 10), role: 'SYS_ADMIN', name: 'System Admin' },
    { id: '2', email: 'pm@verde.com', passwordHash: bcrypt.hashSync('pm123', 10), role: 'PM', name: 'Alice Smith' }
];

let projectsDB = new Map();
projectsDB.set('PRJ-HR-2026', { name: 'Enterprise HR Leave Portal', pm: 'Alice Smith', data: generateProject('PRJ-HR-2026', 5) });
projectsDB.set('PRJ-FIN-9999', { name: 'Finance Ledger Automation', pm: 'Bob Jones', data: generateProject('PRJ-FIN-9999', 5) });

// 🔐 Authentication Endpoint
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = usersDB.find(u => u.email === email);
    
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, role: user.role, name: user.name });
});

// Middleware for RBAC
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

// 🗄️ Database/API Endpoints
app.get('/api/projects', (req, res) => {
    const list = Array.from(projectsDB.entries()).map(([id, state]) => ({
        id, name: state.name, pm: state.pm, hasBinder: true, hasAudit: true, status: state.status
    }));
    res.json(list);
});

app.post('/api/projects', requireRole(['SYS_ADMIN', 'PM']), (req, res) => {
    const { id, name } = req.body;
    projectsDB.set(id, { id, name, pm: req.user.name, status: 'FRESH DRAFT', sponsor: 'TBD', need: 'TBD' });
    io.emit('project_updated', { message: `New project ${id} initiated.` });
    res.json({ success: true, id, name });
});

app.put('/api/projects/:id', requireRole(['SYS_ADMIN', 'PM']), (req, res) => {
    const { id } = req.params;
    const { sponsor, need } = req.body;
    const state = projectsDB.get(id);
    if (!state) return res.status(404).json({ error: 'Not found' });
    state.sponsor = sponsor || state.sponsor;
    state.need = need || state.need;
    projectsDB.set(id, state);
    io.emit('project_updated', { message: `Project ${id} updated.` });
    res.json(state);
});

app.post('/api/projects/:id/action', requireRole(['SYS_ADMIN']), (req, res) => {
    const { id } = req.params;
    const { action } = req.body;
    const state = projectsDB.get(id);
    if (!state) return res.status(404).json({ error: 'Not found' });
    
    if (action === 'APPROVE') state.status = 'PHASE_1_APPROVED';
    if (action === 'TERMINATE') state.status = 'TERMINATED';
    
    projectsDB.set(id, state);
    io.emit('project_updated', { message: `Project ${id} action: ${action}` });
    res.json(state);
});

app.get('/api/projects/:id/binder', (req, res) => {
    const state = projectsDB.get(req.params.id);
    if (state) {
        // Fallback for legacy mocked projects
        if (state.data) return res.json({ html: state.data.binderHtml });
        res.json({ html: generateDynamicProject(state).binderHtml });
    } else res.status(404).json({ error: 'Not found' });
});

app.get('/api/projects/:id/audit', (req, res) => {
    const state = projectsDB.get(req.params.id);
    if (state) {
        if (state.data) return res.json({ html: state.data.auditHtml });
        res.json({ html: generateDynamicProject(state).auditHtml });
    } else res.status(404).json({ error: 'Not found' });
});


// Serve React SPA Fallback
app.get(\'*\', (req, res) => {
    res.sendFile(path.join(__dirname, \'../Verde_React_Dashboard/dist/index.html\'));
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
    console.log(`\n🚀 VERDE MEGA-SERVER ONLINE (Port ${PORT})`);
    console.log(`✅ Express API Active`);
    console.log(`✅ In-Memory State Mapping Loaded`);
    console.log(`✅ JWT RBAC Security Locked`);
    console.log(`✅ Socket.io Real-Time Telemetry Broadcasting\n`);
});
