const fs = require('fs');
let code = fs.readFileSync('backend/src/server.js', 'utf8');
code = code.replace(/const path = require\('path'\);/g, "import path from 'path';");
fs.writeFileSync('backend/src/server.js', code);
console.log('Fixed path import');
