import re

def run():
    with open('client-dashboard.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # Find where the first Project Card starts and the last one ends, and wrap them.
    # Actually, replacing the existing hardcoded ones is easiest if we just find the header closing div,
    # add <div id="project-list" class="space-y-6">, and close it before the Right Column starts.
    
    start_marker = r'</button>\s*</div>\s*<!-- Project Card 1 -->'
    end_marker = r'<!-- Right Column: Approvals & Tasks -->'
    
    # We will just inject an empty <div id="project-list"></div> and remove the hardcoded cards so it doesn't flash.
    
    # Remove the hardcoded project cards completely and inject the container
    pattern = r'(</button>\s*</div>).*?(<!-- Right Column: Approvals & Tasks -->)'
    replacement = r'\1\n\n            <!-- Dynamic Project List -->\n            <div id="project-list" class="space-y-6"></div>\n\n        </div>\n\n        \2'
    
    new_html = re.sub(pattern, replacement, html, flags=re.DOTALL)
    
    with open('client-dashboard.html', 'w', encoding='utf-8') as f:
        f.write(new_html)

if __name__ == '__main__':
    run()
