import os

file_path = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\admin-templates.html'

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

if "{ id: 'phase4-binder'" in html:
    print("Already inserted")
else:
    new_cards = """{ id: 'phase4-construction', title: 'Phase 4: System Construction & Testing', category: 'Engineering', icon: 'fa-hammer', color: 'orange', desc: 'Part 1: Code Freeze rules, UAT/Integration Test Plans, and User Documentation SOPs.', link: 'template-phase4-construction.html' },
               { id: 'phase4-transition', title: 'Phase 4: Transition & Change Management', category: 'Engineering', icon: 'fa-people-arrows', color: 'orange', desc: 'Part 2: System Conversion Strategy (Data Migration) and Change Management execution.', link: 'template-phase4-transition.html' },
               { id: 'phase4-support', title: 'Phase 4: Support & Assessment', category: 'Engineering', icon: 'fa-headset', color: 'orange', desc: 'Part 3: SLA Support Plans, Escalation protocols, and formal Project Assessment/ROI.', link: 'template-phase4-support.html' },
               { id: 'phase4-binder', title: 'The Complete Phase 4 Implementation Binder', category: 'Engineering', icon: 'fa-folder-tree', color: 'orange', desc: 'The Master Compilation Checklist for Go-Live Transition, Testing, and Post-Mortem Assessment.', link: 'template-phase4-binder.html' },
               """
    
    # Just look for the engineering category block or data dictionary
    if "{ id: 'api-endpoint'" in html:
        html = html.replace("{ id: 'api-endpoint'", new_cards + "{ id: 'api-endpoint'")
    else:
        print("Fallback missing too")
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print("Injected Phase 4 cards successfully")
