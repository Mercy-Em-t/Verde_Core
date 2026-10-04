const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');

const commandersIntent = `
<div class="mt-6 mb-8 bg-slate-900 border-l-4 border-emerald-500 p-6 rounded shadow-lg relative overflow-hidden group">
  <div class="absolute inset-0 bg-emerald-900/10 z-0"></div>
  <div class="relative z-10">
    <h3 class="text-xl font-bold text-white mb-2 uppercase tracking-wide flex items-center">
      <i class="fa-solid fa-anchor text-emerald-400 mr-3"></i> Commander's Intent
    </h3>
    <p class="text-slate-300 italic mb-3 font-semibold leading-relaxed">
      "Hold firm on your boundaries — never do analysis for free, collect those retainers upfront, and let your specialist agents do the heavy lifting while you steer the ship. Go secure those contracts and hit that 4M target!"
    </p>
    <div class="inline-flex items-center px-4 py-2 bg-red-900/40 border border-red-500/50 rounded text-red-300 text-sm font-bold mt-2 shadow-inner">
      <i class="fa-solid fa-hand-holding-dollar mr-2"></i> Reminder: Unwarranted discounts chip into your quality and are an insult to your paying clients who respect your work.
    </div>
  </div>
</div>
`;

// Inject right after the <header class="top"> or inside the <main class="wrap">
if (!html.includes("Commander's Intent")) {
  html = html.replace('<main class="wrap">', '<main class="wrap">' + commandersIntent);
  fs.writeFileSync('admin.html', html);
  console.log('Injected Commanders Intent successfully');
} else {
  console.log('Already injected');
}
