import os
import re

# Path to the target file
TARGET_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
    "Verde_Enterprise", 
    "auditkeeper.py"
)

def patch_auditkeeper():
    """
    Patches auditkeeper.py to support a standardized CloudEvents-style schema
    while falling back to the old heuristics for legacy events.
    """
    print(f"Patching {TARGET_FILE}...")
    
    if not os.path.exists(TARGET_FILE):
        print(f"Error: Could not find {TARGET_FILE}")
        return

    with open(TARGET_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    # The new logic to inject
    new_logic = """
        # --- NEW STANDARDIZED SCHEMA (CloudEvents-like) ---
        if "entity_type" in msg and "entity_id" in msg:
            entity = msg["entity_type"]
            entity_id = str(msg["entity_id"])
        # --- END NEW SCHEMA ---
        
        # --- LEGACY HEURISTIC FALLBACK ---
        elif "project_id" in msg:
"""

    # Look for the old heuristic block
    old_heuristic_start = 'if "project_id" in msg:'
    
    if old_heuristic_start not in content:
        print("Error: Target heuristic block not found. Has it already been patched?")
        return
        
    if "entity_type" in content:
        print("Notice: The file appears to already have the standardized schema logic.")
        return

    # Apply the patch
    patched_content = content.replace(
        '        if "project_id" in msg:', 
        new_logic[1:] # Strip leading newline
    )

    with open(TARGET_FILE, "w", encoding="utf-8") as f:
        f.write(patched_content)

    print("Successfully patched AuditKeeper with the new Event Schema standard!")

if __name__ == "__main__":
    patch_auditkeeper()
