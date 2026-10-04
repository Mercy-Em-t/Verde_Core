-- Sprint 21 Migrations: Financial Logic, Phase 5, and Governance

-- 1. Projects updates (Freezing and Infrastructure URLs)
ALTER TABLE projects ADD COLUMN is_frozen BOOLEAN DEFAULT false;
ALTER TABLE projects ADD COLUMN github_url VARCHAR(2048);
ALTER TABLE projects ADD COLUMN staging_url VARCHAR(2048);
ALTER TABLE projects ADD COLUMN production_url VARCHAR(2048);

-- 2. Project Phases updates (Escrow and Phase 5 MRR)
ALTER TABLE project_phases ADD COLUMN escrow_cleared BOOLEAN DEFAULT false;
ALTER TABLE project_phases ADD COLUMN is_recurring BOOLEAN DEFAULT false;

-- 3. Proposals update (Withholding Tax tracking)
ALTER TABLE proposals ADD COLUMN wht_amount DECIMAL(12,2) DEFAULT 0;

-- Optionally seed a phase 5 rubric (SLA & Maintenance)
INSERT INTO qa_rubrics (phase_number, deliverable_type, criteria) 
VALUES (
    5, 
    'SLA & Maintenance Retainer', 
    '["Uptime & Performance: Verifiable 99.9% uptime over the billing cycle.", "Security: All core patches and dependency updates applied within 72 hours of release.", "Backups: Weekly automated database backups securely stored and verified.", "Support Hours: Dedicated block of developer hours tracked and logged for feature tweaks or bug fixes (Tier 2)."]'
) ON CONFLICT (phase_number, deliverable_type) DO UPDATE SET criteria = EXCLUDED.criteria;
