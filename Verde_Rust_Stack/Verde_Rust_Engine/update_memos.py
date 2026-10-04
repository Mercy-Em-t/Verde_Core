import os

file_path = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\my-project.html'

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Add "Draft Weekly Memo" to Admin HUD
admin_hud_marker = '<!-- Governance Actions -->'
if admin_hud_marker in html:
    new_button = """
                <button onclick="openMemoModal()" class="flex flex-col items-center justify-center p-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors shadow">
                    <i class="fa-solid fa-bullhorn text-xl mb-2"></i>
                    <span class="text-xs font-bold">Draft Weekly Memo</span>
                </button>
"""
    # Let's replace the grid from cols-4 to cols-5
    html = html.replace('<div class="grid grid-cols-1 md:grid-cols-4 gap-4">', '<div class="grid grid-cols-1 md:grid-cols-5 gap-4">')
    html = html.replace('<!-- Governance Actions -->', '<!-- Governance Actions -->' + new_button)

# 2. Add "Sprint Memos & Comms" below dynamicPhaseContainer
dynamic_container_end = html.find('</div>\n        </main>')
if dynamic_container_end != -1:
    comms_section = """
        <!-- Sprint Memos & Communication Log (Project-Wide) -->
        <div class="mt-8 dashboard-card p-6">
            <div class="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
                <div>
                    <h3 class="font-bold text-lg"><i class="fa-solid fa-timeline text-indigo-600 mr-2"></i> Sprint Memos & Communication Cadence</h3>
                    <p class="text-sm text-slate-500">The single source of truth for weekly progress, blockers, and scheduled workshops.</p>
                </div>
            </div>

            <div class="space-y-6">
                <!-- Memo 1 -->
                <div class="bg-slate-50 border border-slate-200 rounded-lg p-5">
                    <div class="flex justify-between items-start mb-4 border-b border-slate-200 pb-3">
                        <div>
                            <span class="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Weekly Status Memo</span>
                            <h4 class="font-bold text-[#0B1325] mt-1">End of Sprint 1: Feasibility Audit Complete</h4>
                        </div>
                        <span class="text-xs font-bold text-slate-400">Friday, Oct 10, 2026</span>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-700">
                        <div>
                            <h5 class="font-bold text-xs uppercase text-slate-500 mb-2">✅ Completed This Week</h5>
                            <ul class="list-disc pl-4 space-y-1 text-slate-600">
                                <li>Technical feasibility audit of legacy ERP.</li>
                                <li>DCF Financial Model generated (19-month payback).</li>
                                <li>Project Charter and WBS locked.</li>
                            </ul>
                        </div>
                        <div>
                            <h5 class="font-bold text-xs uppercase text-slate-500 mb-2">🎯 Planned Next Week</h5>
                            <ul class="list-disc pl-4 space-y-1 text-slate-600">
                                <li>Kick off Phase 2: Requirements Modeling.</li>
                                <li>Deploy Stakeholder Diagnostic Questionnaires.</li>
                            </ul>
                        </div>
                        <div class="md:col-span-2 bg-white border border-red-100 p-3 rounded">
                            <h5 class="font-bold text-xs uppercase text-red-500 mb-1">⚠️ Blockers & Client Action Needed</h5>
                            <p class="text-slate-600 text-xs">Waiting on Phase 1 Sign-Off. <strong>Deadline: Monday EOD</strong> to avoid project pause.</p>
                        </div>
                    </div>
                </div>

                <!-- Workshop Invite -->
                <div class="bg-amber-50 border border-amber-200 rounded-lg p-5">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <span class="bg-amber-200 text-amber-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Timeboxed Workshop</span>
                            <h4 class="font-bold text-[#0B1325] mt-1">Joint Application Development (JAD) Session</h4>
                        </div>
                        <button class="bg-[#0B1325] text-white px-4 py-1.5 rounded text-xs font-bold shadow hover:bg-slate-800 client-only">Accept & Add to Calendar</button>
                    </div>
                    <p class="text-sm text-slate-600 mb-3">Mandatory 60-minute session to map cross-departmental workflows and arbitrate operational policies before engineering begins.</p>
                    <div class="flex items-center space-x-4 text-xs font-bold text-slate-700">
                        <span class="flex items-center"><i class="fa-regular fa-calendar text-amber-500 mr-2"></i> Tue, Oct 14 • 10:00 AM EAT</span>
                        <span class="flex items-center"><i class="fa-solid fa-video text-indigo-500 mr-2"></i> Zoom Bridge (Secure)</span>
                    </div>
                </div>
            </div>
        </div>
"""
    html = html[:dynamic_container_end] + comms_section + html[dynamic_container_end:]

# 3. Add Draft Memo Modal
modal_insertion = html.find('<!-- Modals -->')
memo_modal = """
    <!-- Draft Memo Modal (Admin Only) -->
    <div id="memoModal" class="fixed inset-0 z-50 flex items-center justify-center hidden">
        <div class="modal-bg absolute inset-0" onclick="closeMemoModal()"></div>
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl relative z-10 overflow-hidden animate-[fadeIn_0.2s_ease-out] flex flex-col max-h-[90vh]">
            <div class="p-6 border-b border-slate-200 bg-[#0B1325] text-white">
                <h2 class="text-xl font-bold"><i class="fa-solid fa-pen-nib mr-2"></i> Draft Weekly Status Memo</h2>
                <p class="text-sm text-slate-400 mt-1">Publish project updates, track burn rates, and flag blockers.</p>
            </div>
            <form onsubmit="handleMemoSubmit(event)" class="p-6 space-y-5 overflow-y-auto flex-1">
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Memo Title</label>
                    <input type="text" required placeholder="e.g. End of Sprint 2: Data Models Locked" class="w-full p-2 border border-slate-300 rounded focus:border-indigo-500 outline-none text-sm">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-emerald-600 uppercase mb-1">✅ Completed This Week</label>
                        <textarea required rows="4" placeholder="- Delivered 3NF Database Schemas&#10;- Completed JAD Session" class="w-full p-2 border border-slate-300 rounded focus:border-emerald-500 outline-none text-sm"></textarea>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-indigo-600 uppercase mb-1">🎯 Planned Next Week</label>
                        <textarea required rows="4" placeholder="- Frontend wireframing&#10;- Subcontractor kickoff" class="w-full p-2 border border-slate-300 rounded focus:border-indigo-500 outline-none text-sm"></textarea>
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-bold text-red-500 uppercase mb-1">⚠️ Blockers & Client Input Required</label>
                    <textarea rows="2" placeholder="List any delays waiting on the client..." class="w-full p-2 border border-slate-300 rounded focus:border-red-500 outline-none text-sm"></textarea>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Milestone Budget Burn</label>
                        <input type="text" placeholder="e.g. 40% (KES 400,000)" class="w-full p-2 border border-slate-300 rounded focus:border-indigo-500 outline-none text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Send Notification?</label>
                        <select class="w-full p-2 border border-slate-300 rounded focus:border-indigo-500 outline-none text-sm">
                            <option>Yes, email Client Sponsor immediately</option>
                            <option>No, post to dashboard only</option>
                        </select>
                    </div>
                </div>
            </form>
            <div class="p-4 border-t border-slate-200 flex justify-end space-x-3 bg-slate-50">
                <button type="button" onclick="closeMemoModal()" class="px-4 py-2 font-bold text-slate-500 hover:text-[#0B1325]">Cancel</button>
                <button type="button" onclick="handleMemoSubmit(event)" class="px-6 py-2 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700 shadow flex items-center"><i class="fa-solid fa-paper-plane mr-2"></i> Publish Memo</button>
            </div>
        </div>
    </div>
"""
html = html[:modal_insertion+15] + memo_modal + html[modal_insertion+15:]

# Add script handlers
script_end = html.find('</script>\n</body>')
new_funcs = """
        function openMemoModal() { document.getElementById('memoModal').classList.remove('hidden'); }
        function closeMemoModal() { document.getElementById('memoModal').classList.add('hidden'); }
        function handleMemoSubmit(e) {
            e.preventDefault();
            alert('Weekly Status Memo published to client dashboard and emailed to David Kimani (COO).');
            closeMemoModal();
        }
"""
html = html[:script_end] + new_funcs + html[script_end:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Added Memo Engine")
