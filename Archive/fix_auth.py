import re

def run():
    with open('main_api.py', 'r', encoding='utf-8') as f:
        code = f.read()

    # The buggy code:
    # if user["role"] == "Client":
    #     res = conn.run("SELECT Id FROM Projects WHERE Id = :pid AND ClientEmail = :uid", pid=project_id, uid=user["userid"])
    #     if not res: raise HTTPException(status_code=403, detail="Access denied")
    
    # We will replace it with `verify_project_access(project_id, user, conn)`
    
    pattern = r'if user\["role"\] == "Client":.*?if not res: raise HTTPException\(status_code=403, detail="Access denied"\)'
    replacement = r'verify_project_access(project_id, user, conn)'
    
    new_code = re.sub(pattern, replacement, code, flags=re.DOTALL)
    
    with open('main_api.py', 'w', encoding='utf-8') as f:
        f.write(new_code)
    print("Fixed authorization logic in get_project_phases")

if __name__ == '__main__':
    run()
