import os
import re

file_path_admin = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\admin.html'
file_path_leads = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\admin-leads.html'

with open(file_path_admin, 'r', encoding='utf-8') as f:
    admin_html = f.read()

# Replace the sidebar links to point to the correct files
admin_html = admin_html.replace(
    '<li><a href="#" class="flex items-center px-3 py-2 bg-indigo-600/30 text-indigo-300 rounded-lg font-bold"><i class="fa-solid fa-gauge-high w-6"></i> Command Center</a></li>',
    '<li><a href="admin.html" class="flex items-center px-3 py-2 bg-indigo-600/30 text-indigo-300 rounded-lg font-bold"><i class="fa-solid fa-gauge-high w-6"></i> Command Center</a></li>'
)

admin_html = admin_html.replace(
    '<li><a href="#" class="flex items-center px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"><i class="fa-solid fa-inbox w-6"></i> Leads & Pipeline</a></li>',
    '<li><a href="admin-leads.html" class="flex items-center px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"><i class="fa-solid fa-inbox w-6"></i> Leads & Pipeline</a></li>'
)

# Also fix the sidebar link for admin-leads itself
leads_html = admin_html.replace(
    '<li><a href="admin.html" class="flex items-center px-3 py-2 bg-indigo-600/30 text-indigo-300 rounded-lg font-bold"><i class="fa-solid fa-gauge-high w-6"></i> Command Center</a></li>',
    '<li><a href="admin.html" class="flex items-center px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"><i class="fa-solid fa-gauge-high w-6"></i> Command Center</a></li>'
).replace(
    '<li><a href="admin-leads.html" class="flex items-center px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"><i class="fa-solid fa-inbox w-6"></i> Leads & Pipeline</a></li>',
    '<li><a href="admin-leads.html" class="flex items-center px-3 py-2 bg-indigo-600/30 text-indigo-300 rounded-lg font-bold"><i class="fa-solid fa-inbox w-6"></i> Leads & Pipeline</a></li>'
)

# Now replace the main content in leads_html
# find the <main> block
main_start = leads_html.find('<main class="flex-1 overflow-y-auto p-8">')
main_end = leads_html.find('</main>', main_start)

new_main_content = """
        <main class="flex-1 overflow-y-auto p-8 bg-slate-50">
            <!-- Header -->
            <div class="flex justify-between items-end mb-8">
                <div>
                    <h1 class="text-3xl font-bold text-[#0B1325]">Leads & Pipeline</h1>
                    <p class="text-slate-500 mt-1">Manage incoming project requests from the Guided Assessment Wizard.</p>
                </div>
                <button class="px-4 py-2 bg-[#0B1325] text-white font-bold rounded shadow hover:bg-slate-800 transition-colors">
                    <i class="fa-solid fa-plus mr-2"></i> Manual Entry
                </button>
            </div>

            <!-- Kanban Board -->
            <div class="flex space-x-6 overflow-x-auto pb-4">
                
                <!-- COLUMN 1: Inbox / Triage -->
                <div class="w-80 flex-shrink-0 flex flex-col bg-slate-100/50 rounded-lg p-3">
                    <div class="flex justify-between items-center mb-3 px-1">
                        <h3 class="font-bold text-slate-700 text-sm uppercase">1. Inbox Triage</h3>
                        <span class="bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full text-xs">2</span>
                    </div>
                    
                    <!-- Lead Card -->
                    <div class="bg-white p-4 rounded border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-400 mb-3" onclick="openLeadModal()">
                        <div class="flex justify-between items-start mb-2">
                            <span class="font-bold text-[#0B1325] text-sm">Fintech Startup (Kenya)</span>
                            <span class="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded uppercase">High Priority</span>
                        </div>
                        <p class="text-xs text-slate-600 mb-3 line-clamp-2">"We need to migrate our legacy monolithic Postgres DB to a distributed architecture before Q4 scaling."</p>
                        <div class="flex justify-between items-center">
                            <span class="text-xs font-bold text-emerald-600">KES 800k - 1.2M</span>
                            <span class="text-[10px] font-bold text-slate-400">2h ago</span>
                        </div>
                    </div>

                    <!-- Lead Card 2 -->
                    <div class="bg-white p-4 rounded border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-400 mb-3">
                        <div class="flex justify-between items-start mb-2">
                            <span class="font-bold text-[#0B1325] text-sm">Logistics Firm (Global)</span>
                            <span class="text-[10px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded uppercase">New</span>
                        </div>
                        <p class="text-xs text-slate-600 mb-3 line-clamp-2">Looking for a retainer architect to oversee our internal dev team for 6 months.</p>
                        <div class="flex justify-between items-center">
                            <span class="text-xs font-bold text-emerald-600">Retainer (150k/mo)</span>
                            <span class="text-[10px] font-bold text-slate-400">1d ago</span>
                        </div>
                    </div>
                </div>

                <!-- COLUMN 2: Vetting Call -->
                <div class="w-80 flex-shrink-0 flex flex-col bg-slate-100/50 rounded-lg p-3">
                    <div class="flex justify-between items-center mb-3 px-1">
                        <h3 class="font-bold text-slate-700 text-sm uppercase">2. Vetting Call Scheduled</h3>
                        <span class="bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full text-xs">1</span>
                    </div>

                    <!-- Lead Card -->
                    <div class="bg-white p-4 rounded border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-400 mb-3 border-l-4 border-l-amber-500">
                        <div class="flex justify-between items-start mb-2">
                            <span class="font-bold text-[#0B1325] text-sm">EdTech Platform</span>
                        </div>
                        <p class="text-xs text-slate-600 mb-3 line-clamp-2">"Need to integrate M-Pesa subscriptions securely."</p>
                        <div class="flex items-center text-xs text-slate-500 font-bold bg-amber-50 p-2 rounded">
                            <i class="fa-regular fa-calendar mr-2 text-amber-500"></i> Tomorrow, 10:00 AM
                        </div>
                    </div>
                </div>

                <!-- COLUMN 3: Proposal Drafting -->
                <div class="w-80 flex-shrink-0 flex flex-col bg-slate-100/50 rounded-lg p-3">
                    <div class="flex justify-between items-center mb-3 px-1">
                        <h3 class="font-bold text-slate-700 text-sm uppercase">3. Proposal Drafting</h3>
                        <span class="bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full text-xs">0</span>
                    </div>
                    <div class="flex-1 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center p-6 text-center text-sm font-bold text-slate-400">
                        Drag leads here after successful vetting
                    </div>
                </div>

                <!-- COLUMN 4: Proposal Sent -->
                <div class="w-80 flex-shrink-0 flex flex-col bg-slate-100/50 rounded-lg p-3">
                    <div class="flex justify-between items-center mb-3 px-1">
                        <h3 class="font-bold text-slate-700 text-sm uppercase">4. Proposal Sent / Awaiting Sign</h3>
                        <span class="bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full text-xs">1</span>
                    </div>
                    
                    <div class="bg-white p-4 rounded border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-400 mb-3 border-l-4 border-l-indigo-500">
                        <div class="flex justify-between items-start mb-2">
                            <span class="font-bold text-[#0B1325] text-sm">HealthTech Inc</span>
                        </div>
                        <div class="flex items-center text-xs font-bold text-indigo-700 bg-indigo-50 p-2 rounded mb-2">
                            <i class="fa-solid fa-file-signature mr-2"></i> Sent via DocuSign
                        </div>
                        <p class="text-[10px] text-slate-500 text-right">Sent 3 days ago</p>
                    </div>
                </div>

                <!-- COLUMN 5: Won / Deposit Paid -->
                <div class="w-80 flex-shrink-0 flex flex-col bg-slate-100/50 rounded-lg p-3">
                    <div class="flex justify-between items-center mb-3 px-1">
                        <h3 class="font-bold text-slate-700 text-sm uppercase">5. Won (Move to Active)</h3>
                    </div>
                    <div class="flex-1 border-2 border-dashed border-emerald-200 bg-emerald-50/50 rounded-lg flex items-center justify-center p-6 text-center text-sm font-bold text-emerald-500">
                        Drop here to convert to Project and invoice Phase 1
                    </div>
                </div>

            </div>
        </main>
"""

leads_html = leads_html[:main_start] + new_main_content + leads_html[main_end+7:]

# Insert Lead Detail Modal
modal_marker = '</body>'
modal_start = leads_html.rfind(modal_marker)

modal_html = """
    <!-- Lead Details Modal -->
    <div id="leadModal" class="fixed inset-0 z-50 flex items-center justify-center hidden">
        <div class="modal-bg absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onclick="closeLeadModal()"></div>
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            
            <div class="bg-[#0B1325] p-6 text-white flex justify-between items-start">
                <div>
                    <span class="bg-indigo-500/30 text-indigo-200 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block">New Lead</span>
                    <h2 class="text-2xl font-bold">Fintech Startup (Kenya)</h2>
                    <p class="text-indigo-200 text-sm mt-1">Submitted by: John Doe (CTO) • john@fintech.co.ke</p>
                </div>
                <button onclick="closeLeadModal()" class="text-slate-400 hover:text-white"><i class="fa-solid fa-xmark text-xl"></i></button>
            </div>

            <div class="p-6">
                <!-- Data from Guided Assessment Wizard -->
                <div class="space-y-6">
                    <div>
                        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Service Requested</h4>
                        <div class="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-700 font-bold text-sm rounded">
                            <i class="fa-solid fa-diagram-project mr-2 text-indigo-600"></i> Custom Architecture Build
                        </div>
                    </div>

                    <div>
                        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">The Business Problem</h4>
                        <p class="text-sm text-slate-700 bg-slate-50 p-4 rounded border border-slate-100 italic">
                            "We need to migrate our legacy monolithic Postgres DB to a distributed architecture before Q4 scaling. Our current system is locking up during peak transaction hours, causing transaction timeouts."
                        </p>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-slate-50 p-4 rounded border border-slate-100">
                            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Declared Budget</h4>
                            <p class="font-bold text-[#0B1325]">KES 800k - 1.2M</p>
                        </div>
                        <div class="bg-slate-50 p-4 rounded border border-slate-100">
                            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Desired Timeline</h4>
                            <p class="font-bold text-[#0B1325]">Within 3-4 weeks</p>
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

    <script>
        function openLeadModal() {
            document.getElementById('leadModal').classList.remove('hidden');
        }
        function closeLeadModal() {
            document.getElementById('leadModal').classList.add('hidden');
        }
    </script>
"""
leads_html = leads_html[:modal_start] + modal_html + leads_html[modal_start:]

# Write both files
with open(file_path_admin, 'w', encoding='utf-8') as f:
    f.write(admin_html)
with open(file_path_leads, 'w', encoding='utf-8') as f:
    f.write(leads_html)

print("Created admin-leads.html and linked sidebar")
