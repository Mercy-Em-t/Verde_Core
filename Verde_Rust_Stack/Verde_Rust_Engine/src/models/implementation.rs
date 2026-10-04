use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct SystemConstruction {
    pub repository_url: String,
    pub ci_cd_pipeline_active: bool,
    pub environments_provisioned: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct TestingStrategy {
    pub unit_tests_passed: usize,
    pub integration_tests_passed: usize,
    pub acceptance_criteria_met: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct DocumentationStrategy {
    pub api_swagger_url: String,
    pub user_manuals_completed: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct TransitionAndDeployment {
    pub deployment_strategy: String, // e.g., "Parallel", "Direct Cutover"
    pub cutover_date: Option<DateTime<Utc>>,
    pub is_deployed: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum ImplementationStatus {
    Draft,
    Building,
    Deployed,
    Approved,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ImplementationPhase {
    pub construction: SystemConstruction,
    pub testing: TestingStrategy,
    pub documentation: DocumentationStrategy,
    pub deployment: TransitionAndDeployment,
    pub status: ImplementationStatus,
    pub approved_by: Option<String>,
    pub approved_at: Option<DateTime<Utc>>,
}

impl ImplementationPhase {
    pub fn new() -> Self {
        Self {
            construction: SystemConstruction::default(),
            testing: TestingStrategy::default(),
            documentation: DocumentationStrategy::default(),
            deployment: TransitionAndDeployment::default(),
            status: ImplementationStatus::Draft,
            approved_by: None,
            approved_at: None,
        }
    }

    pub fn approve_deployment(&mut self, admin_name: &str) -> Result<(), &'static str> {
        if !self.deployment.is_deployed {
            return Err("Cannot approve Implementation Phase: System is not marked as deployed.");
        }
        if !self.testing.acceptance_criteria_met {
            return Err("Cannot approve Implementation Phase: Acceptance criteria not met.");
        }
        
        self.status = ImplementationStatus::Approved;
        self.approved_by = Some(admin_name.to_string());
        self.approved_at = Some(Utc::now());
        Ok(())
    }
}
