import os

file_path = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\admin-templates.html'

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Inject the Endpoint card
new_cards = """{ id: 'api-endpoint', title: 'Master API Endpoint Specification', category: 'Engineering', icon: 'fa-network-wired', color: 'fuchsia', desc: 'Developer-ready payload contract. Defines precise JSON structures and HTTP Error statuses based directly on Phase 2 exception flows.', link: 'template-api-endpoint.html' },
            """

# Find the category insert point
marker = "{ id: 'phase3-architecture'"
if marker in html:
    html = html.replace(marker, new_cards + marker)
else:
    marker2 = "{ id: 'data-dictionary'"
    if marker2 in html:
         html = html.replace(marker2, new_cards + marker2)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated admin-templates.html with API Endpoint Template card")
