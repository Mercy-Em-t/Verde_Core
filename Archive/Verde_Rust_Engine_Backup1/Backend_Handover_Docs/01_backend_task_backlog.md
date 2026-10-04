# Subcontractor Task Backlog (Backend Wiring & Integrations)

This is the master to-do list for the engineering team. The UI and architectural blueprints are 100% locked. The team's mandate is strictly to wire the frontend to the backend API and external webhooks.

## 1. Phase 1: Lead Conversion & Financial Triggers
- `[ ]` **UI Binding:** Wire the "Convert to Phase 1" button in `admin-leads.html` to fire a `PATCH /api/leads/:id` request.
- `[ ]` **Database Update:** Ensure the `PATCH` route updates the Lead's status to "Phase 1 Active" in the PostgreSQL `leads` table.
- `[ ]` **QuickBooks Webhook:** Inside the same `PATCH` route, trigger a server-side call to the QuickBooks API to instantly generate and email a KES 350,000 Phase 1 Retainer invoice to the client's email address.

## 2. Phase 2: Domain-Driven Design (Lead -> Project Promotion)
- `[ ]` **Invoice Webhook Listener:** Create an endpoint (e.g., `POST /api/webhooks/quickbooks`) to listen for a "Payment Cleared" signal from QuickBooks.
- `[ ]` **Entity Promotion:** When payment clears, automatically extract the data from the `leads` table and insert it into the `projects` table (preventing orphaned data and enforcing the financial gate).

## 3. Phase 3: Dashboard & Matrix Logic
- `[ ]` **Portfolio Matrix Binding:** Wire the `admin.html` Portfolio Matrix to fetch from `GET /api/projects?status=active`.
- `[ ]` **Orchestrator Routing:** Change the matrix card click event. Instead of going to the client portal, it should read the project's phase and route the Orchestrator to the correct internal tool (e.g., if Phase 2, route to `admin-analyst.html?projectId=123`).
- `[ ]` **Client Portal Hydration:** Wire `my-project.html` to fetch the project data and dynamically update the visual progress bar (Explore -> Define -> Design -> Build) based on the database state.

## 4. Phase 4: Third-Party SSO (Tool Stack)
- `[ ]` **OAuth Setup:** Implement standard OAuth 2.0 flows in `server.js` for QuickBooks, DocuSign, and GitHub.
- `[ ]` **Launchpad Routing:** Wire the Tool Stack Launchpad buttons in `admin.html` to hit the OAuth endpoints, allowing the Orchestrator to open authenticated sessions in new tabs without entering passwords.
