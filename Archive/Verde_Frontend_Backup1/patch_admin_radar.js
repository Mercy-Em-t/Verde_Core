const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');

const intelligenceUI = `
<div id="admin-intelligence-radar" class="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
  <!-- Capacity Radar -->
  <div class="bg-slate-900 border border-slate-700 p-6 rounded-xl shadow-lg relative overflow-hidden" id="capacity-radar-card">
    <div class="flex justify-between items-center mb-4">
      <h3 class="font-bold text-white"><i class="fa-solid fa-gauge-high text-indigo-400 mr-2"></i> Capacity Radar</h3>
      <button onclick="setCapacityLimit()" class="text-xs text-slate-400 hover:text-white"><i class="fa-solid fa-gear"></i> Set Limit</button>
    </div>
    <div id="capacity-content" class="text-slate-300 text-sm">Loading telemetry...</div>
  </div>

  <!-- Pipeline Drought Predictor -->
  <div class="bg-slate-900 border border-slate-700 p-6 rounded-xl shadow-lg relative overflow-hidden" id="drought-predictor-card">
    <div class="flex justify-between items-center mb-4">
      <h3 class="font-bold text-white"><i class="fa-solid fa-water text-blue-400 mr-2"></i> Pipeline Predictor</h3>
      <button onclick="snoozeDrought()" class="text-xs text-slate-400 hover:text-white" id="snooze-btn"><i class="fa-solid fa-bell-slash"></i> Snooze</button>
    </div>
    <div id="drought-content" class="text-slate-300 text-sm">Loading telemetry...</div>
  </div>
</div>
`;

const intelligenceScript = `
async function loadAdminIntelligence() {
  try {
    const projects = await TMAPI.req('/projects');
    // For leads, we simulate a count (or fetch if endpoint exists, but we'll just use 0 for now if API isn't ready)
    // Actually, we can just look at projects in 'Pending' or 'Phase 1'
    
    let p4Count = 0;
    let p3Count = 0;
    let p1Count = 0;
    
    projects.forEach(p => {
      const activePhase = p.phases.find(ph => ph.status === 'Active');
      if (activePhase) {
        if (activePhase.phase_number === 4) p4Count++;
        if (activePhase.phase_number === 3) p3Count++;
        if (activePhase.phase_number === 1) p1Count++;
      }
    });

    const maxCap = parseInt(localStorage.getItem('MAX_PHASE4_CAPACITY')) || 2;
    const capacityCard = document.getElementById('capacity-radar-card');
    const capContent = document.getElementById('capacity-content');
    
    if (p4Count >= maxCap) {
      capacityCard.classList.add('border-red-500', 'bg-red-900/20');
      capContent.innerHTML = \`<div class="text-red-400 font-bold text-lg mb-1"><i class="fa-solid fa-triangle-exclamation"></i> CAPACITY CRITICAL</div>
      <p>You have \${p4Count} active Phase 4 builds. Do not activate new Implementation milestones until a project is deployed.</p>\`;
    } else {
      capacityCard.classList.remove('border-red-500', 'bg-red-900/20');
      capContent.innerHTML = \`<div class="text-emerald-400 font-bold text-lg mb-1"><i class="fa-solid fa-check-circle"></i> Capacity Optimal</div>
      <p>Active Phase 4 Builds: \${p4Count} / \${maxCap}</p>\`;
    }

    const droughtCard = document.getElementById('drought-predictor-card');
    const droughtContent = document.getElementById('drought-content');
    const snoozedUntil = parseInt(localStorage.getItem('DROUGHT_SNOOZE_UNTIL')) || 0;
    
    if (p4Count > 0 && p1Count === 0 && Date.now() > snoozedUntil) {
      droughtCard.classList.add('border-amber-500', 'bg-amber-900/20');
      droughtContent.innerHTML = \`<div class="text-amber-400 font-bold text-lg mb-1"><i class="fa-solid fa-bolt"></i> PIPELINE DROUGHT IMMINENT</div>
      <p class="mb-3">You are busy building, but have 0 Phase 1 discovery sprints queued. Initiate outreach immediately to prevent a cash flow gap.</p>
      <button onclick="copyOutreachPitch()" class="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded font-bold text-xs"><i class="fa-solid fa-copy"></i> Copy Outreach Pitch</button>\`;
    } else {
      droughtCard.classList.remove('border-amber-500', 'bg-amber-900/20');
      if (Date.now() <= snoozedUntil) {
        droughtContent.innerHTML = \`<p class="text-slate-500 italic">Alerts snoozed until \${new Date(snoozedUntil).toLocaleDateString()}</p>\`;
      } else {
        droughtContent.innerHTML = \`<div class="text-emerald-400 font-bold text-lg mb-1"><i class="fa-solid fa-check-circle"></i> Pipeline Healthy</div>
        <p>You have active Phase 1 projects feeding the funnel.</p>\`;
      }
    }
  } catch (e) {
    console.error('Failed to load intelligence', e);
  }
}

function setCapacityLimit() {
  const current = localStorage.getItem('MAX_PHASE4_CAPACITY') || 2;
  const val = prompt('Set Maximum Concurrent Phase 4 Builds:', current);
  if (val && !isNaN(val)) {
    localStorage.setItem('MAX_PHASE4_CAPACITY', val);
    loadAdminIntelligence();
  }
}

function snoozeDrought() {
  // Snooze for 7 days
  localStorage.setItem('DROUGHT_SNOOZE_UNTIL', Date.now() + (7 * 24 * 60 * 60 * 1000));
  loadAdminIntelligence();
}

function copyOutreachPitch() {
  const pitch = "Hi [Name],\\n\\nMost enterprise software builds exceed budgets because of gaps in initial systems analysis.\\n\\nAt Tryphen Ecosystem, we run structured 2-Week Systems Feasibility & Architecture Sprints to model and verify your system logic before you commit millions to development.\\n\\nWould you be open to a brief scoping chat?";
  navigator.clipboard.writeText(pitch);
  alert("Outreach pitch copied to clipboard!");
}

// Call on load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(loadAdminIntelligence, 1000);
});
`;

if (!html.includes('id="admin-intelligence-radar"')) {
  html = html.replace('<div class="row">', intelligenceUI + '<div class="row">');
  html = html.replace('async function fetchLedger() {', intelligenceScript + '\nasync function fetchLedger() {');
  fs.writeFileSync('admin.html', html);
  console.log('Admin Intelligence UI injected successfully.');
} else {
  console.log('Already injected.');
}
