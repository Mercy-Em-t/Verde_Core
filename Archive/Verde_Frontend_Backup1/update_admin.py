import os

file_path = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\admin.html'

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Add to Sidebar
sidebar_marker = '<!-- Admin Sidebar Nav -->'
sidebar_start = html.find(sidebar_marker)

if sidebar_start != -1:
    menu_insertion_point = html.find('</nav>', sidebar_start)
    new_menu_item = """
                <a href="#" class="bg-indigo-900 text-white group flex items-center px-2 py-2 text-sm font-bold rounded-md">
                    <i class="fa-solid fa-code-pull-request mr-3 text-indigo-300"></i>
                    Scope & CRs
                </a>
"""
    html = html[:menu_insertion_point] + new_menu_item + html[menu_insertion_point:]

# 2. Add CR Assessment Widget to Right Column
# Let's insert it right after the Tool Stack Launchpad
tool_stack_marker = '<!-- Tool Stack Launchpad -->'
# wait, it's called '<!-- WIDGET 3: External Tool Stack -->'
widget3_idx = html.find('<!-- WIDGET 3: External Tool Stack -->')
if widget3_idx != -1:
    widget3_end = html.find('</div>', widget3_idx)
    widget3_end = html.find('</div>', widget3_end + 1) + 6 # end of dashboard-card

    cr_queue_widget = """
                <!-- WIDGET 5: CR Assessment Queue -->
                <div class="dashboard-card p-6 border-l-4 border-amber-500">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-lg font-bold text-[#0B1325]">CR Assessment Queue</h2>
                        <span class="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">1 Pending</span>
                    </div>
                    
                    <div class="border border-amber-200 rounded p-4 bg-amber-50 cursor-pointer hover:bg-amber-100 transition-colors">
                        <div class="flex justify-between mb-2">
                            <span class="font-bold text-sm text-amber-900">PRJ-9942-CR001</span>
                            <span class="text-[10px] text-amber-600 font-bold bg-amber-200 px-1 rounded uppercase">Requires Architecture Review</span>
                        </div>
                        <h3 class="font-bold text-xs text-amber-800 mb-1">Add Stripe Subs</h3>
                        <p class="text-xs text-amber-700 mb-3">Client requested adding recurring billing to the gateway scope.</p>
                        
                        <div class="flex space-x-2">
                            <button class="flex-1 bg-[#0B1325] text-white text-xs font-bold py-2 rounded hover:bg-slate-800">Draft Assessment</button>
                        </div>
                    </div>
                </div>
"""
    html = html[:widget3_end] + cr_queue_widget + html[widget3_end:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated admin.html")
