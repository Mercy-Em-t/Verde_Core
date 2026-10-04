use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct ArchitectureDesign {
    pub hardware_specs: Vec<String>,
    pub software_specs: Vec<String>,
    pub network_topology: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct UserInterfaceDesign {
    pub wireframes_completed: bool,
    pub navigational_patterns: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct ProgramDesign {
    pub structure_charts: Vec<String>,
    pub api_contracts: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct DataStorageDesign {
    pub database_schema_url: String,
    pub optimization_indexes: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum DesignStatus {
    Draft,
    PendingApproval,
    Approved,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SystemSpecification {
    pub architecture: ArchitectureDesign,
    pub interface: UserInterfaceDesign,
    pub program: ProgramDesign,
    pub data_storage: DataStorageDesign,
    pub status: DesignStatus,
    pub approved_by: Option<String>,
    pub approved_at: Option<DateTime<Utc>>,
}

impl SystemSpecification {
    pub fn new() -> Self {
        Self {
            architecture: ArchitectureDesign::default(),
            interface: UserInterfaceDesign::default(),
            program: ProgramDesign::default(),
            data_storage: DataStorageDesign::default(),
            status: DesignStatus::Draft,
            approved_by: None,
            approved_at: None,
        }
    }

    pub fn approve(&mut self, admin_name: &str) -> Result<(), &'static str> {
        if self.architecture.hardware_specs.is_empty() {
            return Err("Cannot approve System Specification: Hardware specs missing.");
        }
        
        self.status = DesignStatus::Approved;
        self.approved_by = Some(admin_name.to_string());
        self.approved_at = Some(Utc::now());
        Ok(())
    }
}
