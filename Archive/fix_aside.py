import os
import glob

base_dir = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17'
files = glob.glob(os.path.join(base_dir, '*.html'))

old_aside = '<aside class="w-64 bg-[#0B1325] text-slate-300 flex flex-col h-full shrink-0 border-r border-slate-800">'
new_aside = '<aside class="w-64 bg-[#0B1325] text-slate-300 flex flex-col h-screen sticky top-0 shrink-0 border-r border-slate-800">'

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if old_aside in content:
        new_content = content.replace(old_aside, new_aside)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Fixed {os.path.basename(file)}')
