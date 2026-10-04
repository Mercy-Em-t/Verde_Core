# Sprint 16 — Production Go/No-Go Checklist

## Automated baseline

- [x] Sprint 14 integration regression suite passes 11/11 checks.
- [x] Platform JavaScript syntax checks are runnable from the QA suite.
- [x] Deployment configuration contains web, API and PostgreSQL services.

## Must be completed in staging before Go

- [ ] Real staging PostgreSQL provisioned.
- [ ] Secrets supplied through a secret store; no production secrets in files.
- [ ] HTTPS and domain configured.
- [ ] Authentication and role permissions tested with real accounts.
- [ ] Database migrations applied successfully.
- [ ] Backup and restore test completed.
- [ ] File/object storage configured if document uploads are enabled.
- [ ] Monitoring, logging and alerting configured.
- [ ] Payment integration/settlement controls tested if enabled.
- [ ] Security review completed.
- [ ] Browser-based UAT completed by business owner.
- [ ] Rollback procedure exercised.
- [ ] P0/P1 defects = 0.

## Decision

**GO** only when all mandatory staging gates are complete and the business owner signs acceptance.

**NO-GO** if any mandatory gate is incomplete, a P0/P1 defect remains, or rollback/restore has not been demonstrated.

Decision: ____________________

Business owner: ____________________

Technical owner: ____________________

Date: ____________________
