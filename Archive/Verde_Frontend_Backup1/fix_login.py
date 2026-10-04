import re

def run():
    with open('login.html', 'r', encoding='utf-8') as f:
        html = f.read()

    if 'api-client.js' not in html:
        html = html.replace('<script>', '<script src="config.js"></script>\n<script src="api-client.js"></script>\n<script>', 1)

    old_fetch_logic = r"const res = await fetch\('http://127\.0\.0\.1:8081/api/auth/login'[\s\S]*?window\.location\.href = 'client-dashboard\.html';[\s\S]*?\}"

    new_logic = """
        const data = await window.TMAPI.login(emailVal, passVal);
        
        // TMAPI.login automatically sets verde_api_token and verde_role in localStorage.
        const role = localStorage.getItem('verde_role');
        
        if (role === 'Admin') {
            window.location.href = 'admin.html';
        } else if (role === 'Worker') {
            window.location.href = 'workspace.html';
        } else {
            window.location.href = 'client-dashboard.html';
        }
    """
    
    html = re.sub(old_fetch_logic, new_logic, html)

    with open('login.html', 'w', encoding='utf-8') as f:
        f.write(html)

if __name__ == '__main__':
    run()
