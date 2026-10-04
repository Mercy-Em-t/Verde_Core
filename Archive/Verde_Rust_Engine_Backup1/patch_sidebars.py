import os
import glob

# Find all admin HTML files
directory = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17'
admin_files = glob.glob(os.path.join(directory, 'admin*.html')) + [os.path.join(directory, 'my-project.html')]

for file_path in admin_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        html = f.read()

    # We need to replace the old placeholder for Financial Ledger with a real link if it exists,
    # or inject it under Engineering Portal if it doesn't.
    
    old_link = '<li><a href="#" class="flex items-center space-x-2 px-3 py-2 rounded text-sm hover:bg-slate-800 transition opacity-50"><i class="fa-solid fa-vault w-5 text-center"></i> <span>Financial Ledger</span></a></li>'
    new_link = '<li><a href="admin-finance.html" class="flex items-center space-x-2 px-3 py-2 rounded text-sm hover:bg-slate-800 transition"><i class="fa-solid fa-vault w-5 text-center"></i> <span>Financial Ledger</span></a></li>'
    
    if old_link in html:
        html = html.replace(old_link, new_link)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"Updated {os.path.basename(file_path)}")
    else:
        # Check if it's already updated
        if new_link not in html:
            # Let's find Engineering Portal
            eng_link_pattern = '<li><a href="admin-engineering.html" class="flex items-center space-x-2 px-3 py-2 rounded text-sm hover:bg-slate-800 transition"><i class="fa-solid fa-code w-5 text-center"></i> <span>Engineering Portal</span></a></li>'
            
            # Since some might have it as the active link (bg-primary/20), check both
            eng_active = '<li><a href="admin-engineering.html" class="flex items-center space-x-2 px-3 py-2 rounded bg-primary/20 text-accent font-bold text-sm"><i class="fa-solid fa-code w-5 text-center"></i> <span>Engineering Portal</span></a></li>'
            
            if eng_link_pattern in html:
                html = html.replace(eng_link_pattern, eng_link_pattern + '\n                    ' + new_link)
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(html)
                print(f"Injected into {os.path.basename(file_path)}")
            elif eng_active in html:
                html = html.replace(eng_active, eng_active + '\n                    ' + new_link)
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(html)
                print(f"Injected into {os.path.basename(file_path)}")
