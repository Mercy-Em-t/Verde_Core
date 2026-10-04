import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd() + '/';
const checks = [];
const exists = p => fs.existsSync(path.join(root,p));
function check(name, ok, detail=''){ checks.push({name, ok, detail}); }

for (const p of [
  'deploy/docker-compose.yml','deploy/Dockerfile.web','deploy/nginx/default.conf',
  'backend/Dockerfile','backend/db/schema.sql','backend/src/server.js',
  'qa-sprint16-uat.mjs','qa/SPRINT-17-STAGING-UAT.md','docs/SPRINT-17-STAGING-DEPLOYMENT.md'
]) check(`required staging file: ${p}`, exists(p), exists(p)?'':'missing');

for (const f of ['api-client.js','crm.js','engagement.js','finance.js','governance.js','proposal.js','closeout.js','project-state.js','workflow-guards.js','runtime-config.js']) {
  try { execFileSync(process.execPath,['--check',path.join(root,f)],{stdio:'ignore'}); check(`syntax: ${f}`,true); }
  catch { check(`syntax: ${f}`,false,'syntax check failed'); }
}

try { execFileSync(process.execPath,[path.join(root,'qa-sprint16-uat.mjs')],{stdio:'ignore'}); check('Sprint 16 automated UAT regression',true,'19/19 expected from Sprint 16'); }
catch { check('Sprint 16 automated UAT regression',false,'regression failed'); }

const compose=fs.readFileSync(path.join(root,'deploy/docker-compose.yml'),'utf8');
check('compose: postgres service', /\n\s*db:\s*\n[\s\S]*?image:\s*postgres:/m.test(compose));
check('compose: api service', /\n\s*api:\s*\n/m.test(compose));
check('compose: web service', /\n\s*web:\s*\n/m.test(compose));

const passed=checks.filter(x=>x.ok).length;
const failed=checks.length-passed;
console.log(JSON.stringify({ok:failed===0,checksPassed:passed,checksFailed:failed,checks},null,2));
process.exitCode=failed===0?0:1;
