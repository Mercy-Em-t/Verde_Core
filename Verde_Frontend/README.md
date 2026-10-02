# Verde SDLC API Service

Verde SDLC is a rigorous, object-oriented System Development Life Cycle (SDLC) engine built in Node.js/JavaScript. It forces strict adherence to waterfall/iterative documentation phases by utilizing a "Binder" chain-of-custody pattern. You cannot progress to the next phase without cryptographically sound approvals from the previous phases.

## 🚀 Features

- **Strict Gating:** Workflow Engine blocks progression if critical documents (System Requests, Feasibility Studies, Binders) lack Administrator approvals.
- **Phase Passports (Binders):** Binders (e.g., `Phase1Binder`, `Phase2Binder`) act as immutable birth certificates for subsequent phases. They take a frozen snapshot of key metrics to prevent historical tampering.
- **Stateful Document Lifecycle:** Documents transition seamlessly from `PENDING` -> `IN_PROGRESS` -> `COMPLETED` as teams incrementally add tasks, test plans, and system requirements.
- **Built-in Audit Logger:** An embedded `AuditLogger` provides a third-person, timestamped timeline of every major mutation or approval across the project.
- **Printable A4 HTML Generator:** Includes built-in HTML compilation capable of exporting massive physical booklets, complete with auto-expanding accordions and strict CSS print media rules for binding.

## 📁 Architecture

The engine is split into the standard SDLC phases:
- `api-service/`
  - `systemRequest.js`, `feasibilityStudy.js`, `projectPlanning.js` (Phase 1: Planning)
  - `analysis/` (Phase 2: Analysis & System Proposal)
  - `design/` (Phase 3: Design & System Specification)
  - `implementation/` (Phase 4: Implementation & Deployment)
  - `auditLogger.js` (Security & Timeline tracking)
  - `workflow.js` (The core state machine and validation gates)

## 🛠️ Getting Started

### Prerequisites
- Node.js (v14+)

### Running the Simulator
You can simulate an entire project moving through all 4 phases by running the sample project script. This script will mock an HR System project, run it through the API gates, log the audit trail, and export the physical documents.

```bash
node run-sample-project.js
```

This will produce two files in your root directory:
1. `Sample_Project_Output.html` - The Master Project Binder (With an A4 Print button).
2. `Sample_Project_Audit_Trail.html` - The chronological security timeline.

### Running the Test Suite
The Verde SDLC API includes 289 automated tests ensuring phase gates, logic, and snapshotting work flawlessly.

```bash
node run-tests-node.js
```

## 🔒 Security & Document Export
The application features an interactive document export pool. Attempting to download the final HTML binder securely strikes a unique Document ID off a predefined allowed list, assigning that tracking ID directly to the PDF/HTML export to prevent file collision and track custody.
