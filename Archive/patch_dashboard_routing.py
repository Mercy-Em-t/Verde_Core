import re

def run():
    with open('main_api.py', 'r', encoding='utf-8') as f:
        code = f.read()

    # Find the get_admin_dashboard function definition
    target = 'def get_admin_dashboard(entity: str, user: dict = Depends(get_current_user)):\n'
    
    inject = '''
    if entity == "portfolio": return admin_list_portfolio(user)
    if entity == "services": return admin_list_services(user)
'''
    code = code.replace(target, target + inject)
    with open('main_api.py', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Injected explicit routing into get_admin_dashboard")

if __name__ == '__main__':
    run()
