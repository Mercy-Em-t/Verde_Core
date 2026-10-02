# Verde SDLC API Workflow

The Verde engine processes projects through a 5-step, highly rigorous API workflow.

## Phase 1: Planning
*   `SystemRequest`: Captures the business need and sponsor.
*   `FeasibilityStudy`: Calculates Technical, Economic, and Organizational feasibility.
*   `ProjectPlanning`: Generates the WBS (Work Breakdown Structure) and Staffing Plan.
*   **Exit Gate:** System Request and Feasibility Study must be formally approved. Issues `Phase1Binder`.

## Phase 2: Analysis (System Proposal)
*   **Requires:** `Phase1Binder`
*   `RequirementsDetermination`: Elicits functional/non-functional constraints.
*   `UseCaseAnalysis`: Models Dressed Use Cases.
*   `ProcessModeling` & `DataModeling`: DFDs and ERDs.
*   **Exit Gate:** System Proposal must be approved. Issues `Phase2Binder`.

## Phase 3: Design (System Specification)
*   **Requires:** `Phase2Binder`
*   `ArchitectureDesign`: Hardware & Software specifications.
*   `UserInterfaceDesign`: Navigational patterns.
*   `ProgramDesign`: Structure Charts.
*   `DataStorageDesign`: Schema optimization.
*   **Exit Gate:** System Specification must be approved. Issues `Phase3Binder`.

## Phase 4: Implementation (Final System)
*   **Requires:** `Phase3Binder`
*   `SystemConstruction`: Dev environments and repos.
*   `TestingStrategy`: Unit, Integration, System, Acceptance.
*   `DocumentationStrategy`: Swagger specs and User Manuals.
*   `TransitionAndDeployment`: Parallel vs Direct Cutover.
*   **Exit Gate:** Final System deployed and approved. Issues `Phase4Binder`.

## Phase 5: Support & Maintenance (Closure)
*   **Requires:** `Phase4Binder`
*   `SystemSupport`: Help Desk Tickets.
*   `SystemMaintenance`: Patches and Bug Fixes.
*   `ProjectAssessment`: Post-mortem and Lessons Learned.
*   **Exit Gate:** Project officially retired/closed.
