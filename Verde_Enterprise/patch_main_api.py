import re

def run():
    with open('main_api.py', 'r', encoding='utf-8') as f:
        code = f.read()

    # We need to inject the GET /api/projects/{id}/phases endpoint.
    # I will put it right before the document endpoints.
    
    inject_str = """
@app.get("/api/projects/{project_id}/phases")
def get_project_phases(project_id: int, user: dict = Depends(get_current_user)):
    with Connection(**db_params) as conn:
        # Verify access
        if user["role"] == "Client":
            res = conn.run("SELECT Id FROM Projects WHERE Id = :pid AND ClientEmail = :uid", pid=project_id, uid=user["userid"])
            if not res: raise HTTPException(status_code=403, detail="Access denied")
            
        phases = conn.run("SELECT Id, PhaseName, Status, Prerequisites, Steps, Deliverables FROM ProjectPhases WHERE ProjectId = :pid", pid=project_id)
        
        results = []
        for p in phases:
            results.append({
                "id": p[0],
                "name": p[1],
                "status": p[2],
                "prerequisites": p[3],
                "steps": p[4],
                "deliverables": p[5]
            })
            
        return {"phases": results}

@app.post("/api/projects/{project_id}/phases/{phase_id}/prerequisites/{prereq_id}")
def toggle_prereq(project_id: int, phase_id: int, prereq_id: str, user: dict = Depends(get_current_user)):
    if user["role"] != "Admin": raise HTTPException(status_code=403, detail="Only admins can toggle prerequisites")
    
    with Connection(**db_params) as conn:
        phase = conn.run("SELECT Prerequisites, Status FROM ProjectPhases WHERE Id = :pid", pid=phase_id)
        if not phase: raise HTTPException(404, "Phase not found")
        prereqs, status = phase[0]
        
        all_done = True
        for p in prereqs:
            if p["id"] == prereq_id:
                p["completed"] = not p["completed"]
            if not p["completed"]:
                all_done = False
                
        # If all done, unlock
        new_status = "Active" if all_done else "Locked"
        
        conn.run("UPDATE ProjectPhases SET Prerequisites = :pr, Status = :st WHERE Id = :pid", pr=json.dumps(prereqs), st=new_status, pid=phase_id)
        
        # Publish Audit Log
        broker.publish({"type": "AUDIT_LOG", "event": "PREREQUISITE_TOGGLED", "details": f"{prereq_id} toggled in Phase {phase_id}", "user": user["userid"]})
        
        return {"status": "success", "phase_status": new_status, "prerequisites": prereqs}
"""
    
    if "get_project_phases" not in code:
        # Find where to insert it. We'll find `@app.get("/api/projects/{project_id}/documents")`
        idx = code.find('@app.get("/api/projects/{project_id}/documents")')
        if idx != -1:
            code = code[:idx] + inject_str + '\n' + code[idx:]
            with open('main_api.py', 'w', encoding='utf-8') as f:
                f.write(code)
            print("Injected phases endpoints")
        else:
            print("Could not find insertion point")
    else:
        print("Already injected")

if __name__ == '__main__':
    run()
