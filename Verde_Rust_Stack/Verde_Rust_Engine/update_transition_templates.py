import os

file_path = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\admin-templates.html'

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Inject the templates
new_cards = """{ id: 'ip-release', title: 'Phase 2 IP Release & Termination', category: 'Governance', icon: 'fa-file-contract', color: 'rose', desc: 'Path A Drop-Off artifact. Legally releases the IP to the client while severing your liability if they use a cheap 3rd-party dev shop.', link: 'template-ip-release.html' },
               { id: 'transition-email', title: 'Phase 2 Transition Cover Email', category: 'Communications', icon: 'fa-envelope-open-text', color: 'blue', desc: 'The psychological framing script that presents Path A (Drop-Off) and Path B (Phase 3 Build) as equal, risk-insulated options.', link: 'template-transition-email.html' },
            """

# Find the category insert point
marker = "{ id: 'phase2-closing'"
if marker in html:
    html = html.replace(marker, new_cards + marker)
else:
    marker2 = "{ id: 'phase2-binder'"
    if marker2 in html:
         html = html.replace(marker2, new_cards + marker2)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated admin-templates.html with IP Release and Transition Email cards")
