import re

def run():
    with open('main_api.py', 'r', encoding='utf-8') as f:
        code = f.read()

    # We need to find get_admin_dashboard and move it down.
    # Pattern to match the entire get_admin_dashboard function
    pattern = r'(@app\.get\("/api/admin/\{entity\}"\)\ndef get_admin_dashboard.*?(?=\n# -----------------\n# CLIENT DASHBOARDS))'
    
    match = re.search(pattern, code, re.DOTALL)
    if match:
        func_code = match.group(1)
        code = code.replace(func_code, "")
        
        # Now insert it right after the portfolio endpoints, just before # CLIENT DASHBOARDS
        insert_target = "# -----------------\n# CLIENT DASHBOARDS"
        code = code.replace(insert_target, func_code + "\n" + insert_target)
        
        with open('main_api.py', 'w', encoding='utf-8') as f:
            f.write(code)
        print("Moved get_admin_dashboard down")
    else:
        print("Could not find get_admin_dashboard")

if __name__ == '__main__':
    run()
