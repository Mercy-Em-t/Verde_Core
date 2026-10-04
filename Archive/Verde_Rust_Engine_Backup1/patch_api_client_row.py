import re

def run():
    with open('api-client.js', 'r', encoding='utf-8') as f:
        code = f.read()

    # Fix the mapping of status from row[5] to row[4]
    code = code.replace('status: row[5] ? (row[5]', 'status: row[4] ? (row[4]')
    
    with open('api-client.js', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Fixed api-client.js row mapping")

if __name__ == '__main__':
    run()
