import os

file_path = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\my-project.html'

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Find where to insert the Admin HUD. Right above dynamicPhaseContainer is good.
insertion_point = html.find('<div id="dynamicPhaseContainer"')

admin_hud = """
        <!-- ADMIN COPILOT HUD (Hidden for Clients) -->
        <div class="admin-only hidden mb-8 bg-amber-50 border border-amber-200 rounded-xl p-6 shadow-sm">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg font-bold text-amber-900"><i class="fa-solid fa-jet-fighter text-amber-600 mr-2"></i> Engagement Director Workspace</h2>
                <div class="flex space-x-2">
                    <span class="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded">Budget: On Track</span>
                    <span class="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded">Scope: Locked</span>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <!-- Tool Links -->
                <button class="flex flex-col items-center justify-center p-4 bg-white border border-amber-200 rounded hover:bg-amber-100 transition-colors">
                    <i class="fa-brands fa-github text-[#0B1325] text-2xl mb-2"></i>
                    <span class="text-xs font-bold text-slate-700">Codebase</span>
                </button>
                <button class="flex flex-col items-center justify-center p-4 bg-white border border-amber-200 rounded hover:bg-amber-100 transition-colors">
                    <i class="fa-solid fa-diagram-project text-orange-500 text-2xl mb-2"></i>
                    <span class="text-xs font-bold text-slate-700">Architecture</span>
                </button>
                
                <!-- Governance Actions -->
                <button onclick="alert('Opening Document Upload Modal...')" class="flex flex-col items-center justify-center p-4 bg-[#0B1325] text-white rounded hover:bg-slate-800 transition-colors shadow">
                    <i class="fa-solid fa-file-arrow-up text-xl mb-2"></i>
                    <span class="text-xs font-bold">Upload Deliverable</span>
                </button>
                <button onclick="alert('Opening Invoice Generator for active phase...')" class="flex flex-col items-center justify-center p-4 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors shadow">
                    <i class="fa-solid fa-file-invoice-dollar text-xl mb-2"></i>
                    <span class="text-xs font-bold">Generate Invoice</span>
                </button>
            </div>
        </div>
"""

html = html[:insertion_point] + admin_hud + html[insertion_point:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)

print("Injected Admin HUD")
