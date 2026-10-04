import os

file_path = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\my-project.html'

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Let's completely rewrite the sdlcPhases array to enforce the hard stop.
target_start = html.find('const sdlcPhases = [')
target_end = html.find('];', target_start) + 2

new_state = """const sdlcPhases = [
            { 
                id: 1, name: 'Feasibility & Planning', status: 'active',
                desc: 'Phase 1 deliverables are ready for review. Formal signature on the Project Charter and clearance of the Phase 2 Retainer Invoice are required to unlock Phase 2.',
                approval: { status: 'pending' },
                docs: [
                    { name: 'Phase1_Feasibility_Report.pdf', icon: 'fa-file-pdf', color: 'blue-500', status: 'ready' },
                    { name: 'WBS_Master_Schedule.pdf', icon: 'fa-diagram-project', color: 'indigo-500', status: 'ready' },
                    { name: 'Phase1_Project_Charter_UNSIGNED.pdf', icon: 'fa-file-signature', color: 'amber-500', status: 'ready' }
                ],
                crs: []
            },
            { 
                id: 2, name: 'Requirements & Specs', status: 'locked',
                desc: 'HARD STOP: This phase is contractually locked. It will open immediately upon receipt of the signed Phase 1 Project Charter and bank clearance of Invoice INV-001.',
                approval: { status: 'locked' },
                docs: [],
                crs: []
            },
            { id: 3, name: 'Architecture Blueprint', status: 'locked', desc: 'Locked pending Phase 2 completion.', approval: {status: 'locked'}, docs: [], crs: [] },
            { id: 4, name: 'Delivery Strategy', status: 'locked', desc: 'Locked pending Phase 3 completion.', approval: {status: 'locked'}, docs: [], crs: [] },
            { id: 5, name: 'Maintenance', status: 'locked', desc: 'Post-launch SLA.', approval: {status: 'locked'}, docs: [], crs: [] }
        ];"""

html = html[:target_start] + new_state + html[target_end:]

# Now let's update the renderPhaseDetails function to explicitly show the payment/signature warnings for the client
render_start = html.find('// 1. Render Approval Banner')
render_end = html.find('// 2. Render Docs Vault', render_start)

new_render = """// 1. Render Approval Banner
            let approvalHtml = '';
            if(phase.approval.status === 'approved') {
                approvalHtml = `
                <div class="bg-emerald-50 border border-emerald-200 p-4 rounded-lg flex justify-between items-center mb-6">
                    <div>
                        <p class="text-sm font-bold text-emerald-800"><i class="fa-solid fa-circle-check mr-2"></i> Phase Formally Signed Off</p>
                        <p class="text-xs text-emerald-600 mt-1">Authorized by ${phase.approval.by}</p>
                    </div>
                    <button class="bg-white text-emerald-700 px-4 py-2 rounded text-xs font-bold border border-emerald-200 shadow-sm">View Certificate</button>
                </div>`;
            } else if (phase.approval.status === 'pending' && phase.id === 1) {
                approvalHtml = `
                <div class="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <p class="text-sm font-bold text-amber-800"><i class="fa-solid fa-triangle-exclamation mr-2"></i> ACTION REQUIRED: Phase 1 Closure Pending</p>
                        <p class="text-xs text-amber-700 mt-1">Phase 2 discovery cannot commence until the two commercial gates below are cleared.</p>
                        <div class="mt-3 space-y-2">
                            <p class="text-xs font-bold text-amber-900"><i class="fa-solid fa-file-signature text-amber-500 w-4"></i> 1. Ink on the Page: <span class="font-normal">Sign and upload the Project Charter.</span></p>
                            <p class="text-xs font-bold text-amber-900"><i class="fa-solid fa-building-columns text-amber-500 w-4"></i> 2. Funds in the Bank: <span class="font-normal">Clear Invoice INV-001 (Phase 2 Retainer).</span></p>
                        </div>
                    </div>
                    <div class="flex flex-col space-y-2 w-full md:w-auto client-only">
                        <button onclick="alert('Opening secure upload portal for signed charter...')" class="bg-amber-600 text-white px-4 py-2 rounded text-xs font-bold shadow hover:bg-amber-700 transition-colors whitespace-nowrap"><i class="fa-solid fa-cloud-arrow-up mr-2"></i> Upload Signed Charter</button>
                        <button onclick="alert('Opening Payment Gateway / Invoice link...')" class="bg-[#0B1325] text-white px-4 py-2 rounded text-xs font-bold shadow hover:bg-slate-800 transition-colors whitespace-nowrap"><i class="fa-solid fa-credit-card mr-2"></i> View & Pay Invoice</button>
                    </div>
                </div>`;
            } else if (phase.approval.status === 'pending') {
                 approvalHtml = `
                <div class="bg-indigo-50 border border-indigo-200 p-4 rounded-lg flex justify-between items-center mb-6">
                    <div>
                        <p class="text-sm font-bold text-indigo-800"><i class="fa-solid fa-clock mr-2"></i> Awaiting Client Sign-Off</p>
                        <p class="text-xs text-indigo-600 mt-1">Please review the deliverables below and sign to unlock the next phase.</p>
                    </div>
                    <button class="bg-indigo-600 text-white px-4 py-2 rounded text-xs font-bold shadow hover:bg-indigo-700 client-only">Sign Phase Document</button>
                </div>`;
            }
"""
html = html.replace(html[render_start:render_end], new_render)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated my-project.html to enforce commercial hard stops")
