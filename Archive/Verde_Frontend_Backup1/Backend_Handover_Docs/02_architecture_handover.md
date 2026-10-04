# System Handover Blueprints: Tryphene Commercial Platform v5

## 1. Goal Description & Executive Summary
This document serves as the formal architectural handover for the **Tryphene Commercial Platform v5**. The Lead Architect has established the routing, containerization, database schemas, and User Interfaces for the 4-Phase SDLC workflow.

The objective of this handover is to instruct the **Subcontractor Engineering Team** on how to take the currently static/semi-static HTML UI dashboards and dynamically bind them to the existing Node.js/PostgreSQL backend API.

---

## 2. Current Architectural State

### 2.1 Infrastructure (Dockerized)
* **Web Container (Nginx 1.27-alpine):** Serves the static HTML/JS frontend. Handles client-side routing on Port 8091.
* **API Container (Node 20-alpine):** Express.js backend running on Port 8080.
* **DB Container (PostgreSQL 15-alpine):** Relational database running on Port 5432.
* **Reverse Proxy:** Nginx routes `/api/*` traffic directly to the Node container.

### 2.2 Frontend Application Stack (Vanilla JS + TailwindCSS)
The frontend is built for extreme speed and decoupling, using vanilla HTML/JS with Tailwind CDN.
* **Client Portal:** `my-project.html`, `start-project.html` (Onboarding/Assessment)
* **Admin / Orchestrator HUD:** 
  * `admin.html` (Global HUD)
  * `admin-leads.html` (Inbound Pipeline & Phase 1 Qualifier)
  * `admin-jad-dashboard.html` (Phase 1 & 2 Workshop Facilitation)
  * `admin-analyst.html` (Phase 2 Technical Desk Work & Blueprint Sign-offs)
  * `admin-finance.html` (Phase 3 Financial Ledger & Invoice Escrow)
  * `admin-engineering.html` (Phase 3 Subcontractor Kanban & Ticket Generation)
  * `admin-templates.html` (SOPs and Project Artifact Templates)

### 2.3 Backend API & Database (Node + Postgres)
* The database schema (`backend/db/schema.sql`) strictly defines the tables: `users`, `leads`, `projects`, `phases`, `tasks`, and `project_artifacts`.
* The API (`backend/src/server.js`) handles CRUD operations and role-based access control (RBAC).

---

## 3. Outstanding Engineering Tasks (Subcontractor Backlog)

> [!IMPORTANT]
> **Subcontractor Mandate:** Do not alter the UI layout, Tailwind classes, or NGINX routing configurations. Your strict mandate is to wire the Javascript `fetch()` calls on the front-end to the PostgreSQL API.

### Task 1: Dynamic Data Binding for `admin-leads.html`
* **Current State:** The page displays a static mock representation of the "Apex SACCO" lead.
* **Desired Change:** Write a `fetch('/api/leads')` call on `window.onload` to pull the actual leads inserted by the `start-project.html` form. Render the qualification radio buttons dynamically for the newest lead in the queue.

### Task 2: Escrow Ledger Automation (`admin-finance.html`)
* **Current State:** The matrix showing "Cleared" vs "Pending" Tranches is static HTML.
* **Desired Change:** Map the Tranche UI cards to a new API endpoint (e.g., `GET /api/projects/:id/invoices`) so the Orchestrator can dynamically click "Mark as Cleared" and update the database state to unlock the Engineering portal.

### Task 3: Engineering Ticket Generation (`admin-engineering.html`)
* **Current State:** Clicking "Auto-Generate from Phase 2 Use Cases" reveals static DOM elements.
* **Desired Change:** Create an endpoint `POST /api/projects/:id/tickets/generate` that reads the `project_artifacts` table for a specific project, and automatically generates task rows in the `tasks` table. The frontend should then fetch and render these rows.

---

## 4. Verification Plan

### Automated API Tests
* Subcontractors must provide passing Postman/Jest collections for:
  * `POST /api/leads` (Already patched and verified by Lead Architect)
  * `GET /api/leads` (Ensuring it returns valid JSON arrays for the dashboard)

### Manual UI Verification
1. Open `http://localhost:8091/start-project.html` and submit a diagnostic.
2. Open `http://localhost:8091/admin-leads.html` and verify the newly submitted diagnostic appears dynamically on the screen without a hard refresh.
3. Click "Convert to Phase 1" and verify a `PATCH /api/leads/:id` request fires, updating the lead's status in PostgreSQL to "Phase 1 Active".
