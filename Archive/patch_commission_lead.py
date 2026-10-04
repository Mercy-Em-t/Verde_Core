import re

def run():
    with open('main_api.py', 'r', encoding='utf-8') as f:
        code = f.read()

    inject = """
class CommissionProjectModel(BaseModel):
    lead_id: int
    start_phase: str

@app.post("/api/admin/projects/commission-from-lead")
def commission_project_from_lead(data: CommissionProjectModel, user: dict = Depends(get_current_user)):
    if user.get("role") != "Admin": raise HTTPException(status_code=403, detail="Forbidden")
    
    with Connection(**db_params) as conn:
        # 1. Fetch Lead
        lead = conn.run("SELECT Name, Email FROM Leads WHERE Id = :id", id=data.lead_id)
        if not lead: raise HTTPException(status_code=404, detail="Lead not found")
        lead_name, lead_email = lead[0]
        
        # 2. Mark Lead as WON
        conn.run("UPDATE Leads SET State = 'WON' WHERE Id = :id", id=data.lead_id)
        
        # 3. Create Client
        # Check if client exists
        existing_client = conn.run("SELECT Id FROM Clients WHERE Email = :email", email=lead_email)
        if existing_client:
            client_id = existing_client[0][0]
        else:
            res = conn.run("INSERT INTO Clients (Name, Email, Industry) VALUES (:name, :email, 'Unknown') RETURNING Id", 
                           name=lead_name, email=lead_email)
            client_id = res[0][0]
            
        # 4. Provision User Login (if not exists)
        existing_user = conn.run("SELECT UserId FROM Users WHERE UserId = :email", email=lead_email)
        if not existing_user:
            # Temporary auto-gen password for the client
            import hashlib
            default_pwd = hashlib.sha256("client123".encode()).hexdigest()
            conn.run("INSERT INTO Users (UserId, PasswordHash, RecoveryHash, Role) VALUES (:uid, :pwd, :rec, 'Client')",
                     uid=lead_email, pwd=default_pwd, rec=default_pwd)
                     
        # 5. Create Project
        res = conn.run("INSERT INTO Projects (ClientId, State, StartPhase) VALUES (:cid, 'ONBOARDING', :phase) RETURNING Id",
                       cid=client_id, phase=data.start_phase)
        project_id = res[0][0]
        
        # 6. Apply Phase Template
        import phase_templates
        template = phase_templates.TEMPLATES.get(data.start_phase)
        if template:
            import json
            conn.run("INSERT INTO ProjectPhases (ProjectId, PhaseName, Blueprint) VALUES (:pid, :name, :bp)",
                     pid=project_id, name=data.start_phase, bp=json.dumps(template))
                     
        # 7. Generate Pending MSA and Invoice (Mock entries for now)
        # Assuming we have a Documents/Invoices table, or we just rely on Phase blueprint
        
        return {"status": "success", "project_id": project_id, "message": "Project Commissioned Successfully"}
"""

    if "commission_project_from_lead" not in code:
        # Insert before # CLIENT DASHBOARDS
        target = "# -----------------\n# CLIENT DASHBOARDS"
        code = code.replace(target, inject + "\n" + target)
        with open('main_api.py', 'w', encoding='utf-8') as f:
            f.write(code)
        print("Backend Commission Engine injected.")
    else:
        print("Already injected.")

if __name__ == '__main__':
    run()
