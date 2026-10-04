mod models;

use models::system_request::SystemRequest;
use std::collections::HashMap;

#[tokio::main]
async fn main() {
    println!("🚀 VERDE SDLC RUST ENGINE INITIALIZING...");

    // Isolated In-Memory State Mapping (Equivalent to our Node.js Map)
    let mut db: HashMap<String, SystemRequest> = HashMap::new();

    // 1. Simulate the Creation of the Project Phase 1
    let mut sr = SystemRequest::new("PRJ-RUST-001");
    
    sr.set_project_sponsor("Jane Doe (CTO)");
    sr.set_business_need("Migrate backend API from Node.js to Rust for 10x throughput.");
    sr.add_business_requirement("Latency must be < 5ms.");
    sr.add_business_requirement("Memory footprint must be < 10MB.");

    println!("Initial Status: {:?}", sr.status);

    // 2. Approve the Document
    match sr.approve("System Admin") {
        Ok(_) => println!("✅ System Request officially APPROVED by: {:?}", sr.approved_by.as_ref().unwrap()),
        Err(e) => println!("❌ Approval Failed: {}", e),
    }

    // 3. Persist to HashMap
    db.insert(sr.project_id.clone(), sr.clone());

    // Serialize to JSON (Demonstrating Serde's raw power)
    let json_output = serde_json::to_string_pretty(&sr).unwrap();
    println!("\n💾 Serialized Project Data Output:\n{}", json_output);

    println!("\nEngine booted successfully. Rust Strict Typing Enforced.");
}
