import os

file_path = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\admin-templates.html'

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Inject the Use Case card
new_cards = """{ id: 'use-case', title: 'Formal Operational Use Case (UC)', category: 'Engineering', icon: 'fa-list-ol', color: 'emerald', desc: 'Step-by-step human-to-computer interaction mapping. Forces definition of strict pre-conditions, happy paths, and exception flows.', link: 'template-use-case.html' },
            """

# Find the category insert point
marker = "{ id: 'wbs-gantt'"
if marker in html:
    html = html.replace(marker, new_cards + marker)
else:
    marker2 = "{ id: 'project-charter'"
    if marker2 in html:
         html = html.replace(marker2, new_cards + marker2)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated admin-templates.html with Use Case Template card")
