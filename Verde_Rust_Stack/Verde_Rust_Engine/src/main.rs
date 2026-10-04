mod models;

use models::system_request::SystemRequest;
use models::feasibility_study::FeasibilityStudy;
use models::binders::Phase1Binder;

#[tokio::main]
async fn main() {
    println!("🚀 VERDE SDLC RUST ENGINE INITIALIZING...\n");

    // 1. Build the System Request
    let mut sr = SystemRequest::new("PRJ-RUST-001");
    sr.set_business_need("Migrate to Rust for 10x throughput.");
    sr.add_business_requirement("Latency < 5ms.");
    sr.approve("System Admin").unwrap();
    println!("✅ System Request APPROVED.");

    // 2. Build the Feasibility Study
    let mut fs = FeasibilityStudy::new();
    fs.set_metrics("High - Rust experts available", "High ROI", "Management fully supports");
    fs.approve("CTO", true).unwrap();
    println!("✅ Feasibility Study APPROVED (Verdict: PROCEED).\n");

    // 3. Attempt to issue the Phase 1 Binder Passport
    // Notice how Rust's borrow checker mathematically forces us to pass valid structs
    match Phase1Binder::issue(&sr, &fs) {
        Ok(binder) => {
            println!("🏆 GATE PASSED! Phase 1 Binder successfully issued.");
            let json_output = serde_json::to_string_pretty(&binder).unwrap();
            println!("💾 Phase 1 Passport Snapshot:\n{}\n", json_output);

            // =====================================
            // PHASE 2: ANALYSIS & SYSTEM PROPOSAL
            // =====================================
            println!("--- INITIATING PHASE 2: ANALYSIS ---");

            use models::analysis::{RequirementsDetermination, UseCaseAnalysis, Modeling, SystemProposal};

            let mut reqs = RequirementsDetermination::default();
            reqs.add_requirement("Functional", "System must parse JSON natively via Serde.");
            reqs.add_requirement("Non-Functional", "API responses must be under 2ms.");

            let mut use_cases = UseCaseAnalysis::default();
            use_cases.add_use_case("Approve Document", "System Admin", "Admin clicks approve button.");

            let mut modeling = Modeling::default();
            modeling.add_dfd_process("0.0 - SDLC Engine Main Process");
            modeling.add_erd_entity("User");
            modeling.add_erd_entity("ProjectState");

            let mut proposal = SystemProposal::new(reqs, use_cases, modeling);
            
            // Attempt to issue Phase 2 Binder BEFORE approving proposal (Should Fail if logic tested)
            // But we will just approve it directly to show the cryptographic chain
            proposal.approve("Lead Architect").unwrap();
            println!("✅ System Proposal APPROVED.");

            use models::binders::Phase2Binder;
            match Phase2Binder::issue(&binder, &proposal) {
                Ok(ph2_binder) => {
                    println!("🏆 GATE PASSED! Phase 2 Binder successfully issued.");
                    println!("🔗 Cryptographically linked to Phase 1: {}", ph2_binder.previous_binder_id);

                    // =====================================
                    // PHASE 3: DESIGN & SYSTEM SPECIFICATION
                    // =====================================
                    println!("\n--- INITIATING PHASE 3: DESIGN ---");
                    use models::design::SystemSpecification;
                    
                    let mut spec = SystemSpecification::new();
                    spec.architecture.hardware_specs.push("AWS EC2 Rust Instances".to_string());
                    spec.approve("Lead Engineer").unwrap();

                    use models::binders::Phase3Binder;
                    match Phase3Binder::issue(&ph2_binder, &spec) {
                        Ok(ph3_binder) => {
                            println!("🏆 GATE PASSED! Phase 3 Binder successfully issued.");
                            println!("🔗 Linked to Phase 2: {}", ph3_binder.previous_binder_id);

                            // =====================================
                            // PHASE 4: IMPLEMENTATION
                            // =====================================
                            println!("\n--- INITIATING PHASE 4: IMPLEMENTATION ---");
                            use models::implementation::ImplementationPhase;

                            let mut impl_phase = ImplementationPhase::new();
                            impl_phase.testing.acceptance_criteria_met = true;
                            impl_phase.testing.unit_tests_passed = 289;
                            impl_phase.deployment.is_deployed = true;
                            impl_phase.deployment.deployment_strategy = "Parallel Deployment".to_string();
                            impl_phase.approve_deployment("Release Manager").unwrap();

                            use models::binders::Phase4Binder;
                            match Phase4Binder::issue(&ph3_binder, &impl_phase) {
                                Ok(ph4_binder) => {
                                    println!("🏆 GATE PASSED! Phase 4 Binder successfully issued.");
                                    println!("🔗 Linked to Phase 3: {}", ph4_binder.previous_binder_id);
                                    let final_json = serde_json::to_string_pretty(&ph4_binder).unwrap();
                                    println!("💾 FINAL PRE-SUPPORT PASSPORT:\n{}", final_json);
                                },
                                Err(e) => println!("❌ FATAL ERROR: {}", e),
                            }
                        },
                        Err(e) => println!("❌ FATAL ERROR: {}", e),
                    }
                },
                Err(e) => println!("❌ FATAL ERROR: {}", e),
            }

        },
        Err(e) => println!("❌ FATAL ERROR: {}", e),
    }

    println!("\n🚀 Rust Migration Complete: Phases 1 through 4 strict gating enforced.");
}
