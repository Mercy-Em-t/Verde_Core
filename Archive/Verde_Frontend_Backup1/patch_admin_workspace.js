const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');

if (!html.includes('Execute in Workspace')) {
  html = html.replace(
    /onclick="provisionClient\('\$\{x\.id\}', '\$\{x\.email\}', '\$\{x\.org\}', null\)">Provision Client Account<\/button>/,
    "onclick=\"provisionClient('${x.id}', '${x.email}', '${x.org}', null)\">Provision Client Account</button><button class=\"btn primary\" style=\"margin-left:8px\" onclick=\"window.open('workspace.html?project=${x.id}', '_blank')\"><i class=\"fa-solid fa-code-branch\"></i> Execute in Workspace</button>"
  );
  fs.writeFileSync('admin.html', html);
  console.log('patched admin.html');
}
