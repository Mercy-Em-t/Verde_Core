# Sprint 17 — Staging Deployment & Real UAT

## Purpose
Move the Sprint 16 baseline into a controlled staging environment and execute human acceptance against the complete business lifecycle.

## Staging entry criteria
- [ ] HTTPS-enabled staging URL available
- [ ] PostgreSQL instance provisioned
- [ ] API deployed with production-like environment variables
- [ ] Web deployed behind reverse proxy
- [ ] Admin account created through secure seed/administration process
- [ ] Consultant account created
- [ ] Client test account created
- [ ] Backup configured and restore point verified
- [ ] Monitoring/logging available

## UAT scenarios

### UAT-01 — Lead capture
**Given:** anonymous visitor
**When:** qualification form is completed
**Then:** a lead record is created with qualification data and routing.

### UAT-02 — CRM progression
**Given:** a new lead
**When:** operations advances it through permitted states
**Then:** the lifecycle, owner and activity history remain consistent.

### UAT-03 — Proposal
**Given:** qualified opportunity
**When:** a proposal is created, sent and approved
**Then:** selected phases, commercial values and approval state are retained.

### UAT-04 — Engagement activation
**Given:** approved proposal
**When:** engagement is activated
**Then:** delivery workspace is created and current phase/next action are visible.

### UAT-05 — Delivery and governance
**Given:** active engagement
**When:** a deliverable, decision, meeting, change request and approval are recorded
**Then:** governance history is visible and audit records are retained.

### UAT-06 — Finance
**Given:** project invoice
**When:** a valid payment is recorded
**Then:** invoice balance/status and financial summary update correctly.

### UAT-07 — Closeout
**Given:** completed delivery
**When:** acceptance, handover, outcomes and improvement actions are completed
**Then:** the project can be closed and archived.

### UAT-08 — Improve loop
**Given:** closed engagement with lessons
**When:** improvement actions are recorded
**Then:** lessons are available for the next improvement cycle.

## Negative tests
- [ ] Unauthorized user cannot access protected API routes
- [ ] Client cannot perform consultant/admin operations
- [ ] Invalid lifecycle transition is rejected
- [ ] Payment above invoice balance is rejected
- [ ] Missing required proposal/project data is rejected
- [ ] Closeout cannot archive while required work remains
- [ ] Expired/invalid authentication is rejected

## Evidence
For every scenario capture: test ID, date/time, tester, account used, record/reference IDs, screenshot or response evidence, result, defect ID if failed.

## Exit criteria
All critical/high defects resolved; all eight core UAT scenarios pass; backup/restore test passes; access-control checks pass; business owner signs the production-readiness decision.
