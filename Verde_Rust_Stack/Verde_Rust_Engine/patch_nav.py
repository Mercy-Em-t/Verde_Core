import os

path = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\index.html'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_nav = """    <!-- Navigation -->
    <nav class="w-full max-w-6xl flex justify-between items-center p-6 bg-[#F8FAFC]">"""

new_nav = """    <!-- Navigation (Sticky) -->
    <div class="w-full sticky top-0 z-50 bg-[#F8FAFC]/90 backdrop-blur-md border-b border-slate-200 shadow-sm flex justify-center">
        <nav class="w-full max-w-6xl flex justify-between items-center px-6 py-4">"""

content = content.replace(old_nav, new_nav)

content = content.replace('    </nav>\n\n    <!-- HERO SECTION -->', '        </nav>\n    </div>\n\n    <!-- HERO SECTION -->')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Nav is now sticky")
