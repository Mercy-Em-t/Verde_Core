import os

file_path = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\admin-templates.html'

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Add new cards to the template data array in the JS
# Find the closing of the templates array / data definition
# We'll add new entries by finding where internal protocols data is defined

# Add 3 new Client Template cards: RACI, Risk Register, Feasibility Model, WBS+Gantt
new_client_cards_marker = "{ id: 'cor-form'"  # find the COR card to insert before it
if new_client_cards_marker in html:
    new_cards = """{ id: 'feasibility-model', title: 'Economic Feasibility Model (DCF/CBA)', category: 'Governance', icon: 'fa-chart-line', color: 'emerald', desc: 'Plug-and-play 3-year Discounted Cash Flow and Cost-Benefit Analysis. Auto-calculates NPV, ROI, and Payback Period.', link: 'template-feasibility-model.html' },
            { id: 'wbs-gantt', title: 'WBS & Master Project Schedule (Gantt + PERT)', category: 'Governance', icon: 'fa-diagram-project', color: 'indigo', desc: 'Interactive Work Breakdown Structure with visual Gantt chart and PERT critical path. 17-week template pre-loaded.', link: 'template-wbs-gantt.html' },
            { id: 'raci-matrix', title: 'RACI Governance Matrix', category: 'Governance', icon: 'fa-table-cells', color: 'red', desc: 'Phase 1 accountability framework. Defines R/A/C/I for every WBS deliverable across all team roles and client stakeholders.', link: 'template-raci-matrix.html' },
            { id: 'risk-register', title: 'Pre-Mortem Risk Register', category: 'Governance', icon: 'fa-triangle-exclamation', color: 'orange', desc: 'Pre-populated with 6 critical project risks (CRITICAL/HIGH/MEDIUM). Severity auto-calculated. Print-ready governance document.', link: 'template-risk-register.html' },
            """
    html = html.replace(new_client_cards_marker, new_cards + new_client_cards_marker)

# Add Standards & Operational Policies to Internal Protocols
standards_content = """
            { id: 'standards-policies', title: 'Standards & Operational Policies', 
              subtitle: 'Non-negotiable house rules governing all engagements.',
              color: 'slate',
              icon: 'fa-gavel',
              tags: ['All Phases', 'Non-Negotiable', 'Binding'],
              desc: 'Defines the modeling standards (Gane & Sarson, Crow Foot 3NF), repository centralization rules, and communication boundary policies that govern every client engagement.',
              content: `
                <h3 class="font-bold text-lg text-[#0B1325] mb-4 flex items-center"><i class="fa-solid fa-gavel text-slate-600 mr-2"></i> Standards & Operational Policies</h3>
                <p class="text-sm text-slate-600 mb-6 bg-slate-50 p-3 rounded border border-slate-200">These are non-negotiable house rules. They are established in the onboarding binder and govern all technical production across every engagement.</p>
                
                <div class="space-y-6">
                  <div>
                    <h4 class="font-bold text-sm text-slate-700 uppercase tracking-wider mb-3 border-b border-slate-200 pb-1">1. Modeling & Process Standards</h4>
                    <ul class="space-y-2">
                      <li class="flex items-start text-sm text-slate-600"><i class="fa-solid fa-check text-emerald-500 mr-2 mt-1 flex-shrink-0"></i> Process models must follow <strong>Gane & Sarson notation</strong> (Context Diagram, Level 0 DFD, Level 1 DFD). No other notation is acceptable for client deliverables.</li>
                      <li class="flex items-start text-sm text-slate-600"><i class="fa-solid fa-check text-emerald-500 mr-2 mt-1 flex-shrink-0"></i> Relational schemas must follow <strong>Crow's Foot notation</strong> and be formally normalized through 1NF → 2NF → 3NF before any physical DDL is generated.</li>
                      <li class="flex items-start text-sm text-slate-600"><i class="fa-solid fa-check text-emerald-500 mr-2 mt-1 flex-shrink-0"></i> Use Case specifications must include Normal Flow, Alternate Flow, and Exception Flow for every use case submitted in a Phase Deliverable Binder.</li>
                    </ul>
                  </div>
                  <div>
                    <h4 class="font-bold text-sm text-slate-700 uppercase tracking-wider mb-3 border-b border-slate-200 pb-1">2. Repository & Artifact Centralization</h4>
                    <ul class="space-y-2">
                      <li class="flex items-start text-sm text-slate-600"><i class="fa-solid fa-check text-emerald-500 mr-2 mt-1 flex-shrink-0"></i> All analysis artifacts, use cases, DFDs, and ERDs reside in the <strong>central Agency Repository</strong> (GitHub) and the client's provisioned workspace vault.</li>
                      <li class="flex items-start text-sm text-slate-600"><i class="fa-solid fa-ban text-red-500 mr-2 mt-1 flex-shrink-0"></i> <strong>Zero technical assets</strong> may reside solely on contractor hardware. All work must be committed to the central repository within 24 hours of completion.</li>
                      <li class="flex items-start text-sm text-slate-600"><i class="fa-solid fa-ban text-red-500 mr-2 mt-1 flex-shrink-0"></i> Contractors who fail to push work for 48+ hours receive a formal written notice. A second offense triggers payment withholding for the affected milestone.</li>
                    </ul>
                  </div>
                  <div>
                    <h4 class="font-bold text-sm text-slate-700 uppercase tracking-wider mb-3 border-b border-slate-200 pb-1">3. Communication Boundaries</h4>
                    <ul class="space-y-2">
                      <li class="flex items-start text-sm text-slate-600"><i class="fa-solid fa-check text-emerald-500 mr-2 mt-1 flex-shrink-0"></i> Formal project communications, scope discussions, and blocker escalations occur <strong>exclusively</strong> through the Engagement Director via the Friday Status Memo and designated workspace channels.</li>
                      <li class="flex items-start text-sm text-slate-600"><i class="fa-solid fa-ban text-red-500 mr-2 mt-1 flex-shrink-0"></i> <strong>Direct technical instructions</strong> from clients to subcontractors are strictly void and have no contractual standing. All client requests must flow through the Engagement Director.</li>
                      <li class="flex items-start text-sm text-slate-600"><i class="fa-solid fa-ban text-red-500 mr-2 mt-1 flex-shrink-0"></i> Phone calls and WhatsApp messages do not constitute formal project records. All decisions must be confirmed in the workspace Communication Log within 24 hours.</li>
                    </ul>
                  </div>
                </div>
              `
            },
"""

# Find the internal protocols array to inject into
protocols_marker = "const internalProtocols = ["
if protocols_marker in html:
    insert_pos = html.find(protocols_marker) + len(protocols_marker)
    html = html[:insert_pos] + '\n' + standards_content + html[insert_pos:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated admin-templates.html with new template cards and Standards & Policies protocol")
