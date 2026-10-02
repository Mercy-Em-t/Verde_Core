import http from 'http';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/binder') {
        // Run the simulation script dynamically (in a real app, this would be DB state)
        exec('node run-sample-project.js', (err, stdout, stderr) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error generating production binder: ' + stderr);
                return;
            }
            
            // Serve the newly generated Master Binder
            const html = fs.readFileSync(path.join(process.cwd(), 'Sample_Project_Output.html'));
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
        });
    } else if (req.url === '/audit') {
        // Serve the newly generated Audit Trail
        const html = fs.readFileSync(path.join(process.cwd(), 'Sample_Project_Audit_Trail.html'));
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found - Try / or /audit');
    }
});

server.listen(PORT, () => {
    console.log(`\n🚀 VERDE SDLC PRODUCTION SERVER RUNNING 🚀`);
    console.log(`-------------------------------------------------`);
    console.log(`📄 Master Binder: http://localhost:${PORT}/binder`);
    console.log(`🕒 Audit Trail:   http://localhost:${PORT}/audit`);
    console.log(`-------------------------------------------------\n`);
});
