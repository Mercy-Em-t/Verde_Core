const fs = require('fs');
let code = fs.readFileSync('backend/src/server.js', 'utf8');

if(!code.includes("import fs from 'fs';")) {
  code = code.replace("import multer from 'multer';", "import multer from 'multer';\nimport fs from 'fs';");
}

fs.writeFileSync('backend/src/server.js', code);
console.log('Fixed fs in server.js');
