import os

file_path = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\admin-templates.html'

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Inject the Scope Freeze card
new_cards = """{ id: 'scope-freeze', title: 'System Proposal & Scope Freeze', category: 'Governance', icon: 'fa-file-signature', color: 'indigo', desc: 'The ultimate Commercial Gate 2 execution document. Terminates discovery, freezes the baseline, and initiates the Phase 3 retainer.', link: 'template-scope-freeze.html' },
            """

# Find the category insert point
marker = "{ id: 'erd-3nf'"
if marker in html:
    html = html.replace(marker, new_cards + marker)
else:
    marker2 = "{ id: 'cor-form'"
    if marker2 in html:
         html = html.replace(marker2, new_cards + marker2)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated admin-templates.html with Scope Freeze Template card")
