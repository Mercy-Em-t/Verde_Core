const fs = require('fs');
let admin = fs.readFileSync('admin.html', 'utf8');
let myProject = fs.readFileSync('my-project.html', 'utf8');

console.log('--- ADMIN ---');
admin.split('\n').forEach((l,i) => { if(l.includes('<div class="card"') || l.includes('class="tab-') || l.includes('id="nav-')) console.log(i, l.trim()); });
console.log('--- MY PROJECT ---');
myProject.split('\n').forEach((l,i) => { if(l.includes('<div class="card"') || l.includes('class="tab-') || l.includes('id="nav-')) console.log(i, l.trim()); });
