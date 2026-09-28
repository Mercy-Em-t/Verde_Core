import datetime
import json
from pg8000.native import Connection

class AuditKeeper:
    """
    Enterprise Compliance Engine.
    Listens to ALL events on the Redis pub/sub bus and permanently logs them to Postgres.
    """
    def __init__(self, broker, db_params):
        self.broker = broker
        self.db_params = db_params
        self.broker.subscribe(self)
        self.broker.publish({"type": "LOG", "msg": "AuditKeeper: Initialized and recording all state changes."})

    def get_connection(self):
        return Connection(**self.db_params)

    def receive_message(self, msg):
        event_type = msg.get("type", "UNKNOWN")
        
        # Ignore noisy internal polling/read events to prevent infinite loops and DB bloat
        if event_type in ("LOG", "RETRIEVE", "DATA_RETRIEVED", "TOKEN_VALID", "TOKEN_INVALID"):
            return

        actor = msg.get("actor") or msg.get("uploaded_by") or msg.get("userid") or "SYSTEM"
        entity = "N/A"
        entity_id = None
        
        # Heuristically determine the entity from the message
        if "project_id" in msg:
            entity = "Project"
            entity_id = str(msg["project_id"])
        elif "lead_id" in msg:
            entity = "Lead"
            entity_id = str(msg["lead_id"])
        elif "doc_id" in msg:
            entity = "Document"
            entity_id = str(msg["doc_id"])
        elif "worker_id" in msg:
            entity = "Worker"
            entity_id = str(msg["worker_id"])
        elif "entity" in msg:
            entity = msg["entity"]
            entity_id = str(msg.get("entity_id", ""))
            
        try:
            delta_data = json.dumps(msg)
        except Exception:
            delta_data = "{}"

        try:
            with self.get_connection() as conn:
                conn.run(
                    "INSERT INTO AuditLogs (Timestamp, Actor, Action, Entity, EntityId, DeltaData) VALUES (:ts, :act, :axn, :ent, :eid, :dd)",
                    ts=datetime.datetime.now(),
                    act=actor,
                    axn=event_type,
                    ent=entity,
                    eid=entity_id,
                    dd=delta_data
                )
        except Exception as e:
            # Fallback print if DB is locked, never crash the broker
            print(f"AuditKeeper Error: {e}")
