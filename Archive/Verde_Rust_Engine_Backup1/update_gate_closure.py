import os

file_path = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\my-project.html'

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Add "Close Phase Gate" button to the Admin HUD
# Find the button grid in the Engagement Director Workspace
btn_marker = '<button class="bg-[#0B1325] text-white p-3 rounded text-xs font-bold shadow hover:bg-slate-800 transition-colors" onclick="openMemoEditor()"><i class="fa-solid fa-pen-to-square mr-2"></i> Draft Weekly Memo</button>'
if btn_marker in html:
    new_btn = """<button class="bg-indigo-600 text-white p-3 rounded text-xs font-bold shadow hover:bg-indigo-700 transition-colors" onclick="openGateModal()"><i class="fa-solid fa-lock mr-2"></i> Close Phase Gate</button>
    """
    html = html.replace(btn_marker, btn_marker + '\n' + new_btn)

# 2. Add the Gate Closure Modal to the end of the body
modal_marker = '<!-- Admin Action Memos Modal -->'
gate_modal = """
    <!-- Admin Phase Gate Closure Modal -->
    <div id="gateModal" class="fixed inset-0 z-50 flex items-center justify-center hidden">
        <div class="modal-bg absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onclick="closeGateModal()"></div>
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-[fadeIn_0.2s_ease-out] flex flex-col max-h-[90vh]">
            
            <div class="p-6 border-b border-slate-200 bg-[#0B1325] text-white flex justify-between items-center">
                <div>
                    <h2 class="text-xl font-bold"><i class="fa-solid fa-lock text-emerald-400 mr-2"></i> Phase Gate Closure Engine</h2>
                    <p class="text-sm text-slate-400 mt-1">Operational Checklist for Phase Transition & Invoicing</p>
                </div>
                <button onclick="closeGateModal()" class="text-slate-400 hover:text-white"><i class="fa-solid fa-xmark text-xl"></i></button>
            </div>
            
            <div class="p-6 overflow-y-auto flex-1 bg-slate-50">
                <div class="bg-indigo-50 border border-indigo-200 rounded p-4 mb-6">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-xs font-bold text-indigo-800 uppercase tracking-wider">Active Transition</span>
                        <span class="bg-indigo-200 text-indigo-800 text-[10px] font-bold px-2 py-1 rounded">GATE 1</span>
                    </div>
                    <p class="text-sm text-indigo-900 font-medium">Closing: <strong class="font-bold">Phase 1 (Initiation & Feasibility)</strong></p>
                    <p class="text-sm text-indigo-900 font-medium">Unlocking: <strong class="font-bold">Phase 2 (Requirements Analysis)</strong></p>
                </div>

                <h3 class="font-bold text-sm text-slate-700 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Operational Closure Checklist</h3>
                
                <form id="gateForm" onsubmit="handleGateSubmit(event)" class="space-y-4">
                    <label class="flex items-start space-x-3 p-3 bg-white border border-slate-200 rounded cursor-pointer hover:bg-slate-50">
                        <input type="checkbox" required class="mt-1 w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500">
                        <div>
                            <span class="block text-sm font-bold text-slate-800">1. Deliverable Review</span>
                            <span class="block text-xs text-slate-500">Present the Feasibility Report and Workplan to the Client Project Sponsor.</span>
                        </div>
                    </label>

                    <label class="flex items-start space-x-3 p-3 bg-white border border-slate-200 rounded cursor-pointer hover:bg-slate-50">
                        <input type="checkbox" required class="mt-1 w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500">
                        <div>
                            <span class="block text-sm font-bold text-slate-800">2. Formal Signatures</span>
                            <span class="block text-xs text-slate-500">Both parties execute the Project Charter and Phase 1 Acceptance Form.</span>
                        </div>
                    </label>

                    <label class="flex items-start space-x-3 p-3 bg-white border border-slate-200 rounded cursor-pointer hover:bg-slate-50">
                        <input type="checkbox" required class="mt-1 w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500">
                        <div class="flex-1">
                            <div class="flex justify-between items-center mb-1">
                                <span class="block text-sm font-bold text-slate-800">3. Commercial Settlement (Invoice Issued)</span>
                                <button type="button" class="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-1 rounded hover:bg-slate-300" onclick="alert('Generating Phase 2 Sprint Week 1 Invoice for KES 400,000...')">Generate Invoice</button>
                            </div>
                            <span class="block text-xs text-slate-500 mb-2">Issue the invoice for Sprint Week 1 of Phase 2 (Requirements Analysis) at KES 400,000.</span>
                        </div>
                    </label>

                    <label class="flex items-start space-x-3 p-3 bg-white border border-slate-200 rounded cursor-pointer hover:bg-slate-50">
                        <input type="checkbox" required class="mt-1 w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500">
                        <div>
                            <span class="block text-sm font-bold text-slate-800">4. Fund Clearance (Bank Confirmation)</span>
                            <span class="block text-xs text-slate-500">Bank confirmation of Phase 2 retainer funds in full. Do not check this until funds have cleared.</span>
                        </div>
                    </label>
                </form>
            </div>
            
            <div class="p-4 border-t border-slate-200 bg-white flex justify-end space-x-3">
                <button type="button" onclick="closeGateModal()" class="px-4 py-2 font-bold text-slate-500 hover:text-[#0B1325] text-sm">Cancel</button>
                <button type="button" onclick="document.getElementById('gateForm').requestSubmit()" class="px-6 py-2 bg-emerald-600 text-white font-bold rounded shadow hover:bg-emerald-700 text-sm flex items-center"><i class="fa-solid fa-unlock mr-2"></i> Unlock Phase 2 (Requirements)</button>
            </div>
        </div>
    </div>
    <script>
        function openGateModal() { document.getElementById('gateModal').classList.remove('hidden'); }
        function closeGateModal() { document.getElementById('gateModal').classList.add('hidden'); }
        function handleGateSubmit(e) {
            e.preventDefault();
            alert('GATE 1 CLOSED! Phase 1 is officially archived. Phase 2 (Requirements Analysis) is now unlocked. The Stakeholder Discovery Questionnaire has been distributed.');
            closeGateModal();
        }
    </script>
"""
if modal_marker in html:
    html = html.replace(modal_marker, gate_modal + '\n' + modal_marker)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Added Phase Gate Closure Engine to my-project.html")
