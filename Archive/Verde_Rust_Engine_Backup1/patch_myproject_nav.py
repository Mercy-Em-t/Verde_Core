import os
import re

path = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\my-project.html'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the old primitive header
old_header_pattern = re.compile(r'<header>.*?<\/header>', re.DOTALL)

# Inject the modern, sticky navbar
new_header = """<!-- Modern Navigation -->
<div class="w-full sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm flex justify-center" style="margin-bottom: 32px;">
    <nav class="w-full max-w-6xl flex justify-between items-center px-6 py-4">
        <div class="text-2xl font-bold tracking-tight" style="color: #0B1325; cursor: pointer;" onclick="window.location.href='index.html'">
            Tryphene<span style="font-weight: 300;">Murugat</span>
        </div>
        <div style="display: flex; gap: 24px; align-items: center; font-size: 14px; font-weight: 600; color: #475569;">
            <a href="index.html" style="text-decoration: none; color: #475569;">Home</a>
            <a href="services.html" style="text-decoration: none; color: #475569;">Catalog</a>
            <a href="client-dashboard.html" style="text-decoration: none; color: #475569;">Dashboard</a>
            <a href="index.html" onclick="localStorage.removeItem('tm_api_token_v1');" style="text-decoration: none; padding: 8px 16px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; color: #ef4444;">Log Out</a>
        </div>
    </nav>
</div>"""

content = old_header_pattern.sub(new_header, content, count=1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched my-project.html header")
