import hashlib
import secrets
import datetime
import json
from pg8000.native import Connection, DatabaseError

class GateKeeper:
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
                CREATE TABLE IF NOT EXISTS Users (
                    UserId VARCHAR PRIMARY KEY,
                    PasswordHash VARCHAR NOT NULL,
                    RecoveryHash VARCHAR NOT NULL,
                    FailedAttempts INT DEFAULT 0,
                    IsLocked BOOLEAN DEFAULT FALSE,
                    Role VARCHAR DEFAULT 'User'
                )
            ''')
            
            users = conn.run("SELECT * FROM Users")
            if not users:
                self.broker.publish({"type": "LOG", "msg": "GateKeeper: Database empty. Creating default admin account..."})
                default_uid = "admin"
                default_pwd = self._hash("password")
                default_rec = self._hash("recovery123")
                conn.run("INSERT INTO Users (UserId, PasswordHash, RecoveryHash, Role) VALUES (:uid, :pwd, :rec, 'Admin')",
                         uid=default_uid, pwd=default_pwd, rec=default_rec)

    def _hash(self, text):
        return hashlib.sha256(text.encode()).hexdigest()

    def receive_message(self, msg):
        event_type = msg.get("type")
        
        if event_type == "COMMISSION_USER":
            uid, pwd, rec = msg["userid"], msg["password"], msg["recovery"]
            token = msg.get("token")
            is_authorized = False
            
            if token == "SYSTEM":
                is_authorized = True
            elif token:
                session_data = self.broker.r.get(f"session:{token}")
                if session_data:
                    session = json.loads(session_data)
                    if session.get("role") == "Admin":
                        is_authorized = True

            if not is_authorized:
                with self.get_connection() as conn:
                    if not conn.run("SELECT * FROM Users"):
                        is_authorized = True
                        
            if is_authorized:
                # Check if this is the first user
                with self.get_connection() as conn:
                    users = conn.run("SELECT * FROM Users")
                    role = "Admin" if not users else "User"
                    conn.run("INSERT INTO Users (UserId, PasswordHash, RecoveryHash, Role) VALUES (:uid, :pwd, :rec, :role)",
                             uid=uid, pwd=self._hash(pwd), rec=self._hash(rec), role=role)
                self.broker.publish({"type": "LOG", "msg": f"New user commissioned: {uid}"})

        elif event_type == "AUTH_ATTEMPT":
            uid, pwd = msg.get("userid"), msg.get("password")
            req_id = msg.get("req_id")
            response = None
            
            with self.get_connection() as conn:
                user = conn.run("SELECT PasswordHash, FailedAttempts, IsLocked, Role FROM Users WHERE UserId = :uid", uid=uid)
                if not user:
                    response = {"type": "AUTH_FAILED", "msg": "User not found."}
                else:
                    db_hash, attempts, is_locked, role = user[0]
                    if is_locked:
                        response = {"type": "AUTH_LOCKED", "userid": uid}
                    elif self._hash(pwd) == db_hash:
                        conn.run("UPDATE Users SET FailedAttempts = 0 WHERE UserId = :uid", uid=uid)
                        session_token = secrets.token_hex(32)
                        
                        # Store session in Redis with a 12-hour absolute expiration (43200 seconds)
                        session_data = json.dumps({"userid": uid, "role": role})
                        self.broker.r.setex(f"session:{session_token}", 43200, session_data)
                        
                        response = {"type": "AUTH_SUCCESS", "userid": uid, "role": role, "token": session_token}
                    else:
                        attempts += 1
                        if attempts >= 3:
                            conn.run("UPDATE Users SET FailedAttempts = :att, IsLocked = TRUE WHERE UserId = :uid", att=attempts, uid=uid)
                            response = {"type": "AUTH_LOCKED", "userid": uid}
                        else:
                            conn.run("UPDATE Users SET FailedAttempts = :att WHERE UserId = :uid", att=attempts, uid=uid)
                            response = {"type": "AUTH_FAILED", "userid": uid, "msg": f"Invalid password. Attempt {attempts} of 3."}

            if response:
                if req_id: response["req_id"] = req_id
                self.broker.publish(response)

        elif event_type == "VALIDATE_TOKEN":
            token = msg.get("token")
            req_id = msg.get("req_id")
            
            session_data = self.broker.r.get(f"session:{token}")
            if session_data:
                # Token exists, refresh the idle timeout to 30 minutes (1800 seconds)
                self.broker.r.expire(f"session:{token}", 1800)
                session = json.loads(session_data)
                self.broker.publish({"type": "TOKEN_VALID", "role": session["role"], "userid": session["userid"], "req_id": req_id})
            else:
                self.broker.publish({"type": "TOKEN_INVALID", "req_id": req_id})

        elif event_type == "LOGOUT_REQUEST":
            token = msg.get("token")
            session_data = self.broker.r.get(f"session:{token}")
            if session_data:
                uid = json.loads(session_data)["userid"]
                self.broker.r.delete(f"session:{token}")
                self.broker.publish({"type": "LOGOUT_SUCCESS", "userid": uid})
