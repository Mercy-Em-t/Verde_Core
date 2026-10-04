# Sprint 12 — Financial & Commercial Control

## Purpose
Close the loop between sold scope, delivery milestones, cash collection and controlled scope change.

## Controls
- Fee schedule derived from an approved proposal.
- Invoice lifecycle: Draft → Issued → Partially paid → Paid; Void/Overdue supported.
- Payment records update invoice balances transactionally in API mode.
- Change orders are separate commercial records and require an explicit status decision.
- Commercial history is retained for prototype visibility and production audit logging.

## Production boundary
Actual payment processing is not included. Recording a payment is an operational ledger action; a future payment gateway integration should verify settlement independently.
