import os

file_path = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\admin-templates.html'

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Inject the Data Dictionary card
new_cards = """{ id: 'data-dictionary', title: 'Data Dictionary & L2 Process Models', category: 'Engineering', icon: 'fa-book-journal-whills', color: 'cyan', desc: 'Defines every physical data element down to field types and lengths, and outlines Level 2 pseudocode for complex logic.', link: 'template-data-dictionary.html' },
            """

# Find the category insert point
marker = "{ id: 'erd-3nf'"
if marker in html:
    html = html.replace(marker, new_cards + marker)
else:
    marker2 = "{ id: 'scope-freeze'"
    if marker2 in html:
         html = html.replace(marker2, new_cards + marker2)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated admin-templates.html with Data Dictionary Template card")
