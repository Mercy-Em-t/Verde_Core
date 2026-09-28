import os

# Path to the target frontend file
TARGET_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
    "Verde_Frontend", 
    "project-state.js"
)

def patch_frontend_telemetry():
    """
    Patches project-state.js to use navigator.sendBeacon for critical telemetry 
    to avoid data loss when users abandon sessions.
    """
    print(f"Patching {TARGET_FILE}...")
    
    if not os.path.exists(TARGET_FILE):
        print(f"Error: Could not find {TARGET_FILE}")
        return

    with open(TARGET_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    # The old record function
    old_record = 'function record(p,type,data){p.history=p.history||[];p.history.push(Object.assign({at:new Date().toISOString(),type},data||{}));}'
    
    if old_record not in content:
        print("Error: Target record function not found. Has it already been patched?")
        return

    # The new enhanced record function
    new_record = """function record(p,type,data){
    const eventData = Object.assign({at:new Date().toISOString(),type},data||{});
    p.history=p.history||[];
    p.history.push(eventData);
    
    // -- NEW TELEMETRY (BEACON API) --
    // Dispatch to a telemetry endpoint to ensure we don't lose data on tab close
    try {
        if(navigator && navigator.sendBeacon) {
            const payload = JSON.stringify({
                entity_type: "Project", 
                entity_id: p.id, 
                event_type: type, 
                actor: "Client", 
                data: eventData
            });
            // We use Blob to ensure content-type is application/json if needed, 
            // though sendBeacon with string defaults to text/plain.
            const blob = new Blob([payload], {type: 'application/json'});
            navigator.sendBeacon('/api/telemetry', blob);
        }
    } catch(e) {}
    // -- END NEW TELEMETRY --
  }"""

    # Apply the patch
    patched_content = content.replace(old_record, new_record)

    with open(TARGET_FILE, "w", encoding="utf-8") as f:
        f.write(patched_content)

    print("Successfully patched project-state.js with Beacon API Telemetry!")

if __name__ == "__main__":
    patch_frontend_telemetry()
