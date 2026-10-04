const fs = require('fs');
const pages = ['my-project.html', 'tryphene-sdlc-commercial-platform-v1.html', 'journey.html', 'phase.html'];
pages.forEach(p => {
  if (fs.existsSync(p)) {
    let html = fs.readFileSync(p, 'utf8');
    if (!html.includes('runtime-config.js')) {
      html = html.replace('<script src="project-state.js"></script>', '<script src="runtime-config.js"></script><script src="api-client.js"></script>\n<script src="project-state.js"></script>');
      fs.writeFileSync(p, html);
    }
  }
});
console.log('Dependencies injected');
