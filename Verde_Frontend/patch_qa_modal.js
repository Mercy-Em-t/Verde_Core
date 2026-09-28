const fs = require('fs');

let html = fs.readFileSync('admin.html', 'utf8');

// Fix the .hidden CSS to include !important so it overrides the inline display:flex
html = html.replace('.hidden{display:none}', '.hidden{display:none !important}');

fs.writeFileSync('admin.html', html);
console.log('Fixed qaModal hidden issue in admin.html');
