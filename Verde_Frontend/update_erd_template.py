import os

file_path = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\admin-templates.html'

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Inject the ERD card
new_cards = """{ id: 'erd-3nf', title: 'Logical Relational Data Model (3NF)', category: 'Engineering', icon: 'fa-database', color: 'purple', desc: 'Crow\\'s Foot ERD rendering. Enforces rigorous 1NF, 2NF, and 3NF normalization transformations before database physicalization.', link: 'template-erd.html' },
            """

# Find the category insert point
marker = "{ id: 'dfd'"
if marker in html:
    html = html.replace(marker, new_cards + marker)
else:
    marker2 = "{ id: 'rdd'"
    if marker2 in html:
         html = html.replace(marker2, new_cards + marker2)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated admin-templates.html with ERD Template card")
