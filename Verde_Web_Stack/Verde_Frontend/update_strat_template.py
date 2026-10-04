import os

file_path = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\admin-templates.html'

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Inject the Strategy Brief card
new_cards = """{ id: 'strategy-brief', title: 'Business Analysis Strategy Brief', category: 'Discovery', icon: 'fa-chess-knight', color: 'indigo', desc: 'Categorizes subsystem interventions into Process Improvement (BPI), Reengineering (BPR), and Automation (BPA).', link: 'template-strategy-brief.html' },
            """

# Find the category insert point
marker = "{ id: 'jad-preread'"
if marker in html:
    html = html.replace(marker, new_cards + marker)
else:
    marker2 = "{ id: 'conflict-register'"
    if marker2 in html:
         html = html.replace(marker2, new_cards + marker2)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated admin-templates.html with Strategy Brief Template card")
