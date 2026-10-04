import os
import base64

class VaultKeeper:
    def __init__(self, broker):
        self.broker = broker
        self.broker.subscribe(self)
        self.vault_path = r"C:\VerdeVault"
        if not os.path.exists(self.vault_path):
            os.makedirs(self.vault_path)
            self.broker.publish({"type": "LOG", "msg": f"VaultKeeper: Initialized secure vault at {self.vault_path}"})

    def receive_message(self, msg):
        event_type = msg.get("type")
        
        if event_type == "UPLOAD_DOCUMENT":
            try:
                project_id = msg["project_id"]
                filename = msg["filename"]
                b64_content = msg["b64_content"]
                uploaded_by = msg["uploaded_by"]
                req_id = msg.get("req_id")
                
                # Create project-specific directory
                project_dir = os.path.join(self.vault_path, f"Project_{project_id}")
                if not os.path.exists(project_dir):
                    os.makedirs(project_dir)
                    
                # Decode and save securely
                file_path = os.path.join(project_dir, filename)
                with open(file_path, "wb") as f:
                    f.write(base64.b64decode(b64_content))
                    
                self.broker.publish({"type": "LOG", "msg": f"VaultKeeper: Successfully saved {filename} to {file_path}"})
                
                # Pass off to StorageKeeper to log in the database
                self.broker.publish({
                    "type": "DOCUMENT_SAVED",
                    "project_id": project_id,
                    "filename": filename,
                    "filepath": file_path,
                    "uploaded_by": uploaded_by,
                    "req_id": req_id
                })
            except Exception as e:
                self.broker.publish({"type": "LOG", "msg": f"VaultKeeper ERROR: {str(e)}"})
                if msg.get("req_id"):
                    self.broker.publish({"type": "DOCUMENT_UPLOAD_FAILED", "msg": str(e), "req_id": msg["req_id"]})
