import re

def run():
    with open('client-dashboard.html', 'r', encoding='utf-8') as f:
        html = f.read()

    if 'api-client.js' not in html:
        html = html.replace('</body>', '<script src="config.js"></script>\n<script src="api-client.js"></script>\n</body>')

    script_pattern = r"const res = await fetch\('http://127\.0\.0\.1:8081/api/projects'.*?const data = await res\.json\(\);"
    new_script = "const data = await window.TMAPI.clientDashboard();\nif (!data) throw new Error('Failed to fetch projects');"
    
    html = re.sub(script_pattern, new_script, html, flags=re.DOTALL)
    
    with open('client-dashboard.html', 'w', encoding='utf-8') as f:
        f.write(html)

if __name__ == '__main__':
    run()
