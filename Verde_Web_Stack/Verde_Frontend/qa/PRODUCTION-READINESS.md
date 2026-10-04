# Production Readiness Checklist

## Application
- [x] End-to-end state path simulated
- [x] Invalid workflow transitions tested
- [x] Closeout gate tested
- [x] Payment overrun tested
- [x] JavaScript syntax checked
- [ ] Automated browser tests
- [ ] Accessibility audit
- [ ] Cross-browser acceptance test

## API & security
- [x] Authentication boundary exists
- [x] Role checks exist on operational writes
- [x] Parameterized SQL used
- [x] Request size limit
- [x] Rate limiting
- [x] Security headers
- [ ] Secret management service
- [ ] HTTPS certificate/domain
- [ ] Centralized monitoring
- [ ] Security review / penetration test

## Data
- [x] PostgreSQL schema exists
- [x] Audit log exists
- [ ] Production migrations
- [ ] Automated backups
- [ ] Restore rehearsal
- [ ] Retention policy

## Files & collaboration
- [ ] Object storage
- [ ] Signed URLs
- [ ] Malware scanning
- [ ] Retention/access policy

## Commercial operations
- [x] Proposal lifecycle
- [x] Engagement lifecycle
- [x] Invoice/payment ledger
- [x] Change orders
- [x] Closeout
- [ ] Payment gateway/reconciliation
- [ ] Accounting export/integration

## Go-live gate
Do not treat the prototype package as production-deployed until all unchecked items that apply to the intended operating model have an owner, implementation plan and acceptance evidence.
