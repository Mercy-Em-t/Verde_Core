import os

file_path = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\my-project.html'

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Find the end of the sprint memos section to insert the QA section right below it.
insertion_point = html.find('</main>')

qa_section = """
        <!-- Quality & SLA Standards (Defect Protocol) -->
        <div class="mt-8 dashboard-card p-6">
            <div class="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
                <div>
                    <h3 class="font-bold text-lg"><i class="fa-solid fa-shield-halved text-emerald-600 mr-2"></i> Quality Assurance & Defect Protocol</h3>
                    <p class="text-sm text-slate-500">Shared expectations for pre-UAT testing and post-launch SLA defect resolution.</p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- P1-P4 SLA Matrix -->
                <div>
                    <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Defect Severity & SLA Matrix</h4>
                    <div class="border border-slate-200 rounded-lg overflow-hidden">
                        <table class="w-full text-left text-sm">
                            <thead class="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase">
                                <tr>
                                    <th class="p-3">Severity</th>
                                    <th class="p-3">Definition</th>
                                    <th class="p-3">Resolution Target</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                <tr class="hover:bg-slate-50 transition-colors">
                                    <td class="p-3 font-bold text-red-600"><span class="bg-red-100 px-2 py-0.5 rounded">P1 - Critical</span></td>
                                    <td class="p-3 text-slate-600">Core business workflow is completely blocked. No workaround exists.</td>
                                    <td class="p-3 font-bold text-slate-700">4 Hours</td>
                                </tr>
                                <tr class="hover:bg-slate-50 transition-colors">
                                    <td class="p-3 font-bold text-orange-500"><span class="bg-orange-100 px-2 py-0.5 rounded">P2 - High</span></td>
                                    <td class="p-3 text-slate-600">Major feature impaired. Viable workaround exists but disrupts operations.</td>
                                    <td class="p-3 font-bold text-slate-700">24 Hours</td>
                                </tr>
                                <tr class="hover:bg-slate-50 transition-colors">
                                    <td class="p-3 font-bold text-amber-500"><span class="bg-amber-100 px-2 py-0.5 rounded">P3 - Medium</span></td>
                                    <td class="p-3 text-slate-600">Minor functionality issue. Does not block core business operations.</td>
                                    <td class="p-3 font-bold text-slate-700">Next Sprint</td>
                                </tr>
                                <tr class="hover:bg-slate-50 transition-colors">
                                    <td class="p-3 font-bold text-slate-500"><span class="bg-slate-100 px-2 py-0.5 rounded">P4 - Low</span></td>
                                    <td class="p-3 text-slate-600">Cosmetic flaw (e.g., misaligned UI, typo). Does not affect function.</td>
                                    <td class="p-3 font-bold text-slate-700">Backlog</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Pre-UAT Test Plans -->
                <div>
                    <div class="flex justify-between items-center mb-3">
                        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Pre-UAT Test Plan Logs</h4>
                        <button onclick="alert('Admin: Opening QA Upload Portal...')" class="bg-slate-200 text-slate-600 px-3 py-1 rounded text-[10px] font-bold shadow-sm hover:bg-slate-300 admin-only hidden">Upload QA Log</button>
                    </div>
                    <p class="text-xs text-slate-500 mb-4">Before entering User Acceptance Testing (UAT), our engineering team executes systematic edge-case validation. Review the pass/fail matrices below to confirm technical stability.</p>
                    
                    <ul class="space-y-3">
                        <li class="flex justify-between items-center p-3 bg-emerald-50 border border-emerald-100 rounded hover:border-emerald-200 transition-colors cursor-pointer" onclick="downloadMockDoc('TestPlan_Subsystem1.pdf')">
                            <div class="flex items-center">
                                <i class="fa-solid fa-file-shield text-emerald-500 mr-3"></i>
                                <div>
                                    <span class="text-sm font-bold text-emerald-900 block">Subsystem 1: Inbound Receiving</span>
                                    <span class="text-[10px] font-bold text-emerald-600 uppercase">100% Passed • 42/42 Scenarios</span>
                                </div>
                            </div>
                            <i class="fa-solid fa-download text-emerald-600"></i>
                        </li>
                        <li class="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded cursor-not-allowed opacity-60">
                            <div class="flex items-center">
                                <i class="fa-solid fa-lock text-slate-400 mr-3"></i>
                                <div>
                                    <span class="text-sm font-bold text-slate-700 block">Subsystem 2: Ledger Commit</span>
                                    <span class="text-[10px] font-bold text-slate-500 uppercase">Awaiting Engineering QA</span>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
"""

html = html[:insertion_point] + qa_section + html[insertion_point:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)

print("Added QA Widget")
