const fs = require('fs');
let code = fs.readFileSync('backend/src/server.js', 'utf8');

// Insert import path
if (!code.includes("import path from 'path';")) {
  code = code.replace("import multer from 'multer';", "import multer from 'multer';\nimport path from 'path';");
}

// Fix __dirname
if (code.includes("__dirname")) {
  if (!code.includes("fileURLToPath")) {
     code = code.replace("import path from 'path';", "import path from 'path';\nimport { fileURLToPath } from 'url';\nconst __filename = fileURLToPath(import.meta.url);\nconst __dirname = path.dirname(__filename);");
  }
}

fs.writeFileSync('backend/src/server.js', code);
console.log('Fixed ES module issues in server.js');
