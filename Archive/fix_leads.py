import re

def run():
    with open('admin-leads.html', 'r', encoding='utf-8') as f:
        html = f.read()

    if 'api-client.js' not in html:
        html = html.replace('<script>', '<script src="config.js"></script>\n<script src="api-client.js"></script>\n<script>', 1)

    html = re.sub(
        r"const res = await fetch\('http://127\.0\.0\.1:8081/api/leads'.*?allLeadsData = data\.leads \|\| \[\];",
        "allLeadsData = await window.TMAPI.leads() || [];",
        html, flags=re.DOTALL
    )

    with open('admin-leads.html', 'w', encoding='utf-8') as f:
        f.write(html)

if __name__ == '__main__':
    run()
