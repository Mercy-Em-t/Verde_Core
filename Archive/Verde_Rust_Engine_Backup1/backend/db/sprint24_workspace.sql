CREATE TABLE IF NOT EXISTS project_artifacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id VARCHAR(80) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  week_id INT NOT NULL,
  step_id VARCHAR(20) NOT NULL,
  raw_material TEXT,
  generated_template TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, step_id)
);
