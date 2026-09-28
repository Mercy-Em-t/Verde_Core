import os

path = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\services.html'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# I will replace the entire <!-- Navigation --> ... </nav> block with the new sticky nav
# Let's find the start and end of the block.
import re

nav_pattern = re.compile(r'<!-- Navigation -->.*?</nav>', re.DOTALL)

new_nav = """<!-- Navigation (Sticky) -->
    <div class="w-full sticky top-0 z-50 bg-[#F8FAFC]/90 backdrop-blur-md border-b border-slate-200 shadow-sm flex justify-center">
        <nav class="w-full max-w-6xl flex justify-between items-center px-6 py-4">
            <div class="text-2xl font-bold tracking-tight text-[#0B1325] cursor-pointer" onclick="window.location.href='index.html'">
                Tryphene<span class="font-light">Murugat</span>
            </div>
            <div class="space-x-6 text-sm font-semibold text-slate-600">
                <a href="portfolio.html" class="hover:text-[#0B1325] transition-colors">Portfolio</a>
                <a href="services.html" class="hover:text-[#0B1325] transition-colors">Catalog</a>
                <a href="library.html" class="hover:text-[#0B1325] transition-colors">Insights</a>
                <a href="index.html#framework" class="hover:text-[#0B1325] transition-colors">SDLC Framework</a>
                <a href="login.html" class="px-4 py-2 bg-white border border-slate-300 rounded text-[#0B1325] hover:bg-slate-50 transition-colors shadow-sm">Client Login</a>
            </div>
        </nav>
    </div>"""

content = nav_pattern.sub(new_nav, content, count=1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched services.html nav")
