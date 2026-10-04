import re

def run():
    with open('main_api.py', 'r', encoding='utf-8') as f:
        code = f.read()

    inject_str = """
@app.get("/api/projects")
def get_all_projects(user: dict = Depends(get_current_user)):
    if user.get("role") != "Admin": raise HTTPException(status_code=403, detail="Forbidden")
    with Connection(**db_params) as conn:
        res = conn.run("SELECT p.Id, c.Name, p.State, p.StartPhase FROM Projects p JOIN Clients c ON p.ClientId = c.Id")
        projects = []
        for r in res:
            projects.append({
                "id": r[0],
                "name": r[1],
                "status": r[2],
                "stage": r[3] or "active",
                "next_action": "Review"
            })
        return {"projects": projects}
"""
    
    if "@app.get(\"/api/projects\")" not in code:
        idx = code.find('@app.get("/api/client/projects")')
        if idx != -1:
            code = code[:idx] + inject_str + '\n' + code[idx:]
            with open('main_api.py', 'w', encoding='utf-8') as f:
                f.write(code)
            print("Injected GET /api/projects")
        else:
            print("Could not find insertion point")
    else:
        print("Already injected")

if __name__ == '__main__':
    run()
