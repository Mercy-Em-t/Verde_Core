# Sprint 17 — Staging Deployment & Real UAT

## Objective
Establish a real staging environment for the Sprint 16 baseline, execute end-to-end human acceptance, and produce evidence for the production decision.

## Deployment sequence
1. Provision PostgreSQL 16 or managed PostgreSQL.
2. Set `POSTGRES_PASSWORD`, `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN` and deployment-specific values through a secrets mechanism.
3. Apply `backend/db/schema.sql`.
4. Build/deploy the API and web containers.
5. Put Nginx/reverse proxy behind HTTPS.
6. Create non-production admin/consultant/client test identities.
7. Verify `/health` and authentication.
8. Run Sprint 17 negative and positive tests.
9. Execute backup/restore test.
10. Record UAT evidence and defects.
11. Obtain business acceptance before production promotion.

## Security rules
- Never commit `.env` files or credentials.
- Use unique staging secrets; never reuse production credentials.
- Do not use real client personal/confidential data in UAT unless the environment is explicitly approved for it.
- Keep staging data isolated from production.
- Enable HTTPS before client-facing UAT.
- Restrict database network access to the application/private network.

## Promotion rule
A passing automated suite is necessary but not sufficient. Production promotion requires the live staging checklist, human UAT evidence, security checks, backup/restore evidence and an explicit business sign-off.
