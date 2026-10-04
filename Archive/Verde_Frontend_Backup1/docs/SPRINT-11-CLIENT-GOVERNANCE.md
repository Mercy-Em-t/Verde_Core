# Sprint 11 — Client Collaboration & Governance

Sprint 11 adds a shared governance layer around active engagements.

## Client-facing capabilities
- Document exchange records
- Decision register
- Change request register
- Meeting records and next actions
- Deliverable / phase / decision / change approvals
- Governance activity history

## Local prototype
`governance.js` stores the governance record in browser persistence under `tm_governance_v1`.

## Production API
The backend adds `governance_records` and authenticated endpoints:
- `GET /api/governance/:projectId`
- `POST /api/governance`
- `PATCH /api/governance/:id`

All write endpoints require an authenticated admin or consultant and are audited.

## Boundary
This sprint records governance metadata and workflow state. It does not upload binary files to storage yet. A production deployment should add object storage, signed URLs, malware scanning, retention rules, and document access permissions before handling client files.
