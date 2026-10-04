import os
import glob

# The correct sidebar block
correct_sidebar = """    <!-- Sidebar -->
    <aside class="w-64 bg-dark text-slate-300 flex flex-col h-full shrink-0">
        <div class="p-4 border-b border-slate-700/50 flex items-center space-x-3">
            <div class="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold">TM</div>
            <div>
                <h1 class="text-sm font-bold text-white leading-tight">Tryphene Murugat</h1>
                <p class="text-[10px] text-slate-400 uppercase tracking-widest">Consultancy OS</p>
            </div>
        </div>
        
        <div class="p-4 flex-1 overflow-y-auto space-y-6">
            <!-- Business Dev -->
            <div>
                <h2 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Business Dev</h2>
                <ul class="space-y-1">
                    <li><a href="admin.html" class="flex items-center space-x-2 px-3 py-2 rounded text-sm hover:bg-slate-800 transition"><i class="fa-solid fa-chart-line w-5 text-center"></i> <span>Global HUD</span></a></li>
                    <li><a href="admin-leads.html" class="flex items-center space-x-2 px-3 py-2 rounded text-sm hover:bg-slate-800 transition"><i class="fa-solid fa-funnel-dollar w-5 text-center"></i> <span>Lead Qualifiers</span></a></li>
                </ul>
            </div>

            <!-- Operations -->
            <div>
                <h2 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Operations</h2>
                <ul class="space-y-1">
                    <li><a href="admin-analyst.html" class="flex items-center space-x-2 px-3 py-2 rounded text-sm hover:bg-slate-800 transition"><i class="fa-solid fa-microscope w-5 text-center"></i> <span>Systems Analyst</span></a></li>
                    <li><a href="admin-jad-dashboard.html" class="flex items-center space-x-2 px-3 py-2 rounded text-sm hover:bg-slate-800 transition"><i class="fa-solid fa-users-rectangle w-5 text-center"></i> <span>JAD Facilitator</span></a></li>
                    <li><a href="admin-engineering.html" class="flex items-center space-x-2 px-3 py-2 rounded text-sm hover:bg-slate-800 transition"><i class="fa-solid fa-code w-5 text-center"></i> <span>Engineering Portal</span></a></li>
                    <li><a href="admin-finance.html" class="flex items-center space-x-2 px-3 py-2 rounded text-sm hover:bg-slate-800 transition"><i class="fa-solid fa-vault w-5 text-center"></i> <span>Financial Ledger</span></a></li>
                </ul>
            </div>

            <!-- System -->
            <div>
                <h2 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">System</h2>
                <ul class="space-y-1">
                    <li><a href="admin-templates.html" class="flex items-center space-x-2 px-3 py-2 rounded text-sm hover:bg-slate-800 transition"><i class="fa-solid fa-folder-tree w-5 text-center"></i> <span>Template Library</span></a></li>
                    <li><a href="#" class="flex items-center space-x-2 px-3 py-2 rounded text-sm hover:bg-slate-800 transition opacity-50"><i class="fa-solid fa-shield-halved w-5 text-center"></i> <span>QA Gatekeeper</span></a></li>
                </ul>
            </div>
        </div>

        <div class="p-4 border-t border-slate-700/50">
            <button onclick="localStorage.removeItem('tm_role'); window.location.href='index.html'" class="flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition w-full">
                <i class="fa-solid fa-sign-out-alt w-5 text-center"></i> <span>Exit System</span>
            </button>
        </div>
    </aside>
"""

# HTML files to fix
files_to_fix = [
    'admin.html',
    'admin-leads.html',
    'admin-analyst.html',
    'admin-jad-dashboard.html',
    'admin-engineering.html',
    'admin-finance.html',
    'admin-templates.html',
    'my-project.html'
]

import re

base_dir = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17'

for file_name in files_to_fix:
    path = os.path.join(base_dir, file_name)
    if not os.path.exists(path):
        continue
    
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Check if old sidebar format exists: <aside ...> ... </aside>
    # We will use regex to find <aside> block.
    # Be careful, we only want to replace the FIRST <aside> block.
    
    # Let's find the start of <aside and end of </aside>
    import re
    aside_pattern = re.compile(r'<aside.*?</aside>', re.DOTALL)
    
    # We replace the first match of <aside> with correct_sidebar
    new_html = aside_pattern.sub(correct_sidebar, html, count=1)
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_html)
    
    print(f"Fixed sidebar in {file_name}")

# Also fix the Nginx default config
nginx_conf_path = os.path.join(base_dir, 'deploy', 'nginx', 'default.conf')
with open(nginx_conf_path, 'r', encoding='utf-8') as f:
    conf = f.read()

conf = conf.replace('index tryphene-sdlc-commercial-platform-v1.html;', 'index index.html;')
conf = conf.replace('try_files $uri $uri/ /tryphene-sdlc-commercial-platform-v1.html;', 'try_files $uri $uri/ /index.html;')

with open(nginx_conf_path, 'w', encoding='utf-8') as f:
    f.write(conf)
print("Fixed Nginx default.conf")
