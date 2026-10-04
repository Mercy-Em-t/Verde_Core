# Sprint 15 — Deployment Engineering

This package is deployment-ready for a staging environment. It adds a Dockerized PostgreSQL + API + Nginx stack, environment templates, CI syntax checks, and an explicit production runbook.

## Local staging

1. Copy `deploy/.env.example` to `deploy/.env`.
2. Replace `POSTGRES_PASSWORD` and `JWT_SECRET` with long random values.
3. Run from `deploy/`:

```bash
docker compose --env-file .env up --build -d
```

4. Open `http://localhost:8080`.
5. Check `http://localhost:8080/health`.

The database schema is initialized from `backend/db/schema.sql` on first database creation.

## Important production steps before go-live

- Put TLS in front of Nginx (or use a managed HTTPS load balancer).
- Use a managed PostgreSQL service with automated backups and point-in-time recovery.
- Store `JWT_SECRET` and database credentials in a secrets manager, not `.env` files.
- Set `CORS_ORIGIN` to the exact HTTPS application origin.
- Replace the demo admin seed process with controlled account provisioning and MFA/SSO where appropriate.
- Add object storage + signed URLs for actual client files; the current governance layer stores metadata/state.
- Configure centralized logs, uptime checks, error tracking, and alerting.
- Run dependency and container vulnerability scans in CI.
- Add browser-level staging acceptance tests.
- Perform a security review before handling real client data.
- Define backup restore drills, retention, incident response, and data deletion procedures.

## Data migration

The existing browser prototype uses localStorage. Do not copy that data directly into production. Export and validate any real records, map them to the PostgreSQL schema, then import through an authenticated migration process.
