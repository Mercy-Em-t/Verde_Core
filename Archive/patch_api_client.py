import re

def run():
    with open('api-client.js', 'r', encoding='utf-8') as f:
        js = f.read()

    # Map state to status, and Capitalize it so 'LOST' becomes 'Lost', 'NEW' becomes 'New'
    old = "state: row[5]"
    new = "status: row[5] ? (row[5].charAt(0).toUpperCase() + row[5].slice(1).toLowerCase()) : 'New'"
    js = js.replace(old, new)
    
    with open('api-client.js', 'w', encoding='utf-8') as f:
        f.write(js)
    print("Fixed api-client.js lead mapping")

if __name__ == '__main__':
    run()
