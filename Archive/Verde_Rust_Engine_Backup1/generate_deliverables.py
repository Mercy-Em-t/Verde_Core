import os

project_dir = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17'
docs_dir = os.path.join(project_dir, 'Formal_Client_Deliverables')

if not os.path.exists(docs_dir):
    os.makedirs(docs_dir)

phase_1_content = """# PHASE 1 DELIVERABLE: BUSINESS REQUIREMENTS & FEASIBILITY ANALYSIS
**Client:** Tryphene Murugat Consultancy (Internal "Client Zero")
**Project:** Tryphene Commercial Platform v5
**Date:** September 2026

## 1. Business Requirements Document (BRD)
**Problem Statement:**
The consultancy currently operates without a unified digital ecosystem. There is a disconnect between inbound lead generation, client onboarding, and project orchestration, resulting in high manual overhead and fragmented communication.

**Core Objectives:**
1. Establish a high-conversion public landing page ecosystem showcasing the SDLC methodology.
2. Build a secure, isolated Client CRM Hub for tracking project phases, invoices, and blueprints.
3. Deploy an Orchestrator/Admin Dashboard to manage subcontractor workflows and financial escrows.

## 2. Risk & Feasibility Analysis
**Technical Feasibility: HIGH**
- The system can be cleanly decoupled into a Front-End Node.js/HTML stack and a PostgreSQL database.
- Leveraging Docker ensures subcontractor environment parity and eliminates "works on my machine" defects.

**Operational Risks:**
- *Risk:* Subcontractors overwriting existing client data.
- *Mitigation:* Strict 1-to-Many relational hierarchy (Client > Project > Tasks) enforced via JWT Role-Based Access Control (RBAC).

## 3. Commercial Estimation Range
- **Phase 1 (Discovery):** Completed Internal
- **Phase 2 (Architecture):** Completed Internal
- **Phase 3 & 4 (Construction & Deployment):** Estimated at KES 350,000 - KES 500,000 for backend API bindings, PostgreSQL integration, and QuickBooks webhook automation.
"""

phase_2_content = """# PHASE 2 DELIVERABLE: SYSTEM ARCHITECTURE BLUEPRINT
**Client:** Tryphene Murugat Consultancy (Internal "Client Zero")
**Project:** Tryphene Commercial Platform v5
**Date:** September 2026

## 1. System Architecture Blueprint
**Topology:**
- **Web Layer:** Nginx reverse proxy serving static HTML, CSS (Tailwind), and client-side JS.
- **Application Layer:** Node.js (Express) handling API routing, JWT authentication, and external webhooks.
- **Data Layer:** PostgreSQL relational database running in an isolated Docker container.

## 2. 3NF Database Schema Specifications
*See attached `schema.sql` for exact DDL.*
- **Entity: Clients** (id, name, industry, total_value)
- **Entity: Projects** (id, client_id, name, status, budget)
- **Entity: Leads** (id, contact_name, email, organisation, phase)
- **Entity: Tasks** (id, project_id, description, assignee, status)

## 3. API Interface Contracts
The backend engineering team is contracted to build the following routes against the provided UI:
- `POST /api/auth/login`: Accepts credentials, returns JWT.
- `GET /api/clients/:id`: Returns Client CRM profile data.
- `POST /api/leads`: Ingests inbound assessments from the public landing page.
- `PATCH /api/projects/:id/status`: Updates SDLC phase progression.
- `POST /api/webhooks/quickbooks`: Triggers automated invoicing based on phase sign-off.

## 4. High-Fidelity UI/UX Wireframes
*Delivered.* The complete static HTML/Tailwind codebase has been finalized, approved by the Engagement Director, and deployed to the `deploy/` container.
"""

with open(os.path.join(docs_dir, 'Phase_1_BRD_and_Feasibility.md'), 'w', encoding='utf-8') as f:
    f.write(phase_1_content)

with open(os.path.join(docs_dir, 'Phase_2_System_Architecture_Blueprint.md'), 'w', encoding='utf-8') as f:
    f.write(phase_2_content)

print("Formal deliverables created successfully.")
