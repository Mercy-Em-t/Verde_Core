import os

file_path = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\admin.html'

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the alert on Draft Assessment button with openCorModal()
html = html.replace(
    "onclick=\"alert('Opening Change Request Assessment Editor for PRJ-9942-CR001...')\"",
    "onclick=\"openCorModal('PRJ-9942-CR001')\""
)

# Insert the COR Modal
modal_insertion = html.find('</body>')
cor_modal = """
    <!-- Admin COR Assessment Editor Modal -->
    <div id="corModal" class="fixed inset-0 z-50 flex items-center justify-center hidden">
        <div class="modal-bg absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onclick="closeCorModal()"></div>
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-[fadeIn_0.2s_ease-out] flex flex-col max-h-[90vh]">
            
            <div class="p-6 border-b border-slate-200 bg-[#0B1325] text-white flex justify-between items-start">
                <div>
                    <h2 class="text-xl font-bold"><i class="fa-solid fa-code-pull-request mr-2 text-amber-500"></i> Assessment Editor: <span id="corIdDisplay" class="text-amber-500"></span></h2>
                    <p class="text-sm text-slate-400 mt-1">Quantify the schedule and financial impact of this out-of-scope request.</p>
                </div>
                <button onclick="closeCorModal()" class="text-slate-400 hover:text-white"><i class="fa-solid fa-xmark text-xl"></i></button>
            </div>
            
            <form onsubmit="handleCorSubmit(event)" class="p-6 space-y-6 overflow-y-auto flex-1">
                <div class="bg-amber-50 border border-amber-200 rounded p-4">
                    <h3 class="font-bold text-xs text-amber-800 uppercase tracking-wider mb-2">Client Request</h3>
                    <p class="text-sm text-amber-900 font-bold mb-1">Add Stripe Subs</p>
                    <p class="text-xs text-amber-700">Client requested adding recurring billing to the gateway scope.</p>
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Positive Acknowledgment</label>
                    <textarea required rows="2" class="w-full p-3 border border-slate-300 rounded focus:border-indigo-500 outline-none text-sm bg-slate-50" readonly>That adds clear operational value; let me assess how it impacts our locked baseline schedule.</textarea>
                </div>
                
                <div class="grid grid-cols-2 gap-6">
                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Schedule Impact</label>
                        <div class="relative">
                            <i class="fa-solid fa-clock absolute left-3 top-3 text-slate-400"></i>
                            <input type="text" required placeholder="e.g. + 3 Business Days" class="w-full pl-9 p-2 border border-slate-300 rounded focus:border-indigo-500 outline-none text-sm">
                        </div>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Financial Impact (Fixed T&M)</label>
                        <div class="relative">
                            <i class="fa-solid fa-money-bill absolute left-3 top-3 text-emerald-500"></i>
                            <input type="text" required placeholder="e.g. KES 150,000" class="w-full pl-9 p-2 border border-slate-300 rounded focus:border-emerald-500 outline-none text-sm">
                        </div>
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Technical Implementation Notes</label>
                    <textarea rows="3" placeholder="Briefly explain what must be built (e.g. Stripe Webhook endpoints, DB schema migration)..." class="w-full p-2 border border-slate-300 rounded focus:border-indigo-500 outline-none text-sm"></textarea>
                </div>
            </form>
            
            <div class="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
                <button type="button" class="text-xs font-bold text-red-600 hover:underline">Reject (Infeasible)</button>
                <div class="space-x-3">
                    <button type="button" onclick="closeCorModal()" class="px-4 py-2 font-bold text-slate-500 hover:text-[#0B1325] text-sm">Cancel</button>
                    <button type="button" onclick="handleCorSubmit(event)" class="px-6 py-2 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700 shadow text-sm">Publish Assessment to Client</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        function openCorModal(corId) {
            document.getElementById('corIdDisplay').textContent = corId;
            document.getElementById('corModal').classList.remove('hidden');
        }
        function closeCorModal() {
            document.getElementById('corModal').classList.add('hidden');
        }
        function handleCorSubmit(e) {
            e.preventDefault();
            alert('Change Order Request Assessed! It has been published to the client dashboard for their decision (Fund or Backlog).');
            closeCorModal();
            // In a real app, this would trigger an update to my-project.html's state
        }
    </script>
"""
html = html[:modal_insertion] + cor_modal + html[modal_insertion:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated admin.html with COR Engine")
