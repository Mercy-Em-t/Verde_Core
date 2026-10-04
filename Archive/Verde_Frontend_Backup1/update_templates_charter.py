import os

file_path = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\admin-templates.html'

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Inject the project charter card
new_cards = """{ id: 'project-charter', title: 'Phase 1 Executive Project Charter', category: 'Governance', icon: 'fa-file-signature', color: 'indigo', desc: 'Binding Engagement Authorization Document. Ties economic feasibility, schedule, and RACI into a final sign-off sheet.', link: 'template-project-charter.html' },
            """

# Find the WBS card to insert before it
marker = "{ id: 'feasibility-model'"
if marker in html:
    html = html.replace(marker, new_cards + marker)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated admin-templates.html with Project Charter card")
