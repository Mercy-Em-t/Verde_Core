import os
import re

file_path = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\my-project.html'

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the grid content
grid_start = html.find('<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">')
grid_end = html.find('</main>', grid_start)

new_grid = """
        <div id="dynamicPhaseContainer" class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <!-- Phase blocks will be dynamically injected here by JS -->
        </div>
"""

html = html[:grid_start] + new_grid + html[grid_end:]

# Add crDetailsModal just before the </main> or in Modals section
modal_insertion = html.find('<!-- Modals -->')
cr_details_modal = """
    <!-- CR Details Modal -->
    <div id="crDetailsModal" class="fixed inset-0 z-50 flex items-center justify-center hidden">
        <div class="modal-bg absolute inset-0" onclick="closeModals()"></div>
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            <div class="p-6 border-b border-slate-200 flex justify-between items-start">
                <div>
                    <h2 class="text-xl font-bold text-[#0B1325]" id="crdTitle">CR-001: Add Stripe Subs</h2>
                    <p class="text-sm text-slate-500 mt-1" id="crdDate">Submitted 2 days ago</p>
                </div>
                <span id="crdStatus" class="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded">Under Review</span>
            </div>
            <div class="p-6 space-y-4 text-sm text-slate-700">
                <div>
                    <h4 class="font-bold text-xs uppercase text-slate-500 mb-1">Assessment Report</h4>
                    <p id="crdReport" class="bg-slate-50 p-3 rounded border border-slate-100">Reviewing impact on existing payment gateway...</p>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-slate-50 p-3 rounded border border-slate-100">
                        <h4 class="font-bold text-xs uppercase text-slate-500 mb-1">Scope Analysis</h4>
                        <p id="crdScope" class="font-semibold text-slate-800">Pending</p>
                    </div>
                    <div class="bg-slate-50 p-3 rounded border border-slate-100">
                        <h4 class="font-bold text-xs uppercase text-slate-500 mb-1">Financial Impact</h4>
                        <p id="crdImpact" class="font-semibold text-slate-800">TBD</p>
                    </div>
                </div>
                <div class="bg-[#0B1325] text-white p-4 rounded mt-2">
                    <h4 class="font-bold text-xs uppercase text-slate-400 mb-1">Architect's Conclusion</h4>
                    <p id="crdConclusion">Analysis is ongoing. Will provide recommendation by tomorrow.</p>
                </div>
            </div>
            <div class="p-4 border-t border-slate-200 flex justify-end">
                <button type="button" onclick="closeModals()" class="px-6 py-2 bg-slate-200 text-slate-700 font-bold rounded hover:bg-slate-300 transition-colors">Close Report</button>
            </div>
        </div>
    </div>
"""

html = html[:modal_insertion+15] + cr_details_modal + html[modal_insertion+15:]

# Find the JS script block to rewrite SDLC Logic and Modals
js_start = html.find('const sdlcPhases = [')
js_end = html.find('tracker.innerHTML = html;', js_start)

new_js = """
        const crDatabase = {
            'CR-001': {
                id: 'CR-001', title: 'Add Stripe Subs', date: '2 days ago', status: 'Under Review', statusColor: 'amber',
                report: 'We are reviewing how Stripe Subscriptions will interact with the current one-time payment architecture.',
                scope: 'Out-of-Scope (New)', impact: 'TBD', conclusion: 'Analysis is ongoing. Will provide recommendation by tomorrow.'
            },
            'CR-002': {
                id: 'CR-002', title: 'Increase API Rate Limits', date: '1 week ago', status: 'Approved', statusColor: 'emerald',
                report: 'Checked server load and AWS auto-scaling rules. We can accommodate the increase without architecture rewrites.',
                scope: 'In-Scope', impact: 'Covered (Free)', conclusion: 'Approved. We will adjust the rate limit configurations in Phase 2.'
            }
        };

        const sdlcPhases = [
            { 
                id: 1, name: 'Feasibility', status: 'completed',
                desc: 'Phase 1 (Feasibility) is complete. The architecture was deemed viable and approved.',
                approval: { status: 'approved', by: 'Jane Doe (CEO)' },
                docs: [
                    { name: 'MSA_Signed.pdf', icon: 'fa-file-pdf', color: 'red-500', status: 'ready' },
                    { name: 'Phase1_Feasibility.pdf', icon: 'fa-diagram-project', color: 'blue-500', status: 'ready' }
                ],
                crs: ['CR-002']
            },
            { 
                id: 2, name: 'Requirements & Specs', status: 'active',
                desc: 'Phase 2 (Requirements & Specs) is complete. The RACI Approver must sign off to unlock Phase 3 execution and invoicing.',
                approval: { status: 'pending', by: 'Jane Doe (CEO)' },
                docs: [
                    { name: 'Phase2_Specs.pdf', icon: 'fa-lock', color: 'slate-400', status: 'pending' }
                ],
                crs: ['CR-001']
            },
            { id: 3, name: 'Architecture Blueprint', status: 'pending', desc: 'Phase 3 is locked pending Phase 2 approval.', approval: {status: 'locked'}, docs: [], crs: [] },
            { id: 4, name: 'Delivery Strategy', status: 'upsell', desc: 'Add this phase to get a full technical delivery roadmap.', approval: {status: 'locked'}, docs: [], crs: [] },
            { id: 5, name: 'Maintenance', status: 'upsell', desc: 'Add this phase for ongoing retainer support.', approval: {status: 'locked'}, docs: [], crs: [] }
        ];

        let activePhaseId = 2; // Default active

        function viewCR(crId) {
            const cr = crDatabase[crId];
            if (!cr) return;
            document.getElementById('crdTitle').textContent = cr.id + ': ' + cr.title;
            document.getElementById('crdDate').textContent = 'Submitted ' + cr.date;
            
            const statusEl = document.getElementById('crdStatus');
            statusEl.textContent = cr.status;
            statusEl.className = `text-xs font-bold text-${cr.statusColor}-600 bg-${cr.statusColor}-100 px-2 py-1 rounded`;
            
            document.getElementById('crdReport').textContent = cr.report;
            document.getElementById('crdScope').textContent = cr.scope;
            document.getElementById('crdImpact').textContent = cr.impact;
            document.getElementById('crdConclusion').textContent = cr.conclusion;
            
            document.getElementById('crDetailsModal').classList.remove('hidden');
        }

        // We need to redefine closeModals to include crDetailsModal
        window.closeModals = function() {
            document.getElementById('signModal').classList.add('hidden');
            document.getElementById('crModal').classList.add('hidden');
            document.getElementById('crDetailsModal').classList.add('hidden');
        };

        function renderPhaseDetails(phaseId) {
            activePhaseId = phaseId;
            const phase = sdlcPhases.find(p => p.id === phaseId);
            const container = document.getElementById('dynamicPhaseContainer');
            
            // Re-render Tracker to highlight selected
            renderTracker();
            
            if (phase.status === 'upsell') {
                container.innerHTML = `
                    <div class="col-span-3 dashboard-card p-12 text-center flex flex-col items-center justify-center bg-slate-50 border-dashed border-2">
                        <i class="fa-solid fa-lock text-4xl text-slate-300 mb-4"></i>
                        <h3 class="font-bold text-xl text-slate-700 mb-2">${phase.name} (Add-On)</h3>
                        <p class="text-slate-500 mb-6 max-w-md">${phase.desc}</p>
                        <button class="px-6 py-3 bg-[#0B1325] text-white font-bold rounded shadow hover:bg-slate-800 transition-colors client-only">Request to Add Phase</button>
                    </div>
                `;
                return;
            }

            // Approval Block HTML
            let approvalHtml = '';
            if (phase.approval.status === 'approved') {
                approvalHtml = `
                    <div class="bg-emerald-50 p-4 rounded border border-emerald-200 mb-4 text-xs text-emerald-800">
                        <strong>Approved By:</strong> ${phase.approval.by}
                    </div>
                    <div class="w-full py-3 bg-emerald-100 text-emerald-700 font-bold rounded text-center">
                        <i class="fa-solid fa-check mr-2"></i> Phase Approved
                    </div>
                `;
            } else if (phase.approval.status === 'pending') {
                approvalHtml = `
                    <div class="bg-slate-50 p-4 rounded border border-slate-200 mb-4 text-xs text-slate-500">
                        <strong>Awaiting Signature:</strong> ${phase.approval.by}
                    </div>
                    <div id="approvalActions">
                        <button onclick="openSignModal()" class="w-full py-3 bg-[#0B1325] text-white font-bold rounded shadow hover:bg-slate-800 transition-colors client-only">
                            Sign & Approve Phase ${phase.id}
                        </button>
                        <button class="w-full py-3 bg-slate-200 text-slate-500 font-bold rounded cursor-not-allowed admin-only hidden">
                            Awaiting Client Signature
                        </button>
                    </div>
                `;
            } else {
                approvalHtml = `
                    <div class="w-full py-3 bg-slate-100 text-slate-400 font-bold rounded text-center border border-slate-200 border-dashed">
                        <i class="fa-solid fa-lock mr-2"></i> Locked
                    </div>
                `;
            }

            // Docs Html
            let docsHtml = phase.docs.map(doc => {
                if (doc.status === 'ready') {
                    return `
                        <li onclick="downloadMockDoc('${doc.name}')" class="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded hover:border-emerald-200 transition-colors cursor-pointer">
                            <span class="text-sm font-semibold text-[#0B1325]"><i class="fa-solid ${doc.icon} text-${doc.color} mr-2"></i> ${doc.name}</span>
                            <i class="fa-solid fa-download text-slate-400"></i>
                        </li>
                    `;
                } else {
                    return `
                        <li class="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded opacity-50 cursor-not-allowed">
                            <span class="text-sm font-semibold text-slate-500"><i class="fa-solid ${doc.icon} text-${doc.color} mr-2"></i> ${doc.name}</span>
                            <span class="text-xs font-bold text-slate-400">PENDING</span>
                        </li>
                    `;
                }
            }).join('');
            if(phase.docs.length === 0) docsHtml = `<div class="text-sm text-slate-400 text-center py-4 border-2 border-dashed rounded">No documents yet</div>`;

            // CRs HTML
            let crsHtml = phase.crs.map(crId => {
                const cr = crDatabase[crId];
                return `
                    <div class="p-3 border border-${cr.statusColor}-200 bg-${cr.statusColor}-50 rounded text-sm mb-3 cursor-pointer hover:bg-${cr.statusColor}-100 transition-colors" onclick="viewCR('${cr.id}')">
                        <div class="flex justify-between items-start mb-1">
                            <span class="font-bold text-${cr.statusColor}-900">${cr.id}: ${cr.title}</span>
                            <span class="text-xs font-bold text-${cr.statusColor}-600 bg-${cr.statusColor}-100 px-2 py-1 rounded">${cr.status}</span>
                        </div>
                        <span class="text-xs text-${cr.statusColor}-800">${cr.date}</span>
                    </div>
                `;
            }).join('');
            if(phase.crs.length === 0) crsHtml = `<div class="text-sm text-slate-400 text-center py-4 border-2 border-dashed rounded mb-4">No Change Requests</div>`;

            container.innerHTML = `
                <!-- Phase Sign-Off Block -->
                <div class="dashboard-card p-6 flex flex-col">
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="font-bold text-lg"><i class="fa-solid fa-file-signature text-indigo-600 mr-2"></i> Phase Approval</h3>
                    </div>
                    <p class="text-sm text-slate-600 mb-6 flex-grow">${phase.desc}</p>
                    ${approvalHtml}
                </div>

                <!-- Documentation Vault -->
                <div class="dashboard-card p-6 flex flex-col">
                    <h3 class="font-bold text-lg mb-4"><i class="fa-solid fa-vault text-emerald-600 mr-2"></i> Docs Vault</h3>
                    <p class="text-sm text-slate-600 mb-4">Secure downloads for your architecture assets.</p>
                    <ul class="space-y-3 flex-grow">
                        ${docsHtml}
                    </ul>
                </div>

                <!-- Change Request Engine -->
                <div class="dashboard-card p-6 flex flex-col">
                    <h3 class="font-bold text-lg mb-4"><i class="fa-solid fa-code-pull-request text-amber-600 mr-2"></i> Change Requests</h3>
                    <p class="text-sm text-slate-600 mb-4">Alterations to scope for this phase.</p>
                    
                    <div id="crList" class="flex-grow">
                        ${crsHtml}
                    </div>

                    <div id="crActions" class="mt-4">
                        <button onclick="openCrModal()" class="w-full py-3 bg-white border border-slate-300 text-[#0B1325] font-bold rounded shadow-sm hover:bg-slate-50 transition-colors client-only">
                            <i class="fa-solid fa-plus mr-2"></i> New Request
                        </button>
                    </div>
                </div>
            `;
            
            // Re-apply admin/client visibility rules for newly injected HTML
            const isAdmin = (user.role === 'admin' || user.role === 'consultant');
            if (isAdmin) {
                document.querySelectorAll('.client-only').forEach(el => el.classList.add('hidden'));
                document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
            }
        }

        const tracker = document.getElementById('sdlcTracker');
        
        function renderTracker() {
            let html = '';
            sdlcPhases.forEach((phase, index) => {
                const isLast = index === sdlcPhases.length - 1;
                
                // Node Styling
                let nodeClass = phase.status === 'completed' ? 'completed' : 
                                (phase.status === 'active' ? 'active' : 
                                (phase.status === 'pending' ? 'pending' : 'bg-slate-50 border-slate-200 text-slate-300 border-dashed'));
                
                // Highlight active selected phase
                if(phase.id === activePhaseId) {
                    nodeClass += ' ring-4 ring-indigo-200 scale-110 shadow-lg';
                }

                let icon = phase.status === 'completed' ? '<i class="fa-solid fa-check"></i>' : 
                        (phase.status === 'upsell' ? '<i class="fa-solid fa-lock text-xs"></i>' : phase.id);
                        
                let textStatus = phase.status === 'upsell' ? 'LOCKED / ADD-ON' : phase.status;

                html += `
                    <!-- Node -->
                    <div class="relative z-10 flex flex-col items-center group cursor-pointer" onclick="renderPhaseDetails(${phase.id})">
                        <div class="w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm sdlc-node ${nodeClass} transition-all">
                            ${icon}
                        </div>
                        <div class="absolute top-12 text-center w-32 -ml-11">
                            <span class="text-xs font-bold ${phase.status === 'upsell' ? 'text-slate-400' : (phase.id === activePhaseId ? 'text-indigo-600' : 'text-slate-700')} block">${phase.name}</span>
                            <span class="text-[10px] uppercase font-bold text-slate-400">${textStatus}</span>
                        </div>
                    </div>
                `;

                // Connecting Line (if not last)
                if (!isLast) {
                    let lineClass = phase.status === 'completed' ? 'completed' : 
                                    (phase.status === 'upsell' ? 'bg-slate-100 border-t-2 border-dashed border-slate-200 h-0' : 'pending');
                    html += `
                    <!-- Line -->
                    <div class="flex-grow h-1 sdlc-line ${lineClass}"></div>
                    `;
                }
            });
            tracker.innerHTML = html;
        }

        // Initial Render
        renderTracker();
        renderPhaseDetails(activePhaseId);
"""

html = html[:js_start] + new_js + html[js_end+25:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)

print("Update complete")
