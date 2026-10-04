import re

def run():
    with open('main_api.py', 'r', encoding='utf-8') as f:
        code = f.read()

    # Import the templates at the top
    if "from phase_templates import PHASE_TEMPLATES" not in code:
        code = code.replace("from storagekeeper import", "from phase_templates import PHASE_TEMPLATES\nfrom storagekeeper import")
        
    inject_str = """
class CommissionPhaseModel(BaseModel):
    template_id: str

@app.post("/api/admin/projects/{project_id}/phases/commission")
def commission_phase(project_id: int, data: CommissionPhaseModel, user: dict = Depends(get_current_user)):
    if user.get("role") != "Admin": raise HTTPException(status_code=403, detail="Forbidden")
    
    template = PHASE_TEMPLATES.get(data.template_id)
    if not template: raise HTTPException(status_code=400, detail="Invalid phase template")
    
    with Connection(**db_params) as conn:
        # Check if project exists
        res = conn.run("SELECT Id FROM Projects WHERE Id = :pid", pid=project_id)
        if not res: raise HTTPException(status_code=404, detail="Project not found")
        
        # Check if phase already exists
        existing = conn.run("SELECT Id FROM ProjectPhases WHERE ProjectId = :pid AND PhaseName = :name", pid=project_id, name=template["name"])
        if existing: raise HTTPException(status_code=400, detail="Phase already attached to this project")
        
        # Insert
        conn.run('''
            INSERT INTO ProjectPhases (ProjectId, PhaseName, Status, Prerequisites, Steps, Deliverables)
            VALUES (:pid, :name, 'Locked', :p, :s, :d)
        ''', pid=project_id, name=template["name"], p=json.dumps(template["prerequisites"]), s=json.dumps(template["steps"]), d=json.dumps(template["deliverables"]))
        
        broker.publish({"type": "AUDIT_LOG", "event": "PHASE_COMMISSIONED", "details": f"Admin commissioned {template['name']} for Project {project_id}", "user": user["userid"]})
        
        return {"status": "success", "msg": f"Commissioned {template['name']}"}
"""
    
    if "commission_phase" not in code:
        # Insert after get_project_phases
        idx = code.find('def toggle_prereq')
        if idx != -1:
            # find the @app.post before it
            idx = code.rfind('@app.post', 0, idx)
            code = code[:idx] + inject_str + '\n' + code[idx:]
            with open('main_api.py', 'w', encoding='utf-8') as f:
                f.write(code)
            print("Injected commission_phase endpoint")
        else:
            print("Could not find insertion point")
    else:
        print("Already injected")

if __name__ == '__main__':
    run()
