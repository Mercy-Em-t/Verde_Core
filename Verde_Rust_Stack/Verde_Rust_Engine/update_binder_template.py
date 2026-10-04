import os

file_path = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\admin-templates.html'

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Inject the Binder card
new_cards = """{ id: 'phase2-binder', title: 'Phase 2 Requirements Deliverable Binder', category: 'Governance', icon: 'fa-book', color: 'yellow', desc: 'The Master Compilation Checklist. Ensures every Use Case, Subsystem DFD, and 3NF model is completed before generating the System Proposal.', link: 'template-phase2-binder.html' },
            """

# Find the category insert point
marker = "{ id: 'scope-freeze'"
if marker in html:
    html = html.replace(marker, new_cards + marker)
else:
    marker2 = "{ id: 'cor-form'"
    if marker2 in html:
         html = html.replace(marker2, new_cards + marker2)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated admin-templates.html with Phase 2 Binder Template card")
