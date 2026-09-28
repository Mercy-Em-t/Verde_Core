import os

TARGET_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
    "Verde_Enterprise", 
    "main_api.py"
)

def patch_api():
    print(f"Patching {TARGET_FILE}...")
    
    if not os.path.exists(TARGET_FILE):
        print(f"Error: Could not find {TARGET_FILE}")
        return

    with open(TARGET_FILE, "r", encoding="utf-8") as f:
        content = f.read()
        
    if "@app.post(\"/api/telemetry\")" in content:
        print("API is already patched.")
        return

    # Let's inject our new code before the final catch-all or at the bottom.
    
    telemetry_code = """
# --- NEW TELEMETRY ENDPOINTS ---
from fastapi import Request
from pg8000.native import Connection

@app.post("/api/telemetry")
async def receive_telemetry(request: Request):
    \"\"\"Catches Beacon API payloads and forwards them to AuditKeeper via Redis\"\"\"
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
    \"\"\"Queries the JSONB AuditLogs table to calculate drop-offs\"\"\"
    try:
        # Re-using the db_params defined at the top of main_api.py
        with Connection(**db_params) as conn:
            # We use Postgres JSONB operators to extract the funnel numbers
            # This is extremely fast because of the GIN index we added!
            rows = conn.run(\"\"\"
                SELECT 
                    COUNT(*) FILTER (WHERE "DeltaData"->>'event_type' = 'qualified') as qualified,
                    COUNT(*) FILTER (WHERE "DeltaData"->>'event_type' = 'phase-selected') as phase_selected,
                    COUNT(*) FILTER (WHERE "DeltaData"->>'event_type' = 'stage-changed') as stage_changed
                FROM "AuditLogs"
                WHERE "Entity" = 'Project'
            \"\"\")
            
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
"""

    # Append to the end of the file
    patched_content = content + "\n" + telemetry_code

    with open(TARGET_FILE, "w", encoding="utf-8") as f:
        f.write(patched_content)

    print("Successfully patched main_api.py with the telemetry routes!")

if __name__ == "__main__":
    patch_api()
