# Sprint 17 — Automated Staging Preflight

This is the automated gate that can run before deployment or UAT.

## Local result from this build
- Sprint 16 UAT/preflight: **19/19 passed**
- Sprint 14 regression: **11/11 passed**
- Docker runtime: **not available in this execution environment**, so no live container deployment or health check was claimed.

## Required live staging checks
1. `GET /health` returns HTTP 200 and `ok: true`.
2. Login with each test role succeeds.
3. `/api/auth/me` returns the expected role.
4. Protected endpoint rejects unauthenticated requests.
5. Client role is denied admin/consultant mutation routes.
6. PostgreSQL schema initializes successfully.
7. Audit log records a representative mutation.
8. Backup is created and restored to a disposable database.
9. HTTPS certificate and secure headers are verified.
10. Staging smoke/UAT scenarios are executed using `SPRINT-17-STAGING-UAT.md`.
