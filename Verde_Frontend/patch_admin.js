const fs = require('fs');
let admin = fs.readFileSync('admin.html', 'utf8');

const provisionScript = `
async function provisionClient(leadId, email, name, projectId) {
  if(!window.TMAPI || !TMAPI.enabled()) { alert('API is disabled. Cannot provision.'); return; }
  const orgName = name || 'Client';
  const mail = email || prompt('Enter client email:');
  if(!mail) return;
  
  try {
    const res = await fetch(TMAPI.baseUrl + '/auth/provision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + TMAPI.getToken() },
      body: JSON.stringify({ email: mail, name: orgName, leadId, projectId })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    
    // Show modal or alert with draft email
    const mailText = data.draftEmail;
    alert('Client Provisioned Successfully!\\n\\nCopy the following draft email to send to the client:\\n\\n' + mailText);
    
    // Refresh leads
    render();
  } catch(e) {
    alert('Failed to provision: ' + e.message);
  }
}
`;

// Add button to lead detail
admin = admin.replace(
  `<button class="btn" onclick="assignOwner('\${x.id}')">Save owner</button></div>`,
  `<button class="btn" onclick="assignOwner('\${x.id}')">Save owner</button><button class="btn primary" style="margin-left:8px" onclick="provisionClient('\${x.id}', '\${x.email}', '\${x.org}', null)">Provision Client Account</button></div>`
);

admin = admin.replace('</script></body></html>', provisionScript + '\n</script></body></html>');
fs.writeFileSync('admin.html', admin);
console.log('admin.html updated');
