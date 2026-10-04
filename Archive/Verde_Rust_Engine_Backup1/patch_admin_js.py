import re

def run():
    with open('admin.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # Remove `|| !tm_user_raw`
    html = html.replace('|| !tm_user_raw', '')
    
    with open('admin.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Fixed tm_user_raw in admin.html")

if __name__ == '__main__':
    run()
