import re

def run():
    with open('main_api.py', 'r', encoding='utf-8') as f:
        code = f.read()

    # Find the allowed_entities map
    old = 'allowed_entities = {"leads": "Leads", "projects": "Projects", "clients": "Clients", "payments": "Payments", "workers": "Workers", "services": "Services"}'
    new = 'allowed_entities = {"leads": "Leads", "projects": "Projects", "clients": "Clients", "payments": "Payments", "workers": "Workers", "services": "Services", "portfolio": "Portfolio"}'
    
    code = code.replace(old, new)
    
    # Also in get_admin_dashboard:
    # if entity not in allowed_entities: ...
    # if entity == "services": ...
    
    # Let's see how get_admin_dashboard handles services.
    
    with open('main_api.py', 'w', encoding='utf-8') as f:
        f.write(code)
        
    print("Patched main_api.py allowed_entities")

if __name__ == '__main__':
    run()
