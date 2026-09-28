# Sprint 14 — Integration, QA & Production Hardening

## Purpose
Sprint 14 validates the full commercial-to-delivery lifecycle and hardens the highest-risk state transitions before production deployment.

## End-to-end path exercised
1. Qualification
2. Lead creation
3. CRM lifecycle
4. Proposal preparation/approval
5. Engagement activation
6. Kickoff and delivery
7. Governance records
8. Financial schedule/invoice/payment
9. Closeout acceptance
10. Handover
11. Outcomes and lessons
12. Improvement action
13. Archive

## Failure paths exercised
- Invalid engagement transition is rejected.
- Closeout cannot archive while outstanding work remains.
- Payment cannot exceed the remaining invoice balance.

## Hardening added
- Shared client workflow guards for lead/engagement transitions.
- Backend transition validation for lead and engagement status changes.
- Positive payment amount validation.
- Transactional invoice payment update with row locking.
- Closeout readiness gate checks acceptance, outstanding work, handover and commercial clearance.
- JavaScript syntax validation across application and backend files.
- Repeatable integration test command.

## Production gaps still requiring deployment work
- PostgreSQL instance, migrations and backup policy.
- Secrets manager / managed environment variables.
- HTTPS and domain configuration.
- Object storage + malware scanning for uploaded documents.
- Email/SMS/WhatsApp notification provider.
- Payment gateway and reconciliation integration if online payments are required.
- Monitoring, centralized logs and alerting.
- Automated database migration pipeline.
- Automated browser/E2E tests in CI.
- Data retention, privacy and access-review procedures.
- Disaster-recovery rehearsal.

## Exit criteria
The platform is ready to move into a deployment project when the remaining production gaps are explicitly owned, tested and signed off. Sprint 14 does not claim that production infrastructure is already deployed.
