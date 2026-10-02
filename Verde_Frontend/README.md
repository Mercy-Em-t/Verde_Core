# Verde SDLC Enterprise Platform ??

[![Verde SDLC Engine CI/CD](https://github.com/Mercy-Em-t/Verde_Core/actions/workflows/ci.yml/badge.svg)](https://github.com/Mercy-Em-t/Verde_Core/actions/workflows/ci.yml)

Verde SDLC is a rigorous, cryptographically gated System Development Life Cycle (SDLC) enterprise platform. It forces strict adherence to waterfall and iterative documentation phases by utilizing a cryptographic "Binder" chain-of-custody pattern. You cannot progress to the next phase without explicitly signing off and approving the previous phase.

## ?? The Tri-Part Architecture

The Verde Platform consists of three major components:

### 1. The Express Mega Server (\Verde_Frontend/mega_server.js\)
The central orchestrator of the Verde ecosystem.
- **JWT RBAC Security:** Strict Role-Based Access Control. PMs can edit data, but only \SYS_ADMIN\ tokens can cryptographically sign and approve a phase to unlock the next.
- **WebSocket Telemetry:** Built-in \Socket.io\ broadcasts real-time project updates to all connected dashboards globally.
- **In-Memory State Engine:** Projects are securely managed in memory, with strict gating algorithms that throw 500 errors if an illegal state transition is attempted (e.g., trying to generate a Phase 2 plan without a Phase 1 approval).

### 2. The React Control Center (\Verde_React_Dashboard/\)
A completely decoupled, modern React Single Page Application (SPA).
- **Interactive Mutability:** Edit Project Sponsors and Business Needs via sleek, native React Modals.
- **Cryptographic Sign-Offs:** Click "Approve" to send a JWT-signed mandate to the Mega Server, instantly unlocking the Binders.
- **Native A4 PDF Exports:** Dive into the Master Binder or Audit Trail and effortlessly export fully-sliced, presentation-ready PDF booklets using programmatic print APIs.

### 3. The Rust Prototype Engine (\Verde_Rust_Engine/\)
A next-generation prototype demonstrating how to rewrite the core SDLC mathematical gating in strict Rust.
- **Zero Garbage Collection:** Sub-millisecond latency.
- **Compile-Time Safety:** Illegal phase transitions (e.g., jumping from Phase 1 to Phase 3) are caught by the Rust compiler using Enums, completely eliminating runtime state errors.

## ?? Running the Ecosystem

### 1. Start the Mega Server
\\\ash
cd Verde_Frontend
npm install
node mega_server.js
\\\
*(Runs on Port 3000)*

### 2. Start the React Dashboard
\\\ash
cd Verde_React_Dashboard
npm install
npm run dev
\\\
*(Runs on Port 5173)*

Navigate to **http://localhost:5173/** to view the control center, create new projects, and watch the WebSockets light up in real-time.

## ?? Documentation
- [Architecture & Design Patterns](docs/ARCHITECTURE.md)
- [The 5-Phase API Workflow](docs/API_WORKFLOW.md)
