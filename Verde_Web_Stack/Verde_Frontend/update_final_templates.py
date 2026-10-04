import os

file_path = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\admin-templates.html'

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Sprint Tickets -> Engineering
tickets_card = """{ id: 'sprint-tickets', title: 'Contractor Sprint Ticket Templates', category: 'Engineering', icon: 'fa-list-check', color: 'indigo', desc: 'Ready-to-assign JIRA/Linear structures with strict Acceptance Criteria (DoD) mapping directly to Phase 2 specs.', link: 'template-sprint-tickets.html' },
               """
if "{ id: 'api-endpoint'" in html:
    html = html.replace("{ id: 'api-endpoint'", tickets_card + "{ id: 'api-endpoint'")

# eTIMS -> Governance
etims_card = """{ id: 'etims-invoice', title: 'eTIMS Invoicing & Tax Accounting Automation', category: 'Governance', icon: 'fa-file-invoice-dollar', color: 'green', desc: 'Standard operating procedure for QuickBooks mapping, Chart of Accounts, and 5% KRA Withholding Tax rules.', link: 'template-etims-invoice.html' },
               """
if "{ id: 'phase2-closing'" in html:
    html = html.replace("{ id: 'phase2-closing'", etims_card + "{ id: 'phase2-closing'")

# Sprint Memo -> Communications
memo_card = """{ id: 'sprint-memo', title: 'Weekly Sprint Progress Memo', category: 'Communications', icon: 'fa-file-signature', color: 'cyan', desc: 'Standardized burn-down report and executive blocker escalation memo delivered to sponsors during Phase 1 & 2 discovery.', link: 'template-sprint-memo.html' },
               """
if "{ id: 'friday-status'" in html:
    html = html.replace("{ id: 'friday-status'", memo_card + "{ id: 'friday-status'")
elif "{ id: 'transition-email'" in html:
    html = html.replace("{ id: 'transition-email'", memo_card + "{ id: 'transition-email'")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated admin-templates.html with all 3 final templates")
