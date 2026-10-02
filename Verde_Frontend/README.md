# Verde SDLC API Service 🟢

[![Verde SDLC Engine CI/CD](https://github.com/Mercy-Em-t/Verde_Core/actions/workflows/ci.yml/badge.svg)](https://github.com/Mercy-Em-t/Verde_Core/actions/workflows/ci.yml)

Verde SDLC is a rigorous, object-oriented System Development Life Cycle (SDLC) engine built in native Node.js. It forces strict adherence to waterfall/iterative documentation phases by utilizing a "Binder" chain-of-custody pattern. You cannot progress to the next phase without cryptographically sound approvals from the previous phases.

## 🚀 Features

- **Strict Gating & Binders:** Binders act as immutable birth certificates for subsequent phases, taking frozen snapshots of key metrics to prevent historical tampering.
- **Concurrent Multi-Project Support:** The production server handles unlimited isolated SDLC pipelines simultaneously via an in-memory Map structure.
- **Persistent Flat-File JSON:** Deep integration with local volume storage ensures server restarts automatically hydrate your projects without needing PostgreSQL or MongoDB.
- **Printable A4 HTML Generator:** Includes built-in HTML compilation capable of exporting massive physical booklets, complete with strict CSS print media rules for physical binding.

## 📚 Documentation
- [Architecture & Design Patterns](docs/ARCHITECTURE.md)
- [The 5-Phase API Workflow](docs/API_WORKFLOW.md)

## 🐳 Running with Docker (Recommended)

Deploying Verde in production is fully automated via Docker Compose. The persistent database volume is automatically mapped to ensure data survival.

```bash
docker-compose up -d --build
```
Once running, the central dashboard is available at: **http://localhost:3000/**

## 🛠️ Running Locally (Native Node)

If you prefer to run it without Docker:
```bash
# Start the production server
node server.js

# Or run the manual terminal simulator
node run-sample-project.js

# Run the 289-test verification suite
node run-tests-node.js
```
