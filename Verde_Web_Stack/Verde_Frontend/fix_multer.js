const fs = require('fs');
let code = fs.readFileSync('backend/src/server.js', 'utf8');
code = code.replace("const multer = require('multer');", "import multer from 'multer';");
fs.writeFileSync('backend/src/server.js', code);
console.log('Fixed multer import');
