import re

def run():
    with open('login.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # Change type="email" to type="text"
    # Find something like `<input type="email" id="email"` or `<input ... type="email"`
    
    html = html.replace('type="email"', 'type="text"')
    
    with open('login.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Fixed login.html input type")

if __name__ == '__main__':
    run()
