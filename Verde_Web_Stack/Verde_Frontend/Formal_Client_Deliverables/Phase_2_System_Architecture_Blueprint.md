# PHASE 2 DELIVERABLE: SYSTEM ARCHITECTURE BLUEPRINT
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
