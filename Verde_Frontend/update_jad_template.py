import os

file_path = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\admin-templates.html'

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Inject the JAD Pre-Read Packet card
new_cards = """{ id: 'jad-preread', title: 'JAD Pre-Read Packet & Email', category: 'Discovery', icon: 'fa-book-open', color: 'amber', desc: 'Distribute 48 hours prior to the JAD Workshop. Sets ground rules, timeboxes, and executive escalation protocols.', link: 'template-jad-preread.html' },
            """

# Find the category insert point
marker = "{ id: 'conflict-register'"
if marker in html:
    html = html.replace(marker, new_cards + marker)
else:
    # If conflict-register not found, just insert before feasibility
    marker2 = "{ id: 'project-charter'"
    if marker2 in html:
         html = html.replace(marker2, new_cards + marker2)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated admin-templates.html with JAD Pre-Read Packet card")
