-- Sprint 23: Leads Qualification

ALTER TABLE leads ADD COLUMN company_size VARCHAR(50);
ALTER TABLE leads ADD COLUMN funding_status VARCHAR(100);
ALTER TABLE leads ADD COLUMN estimated_budget DECIMAL(12,2) DEFAULT 0;
ALTER TABLE leads ADD COLUMN is_unqualified BOOLEAN DEFAULT false;
