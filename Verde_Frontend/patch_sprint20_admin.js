const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');

// Add Tabs
html = html.replace(
  '<button class="btn" onclick="window.location=\'proposal.html\'">Proposal Builder</button>',
  '<button data-tab="qa">QA Gatekeeper</button><button data-tab="ledger">Financial Ledger</button><button data-tab="ops">Ops & Sales</button><button class="btn" onclick="window.location=\'proposal.html\'">Proposal Builder</button>'
);

// Add Sections
const newSections = `
<section id="qa" class="hidden">
  <div class="card">
    <h2>Pending Document QA Reviews</h2>
    <div id="qaPendingList">Loading...</div>
  </div>
  <div class="card mt-2">
    <h2>SOP Rubrics</h2>
    <div id="qaRubricsList">Loading...</div>
  </div>
</section>

<section id="ledger" class="hidden">
  <div class="card">
    <h2>Monthly Revenue Tracker & Pipeline Ledger</h2>
    <table id="ledgerTable">
      <thead>
        <tr>
          <th>Client / Project</th>
          <th>Active Phase</th>
          <th>Billing Type</th>
          <th>Client Fee (KES)</th>
          <th>Specialist Cost (KES)</th>
          <th>Net Margin (KES)</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody id="ledgerBody">
        <tr><td colspan="7">Loading...</td></tr>
      </tbody>
      <tfoot id="ledgerFoot" style="font-weight: bold; background: #F8FAFC;">
      </tfoot>
    </table>
  </div>
</section>

<section id="ops" class="hidden">
  <div class="grid">
    <div class="card">
      <h2>Weekly Pipeline Checklist</h2>
      <ul style="line-height:1.8">
        <li><input type="checkbox"> <b>Monday (Retainers & Float):</b> Verify upfront deposits for Phases 1 & 2 before scheduling JAD sessions.</li>
        <li><input type="checkbox"> <b>Wednesday (Gate Checks):</b> Review delivered DFDs, ERDs, and code PRs against QA criteria.</li>
        <li><input type="checkbox"> <b>Friday (Reconcile & Release):</b> Collect signed forms, send milestone invoices, and trigger subcontractor payouts.</li>
      </ul>
    </div>
    <div class="card">
      <h2>Subcontractor Vetting Kit</h2>
      <h3>Analyst Assessment</h3>
      <p class="muted">"Provide a brief, unformatted case description of a simplified order-fulfillment process. Task: Deliver a Context Diagram, a Level 0 DFD, a complete Use Case document, and an ERD normalized to 3NF within 24 hours."</p>
      <h3>Architect Assessment</h3>
      <p class="muted">"Given this 5-table schema, write a 2-page Architecture Spec outlining hardware sizing, Auth (JWT), caching, and a structure chart."</p>
    </div>
  </div>
  
  <div class="card mt-2">
    <h2>Client Outreach & Pitches</h2>
    <div style="display:flex;gap:12px">
      <div style="flex:1; border:1px solid #e2e8f0; padding:12px; border-radius:8px">
        <h4>1. The Architecture Audit Angle (Outreach)</h4>
        <p class="muted" style="font-size:12px">Most software builds exceed budgets because of gaps in systems analysis... We run 2-Week Feasibility Sprints to normalize data flows (3NF ERDs) and lock down requirements...</p>
        <button class="btn" onclick="alert('Copied to clipboard!')">Copy Script</button>
      </div>
      <div style="flex:1; border:1px solid #e2e8f0; padding:12px; border-radius:8px">
        <h4>2. The "In-Flight Recovery" Pitch</h4>
        <p class="muted" style="font-size:12px">When custom software stalls, the culprit is missing specs. We offer a fixed-fee Discovery Audit to inspect data models against business needs...</p>
        <button class="btn" onclick="alert('Copied to clipboard!')">Copy Script</button>
      </div>
      <div style="flex:1; border:1px solid #e2e8f0; padding:12px; border-radius:8px">
        <h4>3. Overcoming "Free Quotes"</h4>
        <p class="muted" style="font-size:12px">Agencies giving free quotes inflate them by 200%. For KES 350,000/week, dedicated analysts model your data structures eliminating risks. A spec belongs to you...</p>
        <button class="btn" onclick="alert('Copied to clipboard!')">Copy Script</button>
      </div>
    </div>
  </div>
</section>
`;

html = html.replace('</main>', newSections + '</main>');

// Add QA Modal logic
const qaModal = `
<div id="qaModal" class="hidden" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:999">
  <div style="background:white;padding:24px;border-radius:12px;max-width:600px;width:100%;max-height:80vh;overflow-y:auto">
    <h2>QA Review: <span id="qaDocTitle"></span></h2>
    <p class="muted">Rubric: <span id="qaRubricName"></span></p>
    <div id="qaCriteriaList" style="margin:16px 0"></div>
    <div class="row">
      <button class="btn primary" onclick="submitQaReview('Passed')">Approve & Release to Client</button>
      <button class="btn" style="color:red;border-color:red" onclick="submitQaReview('Failed')">Reject (Requires Revision)</button>
      <button class="btn" onclick="document.getElementById('qaModal').classList.add('hidden')">Cancel</button>
    </div>
  </div>
</div>
`;

html = html.replace('</body>', qaModal + '</body>');

// Inject the JS fetching
const scriptInjection = `
async function loadSprints20() {
  if (typeof TMAPI === 'undefined') return;
  try {
    // Load Ledger
    const ledRes = await TMAPI.req('/api/financial/ledger');
    if(ledRes.ledger) {
      let html = '';
      let totFee = 0, totCost = 0, totMargin = 0;
      ledRes.ledger.forEach(r => {
        const fee = parseFloat(r.client_fee||0);
        const cost = parseFloat(r.specialist_cost||0);
        const margin = fee - cost;
        totFee += fee; totCost += cost; totMargin += margin;
        html += \`<tr>
          <td><b>\${r.project_name}</b><br><span class="muted">\${r.project_id.split('-')[0]}</span></td>
          <td>Phase \${r.phase_number} (\${r.phase_name})</td>
          <td>\${r.billing_type || 'T&M'}</td>
          <td class="money">\${new Intl.NumberFormat().format(fee)}</td>
          <td class="money">\${new Intl.NumberFormat().format(cost)}</td>
          <td class="money">\${new Intl.NumberFormat().format(margin)}</td>
          <td><span class="pill">\${r.phase_status}</span></td>
        </tr>\`;
      });
      document.getElementById('ledgerBody').innerHTML = html || '<tr><td colspan="7">No active financial tracking found.</td></tr>';
      document.getElementById('ledgerFoot').innerHTML = \`<tr>
        <td colspan="3">Monthly Totals:</td>
        <td class="money">\${new Intl.NumberFormat().format(totFee)}</td>
        <td class="money">\${new Intl.NumberFormat().format(totCost)}</td>
        <td class="money">\${new Intl.NumberFormat().format(totMargin)}</td>
        <td>\${totFee >= 4000000 ? '<span style="color:green">Target Met (>4M)</span>' : '<span style="color:orange">Below Target</span>'}</td>
      </tr>\`;
    }

    // Load Rubrics
    const rubRes = await TMAPI.req('/api/qa/rubrics');
    if(rubRes.rubrics) {
      document.getElementById('qaRubricsList').innerHTML = rubRes.rubrics.map(r => 
        \`<div style="padding:10px; border:1px solid #eee; margin-bottom:8px">
          <b>Phase \${r.phase_number}: \${r.deliverable_type}</b>
          <ul style="margin:5px 0 0; padding-left:20px; font-size:13px">\${(r.criteria||[]).map(c=>\`<li>\${c}</li>\`).join('')}</ul>
        </div>\`
      ).join('');
      window.QARUBRICS = rubRes.rubrics;
    }

    // (The Pending docs will be loaded inside loadLeads or project view)
  } catch(e) { console.error('Error loading sprint20 data', e); }
}

// Hook it into window load
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(loadSprints20, 1000);
});

let currentReviewDoc = null;
window.openQaModal = function(docId, docTitle, phaseNum, deliverableType) {
  currentReviewDoc = docId;
  document.getElementById('qaDocTitle').textContent = docTitle;
  document.getElementById('qaRubricName').textContent = deliverableType;
  
  const rubric = (window.QARUBRICS||[]).find(r => r.phase_number == phaseNum && r.deliverable_type == deliverableType);
  
  let chtml = '';
  if(rubric && rubric.criteria) {
    rubric.criteria.forEach((c, i) => {
      chtml += \`<label style="display:block;margin-bottom:8px"><input type="checkbox" id="qa_chk_\${i}"> \${c}</label>\`;
    });
  } else {
    chtml = '<p class="muted">No specific rubric criteria defined. Perform manual review.</p>';
  }
  document.getElementById('qaCriteriaList').innerHTML = chtml;
  
  document.getElementById('qaModal').classList.remove('hidden');
  document.getElementById('qaModal').style.display = 'flex';
};

window.submitQaReview = async function(status) {
  if(!currentReviewDoc) return;
  try {
    await TMAPI.req('/api/documents/' + currentReviewDoc + '/review', 'POST', { status, results: [] });
    alert('QA Status updated: ' + status);
    document.getElementById('qaModal').classList.add('hidden');
    document.getElementById('qaModal').style.display = 'none';
    // refresh
    if(window.loadLeads) loadLeads();
  } catch(e) {
    alert(e.message);
  }
};
`;

html = html.replace('</script></body>', scriptInjection + '</script></body>');

fs.writeFileSync('admin.html', html);
console.log('admin.html patched for Sprint 20');
