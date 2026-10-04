# Verde SDLC Engine: Architecture Reference

The Verde SDLC API Service is a strictly object-oriented implementation of the System Development Life Cycle (SDLC) written in native ES6 Javascript (Node.js). It replaces traditional "loose" agile boards with a cryptographically enforced Waterfall/Iterative document chain.

## Core Architectural Pillars

### 1. The Binder Pattern (Chain of Custody)
At the end of every Phase (Planning, Analysis, Design, Implementation), the Workflow Engine creates a **Binder Passport** (e.g., `Phase1Binder`). 
*   **Immutability:** The binder deep-freezes a snapshot of the completed phase's core metrics (total tests, hardware counts, selected architecture).
*   **Progression:** Phase N+1 *cannot* be instantiated without passing a perfectly valid, `APPROVED` Binder from Phase N into its constructor.
*   **Result:** It is mathematically impossible to start System Construction without an explicitly signed Feasibility Study and Architecture Specification.

### 2. Strict State Gating
Every sub-module follows a strict state machine: `PENDING` -> `IN_PROGRESS` -> `DRAFT` -> `APPROVED`.
Attempting to jump the gun or bypass an Administrator approval triggers a hard `Error` block inside the API.

### 3. Native Server & Dashboard (`server.js`)
The API handles real-time HTML document compilation. The `server.js` production daemon spins up an in-memory database (`projectsDB`) allowing an unlimited number of concurrent isolated SDLC projects to be generated and stored simultaneously with absolute zero state-bleeding.

### 4. Flat-File JSON Persistence
We avoided heavy database dependencies (PostgreSQL/MongoDB) to keep the engine ultra-portable.
Instead, when the `server.js` starts, it automatically mounts a persistent Docker volume, serializes the entire `projectsDB` map via JSON, and syncs it to disk (`data/projects.json`). If the container restarts, all live projects instantly hydrate from the drive.

### 5. Audit Logging
Every document generation, test validation, or administrator approval triggers `AuditLogger.logEvent()`, resulting in a non-destructive chronological timeline independent of the project's physical phase state.
