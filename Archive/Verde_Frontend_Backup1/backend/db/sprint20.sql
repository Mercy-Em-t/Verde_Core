-- Sprint 20 Migrations

CREATE TABLE IF NOT EXISTS qa_rubrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_number integer NOT NULL,
  deliverable_type text NOT NULL,
  criteria jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(phase_number, deliverable_type)
);

CREATE TABLE IF NOT EXISTS document_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES users(id) ON DELETE SET NULL,
  results jsonb NOT NULL DEFAULT '[]',
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Passed', 'Failed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS qa_status text NOT NULL DEFAULT 'Pending' CHECK (qa_status IN ('Pending', 'Passed', 'Failed', 'Exempt')),
ADD COLUMN IF NOT EXISTS deliverable_type text;

ALTER TABLE project_phases
ADD COLUMN IF NOT EXISTS client_fee numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS specialist_cost numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS billing_type text;
