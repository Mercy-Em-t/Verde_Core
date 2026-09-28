import os

file_path = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\admin-templates.html'

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Inject the Closing card
new_cards = """{ id: 'phase2-closing', title: 'Phase 2 Administrative Closing Protocol', category: 'Governance', icon: 'fa-file-invoice-dollar', color: 'green', desc: 'Internal runbook for managing the Gate 2 financial transition. Issues the Phase 3 Work Order invoice and enforces the physical engineering hard stop.', link: 'template-phase2-closing.html' },
            """

# Find the category insert point
marker = "{ id: 'phase2-binder'"
if marker in html:
    html = html.replace(marker, new_cards + marker)
else:
    marker2 = "{ id: 'scope-freeze'"
    if marker2 in html:
         html = html.replace(marker2, new_cards + marker2)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated admin-templates.html with Phase 2 Closing Protocol card")
