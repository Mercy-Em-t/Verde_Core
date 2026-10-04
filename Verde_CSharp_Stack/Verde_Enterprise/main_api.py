from fastapi import FastAPI, Depends, HTTPException, Header
from pydantic import BaseModel
import uvicorn
import uuid
import json
import threading
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware

# Import our modular enterprise components
from broker import RedisBroker

app = FastAPI(title="Verde Enterprise API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for broker & pending requests
broker = RedisBroker()
pending_requests = {}

class APIEventCatcher:
    def receive_message(self, msg):
        event_type = msg.get("type")
        req_id = msg.get("req_id")
        
        if req_id and req_id in pending_requests:
            if event_type in ("DATA_RETRIEVED", "AUTH_SUCCESS", "AUTH_FAILED", "AUTH_LOCKED", "TOKEN_VALID", "TOKEN_INVALID", "LEAD_CREATED", "LEAD_CONVERTED_SUCCESS", "LEAD_CONVERTED_FAILED", "TRANSITION_SUCCESS", "TRANSITION_FAILED", "PAYMENT_SUCCESS", "INVOICE_GENERATED", "WORKER_CREATED", "ASSIGNMENT_SUCCESS"):
                pending_requests[req_id]["response"] = msg
                pending_requests[req_id]["event"].set()

api_catcher = APIEventCatcher()
broker.subscribe(api_catcher)

# Initialize Postgres Database config (still used by endpoints if they needed direct DB access, though we strictly use Redis)
db_params = {
    "user": "verde_admin",
    "password": "verde_password",
    "database": "verde_db",
    "host": "127.0.0.1",
    "port": 5455
}

# IMPORTANT: GateKeeper and StorageKeeper have been moved to worker.py!
# The API Server now ONLY publishes messages to Redis and waits for responses.

# Models

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
class LoginModel(BaseModel):
    userid: str
    password: str

class StoreModel(BaseModel):
    key: str
    value: str

# Dependency to validate token via Redis pub/sub
def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    token = authorization.split(" ")[1]
    req_id = str(uuid.uuid4())
    event = threading.Event()
    pending_requests[req_id] = {"event": event, "response": None}
    
    broker.publish({"type": "VALIDATE_TOKEN", "token": token, "req_id": req_id})
    event.wait(2.0)
    
    res = pending_requests.pop(req_id, {}).get("response")
    if not res or res["type"] != "TOKEN_VALID":
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    return res

@app.post("/api/login")
def login(creds: LoginModel):
    req_id = str(uuid.uuid4())
    event = threading.Event()
    pending_requests[req_id] = {"event": event, "response": None}
    
    broker.publish({"type": "AUTH_ATTEMPT", "userid": creds.userid, "password": creds.password, "req_id": req_id})
    event.wait(5.0)
    
    res = pending_requests.pop(req_id, {}).get("response")
    if not res:
        raise HTTPException(status_code=504, detail="Broker timeout")
        
    if res["type"] == "AUTH_SUCCESS":
        return {"token": res["token"], "role": res["role"]}
    else:
        raise HTTPException(status_code=401, detail=res.get("msg", "Authentication failed"))

@app.post("/api/logout")
def logout(user: dict = Depends(get_current_user), authorization: str = Header(...)):
    token = authorization.split(" ")[1]
    broker.publish({"type": "LOGOUT_REQUEST", "token": token})
    return {"status": "logged_out"}

@app.get("/api/data")
def get_data(user: dict = Depends(get_current_user)):
    req_id = str(uuid.uuid4())
    event = threading.Event()
    pending_requests[req_id] = {"event": event, "response": None}
    
    req_msg = {"type": "RETRIEVE", "table": "VerdeData", "req_id": req_id}
    if user["role"] != "Admin":
        req_msg["owner_filter"] = user["userid"]
        
    broker.publish(req_msg)
    event.wait(5.0)
    
    res = pending_requests.pop(req_id, {}).get("response")
    if res and res["type"] == "DATA_RETRIEVED":
        return [dict(zip(res["columns"], row)) for row in res["rows"]]
    raise HTTPException(status_code=504, detail="Broker timeout")

@app.post("/api/store")
def store_data(data: StoreModel, user: dict = Depends(get_current_user)):
    broker.publish({"type": "STORE", "key": data.key, "val": data.value, "owner_id": user["userid"]})
    return {"status": "success"}

class LeadModel(BaseModel):
    name: str
    email: str
    message: str

class ConvertLeadModel(BaseModel):
    lead_id: int
    start_phase: Optional[str] = "PHASE_1"
    end_phase: Optional[str] = "PHASE_5"
    is_retainer: Optional[bool] = False

@app.post("/api/leads")
def create_lead(data: LeadModel):
    # Public endpoint (no auth required for website visitors)
    req_id = str(uuid.uuid4())
    event = threading.Event()
    pending_requests[req_id] = {"event": event, "response": None}
    
    broker.publish({
        "type": "CREATE_LEAD",
        "name": data.name,
        "email": data.email,
        "message": data.message,
        "req_id": req_id
    })
    event.wait(5.0)
    
    res = pending_requests.pop(req_id, {}).get("response")
    if res and res["type"] == "LEAD_CREATED":
        return {"status": "success", "lead_id": res["lead_id"]}
    raise HTTPException(status_code=500, detail="Failed to create lead")

@app.post("/api/convert_lead")
def convert_lead(data: ConvertLeadModel, user: dict = Depends(get_current_user)):
    # Only Admins can convert leads
    if user.get("role") != "Admin":
        raise HTTPException(status_code=403, detail="Forbidden")
        
    req_id = str(uuid.uuid4())
    event = threading.Event()
    pending_requests[req_id] = {"event": event, "response": None}
    
    broker.publish({
        "type": "CONVERT_LEAD",
        "lead_id": data.lead_id,
        "start_phase": data.start_phase,
        "end_phase": data.end_phase,
        "is_retainer": data.is_retainer,
        "req_id": req_id
    })
    event.wait(5.0)
    
    res = pending_requests.pop(req_id, {}).get("response")
    if res and res["type"] == "LEAD_CONVERTED_SUCCESS":
        return {"status": "success", "client_id": res["client_id"], "project_id": res["project_id"]}
    elif res and res["type"] == "LEAD_CONVERTED_FAILED":
        raise HTTPException(status_code=400, detail=res["msg"])
    raise HTTPException(status_code=504, detail="Broker timeout")

class TransitionModel(BaseModel):
    new_state: str

@app.post("/api/leads/{lead_id}/transition")
def transition_lead(lead_id: int, data: TransitionModel, user: dict = Depends(get_current_user)):
    if user.get("role") != "Admin":
        raise HTTPException(status_code=403, detail="Forbidden")
        
    req_id = str(uuid.uuid4())
    event = threading.Event()
    pending_requests[req_id] = {"event": event, "response": None}
    
    broker.publish({
        "type": "REQUEST_LEAD_TRANSITION",
        "lead_id": lead_id,
        "new_state": data.new_state,
        "req_id": req_id
    })
    event.wait(5.0)
    
    res = pending_requests.pop(req_id, {}).get("response")
    if res and res["type"] == "TRANSITION_SUCCESS":
        return {"status": "success", "new_state": data.new_state}
    elif res and res["type"] == "TRANSITION_FAILED":
        raise HTTPException(status_code=400, detail=res.get("msg"))
    raise HTTPException(status_code=504, detail="Broker timeout")

from pg8000.native import Connection
def get_db():
    return Connection(**db_params)

# -----------------
# ADMIN DASHBOARDS
# -----------------

@app.get("/api/admin/{entity}")
def get_admin_dashboard(entity: str, user: dict = Depends(get_current_user)):

    if entity == "portfolio": return admin_list_portfolio(user)
    if entity == "services": return admin_list_services(user)
    if user.get("role") != "Admin":
        raise HTTPException(status_code=403, detail="Forbidden: Admin access required")
        
    allowed_entities = {"leads": "Leads", "projects": "Projects", "clients": "Clients", "payments": "Payments", "workers": "Workers", "services": "Services"}
    if entity not in allowed_entities:
        raise HTTPException(status_code=404, detail="Dashboard entity not found")
        
    table = allowed_entities[entity]
    with get_db() as conn:
        # Generic select for simplicity (in prod we'd map columns explicitly)
        rows = conn.run(f"SELECT * FROM {table}")
        # Very basic format conversion (assuming ID is first column)
        return {"entity": entity, "count": len(rows), "data": [[str(c) for c in row] for row in rows]}


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

# -----------------
# CLIENT DASHBOARDS
# -----------------

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


class GentleRejectModel(BaseModel):
    emailBody: str

@app.post("/api/leads/{lead_id}/gentle-reject")
def gentle_reject_lead(lead_id: int, payload: GentleRejectModel, user: dict = Depends(get_current_user)):
    if user.get("role") != "Admin": raise HTTPException(status_code=403, detail="Forbidden")
    with Connection(**db_params) as conn:
        conn.run("UPDATE Leads SET State = 'LOST' WHERE Id = :id", id=lead_id)
        # We would theoretically send an email here using payload.emailBody
        return {"status": "success", "message": "Lead rejected"}

@app.get("/api/client/projects")
def get_client_projects(user: dict = Depends(get_current_user)):
    uid = user.get("userid") # This is their email
    with get_db() as conn:
        rows = conn.run('''
            SELECT p.Id, l.Name, p.State 
            FROM Projects p 
            JOIN Leads l ON p.LeadId = l.Id 
            WHERE l.Email = :email
        ''', email=uid)
        
        projects = []
        for r in rows:
            projects.append({
                "id": r[0],
                "name": r[1] + " Project",
                "status": r[2],
                "stage": r[2]
            })
        return {"status": "success", "projects": projects}

from fastapi import UploadFile, File, Form
import base64
from fastapi.responses import FileResponse
import os

def verify_project_access(project_id: int, user: dict, conn):
    if user.get("role") == "Admin":
        return True
        
    uid = user.get("userid")
    
    if user.get("role") == "Worker":
        # Check ProjectAssignments
        query = "SELECT 1 FROM ProjectAssignments p JOIN Workers w ON p.WorkerId = w.Id WHERE p.ProjectId = :pid AND w.UserId = :uid"
        if conn.run(query, pid=project_id, uid=uid):
            return True
        raise HTTPException(status_code=403, detail="Forbidden: You are not assigned to this project.")
    
    # Otherwise assume Client (Check if project belongs to Client)
    query = """
        SELECT 1 FROM Projects p 
        JOIN Leads l ON p.LeadId = l.Id 
        WHERE p.Id = :pid AND l.Email = :uid
    """
    rows = conn.run(query, pid=project_id, uid=uid)
    if not rows:
        raise HTTPException(status_code=403, detail="Forbidden: You do not have access to this project.")
    return True

@app.post("/api/projects/{project_id}/documents")
async def upload_document(
    project_id: int, 
    file: UploadFile = File(...), 
    doc_type: str = Form("GENERAL"),
    target_phase: Optional[str] = Form(None),
    user: dict = Depends(get_current_user)
):
    with get_db() as conn:
        verify_project_access(project_id, user, conn)
        
    # Security: Workers can only upload DELIVERABLES
    if user.get("role") == "Worker":
        doc_type = "DELIVERABLE"
        
    req_id = str(uuid.uuid4())
    content = await file.read()
    b64_content = base64.b64encode(content).decode('utf-8')
    
    broker.publish({
        "type": "UPLOAD_DOCUMENT",
        "project_id": project_id,
        "filename": file.filename,
        "doc_type": doc_type,
        "target_phase": target_phase,
        "b64_content": b64_content,
        "uploaded_by": user.get("userid"),
        "req_id": req_id
    })
    
    return {"status": "accepted", "filename": file.filename, "msg": "Document is being securely processed by the VaultKeeper"}


@app.get("/api/projects/{project_id}/phases")
def get_project_phases(project_id: int, user: dict = Depends(get_current_user)):
    with Connection(**db_params) as conn:
        # Verify access
        verify_project_access(project_id, user, conn)
            
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

@app.get("/api/projects/{project_id}/documents")
def list_documents(project_id: int, user: dict = Depends(get_current_user)):
    with get_db() as conn:
        verify_project_access(project_id, user, conn)
        rows = conn.run("SELECT Id, Filename, DocumentType, Status, TargetPhase, UploadedAt, UploadedBy FROM ProjectDocuments WHERE ProjectId = :pid", pid=project_id)
        
    docs = [{"id": r[0], "filename": r[1], "type": r[2], "status": r[3], "target_phase": r[4], "uploaded_at": r[5], "uploaded_by": r[6]} for r in rows]
    return {"status": "success", "documents": docs}

@app.get("/api/projects/{project_id}/documents/{doc_id}/download")
def download_document(project_id: int, doc_id: int, user: dict = Depends(get_current_user)):
    with get_db() as conn:
        verify_project_access(project_id, user, conn)
        rows = conn.run("SELECT FilePath, Filename FROM ProjectDocuments WHERE Id = :doc_id AND ProjectId = :pid", doc_id=doc_id, pid=project_id)
        
    if not rows:
        raise HTTPException(status_code=404, detail="Document not found")
        
    file_path, filename = rows[0]
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Physical file not found in Vault")
        
    return FileResponse(path=file_path, filename=filename)

from service_catalog import ServiceCatalog
from portfolio_manager import PortfolioManager


@app.get("/api/services")
def list_services():
    catalog = ServiceCatalog(get_db)
    return {"status": "success", "services": catalog.get_all_services(include_inactive=False)}

@app.get("/api/admin/services")
def admin_list_services(user: dict = Depends(get_current_user)):
    if user.get("role") != "Admin": raise HTTPException(status_code=403, detail="Forbidden")
    catalog = ServiceCatalog(get_db)
    return catalog.get_all_services(include_inactive=True)

class CreateServiceModel(BaseModel):
    name: str
    description: str
    price: float

@app.post("/api/admin/services")
def create_service(data: CreateServiceModel, user: dict = Depends(get_current_user)):
    if user.get("role") != "Admin": raise HTTPException(status_code=403, detail="Forbidden")
    catalog = ServiceCatalog(get_db)
    # Check duplicate
    existing = catalog.get_all_services(include_inactive=True)
    if any(s["name"].lower() == data.name.lower() for s in existing["services"] if isinstance(existing, dict)): pass
    # Actually get_all_services returns a list or dict? It returns a dict in main_api but wait...
    # Ah, get_all_services returns the list directly!
    # Let me check service_catalog.py again. Yes, it returns a list `[{"id": ...}]`.
    
    existing = catalog.get_all_services(include_inactive=True)
    if any(s["name"].lower() == data.name.lower() for s in existing):
        raise HTTPException(status_code=400, detail="A service with this name already exists.")
        
    svc_id = catalog.create_service(data.name, data.description, data.price)
    broker.publish({"type": "CREATE_SERVICE", "actor": user.get("userid"), "entity_id": svc_id, "name": data.name, "price": data.price})
    return {"status": "success", "service_id": svc_id, "msg": "Service published to website"}

class UpdateServiceModel(BaseModel):
    name: str
    description: str
    price: float
    is_active: bool

@app.patch("/api/admin/services/{service_id}")
def update_service(service_id: int, data: UpdateServiceModel, user: dict = Depends(get_current_user)):
    if user.get("role") != "Admin": raise HTTPException(status_code=403, detail="Forbidden")
    catalog = ServiceCatalog(get_db)
    
    # Check duplicate on rename
    existing = catalog.get_all_services(include_inactive=True)
    if any(s["name"].lower() == data.name.lower() and s["id"] != service_id for s in existing):
        raise HTTPException(status_code=400, detail="Another service with this name already exists.")
        
    catalog.update_service(service_id, data.name, data.description, data.price, data.is_active)
    broker.publish({"type": "UPDATE_SERVICE", "actor": user.get("userid"), "entity_id": service_id, "name": data.name, "price": data.price, "is_active": data.is_active})
    return {"status": "success", "msg": "Service updated successfully"}

class ServiceQuoteModel(BaseModel):
    service_ids: list[int]

@app.post("/api/services/quote")
def quote_services(data: ServiceQuoteModel, user: dict = Depends(get_current_user)):
    catalog = ServiceCatalog(get_db)
    # Apply a discount if the user is a repeat client (business logic hook)
    total, names = catalog.calculate_project_quote(data.service_ids, apply_bulk_discount=True)
    return {"quote_total": total, "services": names}

class InvoiceRequestModel(BaseModel):
    target_phase: str
    service_ids: list[int]

@app.post("/api/projects/{project_id}/invoices")
def generate_invoice(project_id: int, data: InvoiceRequestModel, user: dict = Depends(get_current_user)):
    if user.get("role") != "Admin":
        raise HTTPException(status_code=403, detail="Forbidden")
        
    catalog = ServiceCatalog(get_db)
    total_due, names = catalog.calculate_project_quote(data.service_ids)
    
    req_id = str(uuid.uuid4())
    event = threading.Event()
    pending_requests[req_id] = {"event": event, "response": None}
    
    broker.publish({
        "type": "GENERATE_INVOICE",
        "project_id": project_id,
        "target_phase": data.target_phase,
        "amount_due": total_due,
        "service_names": names,
        "req_id": req_id
    })
    event.wait(5.0)
    
    res = pending_requests.pop(req_id, {}).get("response")
    if res and res["type"] == "INVOICE_GENERATED":
        return {"status": "success", "invoice_id": res["invoice_id"], "amount_due": total_due}
    raise HTTPException(status_code=504, detail="Broker timeout")

@app.post("/api/projects/{project_id}/documents/{doc_id}/sign")
def sign_document(project_id: int, doc_id: int, user: dict = Depends(get_current_user)):
    # Verify the user actually owns this project (or is an Admin)
    with get_db() as conn:
        verify_project_access(project_id, user, conn)
        
    broker.publish({
        "type": "MARK_DOCUMENT_SIGNED",
        "doc_id": doc_id
    })
    return {"status": "success", "msg": "Document marked as SIGNED"}

class PaymentModel(BaseModel):
    amount: float
    target_phase: str

@app.post("/api/projects/{project_id}/payments")
def submit_payment(project_id: int, data: PaymentModel, user: dict = Depends(get_current_user)):
    req_id = str(uuid.uuid4())
    event = threading.Event()
    pending_requests[req_id] = {"event": event, "response": None}
    
    broker.publish({
        "type": "SUBMIT_PAYMENT",
        "project_id": project_id,
        "amount": data.amount,
        "target_phase": data.target_phase,
        "req_id": req_id
    })
    event.wait(5.0)
    
    res = pending_requests.pop(req_id, {}).get("response")
    if res and res["type"] == "PAYMENT_SUCCESS":
        return {"status": "success", "msg": "Payment processed successfully"}
    raise HTTPException(status_code=504, detail="Broker timeout")

# -----------------
# WORKER MANAGEMENT
# -----------------
class CreateWorkerModel(BaseModel):
    email: str
    specialty: str
    hourly_rate: float

@app.post("/api/admin/workers")
def create_worker(data: CreateWorkerModel, user: dict = Depends(get_current_user)):
    if user.get("role") != "Admin": raise HTTPException(status_code=403, detail="Forbidden")
    
    req_id = str(uuid.uuid4())
    event = threading.Event()
    pending_requests[req_id] = {"event": event, "response": None}
    
    broker.publish({
        "type": "CREATE_WORKER",
        "email": data.email,
        "specialty": data.specialty,
        "hourly_rate": data.hourly_rate,
        "req_id": req_id
    })
    
    # Auto-commission the User account
    broker.publish({
        "type": "COMMISSION_USER",
        "userid": data.email,
        "password": "worker_password_123", # In prod, generate random
        "recovery": "worker_recovery",
        "role": "Worker",
        "token": "SYSTEM"
    })
    
    event.wait(5.0)
    res = pending_requests.pop(req_id, {}).get("response")
    if res and res["type"] == "WORKER_CREATED":
        return {"status": "success", "worker_id": res["worker_id"]}
    raise HTTPException(status_code=504, detail="Broker timeout")

class AssignWorkerModel(BaseModel):
    worker_id: int
    worker_email: str
    target_phase: str

@app.post("/api/projects/{project_id}/assign")
def assign_worker(project_id: int, data: AssignWorkerModel, user: dict = Depends(get_current_user)):
    if user.get("role") != "Admin": raise HTTPException(status_code=403, detail="Forbidden")
    
    req_id = str(uuid.uuid4())
    event = threading.Event()
    pending_requests[req_id] = {"event": event, "response": None}
    
    broker.publish({
        "type": "ASSIGN_WORKER",
        "project_id": project_id,
        "worker_id": data.worker_id,
        "worker_email": data.worker_email,
        "target_phase": data.target_phase,
        "req_id": req_id
    })
    event.wait(5.0)
    res = pending_requests.pop(req_id, {}).get("response")
    if res and res["type"] == "ASSIGNMENT_SUCCESS":
        return {"status": "success", "msg": "Worker assigned successfully"}
    raise HTTPException(status_code=504, detail="Broker timeout")

@app.get("/api/worker/projects")
def get_worker_projects(user: dict = Depends(get_current_user)):
    if user.get("role") != "Worker": raise HTTPException(status_code=403, detail="Forbidden: Workers only")
    
    uid = user.get("userid")
    with get_db() as conn:
        query = """
            SELECT p.Id, p.State, a.TargetPhase, a.AssignedAt 
            FROM ProjectAssignments a
            JOIN Projects p ON a.ProjectId = p.Id
            JOIN Workers w ON a.WorkerId = w.Id
            WHERE w.UserId = :uid
        """
        rows = conn.run(query, uid=uid)
    return {"status": "success", "assignments": [{"project_id": r[0], "project_state": r[1], "assigned_phase": r[2], "assigned_at": r[3]} for r in rows]}

if __name__ == "__main__":
    uvicorn.run("main_api:app", host="127.0.0.1", port=8081, reload=True)


# --- PORTFOLIO ---

@app.get("/api/portfolio")
def list_portfolio():
    mgr = PortfolioManager(get_db)
    return {"status": "success", "portfolio": mgr.get_all(include_inactive=False)}

@app.get("/api/portfolio/{p_id}")
def get_portfolio(p_id: int):
    mgr = PortfolioManager(get_db)
    p = mgr.get_by_id(p_id)
    if not p: raise HTTPException(status_code=404, detail="Project not found")
    return {"status": "success", "project": p}

@app.get("/api/admin/portfolio")
def admin_list_portfolio(user: dict = Depends(get_current_user)):
    if user.get("role") != "Admin": raise HTTPException(status_code=403, detail="Forbidden")
    mgr = PortfolioManager(get_db)
    return mgr.get_all(include_inactive=True)

class PortfolioModel(BaseModel):
    title: str
    client: str = ""
    category: str = ""
    description: str = ""
    challenges: str = ""
    solutions: str = ""
    tech_stack: str = ""
    timeline: str = ""
    roi: str = ""
    image_url: str = ""
    is_active: bool = True

@app.post("/api/admin/portfolio")
def create_portfolio(data: PortfolioModel, user: dict = Depends(get_current_user)):
    if user.get("role") != "Admin": raise HTTPException(status_code=403, detail="Forbidden")
    mgr = PortfolioManager(get_db)
    p_id = mgr.create(data.dict())
    broker.publish({"type": "CREATE_PORTFOLIO", "actor": user.get("userid"), "entity_id": p_id, "title": data.title})
    return {"status": "success", "id": p_id}

@app.patch("/api/admin/portfolio/{p_id}")
def update_portfolio(p_id: int, data: PortfolioModel, user: dict = Depends(get_current_user)):
    if user.get("role") != "Admin": raise HTTPException(status_code=403, detail="Forbidden")
    mgr = PortfolioManager(get_db)
    mgr.update(p_id, data.dict())
    broker.publish({"type": "UPDATE_PORTFOLIO", "actor": user.get("userid"), "entity_id": p_id, "title": data.title, "is_active": data.is_active})
    return {"status": "success"}


# --- NEW TELEMETRY ENDPOINTS ---
from fastapi import Request
from pg8000.native import Connection

@app.post("/api/telemetry")
async def receive_telemetry(request: Request):
    """Catches Beacon API payloads and forwards them to AuditKeeper via Redis"""
    try:
        data = await request.json()
        # Add the type for the broker to recognize it as a generic log
        data["type"] = "UX_TELEMETRY"
        broker.publish(data)
        return {"status": "ok"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}

@app.get("/api/telemetry/funnel")
def get_funnel_analytics():
    """Queries the JSONB AuditLogs table to calculate drop-offs"""
    try:
        # Re-using the db_params defined at the top of main_api.py
        with Connection(**db_params) as conn:
            # We use Postgres JSONB operators to extract the funnel numbers
            # This is extremely fast because of the GIN index we added!
            rows = conn.run("""
                SELECT 
                    COUNT(*) FILTER (WHERE "DeltaData"->>'event_type' = 'qualified') as qualified,
                    COUNT(*) FILTER (WHERE "DeltaData"->>'event_type' = 'phase-selected') as phase_selected,
                    COUNT(*) FILTER (WHERE "DeltaData"->>'event_type' = 'stage-changed') as stage_changed
                FROM "AuditLogs"
                WHERE "Entity" = 'Project'
            """)
            
            if rows and len(rows) > 0:
                qualified, phase_selected, stage_changed = rows[0]
            else:
                qualified, phase_selected, stage_changed = 0, 0, 0
                
            return {
                "started": stage_changed, # Rough proxy for starts
                "phase_selected": phase_selected,
                "qualified": qualified,
                "architecture": int(qualified * 0.3), # Dummy drop-off for demo
                "closed": int(qualified * 0.1)        # Dummy drop-off for demo
            }
    except Exception as e:
        print("Telemetry DB Error:", e)
        return {"error": str(e)}
# --- END TELEMETRY ENDPOINTS ---
