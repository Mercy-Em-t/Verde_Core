import os
import re

file_path = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\index.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# I will find the exact orphaned block by using regex to grab it from right after the <!-- Addons --> section's closing div, 
# up to the extra </div> that closes the outer Phase 3/4 div.

# Let's locate the orphaned content.
orphaned_content_pattern = re.compile(r'(\s*<div class="phase-content p-6 pt-0 bg-slate-50 border-t border-slate-200 mt-4">\s*<div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">\s*<div>\s*<h4 class="font-bold text-\[\#0B1325\] mb-3 uppercase text-xs tracking-wider"><i class="fa-solid fa-box text-slate-400 mr-2"></i> Deliverables</h4>\s*<ul class="text-sm text-slate-600 space-y-2 ml-6 list-disc">\s*<li>Production Codebase & Repositories</li>\s*<li>QA Test Case Execution</li>\s*<li>Dockerized Production Deployment</li>\s*<li>SLA Handover Documentation</li>\s*</ul>\s*</div>\s*<div>\s*<h4 class="font-bold text-\[\#0B1325\] mb-3 uppercase text-xs tracking-wider"><i class="fa-solid fa-file-contract text-slate-400 mr-2"></i> Terms</h4>\s*<p class="text-sm text-slate-600 leading-relaxed">We manage vetted subcontractor execution against the Phase 2 Blueprints. Payment is released from Escrow upon UAT signoff.</p>\s*</div>\s*</div>\s*</div>\s*</div>)', re.MULTILINE)

match = orphaned_content_pattern.search(content)
if not match:
    print("Could not find orphaned content")
    exit(1)

orphaned_text = match.group(1)

# Remove the orphaned text from the end
content = content.replace(orphaned_text, '')

# Now insert it right before Phase 5
insertion_point = r'(\s*<!-- Phase 5 -->)'
content = re.sub(insertion_point, orphaned_text + r'\1', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed HTML structure")
