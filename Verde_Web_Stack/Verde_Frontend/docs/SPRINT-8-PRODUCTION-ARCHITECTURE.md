# Sprint 8 — Production Architecture & Security

## Objective
Move the platform from browser-local prototype persistence toward an authenticated, database-backed application without breaking the current demo mode.

## Architecture

```text
Public website
   │
   ├── Customer Journey / Qualifier
   │
   ▼
API boundary (/api)
   │
   ├── Authentication + roles
   ├── Lead / CRM services
   ├── Project state
   ├── CMS
   └── Audit log
   │
   ▼
PostgreSQL
```

## Runtime modes
- `prototype`: current localStorage behavior remains available.
- `production`: set `TM_CONFIG.apiEnabled = true` and point `apiBaseUrl` at the deployed API.

## Security baseline
- HTTPS at the edge.
- Helmet security headers.
- Strict CORS allow-list.
- Short-lived JWT access tokens; use an httpOnly secure cookie/session layer when deploying behind a trusted web app shell.
- Password hashes only; never store plaintext passwords.
- Role checks: `admin`, `consultant`, `viewer`.
- Rate limiting on API requests.
- Input validation with Zod.
- Parameterized SQL queries.
- Audit records for privileged mutations.
- Database backups and restore tests.
- Secrets supplied through environment variables / secret manager.
- Do not expose `DATABASE_URL`, JWT secrets, password hashes, or admin credentials to browser code.

## Database entities
`users`, `leads`, `projects`, `cms_documents`, `audit_log`.

## First production deployment sequence
1. Create PostgreSQL database.
2. Apply `backend/db/schema.sql`.
3. Create first admin user with a bcrypt password hash.
4. Set environment variables from `.env.example` in the hosting secret store.
5. Install backend dependencies and start the API.
6. Put the API behind HTTPS and an allow-listed domain.
7. Set `runtime-config.js` to production API mode.
8. Run authentication, CRUD, authorization, backup and restore tests.
9. Only then migrate real lead/project data.

## Deliberate boundary
The included API is a starter implementation, not a claim that a single file deployment is production-certified. Before handling real customer data, add environment-specific secret management, structured logging/monitoring, automated migrations, refresh-token/session hardening, CSRF protection if cookies are used, backup policy, error tracking, and a formal access review.
