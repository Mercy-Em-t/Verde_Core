const fs = require('fs');
let html = fs.readFileSync('my-project.html', 'utf8');

const regex = /document\.getElementById\("services"\)\.innerHTML=(.*?)\.join\(""\):'(.*?)';/g;

html = html.replace(regex, "document.getElementById('services').innerHTML=p.selectedPhases.length?p.selectedPhases.map(id=>`<div class=\"phase\"><div><b>Phase ${String(id).padStart(2,'0')} - ${phases[id]}</b><br><small>Selected for this project</small></div><div style=\"display:flex;gap:8px\"><a class=\"btn primary\" href=\"workspace.html?project=${p.id}\"><i class=\"fa-solid fa-code-branch\"></i> Execute in Workspace</a><a class=\"btn\" href=\"${links[id]}\">View</a></div></div>`).join(''):'<div class=\"empty\">No phase selected yet. Start by exploring the framework.</div>';");

fs.writeFileSync('my-project.html', html);
console.log('patched my-project.html');
