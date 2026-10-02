# `api-service` — SDLC Planning Engine

> **Plug-and-play module** for managing the system development lifecycle (SDLC) Planning Phase inside the Verde Frontend.  
> Drop this folder into any Verde project, import `index.js`, and the full planning engine is available immediately.

---

## Quick Start

```html
<!-- In any HTML page with module support -->
<script type="module">
    import ApiService from './api-service/index.js';

    // All classes and utilities are available on ApiService
    const sr = new ApiService.SystemRequest('PRJ-001');
    sr.setProjectSponsor('Jane Doe');
    document.getElementById('view').innerHTML = sr.renderAsHTML();
</script>
```

Or access it globally (already set up by `index.js`):

```javascript
const sr = new window.VerdeApiService.SystemRequest('PRJ-001');
```

---

## Module Structure

```
api-service/
├── index.js                # ← Public entry point. Import this.
├── phases.js               # SDLC phase definitions dictionary
├── workflow.js             # WorkflowEngine — gate checks and transitions
├── systemRequest.js        # SystemRequest document class
├── feasibilityStudy.js     # FeasibilityStudy document class
├── projectPlanning.js      # ProjectPlanning hub class
│   ├── methodologySelector.js  # Sub-object: Methodology selection engine
│   ├── workPlan.js             # Sub-object: WBS + Task List
│   ├── staffingPlan.js         # Sub-object: Staffing requirements
│   └── manageAndControl.js     # Sub-object: Risk, standards, tools
├── documentManager.js      # Versioning + multi-project database
└── auditLogger.js          # Event logger + audit trail renderer
```

---

## Public API Reference

### `ApiService.SystemRequest(projectId)`
Creates a new System Request document object.

| Method | Parameters | Returns | Description |
|---|---|---|---|
| `setProjectSponsor(name)` | `string` | `void` | Sets the project sponsor |
| `setBusinessNeed(text)` | `string` | `void` | Sets the business need |
| `addBusinessRequirement(req)` | `string` | `void` | Appends a business requirement |
| `setBusinessValue(text)` | `string` | `void` | Sets the expected business value |
| `setSpecialIssues(text)` | `string` | `void` | Sets any special constraints |
| `approve(adminName)` | `string` | `void` | Stamps as APPROVED with admin name + timestamp |
| `isApproved()` | — | `boolean` | Returns `true` if officially approved |
| `renderAsHTML()` | — | `string` | Returns a formatted HTML document string |
| `toJSON()` | — | `object` | Returns a plain JSON snapshot for persistence |

---

### `ApiService.FeasibilityStudy(projectId)`
Creates a data-aggregating Feasibility Study object that compiles Technical, Economic, and Organizational studies.

| Method | Parameters | Returns | Description |
|---|---|---|---|
| `setTechnicalAssessment(data)` | `object` | `void` | Sets all technical feasibility fields |
| `addCostOrBenefit(category, name, value)` | `string, string, number` | `void` | Adds to `developmentCosts`, `operationalCosts`, `tangibleBenefits`, or `intangibleBenefits` |
| `markStepComplete(stepName)` | `string` | `void` | Ticks off an economic workflow step (`identifyCostsAndBenefits`, `assignValues`, etc.) |
| `calculateFinancialMetrics(years)` | `number` | `void` | Calculates NPV, ROI, Break-Even Point over N years |
| `setStrategicAlignment(text, survey)` | `string, string` | `void` | Sets the organizational alignment description and user survey summary |
| `addStakeholder(name, role, support, influence)` | `strings` | `void` | Adds a stakeholder to the analysis matrix |
| `addRisk(description, mitigation)` | `string, string` | `void` | Adds a risk entry |
| `setVerdict(boolean)` | `bool` | `void` | Sets `PROCEED` or `DO_NOT_PROCEED` |
| `approve(adminName)` | `string` | `void` | Stamps as APPROVED |
| `isApproved()` | — | `boolean` | Returns `true` if officially approved |
| `renderAsHTML()` | — | `string` | Returns a full formatted HTML report |

---

### `ApiService.ProjectPlanning(projectId, systemRequest, feasibilityStudy)`
The hub object for the second part of the Planning phase.

> **⚠️ Hard Prerequisite:** Both `systemRequest` and `feasibilityStudy` must be approved objects or the constructor throws a `GATE BLOCKED` error.

Contains four live sub-objects:

| Property | Type | Description |
|---|---|---|
| `methodologySelection` | `MethodologySelector` | Handles criteria-based methodology selection |
| `workPlan` | `WorkPlan` | Handles WBS and task list |
| `staffing` | `StaffingPlan` | Handles staffing needs and assignments |
| `manageAndControl` | `ManageAndControl` | Handles risk, standards, and tools |

| Method | Parameters | Description |
|---|---|---|
| `setProjectManager(name)` | `string` | Assigns the Project Manager |
| `renderAsHTML()` | — | Renders the full planning dashboard as HTML |

#### `methodologySelection` (MethodologySelector)
| Method | Parameters | Description |
|---|---|---|
| `setInsights(data)` | `object` | Sets all 6 criteria (`clarityOfUserRequirements`, `familiarityWithTechnology`, `systemComplexity`, `systemReliability`, `shortTimeSchedule`, `scheduleVisibility`) |
| `selectMethodology(category, method, justification)` | `strings` | Officially selects from `WATERFALL`, `RAD`, or `AGILE` |
| `generateRecommendation()` | — | Returns auto-suggestions based on insights |

#### `workPlan` (WorkPlan)
| Method | Parameters | Description |
|---|---|---|
| `setEstimates(size, duration)` | `string, number` | Sets overall size and duration estimates |
| `addWBSPhase(phaseId, name)` | `string, string` | Adds a top-level phase to the WBS |
| `addTask(phaseId, taskObj)` | `string, object` | Adds a task `{ id, name, type, durationDays, milestone, deliverable, assignedTo }` to a phase |
| `assignStaffToTask(taskId, staffName)` | `string, string` | Assigns a staff member to a task |
| `finalizeWorkPlan()` | — | Marks the Work Plan as `COMPLETED` |

#### `staffing` (StaffingPlan)
| Method | Parameters | Description |
|---|---|---|
| `addStaffingNeed(role, count, skills)` | `string, number, array` | Defines a staffing requirement |
| `assignStaffMember(name, role)` | `strings` | Assigns a specific person to the project team |
| `finalizeStaffing()` | — | Marks Staffing as `COMPLETED` |

#### `manageAndControl` (ManageAndControl)
| Method | Parameters | Description |
|---|---|---|
| `addTrackingTool(description)` | `string` | Adds a tracking tool |
| `addStandard(category, description)` | `strings` | Adds a project standard |
| `addRisk(id, description, likelihood, impact, mitigation)` | `strings` | Adds a risk to the risk matrix. Auto-calculates severity (`Critical`, `Moderate`, `Low`) |
| `finalizeManagementPlan()` | — | Marks as `COMPLETED` |

---

### `ApiService.createWorkflow(projectId)`
Factory method returning a `WorkflowEngine` instance for gate management.

| Method | Parameters | Returns | Description |
|---|---|---|---|
| `canStartFeasibilityStudy(systemRequest)` | `SystemRequest` | `{ allowed, reason }` | Gate check before starting the Feasibility Study |
| `canProceedToDetailedPlanning(sr, fs)` | `SystemRequest, FeasibilityStudy` | `{ allowed, reason }` | Gate check before entering Detailed Planning |

---

### `ApiService.AuditLogger(projectId)`
Creates an event logger scoped to a specific project.

| Method | Parameters | Description |
|---|---|---|
| `logEvent(user, action, details)` | `strings` | Logs a timestamped event |
| `getLogs()` | — | Returns all events sorted chronologically |
| `renderAuditReportHTML()` | — | Renders the full third-person timeline as HTML |
| `toJSON()` | — | Returns a JSON-serializable snapshot of all events |

---

### `ApiService.DocumentManager()`
A shared singleton-style multi-project document database with linked-list versioning.

| Method | Parameters | Returns | Description |
|---|---|---|---|
| `saveDocument(projectId, docType, content, author)` | `strings, object` | `DocumentRecord` | Appends a new version, auto-linking to the previous |
| `getLatestDocument(projectId, docType)` | `strings` | `DocumentRecord` | Returns the current active (tail) version |
| `getDocumentHistory(projectId, docType)` | `strings` | `DocumentRecord[]` | Returns the full linked version chain |
| `attachFileToVersion(projectId, docType, version, fileName, fileUrl)` | `strings, number` | `DocumentRecord` | Attaches a physical file (e.g., signed PDF) to a specific version for redundancy |
| `renderHistoryAsHTML(projectId, docType)` | `strings` | `string` | Renders the full version history table including attachments |

---

## Gate Rules (Enforced Automatically)

| Gate | Condition to Pass |
|---|---|
| Start Feasibility Study | `SystemRequest.isApproved() === true` |
| Enter Detailed Planning | `SystemRequest.isApproved() === true` AND `FeasibilityStudy.isApproved() === true` AND `FeasibilityStudy.finalVerdict === 'PROCEED'` |
| Start ProjectPlanning object | Same as above (enforced at constructor level) |

---

## Document States

All primary documents (`SystemRequest`, `FeasibilityStudy`) follow this lifecycle:

```
DRAFT  →  (Admin calls .approve())  →  APPROVED (Official Document)
```

All planning sub-objects (`WorkPlan`, `StaffingPlan`, etc.) follow:

```
PENDING  →  IN_PROGRESS  →  COMPLETED
```

---

## Multi-Project Isolation

The `DocumentManager` stores all data under `store[projectId][docType]`.  
Projects **never share data**. Each project gets its own isolated namespace.

```javascript
// PRJ-001 and PRJ-002 are completely isolated
docManager.saveDocument('PRJ-001', 'SYSTEM_REQUEST', sr1, 'Alice');
docManager.saveDocument('PRJ-002', 'SYSTEM_REQUEST', sr2, 'Bob');

docManager.getLatestDocument('PRJ-001', 'SYSTEM_REQUEST'); // Returns Alice's doc only
docManager.getLatestDocument('PRJ-002', 'SYSTEM_REQUEST'); // Returns Bob's doc only
```

---

## Integration with `api-client.js`

This module operates **independently** from `api-client.js` (the HTTP backend client).  
To persist data to your backend, call `toJSON()` on any document and POST it via `TMAPI`:

```javascript
const srJson = currentSystemRequest.toJSON();
await window.TMAPI.request('/projects/PRJ-001/documents', {
    method: 'POST',
    body: JSON.stringify(srJson)
});
```

---

*Part of the Verde SDLC API Service — Planning Phase Module.*
