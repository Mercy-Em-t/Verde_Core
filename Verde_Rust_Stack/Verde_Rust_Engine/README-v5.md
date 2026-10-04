# Tryphen Murugat — V5 Smart Project Journey

## New layer
This build introduces a browser-persistent Project State Engine.

### Core state
Stored in `localStorage` under `tm_project`:
- project ID
- project name
- customer journey stage
- selected phases
- qualification data
- next action
- status
- state history

### Shared state file
`project-state.js`

### Customer-facing pages
- `tryphene-sdlc-commercial-platform-v1.html` — services, qualifier and cart
- `journey.html` — dynamic customer journey
- `phase.html?phase=1..4` — dedicated phase pages
- `my-project.html` — persistent project view

### Admin
`admin.html` shows the current browser project state and captured leads.

## Important
This is intentionally frontend-only persistence for the prototype. The state model is structured so it can later be moved to a server/database without redesigning the customer journey.

## V5.2 — Sprint 6 Customer Journey Engine
- Customer Journey Playbook now acts as a live project-state view.
- Shows current stage, progress, selected phases, next action, client inputs, consultancy outputs, expected outcome, optional add-ons and common client choices.
- `project-state.js` now records stage changes, phase selections/removals, qualification events, checklist updates and decisions.
- My Project includes a Journey Snapshot linked to the full playbook.
- CMS-backed journey title/introduction remains editable through `cms.js`.
- Current persistence is still browser-local for prototype use; Sprint 7 should move the same state model to authenticated backend persistence.

## V5.2 / Sprint 7 — CRM + persistence-ready operations layer
- Added `crm.js` as a repository boundary for leads, status lifecycle, ownership, notes, tasks and activity history.
- Added CRM lifecycle: New → Review → Contacted → Discovery booked → Qualified → Proposal → Won / Lost.
- Admin console now supports lead inspection, status transitions, assignment, notes and tasks.
- Website qualification now writes into the CRM repository while retaining a compatibility mirror in `tm_leads`.
- Current adapter is browser-local for the prototype. The `TMCRM` API is intentionally isolated so the next production adapter can replace localStorage with authenticated API/database persistence without redesigning the UI.
- Production hardening still required: authentication, authorization, server-side validation, database persistence, audit logging, backups and notification integrations.

## V5.2 — Sprint 8 Production Architecture
- Added `runtime-config.js` and `api-client.js` as a clean boundary between browser demo persistence and a future authenticated API.
- Added `backend/` PostgreSQL/Express starter with authentication, roles, leads, projects, CMS and audit logging.
- Added `backend/db/schema.sql`, `.env.example`, admin seed helper, and production architecture/security guide.
- Default remains prototype/local mode; production API mode is opt-in through `runtime-config.js`.

## V5.3 — Sprint 9 Commercial Transaction Layer
- Added `proposal.html` + `proposal.js` for proposal creation from the current project state.
- Proposal workflow: Draft → Sent → Approved / Declined / Expired.
- Proposals contain selected phases, indicative pricing, scope gates, assumptions, payment terms, notes and approval record.
- Approved proposals can be activated into the project journey and carry the proposal reference into project state.
- Added PostgreSQL `proposals` table and authenticated API routes for proposal list, create, read and update.
- Admin console now links directly to the Proposal Builder.
- Prototype mode remains browser-persistent; API mode has proposal endpoints ready for authenticated deployment.


## Sprint 10 — Engagement & Delivery Activation
- Added `engagement.js` and `delivery.html`.
- Approved proposals can activate a delivery engagement.
- Engagement workflow: Pending kickoff → Kickoff scheduled → In delivery → Awaiting client approval → Phase gated → Completed / On hold.
- Delivery workspace tracks kickoff, phases, deliverables, tasks, client approvals and activity.
- Project state now carries proposal and engagement references and synchronizes the current delivery action.
- Added PostgreSQL `engagements` table and authenticated engagement API endpoints.
- Browser persistence remains available for prototype mode; production deployment should use the API/database with authenticated users.


## Sprint 12 — Financial & Commercial Control

Adds the commercial control loop around active projects: fee schedules, invoices, payment recording, outstanding balances, and change orders. Browser prototype persistence is provided by `finance.js` and `finance.html`; production mode adds PostgreSQL tables for `invoices`, `payments`, and `change_orders` plus authenticated API endpoints. Approved change orders are kept separate from original proposal scope so commercial impact remains auditable.


## V5.13 — Sprint 13 Closeout, Outcomes & Continuous Improvement
- Added `closeout.html` and `closeout.js`.
- Final acceptance, outstanding-item tracking, outcomes/benefits, lessons learned, handover, improvement actions and close/archive state.
- Added PostgreSQL `closeout_records` with authenticated API endpoints and audit logging.
- Closeout feeds the engagement into the Improve stage rather than ending at a static completion screen.
- Prototype mode continues to use browser persistence; production mode uses the API/database boundary.

## V5.14 — Integration, QA & Production Hardening

Sprint 14 adds end-to-end workflow regression coverage and hardening across acquisition, CRM, proposal, engagement, governance, finance and closeout. See `docs/SPRINT-14-INTEGRATION-HARDENING.md` and `qa/PRODUCTION-READINESS.md`.

Repeatable workflow test: `node qa-sprint14-integration.mjs` or `cd backend && npm test`.

## V5.16 / Sprint 17
Sprint 17 establishes the real staging/UAT workstream. See `docs/SPRINT-17-STAGING-DEPLOYMENT.md`, `qa/SPRINT-17-STAGING-UAT.md`, and `qa/SPRINT-17-STAGING-PREFLIGHT.md`. The automated preflight is `qa-sprint17-preflight.mjs`. A live staging environment was not provisioned in this build environment; deployment and human UAT remain explicit acceptance gates.
