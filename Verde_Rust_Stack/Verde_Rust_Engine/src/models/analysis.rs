use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};

// --- Requirements Determination ---
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Requirement {
    pub req_type: String,
    pub description: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct RequirementsDetermination {
    pub requirements: Vec<Requirement>,
    pub is_approved: bool,
}

impl RequirementsDetermination {
    pub fn add_requirement(&mut self, req_type: &str, description: &str) {
        self.requirements.push(Requirement {
            req_type: req_type.to_string(),
            description: description.to_string(),
        });
    }
}

// --- Use Case Analysis ---
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UseCase {
    pub name: String,
    pub primary_actor: String,
    pub trigger: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct UseCaseAnalysis {
    pub use_cases: Vec<UseCase>,
}

impl UseCaseAnalysis {
    pub fn add_use_case(&mut self, name: &str, actor: &str, trigger: &str) {
        self.use_cases.push(UseCase {
            name: name.to_string(),
            primary_actor: actor.to_string(),
            trigger: trigger.to_string(),
        });
    }
}

// --- Process & Data Modeling ---
#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct Modeling {
    pub dfd_processes: Vec<String>,
    pub erd_entities: Vec<String>,
}

impl Modeling {
    pub fn add_dfd_process(&mut self, process: &str) {
        self.dfd_processes.push(process.to_string());
    }
    pub fn add_erd_entity(&mut self, entity: &str) {
        self.erd_entities.push(entity.to_string());
    }
}

// --- The Master System Proposal ---
#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum ProposalStatus {
    Draft,
    PendingApproval,
    Approved,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SystemProposal {
    pub requirements: RequirementsDetermination,
    pub use_cases: UseCaseAnalysis,
    pub modeling: Modeling,
    pub status: ProposalStatus,
    pub approved_by: Option<String>,
    pub approved_at: Option<DateTime<Utc>>,
}

impl SystemProposal {
    pub fn new(reqs: RequirementsDetermination, uca: UseCaseAnalysis, modl: Modeling) -> Self {
        Self {
            requirements: reqs,
            use_cases: uca,
            modeling: modl,
            status: ProposalStatus::Draft,
            approved_by: None,
            approved_at: None,
        }
    }

    pub fn approve(&mut self, admin_name: &str) -> Result<(), &'static str> {
        if self.requirements.requirements.is_empty() {
            return Err("Cannot approve System Proposal: No requirements defined.");
        }
        if self.use_cases.use_cases.is_empty() {
            return Err("Cannot approve System Proposal: No use cases defined.");
        }
        
        self.status = ProposalStatus::Approved;
        self.approved_by = Some(admin_name.to_string());
        self.approved_at = Some(Utc::now());
        Ok(())
    }
}
