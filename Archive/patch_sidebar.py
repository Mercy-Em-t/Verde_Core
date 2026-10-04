import re

def run():
    with open('admin.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # The block we want to append to:
    # <li><a href="admin-leads.html" class="flex items-center space-x-2 px-3 py-2 rounded text-sm hover:bg-slate-800 transition"><i class="fa-solid fa-funnel-dollar w-5 text-center"></i> <span>Lead Qualifiers</span></a></li>
    
    inject_links = """
                    <li><a href="admin-services.html" class="flex items-center space-x-2 px-3 py-2 rounded text-sm hover:bg-slate-800 transition text-emerald-400"><i class="fa-solid fa-layer-group w-5 text-center"></i> <span>Services Catalog</span></a></li>
                    <li><a href="admin-portfolio.html" class="flex items-center space-x-2 px-3 py-2 rounded text-sm hover:bg-slate-800 transition text-indigo-400"><i class="fa-solid fa-images w-5 text-center"></i> <span>Portfolio Matrix</span></a></li>"""
    
    # We will insert it right after the Lead Qualifiers li closing tag
    pattern = r'(<li><a href="admin-leads\.html".*?</li>)'
    
    if "admin-services.html" not in html:
        new_html = re.sub(pattern, r'\1' + inject_links, html, flags=re.DOTALL)
        with open('admin.html', 'w', encoding='utf-8') as f:
            f.write(new_html)
        print("Injected services and portfolio links into admin.html sidebar")
    else:
        print("Already injected")

if __name__ == '__main__':
    run()
