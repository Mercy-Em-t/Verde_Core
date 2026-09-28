import datetime
from pg8000.native import Connection

class StorageKeeper:
    def __init__(self, broker, db_params):
        self.broker = broker
        self.broker.subscribe(self)
        self.db_params = db_params
        self._init_db()
        
    def get_connection(self):
        return Connection(**self.db_params)

    def _init_db(self):
        with self.get_connection() as conn:
            conn.run('''
                CREATE TABLE IF NOT EXISTS VerdeData (
                    Id SERIAL PRIMARY KEY,
                    DataKey VARCHAR NOT NULL,
                    DataValue VARCHAR NOT NULL,
                    Timestamp TIMESTAMP NOT NULL,
                    State VARCHAR DEFAULT 'DRAFT',
                    OwnerId VARCHAR DEFAULT 'System'
                )
            ''')
            
            conn.run('''
                CREATE TABLE IF NOT EXISTS Leads (
                    Id SERIAL PRIMARY KEY,
                    Name VARCHAR NOT NULL,
                    Email VARCHAR NOT NULL,
                    Message TEXT NOT NULL,
                    State VARCHAR DEFAULT 'NEW',
                    CreatedAt TIMESTAMP NOT NULL
                )
            ''')
            
            conn.run('''
                CREATE TABLE IF NOT EXISTS Clients (
                    Id SERIAL PRIMARY KEY,
                    LeadId INT REFERENCES Leads(Id),
                    Name VARCHAR NOT NULL,
                    CreatedAt TIMESTAMP NOT NULL
                )
            ''')
            
            conn.run('''
                CREATE TABLE IF NOT EXISTS Projects (
                    Id SERIAL PRIMARY KEY,
                    ClientId INT REFERENCES Clients(Id),
                    LeadId INT REFERENCES Leads(Id),
                    State VARCHAR DEFAULT 'PRE_ENGAGEMENT',
                    StartPhase VARCHAR,
                    EndPhase VARCHAR,
                    IsRetainer BOOLEAN DEFAULT FALSE,
                    CreatedAt TIMESTAMP NOT NULL
                )
            ''')
            
            conn.run('''
                CREATE TABLE IF NOT EXISTS Services (
                    Id SERIAL PRIMARY KEY,
                    ServiceName VARCHAR NOT NULL,
                    Description TEXT,
                    Price NUMERIC
                )
            ''')
            
            conn.run('''
                CREATE TABLE IF NOT EXISTS Payments (
                    Id SERIAL PRIMARY KEY,
                    ProjectId INT REFERENCES Projects(Id),
                    ClientId INT REFERENCES Clients(Id),
                    Amount NUMERIC NOT NULL,
                    Status VARCHAR DEFAULT 'PENDING',
                    PaymentDate TIMESTAMP NOT NULL
                )
            ''')
            
            conn.run('''
                CREATE TABLE IF NOT EXISTS Workers (
                    Id SERIAL PRIMARY KEY,
                    UserId VARCHAR NOT NULL,
                    Specialty VARCHAR,
                    HourlyRate NUMERIC
                )
            ''')
            
            conn.run('''
                CREATE TABLE IF NOT EXISTS ProjectDocuments (
                    Id SERIAL PRIMARY KEY,
                    ProjectId INT REFERENCES Projects(Id),
                    Filename VARCHAR NOT NULL,
                    FilePath VARCHAR NOT NULL,
                    UploadedBy VARCHAR NOT NULL,
                    UploadedAt TIMESTAMP NOT NULL
                )
            ''')
            
            # Enterprise Database Migrations (Adding columns if they don't exist)
            try: conn.run("ALTER TABLE ProjectDocuments ADD COLUMN IF NOT EXISTS DocumentType VARCHAR DEFAULT 'GENERAL'")
            except: pass
            try: conn.run("ALTER TABLE ProjectDocuments ADD COLUMN IF NOT EXISTS Status VARCHAR DEFAULT 'EXPECTED'")
            except: pass
            try: conn.run("ALTER TABLE ProjectDocuments ADD COLUMN IF NOT EXISTS TargetPhase VARCHAR")
            except: pass
            
            try: conn.run("ALTER TABLE Payments ADD COLUMN IF NOT EXISTS TargetPhase VARCHAR")
            except: pass
            try: conn.run("ALTER TABLE Payments ADD COLUMN IF NOT EXISTS AmountPaid NUMERIC DEFAULT 0")
            except: pass
            try: conn.run("ALTER TABLE Services ADD COLUMN IF NOT EXISTS IsActive BOOLEAN DEFAULT TRUE")
            except: pass
            
            conn.run('''
                CREATE TABLE IF NOT EXISTS ProjectAssignments (
                    Id SERIAL PRIMARY KEY,
                    ProjectId INT REFERENCES Projects(Id),
                    WorkerId INT REFERENCES Workers(Id),
                    TargetPhase VARCHAR NOT NULL,
                    AssignedAt TIMESTAMP NOT NULL
                )
            ''')
            
            conn.run('''
                CREATE TABLE IF NOT EXISTS AuditLogs (
                    Id SERIAL PRIMARY KEY,
                    Timestamp TIMESTAMP NOT NULL,
                    Actor VARCHAR,
                    Action VARCHAR NOT NULL,
                    Entity VARCHAR,
                    EntityId VARCHAR,
                    DeltaData JSONB
                )
            ''')
            
            conn.run('''
                CREATE TABLE IF NOT EXISTS Portfolio (
                    Id SERIAL PRIMARY KEY,
                    Title VARCHAR NOT NULL,
                    ClientName VARCHAR,
                    Category VARCHAR,
                    Description TEXT,
                    Challenges TEXT,
                    Solutions TEXT,
                    TechStack VARCHAR,
                    Timeline VARCHAR,
                    ROI VARCHAR,
                    ImageUrl VARCHAR,
                    IsActive BOOLEAN DEFAULT TRUE
                )
            ''')

    def receive_message(self, msg):
        event_type = msg.get("type")
        
        if event_type == "STORE":
            owner = msg.get("owner_id", "System")
            with self.get_connection() as conn:
                timestamp = datetime.datetime.now()
                conn.run("INSERT INTO VerdeData (DataKey, DataValue, Timestamp, State, OwnerId) VALUES (:key, :val, :ts, 'DRAFT', :owner)",
                         key=msg["key"], val=msg["val"], ts=timestamp, owner=owner)
            self.broker.publish({"type": "LOG", "msg": f"Stored: {msg['key']} by {owner}"})
            
        elif event_type == "UPDATE_STATE":
            item_id = msg["item_id"]
            new_state = msg["new_state"]
            with self.get_connection() as conn:
                conn.run("UPDATE VerdeData SET State = :state WHERE Id = :id", state=new_state, id=item_id)
            self.broker.publish({"type": "LOG", "msg": f"Item {item_id} transitioned to {new_state}"})
            
        elif event_type == "CREATE_LEAD":
            with self.get_connection() as conn:
                timestamp = datetime.datetime.now()
                # pg8000 supports RETURNING to get the ID
                result = conn.run("INSERT INTO Leads (Name, Email, Message, CreatedAt) VALUES (:name, :email, :msg, :ts) RETURNING Id",
                                  name=msg["name"], email=msg["email"], msg=msg["message"], ts=timestamp)
                lead_id = result[0][0]
            self.broker.publish({"type": "LOG", "msg": f"New Lead captured: {lead_id}"})
            # Always broadcast LEAD_CREATED so CommunicationKeeper hears it, regardless of req_id
            event_payload = {"type": "LEAD_CREATED", "lead_id": lead_id, "name": msg["name"], "email": msg["email"]}
            if msg.get("req_id"):
                event_payload["req_id"] = msg["req_id"]
            self.broker.publish(event_payload)
                
        elif event_type == "CONVERT_LEAD":
            lead_id = msg["lead_id"]
            start_phase = msg.get("start_phase")
            end_phase = msg.get("end_phase")
            is_retainer = msg.get("is_retainer", False)
            req_id = msg.get("req_id")
            
            success = False
            error_msg = ""
            with self.get_connection() as conn:
                try:
                    # 1. Fetch Lead
                    lead = conn.run("SELECT Name FROM Leads WHERE Id = :id", id=lead_id)
                    if not lead:
                        raise ValueError("Lead not found")
                        
                    lead_name = lead[0][0]
                    timestamp = datetime.datetime.now()
                    
                    # 2. Create Client
                    client_res = conn.run("INSERT INTO Clients (LeadId, Name, CreatedAt) VALUES (:lid, :name, :ts) RETURNING Id",
                                          lid=lead_id, name=lead_name, ts=timestamp)
                    client_id = client_res[0][0]
                    
                    # 3. Create Project
                    project_res = conn.run('''INSERT INTO Projects (ClientId, LeadId, StartPhase, EndPhase, IsRetainer, CreatedAt) 
                                              VALUES (:cid, :lid, :sp, :ep, :ret, :ts) RETURNING Id''',
                                           cid=client_id, lid=lead_id, sp=start_phase, ep=end_phase, ret=is_retainer, ts=timestamp)
                    project_id = project_res[0][0]
                    
                    # 4. Mark Lead as CONVERTED
                    conn.run("UPDATE Leads SET State = 'CONVERTED' WHERE Id = :id", id=lead_id)
                    
                    success = True
                except Exception as e:
                    error_msg = str(e)
                    
            if success:
                if req_id:
                    self.broker.publish({"type": "LEAD_CONVERTED_SUCCESS", "client_id": client_id, "project_id": project_id, "req_id": req_id})
                self.broker.publish({"type": "LOG", "msg": f"Lead {lead_id} fully converted to Client {client_id} & Project {project_id}"})
            else:
                if req_id:
                    self.broker.publish({"type": "LEAD_CONVERTED_FAILED", "msg": error_msg, "req_id": req_id})
                    
        elif event_type == "DOCUMENT_SAVED":
            with self.get_connection() as conn:
                timestamp = datetime.datetime.now()
                doctype = msg.get("doc_type", "GENERAL")
                target_phase = msg.get("target_phase")
                status = "UPLOADED"
                conn.run('''INSERT INTO ProjectDocuments (ProjectId, Filename, FilePath, UploadedBy, UploadedAt, DocumentType, Status, TargetPhase) 
                            VALUES (:pid, :fname, :fpath, :uploader, :ts, :dtype, :stat, :tphase)''',
                         pid=msg["project_id"], fname=msg["filename"], fpath=msg["filepath"], 
                         uploader=msg["uploaded_by"], ts=timestamp, dtype=doctype, stat=status, tphase=target_phase)
            self.broker.publish({"type": "LOG", "msg": f"Document {msg['filename']} registered in database for Project {msg['project_id']}"})
            if msg.get("req_id"):
                self.broker.publish({"type": "DOCUMENT_REGISTERED", "req_id": msg["req_id"]})
                
        elif event_type == "MARK_DOCUMENT_SIGNED":
            with self.get_connection() as conn:
                conn.run("UPDATE ProjectDocuments SET Status = 'SIGNED' WHERE Id = :id", id=msg["doc_id"])
            self.broker.publish({"type": "LOG", "msg": f"Document {msg['doc_id']} marked as SIGNED"})
            
        elif event_type == "CREATE_WORKER":
            with self.get_connection() as conn:
                res = conn.run("INSERT INTO Workers (UserId, Specialty, HourlyRate) VALUES (:uid, :spec, :rate) RETURNING Id",
                               uid=msg["email"], spec=msg["specialty"], rate=msg["hourly_rate"])
            self.broker.publish({"type": "LOG", "msg": f"Worker {msg['email']} registered."})
            if msg.get("req_id"):
                self.broker.publish({"type": "WORKER_CREATED", "worker_id": res[0][0], "req_id": msg["req_id"]})
                
        elif event_type == "ASSIGN_WORKER":
            with self.get_connection() as conn:
                timestamp = datetime.datetime.now()
                conn.run("INSERT INTO ProjectAssignments (ProjectId, WorkerId, TargetPhase, AssignedAt) VALUES (:pid, :wid, :tphase, :ts)",
                         pid=msg["project_id"], wid=msg["worker_id"], tphase=msg["target_phase"], ts=timestamp)
            self.broker.publish({"type": "LOG", "msg": f"Worker {msg['worker_id']} assigned to Project {msg['project_id']}"})
            
            # Broadcast for CommunicationKeeper to send email
            self.broker.publish({"type": "WORKER_ASSIGNED", "worker_email": msg["worker_email"], "project_id": msg["project_id"], "target_phase": msg["target_phase"]})
            
            if msg.get("req_id"):
                self.broker.publish({"type": "ASSIGNMENT_SUCCESS", "req_id": msg["req_id"]})
                    
        elif event_type == "RETRIEVE" and msg.get("table", "VerdeData") == "VerdeData":
            owner_filter = msg.get("owner_filter")
            with self.get_connection() as conn:
                if owner_filter:
                    rows = conn.run("SELECT Id, DataKey, DataValue, Timestamp, State, OwnerId FROM VerdeData WHERE OwnerId = :owner", owner=owner_filter)
                else:
                    rows = conn.run("SELECT Id, DataKey, DataValue, Timestamp, State, OwnerId FROM VerdeData")
            
            # Format timestamp for JSON serialization
            formatted_rows = []
            for r in rows:
                formatted_rows.append((r[0], r[1], r[2], r[3].isoformat() if hasattr(r[3], 'isoformat') else r[3], r[4], r[5]))
                
            response = {"type": "DATA_RETRIEVED", "columns": ("ID", "Key", "Value", "Timestamp", "State", "Owner"), "rows": formatted_rows}
            if "req_id" in msg: response["req_id"] = msg["req_id"]
            self.broker.publish(response)
