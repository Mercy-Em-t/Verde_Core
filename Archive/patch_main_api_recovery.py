import re

def run():
    with open('main_api.py', 'r', encoding='utf-8') as f:
        code = f.read()

    inject_api = """
class RecoveryModel(BaseModel):
    userid: str
    recovery_key: str
    new_password: str

@app.post("/api/recover")
def account_recovery(payload: RecoveryModel):
    req_id = str(uuid.uuid4())
    event = threading.Event()
    pending_requests[req_id] = {"event": event, "response": None}
    
    broker.publish({
        "type": "AUTH_RECOVERY", 
        "userid": payload.userid, 
        "recovery_key": payload.recovery_key, 
        "new_password": payload.new_password,
        "req_id": req_id
    })
    event.wait(5.0)
    
    res = pending_requests.pop(req_id, {}).get("response")
    if not res:
        raise HTTPException(status_code=504, detail="Broker timeout")
        
    if res["type"] == "RECOVERY_SUCCESS":
        return {"status": "success", "message": res["msg"]}
    else:
        raise HTTPException(status_code=401, detail=res.get("msg", "Recovery failed"))
"""

    if "@app.post(\"/api/recover\")" not in code:
        # Inject right before login
        pattern = r'(class LoginModel\(BaseModel\):)'
        code = re.sub(pattern, inject_api + r'\1', code)
        with open('main_api.py', 'w', encoding='utf-8') as f:
            f.write(code)
        print("Injected /api/recover into main_api.py")
    else:
        print("Already injected")

if __name__ == '__main__':
    run()
