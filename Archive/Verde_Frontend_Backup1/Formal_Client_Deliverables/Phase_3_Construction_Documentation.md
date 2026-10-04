# Phase 3: Construction & Backend API Bindings
**SDLC System Documentation & Runbook**

## 1. Programming & Code Construction Implementation
*SDLC Step Ref: Code implementation documentation*

This phase focused on translating the Phase 2 Architecture (Static Blueprint) into a live, dynamically hydrated web application.
- **Backend Environment:** Node.js, Express.js.
- **Database Engine:** PostgreSQL (running inside Docker `deploy-db-1`).
- **Data Hydration Strategy:** The UI templates (`my-project.html`, `admin.html`, `admin-client-profile.html`) no longer rely on localized mock states. All data is fetched dynamically on page load via authenticated `GET /api/*` requests.

### Key Endpoint Deliverables
1.  **Lead Management (`GET`, `POST`, `PATCH` `/api/leads`)**
    -   Handles initial form submissions.
    -   Repaired SQL query parameter injection to prevent corruption.
    -   **Pipeline Filter:** Refined the `GET` query to `WHERE l.status NOT IN ('Won', 'Lost')` to ensure a focused, un-cluttered admin inbox.
2.  **Project Domain (`GET /api/projects/:id`)**
    -   Instantiated via Domain-Driven Design (DDD) rules upon invoice payment.
    -   Hydrates client progress bars and dynamic stage rendering in real-time.
3.  **Financial Gatekeeper Webhook (`POST /api/webhooks/quickbooks`)**
    -   Asynchronous listener that awaits a `payment_cleared` event payload from QuickBooks.
    -   Upon receiving validation, it triggers the entity promotion (Lead → Project).

---

## 2. Security & Compliance Protocol
*SDLC Step Ref: Defect Severity Protocol & Security Sign-Off*

- **HMAC Signature Validation:** 
  The QuickBooks webhook listener was patched to enforce Intuit's `intuit-signature` HMAC-SHA256 protocol. The application reads the incoming payload, hashes it against the `QB_WEBHOOK_SECRET` stored in the environment, and drops unauthorized traffic.
- **Single Sign-On (OAuth 2.0):**
  Tool Stack integration has been established via standard OAuth 2.0 redirection flows. A normalized `oauth_tokens` table was engineered to securely store access and refresh keys linked to the `users` table via `user_id` UUIDs.

---

## 3. Test Suite Matrix
*SDLC Step Ref: Software Testing & Defect Management*

| Test ID | Component / Endpoint | Input / Condition | Expected Output | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TS-01** | Lead Submission (`POST`) | Valid form payload submitted by client | 201 Created. Inserted successfully into `leads` table. | ✅ PASS |
| **TS-02** | Qualification Flow (`PATCH`) | Status mapped to "Qualified" via UI | Lead flagged. Simulated KES 350,000 Invoice generated to client email. | ✅ PASS |
| **TS-03** | Auto-Promotion (Webhook) | Valid `payment_cleared` payload + correct HMAC signature | Lead status → Won. Project created in `projects` table. | ✅ PASS |
| **TS-04** | Project Hydration (UI) | Navigate to `my-project.html?projectId=...` | Dynamic fetch of project state, progress bars, and latest 3 comms. | ✅ PASS |
| **TS-05** | Admin CRM Hydration (UI) | Navigate to `admin-client-profile.html` | DOM is injected with client name, stage, and active project cards. | ✅ PASS |

---

## 4. Technical System Runbook (For DevOps Transition)
*SDLC Step Ref: System Documentation & Runbook*

**Rebuilding the Environment:**
Whenever backend APIs or UI templates are patched, the container orchestration must be rebuilt seamlessly without downtime.

```bash
# 1. Bring down stale instances safely
docker-compose down

# 2. Rebuild images with latest codebase changes
docker-compose -f deploy/docker-compose.yml up -d --build

# 3. Verify Container Health
docker ps
docker logs deploy-api-1
```

**Database Access (Direct Query):**
```bash
docker exec -it deploy-db-1 psql -U tryphene -d tryphene
```

---
*Document produced as per Tryphene Murugat SDLC Mandate. All check-boxes for Phase 3 Code Construction have been verified.*
