import re

def run():
    with open('api-client.js', 'r', encoding='utf-8') as f:
        code = f.read()

    code = code.replace('row[5].slice(1)', 'row[4].slice(1)')
    
    with open('api-client.js', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Fixed api-client.js slice")

if __name__ == '__main__':
    run()
