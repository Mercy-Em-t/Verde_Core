const fs = require('fs');
let code = fs.readFileSync('backend/seed_rubrics.js', 'utf8');
code = code.replace(/console\\.log.*/g, "console.log('Seeded rubric for Phase ' + r.phase_number);");
fs.writeFileSync('backend/seed_rubrics.js', code);
