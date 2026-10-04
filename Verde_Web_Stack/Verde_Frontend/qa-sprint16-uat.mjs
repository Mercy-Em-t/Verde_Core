import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const root = process.cwd() + '/';
const checks = [];
function pass(name, detail=''){ checks.push({name, ok:true, detail}); }
function fail(name, detail=''){ checks.push({name, ok:false, detail}); }
function exists(rel){ return fs.existsSync(path.join(root, rel)); }

const required = [
  'tryphene-sdlc-commercial-platform-v1.html','journey.html','my-project.html','phase.html',
  'proposal.html','delivery.html','governance.html','finance.html','closeout.html','admin.html',
  'project-state.js','cms.js','crm.js','proposal.js','engagement.js','governance.js','finance.js','closeout.js',
  'workflow-guards.js','api-client.js','runtime-config.js','backend/src/server.js','backend/src/workflow.js',
  'backend/db/schema.sql','deploy/docker-compose.yml','deploy/nginx/default.conf','DEPLOYMENT.md'
];
const missing = required.filter(x=>!exists(x));
missing.length ? fail('required platform files present', missing.join(', ')) : pass('required platform files present');

const jsFiles = fs.readdirSync(root).filter(f=>f.endsWith('.js')).concat(
  ['backend/src/server.js','backend/src/workflow.js','backend/src/seed-admin.js'].filter(x=>exists(x))
);
for (const rel of [...new Set(jsFiles)]) {
  try { execFileSync('node',['--check',path.join(root,rel)],{stdio:'pipe'}); pass(`syntax: ${rel}`); }
  catch(e){ fail(`syntax: ${rel}`, String(e.stderr||e.stdout||e.message).trim()); }
}

try {
  execFileSync('node',[path.join(root,'qa-sprint14-integration.mjs')],{stdio:'pipe'});
  pass('Sprint 14 regression suite', '11/11 checks passed');
} catch(e){ fail('Sprint 14 regression suite', String(e.stdout||e.stderr||e.message).trim()); }

const compose = fs.readFileSync(path.join(root,'deploy/docker-compose.yml'),'utf8');
for (const token of ['postgres','api','web']) compose.includes(token) ? pass(`deployment compose includes ${token}`) : fail(`deployment compose includes ${token}`);

const summary = { ok: checks.every(x=>x.ok), checksPassed: checks.filter(x=>x.ok).length, checksFailed: checks.filter(x=>!x.ok).length, checks };
console.log(JSON.stringify(summary,null,2));
process.exit(summary.ok ? 0 : 1);
