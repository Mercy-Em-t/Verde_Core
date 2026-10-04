import os

file_path = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\admin-templates.html'

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Inject the DFD card
new_cards = """{ id: 'dfd', title: 'Balanced Process Models (DFDs)', category: 'Engineering', icon: 'fa-project-diagram', color: 'rose', desc: 'Strict Gane & Sarson DFD rendering. Enforces Context, Level 0, and Level 1 decompositions for every subsystem.', link: 'template-dfd.html' },
            """

# Find the category insert point
marker = "{ id: 'rdd'"
if marker in html:
    html = html.replace(marker, new_cards + marker)
else:
    marker2 = "{ id: 'use-case'"
    if marker2 in html:
         html = html.replace(marker2, new_cards + marker2)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated admin-templates.html with DFD Template card")
