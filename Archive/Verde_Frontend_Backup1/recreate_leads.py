import os
import re

base_dir = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17'

# Read admin.html as base
with open(os.path.join(base_dir, 'admin.html'), 'r', encoding='utf-8') as f:
    admin_html = f.read()

# The Lead Qualifier main content to inject
lead_qualifier_main = """
    <!-- Main Content Wrapper -->
    <div class="flex-grow flex flex-col h-screen overflow-y-auto bg-slate-50">

        <!-- Top Navigation -->
        <header class="w-full bg-white px-8 py-5 flex justify-between items-center shadow-sm border-b border-slate-200 sticky top-0 z-10">
            <h1 class="text-2xl font-bold text-[#0B1325]">Lead Qualification Engine</h1>
            <div class="flex items-center space-x-4">
                <div class="relative">
                    <i class="fa-solid fa-bell text-slate-400 text-xl cursor-pointer hover:text-indigo-600 transition-colors"></i>
                </div>
            </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 p-8 max-w-5xl mx-auto w-full">
            
            <div class="mb-8">
                <h2 class="text-3xl font-black text-slate-800 tracking-tight">Inbound Pipeline</h2>
                <p class="text-slate-500 mt-2">Filter unqualified leads and enforce the Discovery Retainer gate.</p>
            </div>

            <!-- Qualification Form -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <h3 class="text-lg font-bold text-[#0B1325] mb-6 border-b border-slate-100 pb-4">New Lead: Apex SACCO</h3>
                
                <form id="qualifierForm" class="space-y-6">
                    <div>
                        <p class="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wider">Client Request Profile</p>
                        <div class="space-y-3">
                            <label class="flex items-start space-x-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition">
                                <input type="radio" name="scope" value="idea" class="mt-1">
                                <div>
                                    <span class="block font-bold text-slate-800">"We need a warehouse app but don't have specs"</span>
                                    <span class="block text-sm text-slate-500">Client has a budget but no technical blueprints. High risk of scope creep.</span>
                                </div>
                            </label>
                            <label class="flex items-start space-x-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition">
                                <input type="radio" name="scope" value="spec" class="mt-1">
                                <div>
                                    <span class="block font-bold text-slate-800">"We have UI designs but need backend architecture"</span>
                                    <span class="block text-sm text-slate-500">Client has partial specs. Requires formal Phase 2 Systems Analysis.</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </form>

                <div id="qualifierResult" class="hidden mt-8 p-6 bg-indigo-50 border border-indigo-100 rounded-lg">
                    <div class="flex items-start space-x-4">
                        <div class="text-indigo-600 text-3xl"><i class="fa-solid fa-scale-balanced"></i></div>
                        <div>
                            <h4 id="qTitle" class="text-lg font-bold text-indigo-900">Phase 1: Discovery & Viability</h4>
                            <p id="qDesc" class="text-sm text-indigo-700 mt-1 mb-4">You require a comprehensive feasibility audit before heavy capital expenditure.</p>
                            <button onclick="alert('Retainer Invoice Generated. Lead moved to Phase 1.')" class="bg-indigo-600 text-white px-6 py-2 rounded font-bold shadow hover:bg-indigo-700 transition">Convert to Phase 1 Discovery</button>
                        </div>
                    </div>
                </div>
            </div>

        </main>
    </div>

    <script>
        const form = document.getElementById('qualifierForm');
        const result = document.getElementById('qualifierResult');
        const qTitle = document.getElementById('qTitle');
        const qDesc = document.getElementById('qDesc');
        const radios = form.querySelectorAll('input[type="radio"]');

        const mappings = {
            'idea': {
                title: 'Phase 1: Discovery & Viability',
                desc: 'Client requires a comprehensive feasibility audit, requirements engineering, and commercial scoping before heavy capital expenditure. Enforce Discovery Retainer.'
            },
            'spec': {
                title: 'Phase 2: Systems Architecture',
                desc: 'Client is ready to draft the absolute technical blueprint (Database Schemas, API Contracts, UI Wireframes) to de-risk the construction phase. Enforce Design Retainer.'
            }
        };

        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const val = e.target.value;
                qTitle.innerText = mappings[val].title;
                qDesc.innerText = mappings[val].desc;
                result.classList.remove('hidden');
            });
        });
    </script>
</body>
</html>
"""

# Replace everything from <div class="flex-grow... down to the end of the file
import re
new_html = re.sub(r'<!-- Main Content Wrapper -->.*', lead_qualifier_main, admin_html, flags=re.DOTALL)

with open(os.path.join(base_dir, 'admin-leads.html'), 'w', encoding='utf-8') as f:
    f.write(new_html)

print("Recreated admin-leads.html")
