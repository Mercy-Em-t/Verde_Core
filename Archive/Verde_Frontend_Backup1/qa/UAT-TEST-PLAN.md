# Sprint 16 — UAT & Production Readiness Test Plan

## Objective
Validate that the commercial platform works as one business workflow and identify any remaining production blockers before go-live.

## UAT scenarios

| ID | Scenario | Acceptance criterion |
|---|---|---|
| UAT-01 | Visitor qualifies | Lead is captured with qualification result and journey stage. |
| UAT-02 | Lead lifecycle | Lead can move through New → Review → Contacted → Discovery → Qualified → Proposal → Won/Lost using permitted transitions. |
| UAT-03 | Proposal | Selected phases, pricing, assumptions and validity are represented correctly. |
| UAT-04 | Approval to engagement | Approved proposal can activate an engagement and preserve project references. |
| UAT-05 | Delivery | Engagement phase, tasks, deliverables and next action remain visible and coherent. |
| UAT-06 | Governance | Decisions, meetings, change requests and approvals are recorded and auditable. |
| UAT-07 | Finance | Fee schedule, invoice balances, payments and change-order values reconcile. |
| UAT-08 | Closeout | Archive is blocked until required acceptance, handover and outstanding-work conditions are satisfied. |
| UAT-09 | Improve | Lessons and improvement actions can be recorded after closeout. |
| UAT-10 | Permissions | Unauthenticated or insufficiently privileged users cannot perform protected operational actions. |
| UAT-11 | Failure paths | Invalid state transitions, overpayments and incomplete closeout conditions are rejected cleanly. |
| UAT-12 | Deployment | Staging stack starts, health endpoint responds, static web is served and `/api` is routed to the backend. |

## Evidence to capture

- Test date/time
- Tester
- Environment and build identifier
- Screenshot or request/response evidence for each failed or ambiguous case
- Defect ID for every failure
- Retest result after remediation

## Severity

- **P0:** security/data-loss/complete outage; blocks go-live.
- **P1:** critical business workflow blocked or materially incorrect; blocks go-live.
- **P2:** important defect with workaround; may be accepted with owner/date.
- **P3:** cosmetic/minor issue; can be deferred.

## Exit criteria

- All P0/P1 defects closed.
- P2 defects have explicit owner and target date if accepted.
- Regression suite passes.
- Staging deployment and rollback procedure exercised.
- Backup/restore test evidenced.
- Security review completed.
- Business owner signs the go/no-go decision.
