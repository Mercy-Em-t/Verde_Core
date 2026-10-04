import re

def run():
    with open('admin-services.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # Change localServices = res || []; to localServices = res.services || res || [];
    html = html.replace('localServices = res || [];', 'localServices = res.services || res.data || res || []; if(!Array.isArray(localServices)) localServices = Object.values(localServices); if(!Array.isArray(localServices)) localServices = [];')
    
    with open('admin-services.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Fixed localServices mapping in admin-services.html")

if __name__ == '__main__':
    run()
