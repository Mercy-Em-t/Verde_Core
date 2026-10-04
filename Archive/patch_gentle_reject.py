import re

def run():
    with open('main_api.py', 'r', encoding='utf-8') as f:
        code = f.read()

    inject_str = """
class GentleRejectModel(BaseModel):
    emailBody: str

@app.post("/api/leads/{lead_id}/gentle-reject")
def gentle_reject_lead(lead_id: int, payload: GentleRejectModel, user: dict = Depends(get_current_user)):
    if user.get("role") != "Admin": raise HTTPException(status_code=403, detail="Forbidden")
    with Connection(**db_params) as conn:
        conn.run("UPDATE Leads SET State = 'LOST' WHERE Id = :id", id=lead_id)
        # We would theoretically send an email here using payload.emailBody
        return {"status": "success", "message": "Lead rejected"}
"""
    
    if "gentle_reject_lead" not in code:
        idx = code.find('@app.get("/api/client/projects")')
        if idx != -1:
            code = code[:idx] + inject_str + '\n' + code[idx:]
            with open('main_api.py', 'w', encoding='utf-8') as f:
                f.write(code)
            print("Injected POST /api/leads/{id}/gentle-reject")
        else:
            print("Could not find insertion point")
    else:
        print("Already injected")

if __name__ == '__main__':
    run()
