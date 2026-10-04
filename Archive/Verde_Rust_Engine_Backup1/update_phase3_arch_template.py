import os

file_path = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\admin-templates.html'

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Inject the Phase 3 Arch card
new_cards = """{ id: 'phase3-architecture', title: 'Phase 3 System Architecture & Technical Design', category: 'Engineering', icon: 'fa-server', color: 'fuchsia', desc: 'Evaluates Custom vs COTS via the Alternative Matrix and explicitly defines the AWS/Node.js/PostgreSQL network topology.', link: 'template-phase3-architecture.html' },
            """

# Find the category insert point
marker = "{ id: 'data-dictionary'"
if marker in html:
    html = html.replace(marker, new_cards + marker)
else:
    marker2 = "{ id: 'erd-3nf'"
    if marker2 in html:
         html = html.replace(marker2, new_cards + marker2)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated admin-templates.html with Phase 3 Architecture Template card")
