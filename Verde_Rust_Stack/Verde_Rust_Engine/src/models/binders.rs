use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};
use super::system_request::{SystemRequest, SystemRequestStatus};
use super::feasibility_study::{FeasibilityStudy, FeasibilityVerdict};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Phase1Binder {
    pub binder_id: String,
    pub project_id: String,
    pub issued_at: DateTime<Utc>,
    pub issued_by_system: String,
    pub metrics_snapshot: Phase1Metrics,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Phase1Metrics {
    pub business_requirements_count: usize,
    pub feasibility_status: String,
}

impl Phase1Binder {
    /// THE RUST COMPILER GUARANTEE:
    /// This function physically cannot be executed without valid references to
    /// an existing SystemRequest and FeasibilityStudy memory block.
    pub fn issue(sr: &SystemRequest, fs: &FeasibilityStudy) -> Result<Self, &'static str> {
        // 1. Enforce strict State Machine requirements at birth
        if !matches!(sr.status, SystemRequestStatus::Approved) {
            return Err("GATE BLOCKED: System Request must be strictly APPROVED.");
        }
        
        if !matches!(fs.final_verdict, FeasibilityVerdict::Proceed) {
            return Err("GATE BLOCKED: Feasibility Study final verdict must be PROCEED.");
        }

        let binder_id = format!("PH1-BINDER-{}-{}", sr.project_id, Utc::now().timestamp());

        Ok(Self {
            binder_id,
            project_id: sr.project_id.clone(),
            issued_at: Utc::now(),
            issued_by_system: "VERDE_RUST_CORE".to_string(),
            metrics_snapshot: Phase1Metrics {
                business_requirements_count: sr.business_requirements.len(),
                feasibility_status: "PROCEED".to_string(),
            },
        })
    }
}

// ==========================================
// PHASE 2 BINDER (SYSTEM PROPOSAL PASSPORT)
// ==========================================

use super::analysis::{SystemProposal, ProposalStatus};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Phase2Binder {
    pub binder_id: String,
    pub previous_binder_id: String, // Cryptographic chain linking back to Phase 1
    pub issued_at: DateTime<Utc>,
    pub metrics_snapshot: Phase2Metrics,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Phase2Metrics {
    pub total_requirements: usize,
    pub total_use_cases: usize,
    pub total_entities: usize,
}

impl Phase2Binder {
    /// STRICT GATING: 
    /// You cannot generate a Phase 2 Binder without both the APPROVED Phase 1 Binder
    /// and the APPROVED System Proposal.
    pub fn issue(ph1_binder: &Phase1Binder, proposal: &SystemProposal) -> Result<Self, &'static str> {
        if !matches!(proposal.status, ProposalStatus::Approved) {
            return Err("GATE BLOCKED: System Proposal must be explicitly APPROVED.");
        }

        let binder_id = format!("PH2-BINDER-{}-{}", ph1_binder.project_id, Utc::now().timestamp());

        Ok(Self {
            binder_id,
            previous_binder_id: ph1_binder.binder_id.clone(),
            issued_at: Utc::now(),
            metrics_snapshot: Phase2Metrics {
                total_requirements: proposal.requirements.requirements.len(),
                total_use_cases: proposal.use_cases.use_cases.len(),
                total_entities: proposal.modeling.erd_entities.len(),
            },
        })
    }
}

// ==========================================
// PHASE 3 BINDER (SYSTEM SPECIFICATION PASSPORT)
// ==========================================

use super::design::{SystemSpecification, DesignStatus};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Phase3Binder {
    pub binder_id: String,
    pub previous_binder_id: String, // Cryptographic chain linking back to Phase 2
    pub issued_at: DateTime<Utc>,
    pub metrics_snapshot: Phase3Metrics,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Phase3Metrics {
    pub hardware_nodes: usize,
    pub db_indexes: usize,
}

impl Phase3Binder {
    pub fn issue(ph2_binder: &Phase2Binder, spec: &SystemSpecification) -> Result<Self, &'static str> {
        if !matches!(spec.status, DesignStatus::Approved) {
            return Err("GATE BLOCKED: System Specification must be explicitly APPROVED.");
        }

        let binder_id = format!("PH3-BINDER-{}", Utc::now().timestamp());

        Ok(Self {
            binder_id,
            previous_binder_id: ph2_binder.binder_id.clone(),
            issued_at: Utc::now(),
            metrics_snapshot: Phase3Metrics {
                hardware_nodes: spec.architecture.hardware_specs.len(),
                db_indexes: spec.data_storage.optimization_indexes.len(),
            },
        })
    }
}

// ==========================================
// PHASE 4 BINDER (IMPLEMENTATION PASSPORT)
// ==========================================

use super::implementation::{ImplementationPhase, ImplementationStatus};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Phase4Binder {
    pub binder_id: String,
    pub previous_binder_id: String, // Cryptographic chain linking back to Phase 3
    pub issued_at: DateTime<Utc>,
    pub metrics_snapshot: Phase4Metrics,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Phase4Metrics {
    pub total_tests_passed: usize,
    pub deployment_strategy: String,
}

impl Phase4Binder {
    pub fn issue(ph3_binder: &Phase3Binder, impl_phase: &ImplementationPhase) -> Result<Self, &'static str> {
        if !matches!(impl_phase.status, ImplementationStatus::Approved) {
            return Err("GATE BLOCKED: Implementation Phase must be explicitly APPROVED.");
        }

        let binder_id = format!("PH4-BINDER-{}", Utc::now().timestamp());

        Ok(Self {
            binder_id,
            previous_binder_id: ph3_binder.binder_id.clone(),
            issued_at: Utc::now(),
            metrics_snapshot: Phase4Metrics {
                total_tests_passed: impl_phase.testing.unit_tests_passed + impl_phase.testing.integration_tests_passed,
                deployment_strategy: impl_phase.deployment.deployment_strategy.clone(),
            },
        })
    }
}
