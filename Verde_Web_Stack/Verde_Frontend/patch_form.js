const fs = require('fs');
let html = fs.readFileSync('tryphene-sdlc-commercial-platform-v1.html', 'utf8');

const oldStr = 'qualResult.innerHTML=`<strong>Your project is now qualified.</strong><br><b>You are here: ${TM.stages.find(s=>s.id===p.stage).label}</b><br>${p.nextAction}.<br><div style="margin-top:10px"><a href="register.html" style="color:#fff;font-weight:700">Save and Open My Project &rarr;</a></div>`;';
const newStr = 'qualResult.innerHTML=`<div style="padding:15px; background: rgba(0,255,0,0.1); border: 1px solid var(--accent); border-radius: 6px;"><strong>Application Received</strong><br><br>Thank you for submitting your project inquiry. Our team is reviewing the details and will be in touch with you shortly via email with the next steps forward.</div>`;';

html = html.replace(oldStr, newStr);

// To handle any slightly different spacing
const oldRegex = /qualResult\.innerHTML=`<strong>Your project is now qualified\.<\/strong>(.*?)<\/a><\/div>`;/s;
if (html.match(oldRegex)) {
  html = html.replace(oldRegex, newStr);
}

fs.writeFileSync('tryphene-sdlc-commercial-platform-v1.html', html);
console.log('Public form updated');
