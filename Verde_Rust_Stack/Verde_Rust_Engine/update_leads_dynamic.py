import os

file_path = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\admin-leads.html'

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

kanban_start = html.find('<!-- Kanban Board -->')
kanban_end = html.find('</main>', kanban_start)

# Replace the static kanban with a container
new_kanban = """
            <!-- Kanban Board Container -->
            <div id="kanbanBoard" class="flex space-x-6 overflow-x-auto pb-4 h-full">
                <!-- Columns injected dynamically -->
            </div>
"""
html = html[:kanban_start] + new_kanban + html[kanban_end:]

# Now replace the script block to add dynamic rendering
script_start = html.find('<script>')
script_end = html.find('</script>', script_start)

new_script = """
    <script>
        // Decoupled Lead Data Engine
        // This acts as the state store. In the future, this will be populated via fetch('/api/leads')
        const leadsData = [
            {
                id: 'LD-101',
                company: 'Fintech Startup (Kenya)',
                contactName: 'John Doe (CTO)',
                contactEmail: 'john@fintech.co.ke',
                stage: 1, // 1: Inbox, 2: Vetting, 3: Drafting, 4: Sent, 5: Won
                priority: 'High Priority',
                priorityColor: 'red',
                service: 'Custom Architecture Build',
                problem: 'We need to migrate our legacy monolithic Postgres DB to a distributed architecture before Q4 scaling. Our current system is locking up during peak transaction hours, causing transaction timeouts.',
                budget: 'KES 800k - 1.2M',
                timeline: 'Within 3-4 weeks',
                submittedAt: '2h ago',
                appointment: null
            },
            {
                id: 'LD-102',
                company: 'Logistics Firm (Global)',
                contactName: 'Sarah Jenkins',
                contactEmail: 's.jenkins@logistics.com',
                stage: 1,
                priority: 'New',
                priorityColor: 'slate',
                service: 'Retainer Services',
                problem: 'Looking for a retainer architect to oversee our internal dev team for 6 months.',
                budget: 'Retainer (150k/mo)',
                timeline: 'Next Month',
                submittedAt: '1d ago',
                appointment: null
            },
            {
                id: 'LD-103',
                company: 'EdTech Platform',
                contactName: 'Michael O.',
                contactEmail: 'michael@edtech.co.ke',
                stage: 2,
                priority: 'Vetting',
                priorityColor: 'amber',
                service: 'Integration Architecture',
                problem: 'Need to integrate M-Pesa subscriptions securely into our learning management system.',
                budget: 'KES 300k',
                timeline: 'ASAP',
                submittedAt: '3d ago',
                appointment: 'Tomorrow, 10:00 AM'
            },
            {
                id: 'LD-104',
                company: 'HealthTech Inc',
                contactName: 'Dr. Jane Smith',
                contactEmail: 'jane@healthtech.com',
                stage: 4,
                priority: 'Awaiting Sign',
                priorityColor: 'indigo',
                service: 'HIPAA Compliance Audit',
                problem: 'Need a full security architecture review before raising Series A.',
                budget: 'KES 500k',
                timeline: 'Next 2 months',
                submittedAt: '1w ago',
                appointment: null
            }
        ];

        const stages = [
            { id: 1, name: '1. Inbox Triage', emptyText: 'No new leads' },
            { id: 2, name: '2. Vetting Call Scheduled', emptyText: 'No calls scheduled' },
            { id: 3, name: '3. Proposal Drafting', emptyText: 'Drag leads here after successful vetting' },
            { id: 4, name: '4. Proposal Sent / Awaiting Sign', emptyText: 'No proposals pending' },
            { id: 5, name: '5. Won (Move to Active)', emptyText: 'Drop here to convert to Project and invoice Phase 1', isSuccess: true }
        ];

        function renderKanban() {
            const board = document.getElementById('kanbanBoard');
            let boardHtml = '';

            stages.forEach(stage => {
                const stageLeads = leadsData.filter(l => l.stage === stage.id);
                
                let cardsHtml = '';
                if (stageLeads.length > 0) {
                    stageLeads.forEach(lead => {
                        let extraHtml = '';
                        if (lead.appointment && stage.id === 2) {
                            extraHtml = `<div class="flex items-center text-xs text-slate-500 font-bold bg-amber-50 p-2 rounded mt-3"><i class="fa-regular fa-calendar mr-2 text-amber-500"></i> ${lead.appointment}</div>`;
                        } else if (stage.id === 4) {
                            extraHtml = `<div class="flex items-center text-xs font-bold text-indigo-700 bg-indigo-50 p-2 rounded mt-3"><i class="fa-solid fa-file-signature mr-2"></i> Sent via DocuSign</div>`;
                        }

                        cardsHtml += `
                            <div class="bg-white p-4 rounded border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-400 mb-3" onclick="openLeadModal('${lead.id}')">
                                <div class="flex justify-between items-start mb-2">
                                    <span class="font-bold text-[#0B1325] text-sm">${lead.company}</span>
                                    <span class="text-[10px] bg-${lead.priorityColor}-100 text-${lead.priorityColor}-700 font-bold px-1.5 py-0.5 rounded uppercase">${lead.priority}</span>
                                </div>
                                <p class="text-xs text-slate-600 mb-3 line-clamp-2">"${lead.problem}"</p>
                                <div class="flex justify-between items-center">
                                    <span class="text-xs font-bold text-emerald-600">${lead.budget}</span>
                                    <span class="text-[10px] font-bold text-slate-400">${lead.submittedAt}</span>
                                </div>
                                ${extraHtml}
                            </div>
                        `;
                    });
                } else {
                    cardsHtml = `
                        <div class="flex-1 border-2 border-dashed ${stage.isSuccess ? 'border-emerald-200 bg-emerald-50/50 text-emerald-500' : 'border-slate-200 text-slate-400'} rounded-lg flex items-center justify-center p-6 text-center text-sm font-bold">
                            ${stage.emptyText}
                        </div>
                    `;
                }

                boardHtml += `
                    <div class="w-80 flex-shrink-0 flex flex-col bg-slate-100/50 rounded-lg p-3 h-full max-h-full overflow-y-auto">
                        <div class="flex justify-between items-center mb-3 px-1 sticky top-0 bg-slate-100/90 backdrop-blur pb-2 z-10">
                            <h3 class="font-bold text-slate-700 text-sm uppercase">${stage.name}</h3>
                            <span class="bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full text-xs">${stageLeads.length}</span>
                        </div>
                        <div class="flex-1 flex flex-col">
                            ${cardsHtml}
                        </div>
                    </div>
                `;
            });

            board.innerHTML = boardHtml;
        }

        function openLeadModal(leadId) {
            const lead = leadsData.find(l => l.id === leadId);
            if (!lead) return;

            document.getElementById('lm-company').textContent = lead.company;
            document.getElementById('lm-contact').textContent = `Submitted by: ${lead.contactName} • ${lead.contactEmail}`;
            document.getElementById('lm-service').textContent = lead.service;
            document.getElementById('lm-problem').textContent = `"${lead.problem}"`;
            document.getElementById('lm-budget').textContent = lead.budget;
            document.getElementById('lm-timeline').textContent = lead.timeline;
            
            document.getElementById('leadModal').classList.remove('hidden');
        }

        function closeLeadModal() {
            document.getElementById('leadModal').classList.add('hidden');
        }

        // Initialize Kanban
        renderKanban();
    </script>
"""
html = html[:script_start] + new_script + html[script_end+9:]

# We also need to update the Lead Modal HTML to have the right ID hooks
modal_start = html.find('<!-- Lead Details Modal -->')
modal_end = html.find('</div>\n    </div>\n', modal_start) + 18

new_modal_html = """
    <!-- Lead Details Modal -->
    <div id="leadModal" class="fixed inset-0 z-50 flex items-center justify-center hidden">
        <div class="modal-bg absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onclick="closeLeadModal()"></div>
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            
            <div class="bg-[#0B1325] p-6 text-white flex justify-between items-start">
                <div>
                    <span class="bg-indigo-500/30 text-indigo-200 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block">Lead Details</span>
                    <h2 class="text-2xl font-bold" id="lm-company">Company Name</h2>
                    <p class="text-indigo-200 text-sm mt-1" id="lm-contact">Submitted by: ...</p>
                </div>
                <button onclick="closeLeadModal()" class="text-slate-400 hover:text-white"><i class="fa-solid fa-xmark text-xl"></i></button>
            </div>

            <div class="p-6">
                <!-- Dynamically Injected Data -->
                <div class="space-y-6">
                    <div>
                        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Service Requested</h4>
                        <div class="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-700 font-bold text-sm rounded">
                            <i class="fa-solid fa-diagram-project mr-2 text-indigo-600"></i> <span id="lm-service">Service</span>
                        </div>
                    </div>

                    <div>
                        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">The Business Problem</h4>
                        <p id="lm-problem" class="text-sm text-slate-700 bg-slate-50 p-4 rounded border border-slate-100 italic">
                            ...
                        </p>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-slate-50 p-4 rounded border border-slate-100">
                            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Declared Budget</h4>
                            <p class="font-bold text-[#0B1325]" id="lm-budget">...</p>
                        </div>
                        <div class="bg-slate-50 p-4 rounded border border-slate-100">
                            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Desired Timeline</h4>
                            <p class="font-bold text-[#0B1325]" id="lm-timeline">...</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Action Bar -->
            <div class="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                <button class="text-sm font-bold text-red-600 hover:bg-red-50 px-4 py-2 rounded">Reject Lead</button>
                <div class="space-x-3">
                    <button onclick="alert('Email draft opened to request a vetting call.')" class="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded hover:bg-slate-50 transition-colors shadow-sm">
                        <i class="fa-regular fa-calendar mr-2"></i> Request Call
                    </button>
                    <button class="px-6 py-2 bg-indigo-600 text-white font-bold rounded shadow hover:bg-indigo-700 transition-colors">
                        Move to Vetting <i class="fa-solid fa-arrow-right ml-2"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
"""
html = html[:modal_start] + new_modal_html + html[modal_end:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated admin-leads.html to be fully dynamic")
