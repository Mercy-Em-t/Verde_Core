use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum FeasibilityVerdict {
    Pending,
    Proceed,
    Halt,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FeasibilityStudy {
    pub technical_feasibility: String,
    pub economic_feasibility: String,
    pub organizational_feasibility: String,
    pub final_verdict: FeasibilityVerdict,
    pub approved_by: Option<String>,
}

impl FeasibilityStudy {
    pub fn new() -> Self {
        Self {
            technical_feasibility: String::new(),
            economic_feasibility: String::new(),
            organizational_feasibility: String::new(),
            final_verdict: FeasibilityVerdict::Pending,
            approved_by: None,
        }
    }

    pub fn set_metrics(&mut self, tech: &str, econ: &str, org: &str) {
        self.technical_feasibility = tech.to_string();
        self.economic_feasibility = econ.to_string();
        self.organizational_feasibility = org.to_string();
    }

    pub fn approve(&mut self, admin_name: &str, proceed: bool) -> Result<(), &'static str> {
        if self.technical_feasibility.is_empty() {
            return Err("Cannot approve: Missing technical feasibility metrics.");
        }
        
        self.final_verdict = if proceed {
            FeasibilityVerdict::Proceed
        } else {
            FeasibilityVerdict::Halt
        };
        
        self.approved_by = Some(admin_name.to_string());
        Ok(())
    }
}
