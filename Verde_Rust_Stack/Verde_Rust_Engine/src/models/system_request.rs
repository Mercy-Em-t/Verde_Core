use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum SystemRequestStatus {
    Pending,
    InProgress,
    Completed,
    Approved,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SystemRequest {
    pub project_id: String,
    pub status: SystemRequestStatus,
    pub project_sponsor: String,
    pub business_need: String,
    pub business_requirements: Vec<String>,
    pub business_value: String,
    pub special_issues: String,
    pub created_at: DateTime<Utc>,
    pub approved_by: Option<String>,
    pub approved_at: Option<DateTime<Utc>>,
}

impl SystemRequest {
    pub fn new(project_id: &str) -> Self {
        Self {
            project_id: project_id.to_string(),
            status: SystemRequestStatus::Pending,
            project_sponsor: String::new(),
            business_need: String::new(),
            business_requirements: Vec::new(),
            business_value: String::new(),
            special_issues: String::new(),
            created_at: Utc::now(),
            approved_by: None,
            approved_at: None,
        }
    }

    pub fn set_project_sponsor(&mut self, sponsor: &str) {
        self.project_sponsor = sponsor.to_string();
        self.update_status();
    }

    pub fn set_business_need(&mut self, need: &str) {
        self.business_need = need.to_string();
        self.update_status();
    }

    pub fn add_business_requirement(&mut self, req: &str) {
        self.business_requirements.push(req.to_string());
        self.update_status();
    }

    fn update_status(&mut self) {
        if matches!(self.status, SystemRequestStatus::Pending) {
            self.status = SystemRequestStatus::InProgress;
        }
    }

    pub fn approve(&mut self, admin_name: &str) -> Result<(), &'static str> {
        if self.business_need.is_empty() {
            return Err("Cannot approve: Business Need is required.");
        }
        self.status = SystemRequestStatus::Approved;
        self.approved_by = Some(admin_name.to_string());
        self.approved_at = Some(Utc::now());
        Ok(())
    }
}
