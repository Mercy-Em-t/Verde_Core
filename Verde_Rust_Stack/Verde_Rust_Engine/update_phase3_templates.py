import os

file_path = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\admin-templates.html'

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# First, modify the Phase 3 Arch card to be more general
html = html.replace("{ id: 'phase3-architecture', title: 'Phase 3 System Architecture & Technical Design', category: 'Engineering', icon: 'fa-server', color: 'fuchsia', desc: 'Evaluates Custom vs COTS via the Alternative Matrix and explicitly defines the AWS/Node.js/PostgreSQL network topology.', link: 'template-phase3-architecture.html' },",
                    "{ id: 'phase3-architecture', title: 'Phase 3: System Architecture', category: 'Engineering', icon: 'fa-server', color: 'fuchsia', desc: 'Part 1: Alternative Matrix (Custom vs COTS), Hardware/Software Specs, and Security Plan.', link: 'template-phase3-architecture.html' },")

# Add the new ones
new_cards = """{ id: 'phase3-ui', title: 'Phase 3: User Interface Design', category: 'Engineering', icon: 'fa-mobile-screen', color: 'fuchsia', desc: 'Part 2: Use Scenarios, Interface Structure Diagram (ISD), Ergonomic Standards, and Prototyping rules.', link: 'template-phase3-ui.html' },
               { id: 'phase3-program', title: 'Phase 3: Data Storage & Program Design', category: 'Engineering', icon: 'fa-database', color: 'fuchsia', desc: 'Part 3: Physical PostgreSQL DDL mapping, Program Structure Charts, and execution specifications.', link: 'template-phase3-program.html' },
               { id: 'phase3-binder', title: 'The Complete Phase 3 Engineering Binder', category: 'Engineering', icon: 'fa-folder-tree', color: 'fuchsia', desc: 'The Master Compilation Checklist unifying Architecture, UI, and Database structural deliverables.', link: 'template-phase3-binder.html' },
               """

if "{ id: 'phase3-architecture'" in html:
    html = html.replace("{ id: 'phase3-architecture'", new_cards + "{ id: 'phase3-architecture'")
else:
    print("Could not find phase3-architecture marker")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated admin-templates.html with Phase 3 UI, Program, and Binder cards")
