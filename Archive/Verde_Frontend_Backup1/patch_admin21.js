const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');

// 1. Financial Ledger Headers
if (!html.includes('<th>5% WHT</th>')) {
  html = html.replace('<th>Client Fee</th>', '<th>Client Fee</th><th>5% WHT</th>');
  html = html.replace('<td>${(p.client_fee || 0).toLocaleString()}</td>', '<td>${(p.client_fee || 0).toLocaleString()}</td><td>${(p.client_fee * 0.05).toLocaleString()}</td>');
  
  // MRR Section in Financial Ledger UI
  const mrrSection = `
  <div class="mt-8 border-t border-slate-700 pt-6">
    <h3 class="text-xl font-bold text-white mb-4">Phase 5 (MRR) - Recurring Revenue</h3>
    <table class="w-full text-left text-sm text-slate-300">
      <thead><tr class="bg-slate-800 text-slate-400"><th>Project</th><th>Tier</th><th>Monthly Fee</th></tr></thead>
      <tbody id="mrr-tbody"></tbody>
    </table>
    <div class="mt-4 text-right text-emerald-400 font-bold text-xl">Total MRR: KES <span id="total-mrr">0</span> / 1,000,000 Target</div>
  </div>`;
  html = html.replace('</table>\n          </div>', '</table>\n          </div>' + mrrSection);
}

// 2. Project Controls (Freeze & Infra)
const infraAndFreeze = `
<div class="mt-4 p-4 bg-slate-800 rounded border border-slate-700">
  <h4 class="font-bold text-slate-300 mb-2">Project Governance & Infrastructure</h4>
  <div class="flex items-center space-x-4 mb-4">
    <button onclick="toggleFreeze(\${proj.project_id}, \${!proj.is_frozen})" class="px-4 py-2 \${proj.is_frozen ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'} text-white rounded font-bold">
      \${proj.is_frozen ? 'Unfreeze Project' : 'Freeze Project (Slow Client)'}
    </button>
    \${proj.is_frozen ? '<span class="text-red-400 font-bold"><i class="fa-solid fa-snowflake"></i> PROJECT FROZEN</span>' : ''}
  </div>
  <div class="grid grid-cols-3 gap-4">
    <div>
      <label class="block text-xs text-slate-400">GitHub URL</label>
      <input type="text" id="infra-github" value="\${proj.github_url || ''}" class="w-full bg-slate-900 border border-slate-700 rounded p-1 text-white">
    </div>
    <div>
      <label class="block text-xs text-slate-400">Staging URL</label>
      <input type="text" id="infra-staging" value="\${proj.staging_url || ''}" class="w-full bg-slate-900 border border-slate-700 rounded p-1 text-white">
    </div>
    <div>
      <label class="block text-xs text-slate-400">Production URL</label>
      <input type="text" id="infra-prod" value="\${proj.production_url || ''}" class="w-full bg-slate-900 border border-slate-700 rounded p-1 text-white">
    </div>
  </div>
  <button onclick="saveInfra(\${proj.project_id})" class="mt-2 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm">Save URLs</button>
</div>
`;
html = html.replace('<div id="project-phases" class="space-y-4"></div>', infraAndFreeze + '<div id="project-phases" class="space-y-4 mt-4"></div>');

// Add Escrow Toggle and Phase 5 mapping in JS render phase
html = html.replace('const isActive = ph.status === \\'Active\\';', 'const isActive = ph.status === \\'Active\\'; const isPhase3or4 = ph.phase_number === 3 || ph.phase_number === 4; const isPhase5 = ph.phase_number === 5;');
html = html.replace('class="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm"', 'class="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm"');

const toggleEscrow = `\${isPhase3or4 ? \`<button onclick="toggleEscrow(\${ph.project_id}, \${ph.phase_number}, \${!ph.escrow_cleared})" class="ml-2 px-2 py-1 \${ph.escrow_cleared ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-amber-600 hover:bg-amber-500'} text-white rounded text-sm">\${ph.escrow_cleared ? 'Escrow Cleared' : 'Awaiting Escrow'}</button>\` : ''}`;

html = html.replace('Update Financials</button>', 'Update Financials</button>' + toggleEscrow);

// Add JS functions
const jsFunctions = `
async function toggleFreeze(id, freeze) {
  await TMAPI.req(\`/projects/\${id}/freeze\`, 'PATCH', { is_frozen: freeze });
  alert(freeze ? 'Project Frozen' : 'Project Reactivated');
  viewProject(id);
}
async function saveInfra(id) {
  const payload = {
    github_url: document.getElementById('infra-github').value,
    staging_url: document.getElementById('infra-staging').value,
    production_url: document.getElementById('infra-prod').value
  };
  await TMAPI.req(\`/projects/\${id}/infrastructure\`, 'PATCH', payload);
  alert('Infrastructure Links Saved');
}
async function toggleEscrow(projId, phaseNum, cleared) {
  await TMAPI.req(\`/projects/\${projId}/phases/\${phaseNum}/escrow\`, 'PATCH', { escrow_cleared: cleared });
  viewProject(projId);
}
`;
html = html.replace('async function fetchLedger() {', jsFunctions + '\nasync function fetchLedger() {');

// MRR Population
html = html.replace('res.ledger.forEach(p => {', `
let totalMrr = 0;
let mrrHtml = '';
res.ledger.forEach(p => {
  if (p.phase_number === 5 && p.status === 'Active') {
    totalMrr += Number(p.client_fee) || 0;
    mrrHtml += \`<tr><td>\${p.project_name}</td><td>\${p.billing_type}</td><td>\${(p.client_fee || 0).toLocaleString()}</td></tr>\`;
  }
`);
html = html.replace('tbody.innerHTML = html;', `tbody.innerHTML = html;
document.getElementById('mrr-tbody').innerHTML = mrrHtml;
document.getElementById('total-mrr').textContent = totalMrr.toLocaleString();
`);

fs.writeFileSync('admin.html', html);
console.log('Patched admin.html successfully');
