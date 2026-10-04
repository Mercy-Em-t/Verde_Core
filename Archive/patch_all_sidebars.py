import os
import glob
import re

def run():
    inject_links = """
                    <li><a href="admin-services.html" class="flex items-center space-x-2 px-3 py-2 rounded text-sm hover:bg-slate-800 transition text-emerald-400"><i class="fa-solid fa-layer-group w-5 text-center"></i> <span>Services Catalog</span></a></li>
                    <li><a href="admin-portfolio.html" class="flex items-center space-x-2 px-3 py-2 rounded text-sm hover:bg-slate-800 transition text-indigo-400"><i class="fa-solid fa-images w-5 text-center"></i> <span>Portfolio Matrix</span></a></li>"""
                    
    pattern = r'(<li><a href="admin-leads\.html"[^>]*>.*?</a></li>)'
    
    files = glob.glob('admin-*.html')
    for f_name in files:
        if f_name == 'admin-project-detail.html': continue
        with open(f_name, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if "admin-services.html" not in content and "Lead Qualifiers" in content:
            new_content = re.sub(pattern, r'\1' + inject_links, content, flags=re.DOTALL)
            with open(f_name, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Patched sidebar for {f_name}")

if __name__ == '__main__':
    run()
