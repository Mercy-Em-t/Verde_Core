CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'consultant' CHECK (role IN ('admin','consultant','viewer','client')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS oauth_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  provider text NOT NULL,
  access_token text NOT NULL,
  refresh_token text,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider)
);


CREATE TABLE IF NOT EXISTS leads (
  id text PRIMARY KEY,
  organisation text NOT NULL DEFAULT '',
  industry text NOT NULL DEFAULT '',
  contact text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  stage text NOT NULL DEFAULT '',
  budget text NOT NULL DEFAULT '',
  timeline text NOT NULL DEFAULT '',
  docs text NOT NULL DEFAULT '',
  goal text NOT NULL DEFAULT '',
  selected_phases jsonb NOT NULL DEFAULT '[]',
  score integer,
  route text NOT NULL DEFAULT 'Nurture / discovery',
  status text NOT NULL DEFAULT 'New',
  owner_id uuid REFERENCES users(id) ON DELETE SET NULL,
  client_id uuid REFERENCES users(id) ON DELETE SET NULL,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id text PRIMARY KEY,
  lead_id text REFERENCES leads(id) ON DELETE SET NULL,
  client_id uuid REFERENCES users(id) ON DELETE SET NULL,
  name text NOT NULL DEFAULT 'Your project',
  stage text NOT NULL DEFAULT 'explore',
  status text NOT NULL DEFAULT 'Exploring',
  selected_phases jsonb NOT NULL DEFAULT '[]',
  qualification jsonb NOT NULL DEFAULT '{}',
  next_action text NOT NULL DEFAULT '',
  checklist jsonb NOT NULL DEFAULT '{}',
  decisions jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cms_documents (
  key text PRIMARY KEY,
  content jsonb NOT NULL,
  version integer NOT NULL DEFAULT 1,
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id bigserial PRIMARY KEY,
  actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  entity_type text NOT NULL,
  entity_id text,
  action text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_owner ON leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_lead ON projects(lead_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);

CREATE TABLE IF NOT EXISTS proposals (
  id text PRIMARY KEY,
  number text UNIQUE NOT NULL,
  lead_id text REFERENCES leads(id) ON DELETE SET NULL,
  project_id text REFERENCES projects(id) ON DELETE SET NULL,
  client text NOT NULL DEFAULT '',
  contact text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  goal text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft','Sent','Approved','Declined','Expired')),
  items jsonb NOT NULL DEFAULT '[]',
  subtotal numeric(14,2) NOT NULL DEFAULT 0,
  discount numeric(14,2) NOT NULL DEFAULT 0,
  total numeric(14,2) NOT NULL DEFAULT 0,
  valid_days integer NOT NULL DEFAULT 14,
  assumptions jsonb NOT NULL DEFAULT '[]',
  payment_terms text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  approval jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_lead ON proposals(lead_id);


CREATE TABLE IF NOT EXISTS engagements (
  id text PRIMARY KEY, proposal_id text REFERENCES proposals(id) ON DELETE SET NULL, project_id text REFERENCES projects(id) ON DELETE SET NULL,
  client text NOT NULL DEFAULT '', status text NOT NULL DEFAULT 'Pending kickoff', current_phase_id integer, owner_id uuid REFERENCES users(id) ON DELETE SET NULL,
  kickoff jsonb NOT NULL DEFAULT '{}', phases jsonb NOT NULL DEFAULT '[]', next_action text NOT NULL DEFAULT '', activity jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_engagement_project ON engagements(project_id);
CREATE INDEX IF NOT EXISTS idx_engagement_status ON engagements(status);

CREATE TABLE IF NOT EXISTS governance_records (
  id text PRIMARY KEY,
  project_id text REFERENCES projects(id) ON DELETE CASCADE,
  engagement_id text REFERENCES engagements(id) ON DELETE SET NULL,
  documents jsonb NOT NULL DEFAULT '[]',
  decisions jsonb NOT NULL DEFAULT '[]',
  change_requests jsonb NOT NULL DEFAULT '[]',
  meetings jsonb NOT NULL DEFAULT '[]',
  approvals jsonb NOT NULL DEFAULT '[]',
  activity jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_governance_project ON governance_records(project_id);
CREATE INDEX IF NOT EXISTS idx_governance_engagement ON governance_records(engagement_id);


CREATE TABLE IF NOT EXISTS invoices (
  id text PRIMARY KEY, number text UNIQUE NOT NULL, project_id text REFERENCES projects(id) ON DELETE SET NULL, proposal_id text REFERENCES proposals(id) ON DELETE SET NULL,
  client text NOT NULL DEFAULT '', description text NOT NULL DEFAULT '', status text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft','Issued','Partially paid','Paid','Void','Overdue')),
  amount numeric(14,2) NOT NULL DEFAULT 0, paid numeric(14,2) NOT NULL DEFAULT 0, due_date date, notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_invoices_project ON invoices(project_id);
CREATE TABLE IF NOT EXISTS payments (
  id text PRIMARY KEY, invoice_id text REFERENCES invoices(id) ON DELETE CASCADE, project_id text REFERENCES projects(id) ON DELETE SET NULL, amount numeric(14,2) NOT NULL DEFAULT 0,
  paid_date date NOT NULL DEFAULT CURRENT_DATE, method text NOT NULL DEFAULT 'Bank transfer', reference text NOT NULL DEFAULT '', notes text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE TABLE IF NOT EXISTS change_orders (
  id text PRIMARY KEY, project_id text REFERENCES projects(id) ON DELETE CASCADE, proposal_id text REFERENCES proposals(id) ON DELETE SET NULL, title text NOT NULL, description text NOT NULL DEFAULT '',
  amount numeric(14,2) NOT NULL DEFAULT 0, status text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft','Submitted','Approved','Declined')), decision_note text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_change_orders_project ON change_orders(project_id);

CREATE TABLE IF NOT EXISTS closeout_records (
  id text PRIMARY KEY,
  project_id text REFERENCES projects(id) ON DELETE CASCADE,
  engagement_id text REFERENCES engagements(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'Open' CHECK (status IN ('Open','Awaiting final acceptance','Accepted','Closed')),
  acceptance jsonb NOT NULL DEFAULT '{}',
  outstanding jsonb NOT NULL DEFAULT '[]',
  outcomes jsonb NOT NULL DEFAULT '[]',
  lessons jsonb NOT NULL DEFAULT '[]',
  handover jsonb NOT NULL DEFAULT '{}',
  improvement jsonb NOT NULL DEFAULT '{}',
  archive jsonb NOT NULL DEFAULT '{}',
  activity jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_closeout_project ON closeout_records(project_id);
CREATE INDEX IF NOT EXISTS idx_closeout_status ON closeout_records(status);

CREATE TABLE IF NOT EXISTS project_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text REFERENCES projects(id) ON DELETE CASCADE,
  phase_number integer NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Awaiting Sign-off', 'Completed')),
  signoff_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, phase_number)
);

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text REFERENCES projects(id) ON DELETE CASCADE,
  phase_number integer,
  title text NOT NULL,
  url text NOT NULL,
  visibility text NOT NULL DEFAULT 'client' CHECK (visibility IN ('internal', 'client')),
  uploaded_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text REFERENCES projects(id) ON DELETE CASCADE,
  phase_number integer,
  author_id uuid REFERENCES users(id) ON DELETE SET NULL,
  body text NOT NULL,
  type text NOT NULL DEFAULT 'general' CHECK (type IN ('general', 'update', 'signoff_request', 'signoff_approval')),
  created_at timestamptz NOT NULL DEFAULT now()
);

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
