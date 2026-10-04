import re

def run():
    with open('admin.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # Find the button and replace its onclick
    html = html.replace('onclick="addClientWarning()"', 'onclick="openCommissionModal()"')

    with open('admin.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Fixed button onclick")

if __name__ == '__main__':
    run()
