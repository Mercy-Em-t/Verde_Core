import http from 'http';
import fs from 'fs';
import path from 'path';
import { generateProject } from './simulator.js';

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(process.cwd(), 'data', 'projects.json');

// In-Memory Database of isolated projects
let projectsDB = new Map();

function saveDatabase() {
    const obj = Object.fromEntries(projectsDB);
    fs.writeFileSync(DB_FILE, JSON.stringify(obj, null, 2));
    console.log(`💾 Saved ${projectsDB.size} projects to persistent storage (projects.json)`);
}

function loadDatabase() {
    if (fs.existsSync(DB_FILE)) {
        const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        projectsDB = new Map(Object.entries(data));
        console.log(`📂 Loaded ${projectsDB.size} projects from persistent storage.`);
        return true;
    }
    return false;
}

function initializeProjects() {
    if (loadDatabase()) {
        return; // Skip generation if we already have persistent data
    }

    console.log('Seeding memory with isolated projects...');
    // Project 1: Complete 5-Phase HR Project
    projectsDB.set('PRJ-HR-2026', {
        name: 'Enterprise HR Leave Portal',
        pm: 'Alice Smith (Project Manager)',
        data: generateProject('PRJ-HR-2026', 5, 'Alice Smith (Project Manager)')
    });

    // Project 2: Finance System
    projectsDB.set('PRJ-FIN-9999', {
        name: 'Finance Ledger Automation',
        pm: 'Bob Jones (Finance Lead)',
        data: generateProject('PRJ-FIN-9999', 5, 'Bob Jones (Finance Lead)')
    });
    
    // Project 3: IT Security Audit
    projectsDB.set('PRJ-SEC-0001', {
        name: 'Zero Trust Network Rollout',
        pm: 'Charlie Root (CISO)',
        data: generateProject('PRJ-SEC-0001', 5, 'Charlie Root (CISO)')
    });

    // Persist to disk immediately after generation
    saveDatabase();
}

const server = http.createServer((req, res) => {
    // Enable CORS for React frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }

    // JSON API Endpoints
    if (req.url === '/api/projects') {
        const projectList = Array.from(projectsDB.entries()).map(([id, info]) => ({
            id,
            name: info.name,
            pm: info.pm,
            hasBinder: !!info.data.binderHtml,
            hasAudit: !!info.data.auditHtml
        }));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(projectList));
    }

    if (req.url.startsWith('/api/projects/') && req.url.endsWith('/binder')) {
        const id = req.url.split('/')[3];
        if (projectsDB.has(id)) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ html: projectsDB.get(id).data.binderHtml }));
        }
        res.writeHead(404);
        return res.end(JSON.stringify({ error: 'Not found' }));
    }

    if (req.url.startsWith('/api/projects/') && req.url.endsWith('/audit')) {
        const id = req.url.split('/')[3];
        if (projectsDB.has(id)) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ html: projectsDB.get(id).data.auditHtml }));
        }
        res.writeHead(404);
        return res.end(JSON.stringify({ error: 'Not found' }));
    }

    // Basic router for HTML Dashboard (Legacy mode)
    if (req.url === '/') {
        let listHtml = Array.from(projectsDB.entries()).map(([id, info]) => `
            <div style="background: white; margin-bottom: 15px; padding: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h3 style="margin-top: 0; color: #2c3e50;">${info.name} <span style="color: #7f8c8d; font-size: 0.8em;">(${id})</span></h3>
                <p><strong>Project Manager:</strong> ${info.pm}</p>
                <a href="/project/${id}/binder" style="display: inline-block; background: #3498db; color: white; padding: 10px 15px; text-decoration: none; border-radius: 3px; margin-right: 10px;">📄 View Master Binder</a>
                <a href="/project/${id}/audit" style="display: inline-block; background: #2c3e50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 3px;">🕒 View Audit Trail</a>
            </div>
        `).join('');

        const dashboard = `
            <html>
                <head>
                    <title>Verde SDLC Dashboard</title>
                    <style>body { font-family: sans-serif; background: #ecf0f1; padding: 40px; } </style>
                </head>
                <body>
                    <h1 style="color: #2c3e50;">Verde SDLC: Active Projects</h1>
                    <p style="font-size: 1.2em; margin-bottom: 30px;">This dashboard demonstrates simultaneous, entirely isolated project instances running concurrently in memory without state bleeding.</p>
                    ${listHtml}
                </body>
            </html>
        `;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(dashboard);

    } else if (req.url.startsWith('/project/')) {
        const parts = req.url.split('/'); // ['', 'project', 'PRJ-ID', 'type']
        const id = parts[2];
        const type = parts[3];

        if (projectsDB.has(id)) {
            const project = projectsDB.get(id);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            if (type === 'binder') res.end(project.data.binderHtml);
            else if (type === 'audit') res.end(project.data.auditHtml);
            else {
                res.writeHead(404);
                res.end('Unknown view type');
            }
        } else {
            res.writeHead(404);
            res.end('Project not found');
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

initializeProjects();

server.listen(PORT, () => {
    console.log(`\n🚀 VERDE SDLC PRODUCTION SERVER RUNNING 🚀`);
    console.log(`-------------------------------------------------`);
    console.log(`🏠 Dashboard:     http://localhost:${PORT}/`);
    console.log(`-------------------------------------------------\n`);
});
