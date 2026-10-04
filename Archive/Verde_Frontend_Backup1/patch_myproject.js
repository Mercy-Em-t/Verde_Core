const fs = require('fs');
let myProject = fs.readFileSync('my-project.html', 'utf8');

// The grid has Selected Services and Project Information. We'll add two more sections below it.
const additions = `
<section class="card" style="margin-top:16px">
  <h2>Phase Governance & Documents Hub</h2>
  <div class="empty" id="documents">No documents found. Deliverables will appear here by phase.</div>
</section>

<section class="card" style="margin-top:16px">
  <h2>Communications & Updates</h2>
  <div class="empty" id="communications">No updates yet.</div>
</section>
`;

myProject = myProject.replace('<section class="card" style="margin-top:16px"><h2>Journey snapshot</h2>', additions + '\n<section class="card" style="margin-top:16px"><h2>Journey snapshot</h2>');

// Add the logic to fetch documents and comms in render()
const scriptPatch = `
  // Nudge towards next phase
  if(p.selectedPhases.length === 0) {
    nextBtn.href = "tryphene-sdlc-commercial-platform-v1.html#framework";
    nextBtn.textContent = "Explore phases";
  } else {
    nextBtn.href = "journey.html";
    nextBtn.textContent = "View customer journey";
  }
}

// Fetch documents and communications if API is enabled
if (window.TMAPI && TMAPI.enabled()) {
  try {
    const [docsRes, commsRes] = await Promise.all([
      fetch(TMAPI.baseUrl + '/projects/' + p.id + '/documents', { headers: { 'Authorization': 'Bearer ' + TMAPI.getToken() } }),
      fetch(TMAPI.baseUrl + '/projects/' + p.id + '/communications', { headers: { 'Authorization': 'Bearer ' + TMAPI.getToken() } })
    ]);
    const docsData = await docsRes.json();
    const commsData = await commsRes.json();

    if (docsData.documents && docsData.documents.length > 0) {
      document.getElementById('documents').innerHTML = docsData.documents.map(d => 
        '<div class="phase" style="padding:10px 0;"><div><b>Phase ' + (d.phase_number || 'General') + ': ' + d.title + '</b><br><small>Uploaded ' + new Date(d.created_at).toLocaleDateString() + '</small></div><a class="btn" href="' + TMAPI.baseUrl.replace('/api','') + d.url + '" target="_blank">Download</a></div>'
      ).join('');
    }

    if (commsData.communications && commsData.communications.length > 0) {
      document.getElementById('communications').innerHTML = commsData.communications.map(c => 
        '<div style="padding:10px 0; border-bottom: 1px solid var(--line)"><b>' + c.author_name + '</b> <small class="muted">' + new Date(c.created_at).toLocaleString() + '</small><br>' + c.body + (c.type === 'signoff_request' ? '<br><button class="btn primary" style="margin-top:8px" onclick="signOff(' + p.id + ', ' + c.phase_number + ')">Approve & Sign-off Phase ' + c.phase_number + '</button>' : '') + '</div>'
      ).join('');
    }
  } catch (e) {
    console.error('Error fetching docs/comms', e);
  }
}
`;

myProject = myProject.replace(`if(p.selectedPhases.length === 0) {
    nextBtn.href = "tryphene-sdlc-commercial-platform-v1.html#framework";
    nextBtn.textContent = "Explore phases";
  } else {
    // If they already have phases, they might just need to wait for contact or go to journey
    nextBtn.href = "journey.html";
    nextBtn.textContent = "View customer journey";
  }
}`, scriptPatch);

// Add the signOff function
const signOffScript = `
async function signOff(projectId, phaseNumber) {
  if (!confirm('Are you sure you want to officially sign-off on Phase ' + phaseNumber + '? This freezes the current scope.')) return;
  try {
    const res = await fetch(TMAPI.baseUrl + '/projects/' + projectId + '/phases/' + phaseNumber + '/signoff', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + TMAPI.getToken() }
    });
    if(!res.ok) throw new Error('Failed to sign off');
    alert('Phase ' + phaseNumber + ' successfully signed off!');
    render();
  } catch(e) {
    alert(e.message);
  }
}
`;

myProject = myProject.replace('</script></body></html>', signOffScript + '\n</script></body></html>');
fs.writeFileSync('my-project.html', myProject);
console.log('my-project.html updated');
