import os

file_path = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\my-project.html'

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# We need to update the mock crDatabase to include an "Assessed" state CR.
# Find `const crDatabase = [` and replace the `CR-001` entry to show the new assessment.
cr_db_start = html.find('const crDatabase = [')
cr_db_end = html.find('];', cr_db_start)

new_cr_db = """const crDatabase = [
            {
                id: 'CR-001',
                phaseId: 2,
                title: 'Add Stripe Subs',
                date: 'Oct 12',
                status: 'Assessed',
                desc: 'Need Stripe subscriptions added to gateway.',
                impactTime: '+ 3 Business Days',
                impactCost: 'KES 150,000'
            },
            {
                id: 'CR-002',
                phaseId: 2,
                title: 'Change DB to MySQL',
                date: 'Oct 13',
                status: 'Rejected',
                desc: 'Can we use MySQL instead of Postgres?'
            }
        """
html = html[:cr_db_start] + new_cr_db + html[cr_db_end:]

# Now we need to update the renderTracker function where it renders the CRs
render_cr_start = html.find('// 3. Render Change Requests')
render_cr_end = html.find('document.getElementById(\'crList\').innerHTML = crHtml;', render_cr_start)

new_render_cr = """// 3. Render Change Requests
            const phaseCRs = crDatabase.filter(cr => cr.phaseId === phaseId);
            let crHtml = '';
            if(phaseCRs.length === 0) {
                crHtml = '<div class="text-sm text-slate-500 italic text-center py-4">No change requests for this phase.</div>';
            } else {
                phaseCRs.forEach(cr => {
                    let badge = '';
                    let actionHtml = '';
                    
                    if(cr.status === 'Submitted') {
                        badge = '<span class="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded">Pending Admin</span>';
                    } else if(cr.status === 'Assessed') {
                        badge = '<span class="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-blue-200">Decision Required</span>';
                        actionHtml = `
                            <div class="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                <p class="text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-2">Impact Assessment</p>
                                <div class="flex justify-between text-xs font-bold text-[#0B1325] mb-3">
                                    <span class="flex items-center"><i class="fa-solid fa-clock text-slate-400 mr-1"></i> ${cr.impactTime}</span>
                                    <span class="flex items-center text-emerald-600"><i class="fa-solid fa-money-bill mr-1"></i> ${cr.impactCost}</span>
                                </div>
                                <div class="flex space-x-2">
                                    <button onclick="alert('Change Funded! Scope unlocked and KES 150,000 invoice generated.')" class="flex-1 bg-emerald-600 text-white text-[10px] font-bold py-2 rounded hover:bg-emerald-700 transition-colors">Fund & Add to Scope</button>
                                    <button onclick="alert('Change moved to Post-Launch Backlog.')" class="flex-1 bg-slate-200 text-slate-700 text-[10px] font-bold py-2 rounded hover:bg-slate-300 transition-colors">Hold in Backlog</button>
                                </div>
                            </div>
                        `;
                    } else if(cr.status === 'Rejected') {
                        badge = '<span class="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded">Rejected</span>';
                    } else {
                        badge = `<span class="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">${cr.status}</span>`;
                    }

                    crHtml += `
                    <div class="p-3 border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors bg-white">
                        <div class="flex justify-between items-start mb-1">
                            <span class="font-bold text-[#0B1325] text-sm">${cr.id}</span>
                            ${badge}
                        </div>
                        <p class="text-xs font-bold text-slate-700 mb-1">${cr.title}</p>
                        <p class="text-[10px] text-slate-500">${cr.desc}</p>
                        ${actionHtml}
                    </div>
                    `;
                });
            }
            """
html = html[:render_cr_start] + new_render_cr + html[render_cr_end:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated my-project.html with Client COR Engine")
