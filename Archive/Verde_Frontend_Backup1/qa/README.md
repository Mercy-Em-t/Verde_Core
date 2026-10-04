# Sprint 14 QA

Run from this directory:

```bash
node qa-sprint14-integration.mjs
```

Or from `backend/`:

```bash
npm test
```

The test uses an in-memory browser persistence shim and simulates a complete commercial engagement without requiring PostgreSQL. It is a workflow regression test, not a substitute for deployment/infrastructure tests.
