import os

file_path = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\admin-templates.html'

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Inject the RDD card
new_cards = """{ id: 'rdd', title: 'Requirements Definition Document (RDD)', category: 'Engineering', icon: 'fa-file-contract', color: 'teal', desc: 'Separates Functional Requirements (FR) from Non-Functional Requirements (NFR) for strict engineering traceability.', link: 'template-rdd.html' },
            """

# Find the category insert point
marker = "{ id: 'use-case'"
if marker in html:
    html = html.replace(marker, new_cards + marker)
else:
    marker2 = "{ id: 'strategy-brief'"
    if marker2 in html:
         html = html.replace(marker2, new_cards + marker2)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated admin-templates.html with RDD Template card")
