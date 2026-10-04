const fs = require('fs');
const path = require('path');

const dirsToScan = ['.', './deploy/nginx/html'];

dirsToScan.forEach(dir => {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    if (file.endsWith('.html') || file.endsWith('.js') || file.endsWith('.md')) {
      const filePath = path.join(dir, file);
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('Tryphen')) {
          content = content.replace(/Tryphen/g, 'Tryphen');
          fs.writeFileSync(filePath, content);
          console.log(`Fixed typo in ${filePath}`);
        }
      } catch (e) {
        // ignore dirs or unreadable
      }
    }
  });
});
