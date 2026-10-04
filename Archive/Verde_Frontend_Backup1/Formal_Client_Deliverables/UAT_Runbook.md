# User Acceptance Testing (UAT) Runbook
**Project:** Tryphene Commercial Platform v5  
**Phase:** 4 - Pre-Production Readiness  

To officially certify this application as production-ready, please act as **Client Zero** and execute the following manual tests. Check the box when the expected behavior is verified.

## Scenario 1: New Client Ingestion
- [ ] **Action:** Go to `index.html`, fill out the "Does your architecture scale?" form, and submit.
- [ ] **Expected Result:** The page shows a success message.
- [ ] **Verification:** Log in to `admin.html`. The new lead should appear in the Inbound Pipeline on `admin-leads.html`.

## Scenario 2: Lead Promotion & QuickBooks Webhook
- [ ] **Action:** On `admin-leads.html`, find your new lead and click "Convert to Phase 1".
- [ ] **Expected Result:** The backend simulates sending an invoice. Exactly 2 seconds later, the QuickBooks webhook fires automatically.
- [ ] **Verification:** The lead vanishes from the active pipeline (it is now 'Won'). Navigate to the `admin.html` dashboard—the new project should occupy a slot in the Portfolio Matrix.

## Scenario 3: Admin CRM Hydration
- [ ] **Action:** On the `admin.html` dashboard, click the new project card in the Portfolio Matrix.
- [ ] **Expected Result:** You are routed to `admin-client-profile.html?projectId=...`.
- [ ] **Verification:** The client's name, stage, and project cards render dynamically without dummy text.

## Scenario 4: Client Portal Experience
- [ ] **Action:** Copy the `projectId` from the URL above and paste it into `my-project.html?projectId=...`
- [ ] **Expected Result:** The Client Portal opens.
- [ ] **Verification:** The Phase progress bar accurately reflects the 'explore' stage. The project name and internal communication logs populate from the database.

## Scenario 5: External Tool Stack SSO
- [ ] **Action:** On the `admin.html` dashboard, click the GitHub SSO and QuickBooks SSO buttons.
- [ ] **Expected Result:** A new tab opens simulating the OAuth 2.0 flow.
- [ ] **Verification:** The flow completes successfully and prompts you to close the tab and return to the orchestrator.

---
**Sign-Off:**  
Once all boxes are checked, the system is verified and cleared for final cloud provisioning.
