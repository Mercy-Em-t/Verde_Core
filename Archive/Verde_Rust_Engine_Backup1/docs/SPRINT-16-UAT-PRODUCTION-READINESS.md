# Sprint 16 — UAT & Production Readiness

Sprint 16 shifts the platform from feature construction to controlled acceptance.

## Scope

- End-to-end UAT scenarios across acquisition, CRM, proposal, engagement, delivery, governance, finance and closeout.
- Automated regression against the Sprint 14 workflow suite.
- JavaScript syntax validation.
- Deployment configuration sanity checks.
- Formal defect severity and acceptance rules.
- Production go/no-go gates.

## Important boundary

This sprint does not claim that a live production environment has been deployed or that real-user acceptance has occurred. Those require an actual staging environment, real credentials/accounts, a business tester and operational evidence.

## Recommended execution order

1. Unpack Sprint 16 package.
2. Run `node qa-sprint16-uat.mjs`.
3. Start the staging stack using `deploy/docker-compose.yml` in a controlled environment.
4. Execute `qa/UAT-TEST-PLAN.md` manually in a browser and API client.
5. Record defects with severity and evidence.
6. Retest fixes.
7. Complete backup/restore and rollback drills.
8. Complete `qa/PRODUCTION-GO-NO-GO.md`.
9. Obtain business and technical sign-off.
