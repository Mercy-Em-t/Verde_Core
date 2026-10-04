import tkinter as tk
from tkinter import messagebox, ttk
import sqlite3
import datetime
import hashlib
import secrets
import string
import json
import threading
import uuid
from http.server import HTTPServer, BaseHTTPRequestHandler

# --- MESSAGING ARCHITECTURE ---
class MessageBroker:
    def __init__(self):
        self._subscribers = []

    def subscribe(self, subscriber):
        if subscriber not in self._subscribers:
            self._subscribers.append(subscriber)

    def unsubscribe(self, subscriber):
        if subscriber in self._subscribers:
            self._subscribers.remove(subscriber)

    def publish(self, message):
        for sub in self._subscribers:
            sub.receive_message(message)

# --- BACKEND COMPONENTS ---
class ObjectScanner:
    def __init__(self, broker):
        self.broker = broker

    def scan_input(self, raw_input):
        parts = raw_input.strip().split()
        if not parts: return

        cmd = parts[0].lower()
        if cmd == "store" and len(parts) >= 3:
            key, val = parts[1], " ".join(parts[2:])
            self.broker.publish({"type": "STORE", "key": key, "val": val})
        elif cmd == "retrieve":
            table = parts[1] if len(parts) > 1 else "VerdeData"
            self.broker.publish({"type": "RETRIEVE", "table": table})
        else:
            self.broker.publish({"type": "LOG", "msg": f"Unknown command: {raw_input}"})

class StorageKeeper:
    def __init__(self, broker):
        self.broker = broker
        self.db_name = "verde.db"
        self._init_db()
        self.broker.subscribe(self)

    def _init_db(self):
        with sqlite3.connect(self.db_name) as conn:
            conn.execute('''CREATE TABLE IF NOT EXISTS VerdeData 
                            (Id INTEGER PRIMARY KEY, DataKey TEXT, DataValue TEXT, Timestamp DATETIME)''')
            try:
                conn.execute("ALTER TABLE VerdeData ADD COLUMN State TEXT DEFAULT 'DRAFT'")
                conn.execute("ALTER TABLE VerdeData ADD COLUMN OwnerId TEXT DEFAULT 'System'")
            except sqlite3.OperationalError:
                pass

    def receive_message(self, msg):
        if msg["type"] == "STORE":
            owner = msg.get("owner_id", "System")
            with sqlite3.connect(self.db_name) as conn:
                timestamp = datetime.datetime.now().isoformat()
                conn.execute("INSERT INTO VerdeData (DataKey, DataValue, Timestamp, State, OwnerId) VALUES (?, ?, ?, 'DRAFT', ?)", 
                             (msg["key"], msg["val"], timestamp, owner))
            self.broker.publish({"type": "LOG", "msg": f"Stored: {msg['key']} by {owner}"})
            
        elif msg["type"] == "UPDATE_STATE":
            item_id = msg["item_id"]
            new_state = msg["new_state"]
            with sqlite3.connect(self.db_name) as conn:
                conn.execute("UPDATE VerdeData SET State = ? WHERE Id = ?", (new_state, item_id))
            self.broker.publish({"type": "LOG", "msg": f"Item {item_id} transitioned to {new_state}"})
            
        elif msg["type"] == "RETRIEVE" and msg.get("table", "VerdeData") == "VerdeData":
            owner_filter = msg.get("owner_filter")
            with sqlite3.connect(self.db_name) as conn:
                if owner_filter:
                    cur = conn.execute("SELECT Id, DataKey, DataValue, Timestamp, State, OwnerId FROM VerdeData WHERE OwnerId = ?", (owner_filter,))
                else:
                    cur = conn.execute("SELECT Id, DataKey, DataValue, Timestamp, State, OwnerId FROM VerdeData")
                rows = cur.fetchall()
            response = {"type": "DATA_RETRIEVED", "columns": ("ID", "Key", "Value", "Timestamp", "State", "Owner"), "rows": rows}
            if "req_id" in msg: response["req_id"] = msg["req_id"]
            self.broker.publish(response)

class GateKeeper:
    def __init__(self, broker):
        self.broker = broker
        self.db_name = "verde.db"
        self.active_sessions = {} # token -> {"userid": uid, "role": role}
        self._init_db()
        self.broker.subscribe(self)

    def _init_db(self):
        with sqlite3.connect(self.db_name) as conn:
            conn.execute('''CREATE TABLE IF NOT EXISTS Users 
                            (UserId TEXT PRIMARY KEY, PasswordHash TEXT, RecoveryHash TEXT, FailedAttempts INTEGER, IsLocked BOOLEAN, Role TEXT)''')
            # Attempt to upgrade legacy tables if they don't have the Role column
            try:
                conn.execute("ALTER TABLE Users ADD COLUMN Role TEXT DEFAULT 'User'")
            except sqlite3.OperationalError:
                pass

    def _hash(self, text):
        return hashlib.sha256(text.encode()).hexdigest()

    def receive_message(self, msg):
        if msg["type"] == "CHECK_SETUP":
            with sqlite3.connect(self.db_name) as conn:
                cur = conn.execute("SELECT COUNT(*) FROM Users")
                if cur.fetchone()[0] == 0:
                    self.broker.publish({"type": "SYS_NEEDS_SETUP"})
                else:
                    self.broker.publish({"type": "SYS_NEEDS_LOGIN"})
                    
        elif msg["type"] == "CREATE_ADMIN":
            uid, pwd, rec = msg["userid"], msg["password"], msg["recovery"]
            with sqlite3.connect(self.db_name) as conn:
                try:
                    conn.execute("INSERT INTO Users (UserId, PasswordHash, RecoveryHash, FailedAttempts, IsLocked, Role) VALUES (?, ?, ?, 0, 0, 'Admin')",
                                 (uid, self._hash(pwd), self._hash(rec)))
                    self.broker.publish({"type": "SETUP_COMPLETE"})
                except sqlite3.IntegrityError:
                    self.broker.publish({"type": "LOG", "msg": f"Error: User {uid} already exists."})

        elif msg["type"] == "COMMISSION_USER":
            token = msg.get("token")
            # SECURITY VALIDATION: Enforce Session Token & Role
            if token not in self.active_sessions or self.active_sessions[token]["role"] != "Admin":
                self.broker.publish({"type": "LOG", "msg": "SECURITY ALERT: Unauthorized attempt to commission an account!"})
                return

            uid, pwd, rec, role = msg["userid"], msg["password"], msg["recovery"], msg.get("role", "User")
            with sqlite3.connect(self.db_name) as conn:
                try:
                    conn.execute("INSERT INTO Users (UserId, PasswordHash, RecoveryHash, FailedAttempts, IsLocked, Role) VALUES (?, ?, ?, 0, 0, ?)",
                                 (uid, self._hash(pwd), self._hash(rec), role))
                    self.broker.publish({"type": "LOG", "msg": f"Account commissioned: {uid} as {role}"})
                except sqlite3.IntegrityError:
                    self.broker.publish({"type": "LOG", "msg": f"Error: User {uid} already exists."})

        elif msg["type"] == "AUTH_ATTEMPT":
            uid, pwd = msg["userid"], msg["password"]
            req_id = msg.get("req_id")
            
            response = None

            with sqlite3.connect(self.db_name) as conn:
                cur = conn.execute("SELECT PasswordHash, FailedAttempts, IsLocked, Role FROM Users WHERE UserId = ? COLLATE NOCASE", (uid,))
                user = cur.fetchone()

                if not user:
                    response = {"type": "AUTH_FAILED", "msg": "User not found."}
                else:
                    db_hash, attempts, is_locked, role = user

                    if is_locked:
                        response = {"type": "AUTH_LOCKED", "userid": uid}
                    elif self._hash(pwd) == db_hash:
                        conn.execute("UPDATE Users SET FailedAttempts = 0 WHERE UserId = ? COLLATE NOCASE", (uid,))
                        # Generate cryptographically secure session token
                        session_token = secrets.token_hex(32)
                        now = datetime.datetime.now().timestamp()
                        self.active_sessions[session_token] = {"userid": uid, "role": role, "created_at": now, "last_active": now}
                        response = {"type": "AUTH_SUCCESS", "userid": uid, "role": role, "token": session_token}
                    else:
                        attempts += 1
                        if attempts >= 3:
                            conn.execute("UPDATE Users SET FailedAttempts = ?, IsLocked = 1 WHERE UserId = ? COLLATE NOCASE", (attempts, uid))
                            response = {"type": "AUTH_LOCKED", "userid": uid}
                        else:
                            conn.execute("UPDATE Users SET FailedAttempts = ? WHERE UserId = ? COLLATE NOCASE", (attempts, uid))
                            response = {"type": "AUTH_FAILED", "userid": uid, "msg": f"Invalid password. Attempt {attempts} of 3."}
                            
            if response:
                if req_id: response["req_id"] = req_id
                self.broker.publish(response)

        elif msg["type"] == "VALIDATE_TOKEN":
            token = msg.get("token")
            req_id = msg.get("req_id")
            if token in self.active_sessions:
                session = self.active_sessions[token]
                now = datetime.datetime.now().timestamp()
                
                # Check Timeouts
                if now - session["last_active"] > 1800: # 30 mins Idle
                    del self.active_sessions[token]
                    self.broker.publish({"type": "TOKEN_INVALID", "req_id": req_id})
                elif now - session["created_at"] > 43200: # 12 hours Absolute
                    del self.active_sessions[token]
                    self.broker.publish({"type": "TOKEN_INVALID", "req_id": req_id})
                else:
                    # Valid, update sliding window
                    session["last_active"] = now
                    self.broker.publish({"type": "TOKEN_VALID", "role": session["role"], "userid": session["userid"], "req_id": req_id})
            else:
                self.broker.publish({"type": "TOKEN_INVALID", "req_id": req_id})

        elif msg["type"] == "LOGOUT_REQUEST":
            token = msg.get("token")
            if token in self.active_sessions:
                uid = self.active_sessions[token]["userid"]
                del self.active_sessions[token]
                self.broker.publish({"type": "LOGOUT_SUCCESS", "userid": uid})

        elif msg["type"] == "RECOVERY_ATTEMPT":
            uid, rec, new_pwd = msg["userid"], msg["recovery"], msg["new_password"]
            success = False
            with sqlite3.connect(self.db_name) as conn:
                cur = conn.execute("SELECT RecoveryHash FROM Users WHERE UserId = ? COLLATE NOCASE", (uid,))
                user = cur.fetchone()
                if user and self._hash(rec) == user[0]:
                    conn.execute("UPDATE Users SET PasswordHash = ?, FailedAttempts = 0, IsLocked = 0 WHERE UserId = ? COLLATE NOCASE", (self._hash(new_pwd), uid))
                    success = True
            
            if success:
                self.broker.publish({"type": "RECOVERY_SUCCESS"})
            else:
                self.broker.publish({"type": "RECOVERY_FAILED"})

        elif msg["type"] == "RETRIEVE" and msg.get("table") == "Users":
            with sqlite3.connect(self.db_name) as conn:
                cur = conn.execute("SELECT UserId, FailedAttempts, IsLocked, Role FROM Users")
                rows = cur.fetchall()
            response = {"type": "DATA_RETRIEVED", "columns": ("User ID", "Failed Attempts", "Account Locked", "Role"), "rows": rows}
            if "req_id" in msg: response["req_id"] = msg["req_id"]
            self.broker.publish(response)

class VerdeAPIHandler(BaseHTTPRequestHandler):
    broker = None
    pending_requests = {} # req_id -> {"event": threading.Event(), "response": None}

    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def _validate_token(self):
        auth_header = self.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "): return False
        token = auth_header.split(" ")[1]
        
        req_id = str(uuid.uuid4())
        event = threading.Event()
        VerdeAPIHandler.pending_requests[req_id] = {"event": event, "response": None}
        
        VerdeAPIHandler.broker.publish({"type": "VALIDATE_TOKEN", "token": token, "req_id": req_id})
        event.wait(2.0)
        
        result = VerdeAPIHandler.pending_requests.pop(req_id, None)
        return result is not None and result["response"] is not None

    def do_GET(self):
        if self.path.startswith("/api/data"):
            session = self._validate_token()
            if not session:
                self.send_response(401)
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(b'{"error": "Unauthorized"}')
                return
                
            req_id = str(uuid.uuid4())
            event = threading.Event()
            VerdeAPIHandler.pending_requests[req_id] = {"event": event, "response": None}
            
            req_msg = {"type": "RETRIEVE", "table": "VerdeData", "req_id": req_id}
            # Enforce ACL
            if session["role"] != "Admin":
                req_msg["owner_filter"] = session["userid"]
                
            VerdeAPIHandler.broker.publish(req_msg)
            event.wait(5.0)
            
            result = VerdeAPIHandler.pending_requests.pop(req_id, None)
            
            if result and result["response"] is not None:
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps(result["response"]).encode())
            else:
                self.send_response(504)
                self.end_headers()
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path.startswith("/api/login"):
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data)
                uid, pwd = data.get("userid"), data.get("password")
                if not uid or not pwd: raise ValueError("userid and password required")

                req_id = str(uuid.uuid4())
                event = threading.Event()
                VerdeAPIHandler.pending_requests[req_id] = {"event": event, "response": None}
                
                # Send Auth attempt to the Broker
                VerdeAPIHandler.broker.publish({"type": "AUTH_ATTEMPT", "userid": uid, "password": pwd, "req_id": req_id})
                event.wait(5.0)
                
                result = VerdeAPIHandler.pending_requests.pop(req_id, None)
                if result and result["response"]:
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self._send_cors_headers()
                    self.end_headers()
                    self.wfile.write(json.dumps(result["response"]).encode())
                else:
                    self.send_response(401)
                    self._send_cors_headers()
                    self.end_headers()
                    self.wfile.write(b'{"error": "Authentication failed or timeout"}')
            except Exception as e:
                self.send_response(400)
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
                
        elif self.path.startswith("/api/store"):
            session = self._validate_token()
            if not session:
                self.send_response(401)
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(b'{"error": "Unauthorized"}')
                return
                
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data)
                if not isinstance(data, dict): raise ValueError("Payload must be a JSON object")
                if "key" not in data or not isinstance(data["key"], str) or not data["key"].strip():
                    raise ValueError("Missing or invalid 'key' string")
                if "value" not in data or not isinstance(data["value"], str) or not data["value"].strip():
                    raise ValueError("Missing or invalid 'value' string")
                    
                VerdeAPIHandler.broker.publish({"type": "STORE", "key": data["key"].strip(), "val": data["value"].strip(), "owner_id": session["userid"]})
                
                self.send_response(201)
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(b'{"status": "success"}')
            except Exception as e:
                self.send_response(400)
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
                
        elif self.path.startswith("/api/upload"):
            session = self._validate_token()
            if not session:
                self.send_response(401)
                self._send_cors_headers()
                self.end_headers()
                return
                
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data)
                file_id = data.get("file_id")
                
                if "chunk" in data:
                    VerdeAPIHandler.broker.publish({"type": "FILE_CHUNK", "file_id": file_id, "chunk_data": data["chunk"]})
                elif data.get("finalize"):
                    VerdeAPIHandler.broker.publish({"type": "FINALIZE_FILE", "file_id": file_id, "filename": data["filename"], "owner_id": session["userid"]})
                    
                self.send_response(200)
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(b'{"status": "success"}')
            except Exception as e:
                self.send_response(400)
                self._send_cors_headers()
                self.end_headers()
                
        elif self.path.startswith("/api/transition"):
            session = self._validate_token()
            if not session:
                self.send_response(401)
                self._send_cors_headers()
                self.end_headers()
                return
                
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data)
                VerdeAPIHandler.broker.publish({"type": "REQUEST_TRANSITION", "item_id": data["item_id"], "new_state": data["new_state"]})
                
                self.send_response(200)
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(b'{"status": "processing"}')
            except Exception as e:
                self.send_response(400)
                self._send_cors_headers()
                self.end_headers()
                
        elif self.path.startswith("/api/logout"):
            auth_header = self.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
                VerdeAPIHandler.broker.publish({"type": "LOGOUT_REQUEST", "token": token})
                
            self.send_response(200)
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(b'{"status": "logged_out"}')
            
        else:
            self.send_response(404)
            self.end_headers()

class WebConnector:
    def __init__(self, broker, port=8080):
        self.broker = broker
        self.port = port
        self.broker.subscribe(self)
        
        # Pass broker reference to the handler class
        VerdeAPIHandler.broker = broker
        
        # Start server in a background daemon thread so it doesn't freeze Tkinter
        self.server = HTTPServer(('127.0.0.1', self.port), VerdeAPIHandler)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.broker.publish({"type": "LOG", "msg": f"WebConnector running on http://127.0.0.1:{self.port}"})

    def receive_message(self, msg):
        # If we see retrieved data meant for an API request, fulfill it!
        if msg["type"] == "DATA_RETRIEVED" and "req_id" in msg:
            req_id = msg["req_id"]
            if req_id in VerdeAPIHandler.pending_requests:
                # Format into JSON dict
                formatted_data = [dict(zip(msg["columns"], row)) for row in msg["rows"]]
                VerdeAPIHandler.pending_requests[req_id]["response"] = formatted_data
                VerdeAPIHandler.pending_requests[req_id]["event"].set()
                
        # If we see auth responses meant for an API request, fulfill it!
        elif msg["type"] in ("AUTH_SUCCESS", "AUTH_FAILED", "AUTH_LOCKED") and "req_id" in msg:
            req_id = msg["req_id"]
            if req_id in VerdeAPIHandler.pending_requests:
                if msg["type"] == "AUTH_SUCCESS":
                    VerdeAPIHandler.pending_requests[req_id]["response"] = {"token": msg["token"], "role": msg["role"]}
                else:
                    VerdeAPIHandler.pending_requests[req_id]["response"] = None # Will cause a 401
                VerdeAPIHandler.pending_requests[req_id]["event"].set()
                
        # If we see token validation responses meant for an API request, fulfill it!
        elif msg["type"] in ("TOKEN_VALID", "TOKEN_INVALID") and "req_id" in msg:
            req_id = msg["req_id"]
            if req_id in VerdeAPIHandler.pending_requests:
                if msg["type"] == "TOKEN_VALID":
                    VerdeAPIHandler.pending_requests[req_id]["response"] = {"role": msg["role"], "userid": msg["userid"]}
                else:
                    VerdeAPIHandler.pending_requests[req_id]["response"] = None
                VerdeAPIHandler.pending_requests[req_id]["event"].set()

class StateMachineManager:
    def __init__(self, broker):
        self.broker = broker
        self.broker.subscribe(self)
        self.db_name = "verde.db"
        
        # Strict Workflow Guardrails
        self.rules = {
            "DRAFT": ["REVIEW", "CANCELLED"],
            "REVIEW": ["APPROVED", "REJECTED"],
            "APPROVED": ["PUBLISHED"],
            "REJECTED": ["DRAFT"],
            "CANCELLED": []
        }

    def receive_message(self, msg):
        if msg["type"] == "REQUEST_TRANSITION":
            item_id = msg["item_id"]
            requested_state = msg["new_state"]
            
            with sqlite3.connect(self.db_name) as conn:
                cur = conn.execute("SELECT State FROM VerdeData WHERE Id = ?", (item_id,))
                row = cur.fetchone()
                
            if not row:
                self.broker.publish({"type": "LOG", "msg": f"StateMachine Error: Item {item_id} not found."})
                return
                
            current_state = row[0]
            
            # Enforce Guardrails
            allowed_transitions = self.rules.get(current_state, [])
            if requested_state in allowed_transitions:
                self.broker.publish({"type": "UPDATE_STATE", "item_id": item_id, "new_state": requested_state})
            else:
                self.broker.publish({"type": "LOG", "msg": f"SECURITY BLOCK: Cannot transition from {current_state} to {requested_state}"})

class AuditLogger:
    def __init__(self, broker):
        self.broker = broker
        self.broker.subscribe(self)
        self.db_name = "verde.db"
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_name) as conn:
            conn.execute('''CREATE TABLE IF NOT EXISTS AuditLogs 
                            (LogId INTEGER PRIMARY KEY, Timestamp DATETIME, UserId TEXT, Action TEXT, Details TEXT)''')

    def receive_message(self, msg):
        event_type = msg["type"]
        timestamp = datetime.datetime.now().isoformat()
        
        userid = msg.get("userid") or msg.get("owner_id") or "System"
        action = None
        details = ""

        if event_type == "AUTH_SUCCESS":
            action = "LOGIN_SUCCESS"
        elif event_type == "AUTH_FAILED":
            action = "LOGIN_FAILED"
            details = msg.get("msg", "")
        elif event_type == "AUTH_LOCKED":
            action = "ACCOUNT_LOCKED"
        elif event_type == "LOGOUT_SUCCESS":
            action = "LOGOUT"
        elif event_type == "STORE":
            action = "DATA_CREATED"
            details = f"Key: {msg.get('key')}"
        elif event_type == "UPDATE_STATE":
            action = "WORKFLOW_TRANSITION"
            details = f"Item {msg.get('item_id')} to {msg.get('new_state')}"
            
        if action:
            with sqlite3.connect(self.db_name) as conn:
                conn.execute("INSERT INTO AuditLogs (Timestamp, UserId, Action, Details) VALUES (?, ?, ?, ?)",
                             (timestamp, userid, action, details))

import os
import base64

class VaultKeeper:
    def __init__(self, broker):
        self.broker = broker
        self.broker.subscribe(self)
        self.db_name = "verde.db"
        self.vault_dir = "C:\\VerdeVault"
        os.makedirs(self.vault_dir, exist_ok=True)
        self._init_db()
        
    def _init_db(self):
        with sqlite3.connect(self.db_name) as conn:
            conn.execute('''CREATE TABLE IF NOT EXISTS Files 
                            (FileId TEXT PRIMARY KEY, Filename TEXT, FilePath TEXT, OwnerId TEXT)''')

    def receive_message(self, msg):
        if msg["type"] == "FILE_CHUNK":
            file_id = msg["file_id"]
            chunk_data = msg["chunk_data"] # base64 encoded
            
            temp_path = os.path.join(self.vault_dir, f"{file_id}.part")
            with open(temp_path, "ab") as f:
                f.write(base64.b64decode(chunk_data))
                
        elif msg["type"] == "FINALIZE_FILE":
            file_id = msg["file_id"]
            filename = msg["filename"]
            owner = msg.get("owner_id", "System")
            
            temp_path = os.path.join(self.vault_dir, f"{file_id}.part")
            final_path = os.path.join(self.vault_dir, f"{file_id}_{filename}")
            
            if os.path.exists(temp_path):
                os.rename(temp_path, final_path)
                with sqlite3.connect(self.db_name) as conn:
                    conn.execute("INSERT INTO Files (FileId, Filename, FilePath, OwnerId) VALUES (?, ?, ?, ?)",
                                 (file_id, filename, final_path, owner))
                self.broker.publish({"type": "LOG", "msg": f"VaultKeeper saved file: {filename}"})
            else:
                self.broker.publish({"type": "LOG", "msg": f"VaultKeeper error: File parts missing for {filename}"})

class Postmaster:
    def __init__(self, broker):
        self.broker = broker
        self.broker.subscribe(self)
        
    def receive_message(self, msg):
        if msg["type"] == "DELIVER_CREDENTIALS":
            # In a real system, this connects to SMTP. Here we write to a secure local file as a mockup.
            try:
                with open("secure_outbox.txt", "a") as f:
                    f.write(f"--- EMAIL TO: {msg['userid']} ---\n")
                    f.write(f"Your temporary password is: {msg['password']}\n")
                    f.write(f"Your Master Recovery Key is: {msg['recovery']}\n")
                    f.write(f"KEEP THIS SAFE.\n\n")
                self.broker.publish({"type": "LOG", "msg": f"Postmaster successfully 'emailed' credentials for {msg['userid']}"})
            except Exception as e:
                self.broker.publish({"type": "LOG", "msg": f"Postmaster Error: {e}"})

# --- USER INTERFACE (Mint Factory) ---
class SystemEntryPoint(tk.Tk):
    def __init__(self, broker, scanner):
        super().__init__()
        self.broker = broker
        self.scanner = scanner
        self.broker.subscribe(self)
        
        self.session_token = None
        self.current_role = None

        self.title("Verde System Core")
        self.geometry("800x600")
        self.configure(bg="#2d2d30")
        self.withdraw() # HIDE MAIN WINDOW ON BOOT

        # Menu Bar
        self.menubar = tk.Menu(self)
        db_menu = tk.Menu(self.menubar, tearoff=0)
        db_menu.add_command(label="Mint: Add Database Entry", command=self.show_entry_form)
        db_menu.add_command(label="Mint: View Database", command=self.show_viewer_form)
        self.menubar.add_cascade(label="Database", menu=db_menu)
        
        self.config(menu=self.menubar)

        tk.Label(self, text="VERDE SYSTEM ENTRY POINT", bg="#2d2d30", fg="white", font=("Arial", 24, "bold")).pack(pady=20)
        
        self.log_text = tk.Text(self, height=10, bg="#1e1e1e", fg="cyan")
        self.log_text.pack(pady=20, padx=20, fill="both", expand=True)

        self.current_auth_window = None

    def receive_message(self, msg):
        if msg["type"] == "LOG":
            self.log_text.insert(tk.END, f"> {msg['msg']}\n")
            self.log_text.see(tk.END)
        
        elif msg["type"] == "SYS_NEEDS_SETUP":
            self.show_setup_form()
        elif msg["type"] == "SYS_NEEDS_LOGIN":
            self.show_login_form()
            
        elif msg["type"] == "SETUP_COMPLETE":
            if self.current_auth_window: self.current_auth_window.destroy()
            self.show_login_form()
            
        elif msg["type"] == "AUTH_SUCCESS":
            if self.current_auth_window: self.current_auth_window.destroy()
            self.session_token = msg["token"]
            self.current_role = msg["role"]
            
            # RBAC: Only show Admin menu if the user is an Admin
            try:
                self.menubar.delete("Admin")
            except:
                pass
                
            if self.current_role == "Admin":
                admin_menu = tk.Menu(self.menubar, tearoff=0)
                admin_menu.add_command(label="Commission New Account", command=self.show_commission_form)
                self.menubar.add_cascade(label="Admin", menu=admin_menu)
                
            self.deiconify() # REVEAL MAIN WINDOW
            
        elif msg["type"] == "AUTH_FAILED":
            messagebox.showerror("Access Denied", msg["msg"])
            
        elif msg["type"] == "AUTH_LOCKED":
            messagebox.showwarning("Account Locked", "Maximum attempts exceeded. Account is locked.")
            if self.current_auth_window: self.current_auth_window.destroy()
            self.show_recovery_form()
            
        elif msg["type"] == "RECOVERY_SUCCESS":
            messagebox.showinfo("Success", "Account unlocked and password reset! Please log in.")
            if self.current_auth_window: self.current_auth_window.destroy()
            self.show_login_form()
            
        elif msg["type"] == "RECOVERY_FAILED":
            messagebox.showerror("Error", "Invalid Recovery Key.")

    # --- SECURITY FORMS ---
    def show_setup_form(self):
        self.current_auth_window = tk.Toplevel(self)
        self.current_auth_window.title("System Setup")
        self.current_auth_window.geometry("400x350")
        self.current_auth_window.protocol("WM_DELETE_WINDOW", lambda: self.destroy())
        
        recovery_key = "VRD-" + "".join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(12))

        tk.Label(self.current_auth_window, text="Welcome to Verde System", font=("Arial", 14, "bold")).pack(pady=10)
        tk.Label(self.current_auth_window, text="Create Admin Account:").pack()
        
        tk.Label(self.current_auth_window, text="User ID:").pack(pady=2)
        uid_entry = tk.Entry(self.current_auth_window)
        uid_entry.pack()
        
        tk.Label(self.current_auth_window, text="Password:").pack(pady=2)
        pwd_entry = tk.Entry(self.current_auth_window, show="*")
        pwd_entry.pack()
        
        tk.Label(self.current_auth_window, text="YOUR MASTER RECOVERY KEY (SAVE THIS!):", fg="red", font=("Arial", 9, "bold")).pack(pady=(15,0))
        rec_entry = tk.Entry(self.current_auth_window, width=30, justify="center", font=("Courier", 10, "bold"))
        rec_entry.insert(0, recovery_key)
        rec_entry.config(state="readonly")
        rec_entry.pack(pady=5)

        tk.Button(self.current_auth_window, text="Complete Setup", 
                  command=lambda: self.broker.publish({"type": "CREATE_ADMIN", "userid": uid_entry.get(), "password": pwd_entry.get(), "recovery": recovery_key})).pack(pady=15)

    def show_login_form(self):
        self.current_auth_window = tk.Toplevel(self)
        self.current_auth_window.title("Authentication Required")
        self.current_auth_window.geometry("300x200")
        self.current_auth_window.protocol("WM_DELETE_WINDOW", lambda: self.destroy())
        
        tk.Label(self.current_auth_window, text="User ID:").pack(pady=5)
        uid_entry = tk.Entry(self.current_auth_window)
        uid_entry.pack()
        
        tk.Label(self.current_auth_window, text="Password:").pack(pady=5)
        pwd_entry = tk.Entry(self.current_auth_window, show="*")
        pwd_entry.pack()

        tk.Button(self.current_auth_window, text="Login", 
                  command=lambda: self.broker.publish({"type": "AUTH_ATTEMPT", "userid": uid_entry.get(), "password": pwd_entry.get()})).pack(pady=20)

    def show_recovery_form(self):
        self.current_auth_window = tk.Toplevel(self)
        self.current_auth_window.title("Account Recovery")
        self.current_auth_window.geometry("350x250")
        self.current_auth_window.protocol("WM_DELETE_WINDOW", lambda: self.destroy())
        
        tk.Label(self.current_auth_window, text="User ID:").pack(pady=2)
        uid_entry = tk.Entry(self.current_auth_window)
        uid_entry.pack()
        
        tk.Label(self.current_auth_window, text="Master Recovery Key:").pack(pady=2)
        rec_entry = tk.Entry(self.current_auth_window)
        rec_entry.pack()
        
        tk.Label(self.current_auth_window, text="New Password:").pack(pady=2)
        pwd_entry = tk.Entry(self.current_auth_window, show="*")
        pwd_entry.pack()

        tk.Button(self.current_auth_window, text="Reset & Unlock", 
                  command=lambda: self.broker.publish({"type": "RECOVERY_ATTEMPT", "userid": uid_entry.get(), "recovery": rec_entry.get(), "new_password": pwd_entry.get()})).pack(pady=15)

    def show_commission_form(self):
        form = tk.Toplevel(self)
        form.title("Commission New Account")
        form.geometry("400x350")
        
        recovery_key = "VRD-" + "".join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(12))

        tk.Label(form, text="Create New User Account:").pack(pady=10)
        
        tk.Label(form, text="User ID:").pack(pady=2)
        uid_entry = tk.Entry(form)
        uid_entry.pack()
        
        tk.Label(form, text="Initial Password:").pack(pady=2)
        pwd_entry = tk.Entry(form, show="*")
        pwd_entry.pack()
        
        tk.Label(form, text="USER'S RECOVERY KEY (GIVE THIS TO THEM!):", fg="red", font=("Arial", 9, "bold")).pack(pady=(15,0))
        rec_entry = tk.Entry(form, width=30, justify="center", font=("Courier", 10, "bold"))
        rec_entry.insert(0, recovery_key)
        rec_entry.config(state="readonly")
        rec_entry.pack(pady=5)

        def submit():
            u, p = uid_entry.get().strip(), pwd_entry.get().strip()
            if not u or not p:
                messagebox.showerror("Validation Error", "User ID and Password cannot be empty!")
                return
            
            # Attaching our secure Session Token to prove we are an Admin!
            self.broker.publish({"type": "COMMISSION_USER", "userid": u, "password": p, "recovery": recovery_key, "token": self.session_token})
            # Also tell the Postmaster to "email" the credentials to the new user
            self.broker.publish({"type": "DELIVER_CREDENTIALS", "userid": u, "password": p, "recovery": recovery_key})
            
            messagebox.showinfo("Success", f"User {u} commissioned successfully. Credentials sent to Postmaster.")
            form.destroy()

        tk.Button(form, text="Commission Account", command=submit).pack(pady=15)

    def show_entry_form(self):
        form = tk.Toplevel(self)
        form.title("Add Entry")
        form.geometry("300x200")
        tk.Label(form, text="Data Key:").pack(pady=5)
        key_entry = tk.Entry(form)
        key_entry.pack()
        tk.Label(form, text="Data Value:").pack(pady=5)
        val_entry = tk.Entry(form)
        val_entry.pack()
        
        def submit():
            # VALIDATION: Ensure fields are not empty before sending to DB
            k, v = key_entry.get().strip(), val_entry.get().strip()
            if not k or not v:
                messagebox.showerror("Validation Error", "Data Key and Data Value cannot be empty!")
                return
                
            self.scanner.scan_input(f"store {k} {v}")
            key_entry.delete(0, tk.END)
            val_entry.delete(0, tk.END)
            messagebox.showinfo("Success", "Data sent to storage successfully!")
            
        tk.Button(form, text="Add Data", command=submit).pack(pady=20)

    def show_viewer_form(self):
        form = tk.Toplevel(self)
        form.title("Database Viewer")
        form.geometry("600x400")
        
        control_frame = tk.Frame(form)
        control_frame.pack(fill="x", pady=5)
        
        tk.Label(control_frame, text="Select Table:").pack(side="left", padx=5)
        table_combo = ttk.Combobox(control_frame, values=["VerdeData", "Users"], state="readonly")
        table_combo.set("VerdeData")
        table_combo.pack(side="left", padx=5)
        
        tree_frame = tk.Frame(form)
        tree_frame.pack(fill="both", expand=True)
        
        tree = ttk.Treeview(tree_frame, show="headings")
        tree.pack(fill="both", expand=True)

        class ViewerSubscriber:
            def receive_message(self, msg):
                if msg["type"] == "DATA_RETRIEVED":
                    if tree.winfo_exists():
                        # Update columns dynamically
                        tree["columns"] = msg.get("columns", [])
                        for col in tree["columns"]:
                            tree.heading(col, text=col)
                            tree.column(col, width=100)
                        
                        # Clear old data and insert new rows
                        for item in tree.get_children(): tree.delete(item)
                        for row in msg.get("rows", []): tree.insert("", "end", values=row)

        sub = ViewerSubscriber()
        self.broker.subscribe(sub)
        form.protocol("WM_DELETE_WINDOW", lambda: (self.broker.unsubscribe(sub), form.destroy()))
        
        def refresh():
            self.scanner.scan_input(f"retrieve {table_combo.get()}")
            
        tk.Button(control_frame, text="Refresh", command=refresh).pack(side="left", padx=5)
        table_combo.bind("<<ComboboxSelected>>", lambda e: refresh())
        
        refresh() # Initial fetch

# --- BOOT UP ---
if __name__ == "__main__":
    broker = MessageBroker()
    scanner = ObjectScanner(broker)
    storage = StorageKeeper(broker)
    gatekeeper = GateKeeper(broker)
    statemachine = StateMachineManager(broker) # NEW: Start Workflow Engine
    vault = VaultKeeper(broker) # NEW: Start File Vault
    audit = AuditLogger(broker) # NEW: Start Audit Logger
    postmaster = Postmaster(broker)
    web_connector = WebConnector(broker, port=8080)
    
    app = SystemEntryPoint(broker, scanner)
    
    # Trigger boot sequence
    broker.publish({"type": "CHECK_SETUP"})
    
    app.mainloop()
