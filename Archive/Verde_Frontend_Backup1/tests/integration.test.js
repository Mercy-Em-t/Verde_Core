// tests/integration.test.js
// Integration Test Suite — Full end-to-end SDLC flow
// Phase 1 → Gate → Phase 2 → Exit Gate

import { TestRunner } from './testRunner.js';
import ApiService from '../api-service/index.js';

export function runIntegrationTests() {
    const t = new TestRunner('Suite 9 — Integration (Full SDLC Flow: Phase 1 → Phase 2)');

    const PROJECT_ID = 'PRJ-INTEGRATION-001';
    const workflow   = ApiService.createWorkflow(PROJECT_ID);
    const docManager = new ApiService.DocumentManager();
    const auditLog   = new ApiService.AuditLogger(PROJECT_ID);

    auditLog.logEvent('System', 'PROJECT_CREATED', 'Integration test project initialized');

    // ─── STEP 1: Create & Approve System Request ────────────────────────────
    const sr = new ApiService.SystemRequest(PROJECT_ID);
    sr.setProjectSponsor('Director of Operations');
    sr.setBusinessNeed('Replace paper-based leave management with a web portal');
    sr.addBusinessRequirement('Online leave submission by all staff');
    sr.addBusinessRequirement('Real-time manager approval notifications');
    sr.addBusinessRequirement('HR dashboard for leave analytics');
    sr.setBusinessValue('Estimated $120,000 annual savings in admin time');
    sr.setSpecialIssues('Must integrate with existing payroll system via REST API');

    t.assert(!sr.isApproved(), '9.1 SR starts unapproved (DRAFT)');

    // Gate 1 — should block (not approved)
    const gate1Block = workflow.canStartFeasibilityStudy(sr);
    t.assert(!gate1Block.allowed, '9.2 GATE 1 blocks — SR not yet approved');

    sr.approve('CTO-David');
    auditLog.logEvent('CTO-David', 'DOCUMENT_APPROVED', 'System Request approved. Gate 1 cleared.');
    docManager.saveDocument(PROJECT_ID, 'SYSTEM_REQUEST', sr, 'CTO-David');

    const gate1Pass = workflow.canStartFeasibilityStudy(sr);
    t.assert(gate1Pass.allowed, '9.3 GATE 1 passes — SR approved');

    // ─── STEP 2: Create & Approve Feasibility Study ─────────────────────────
    const fs = new ApiService.FeasibilityStudy(PROJECT_ID);
    fs.setTechnicalAssessment({
        description: 'React + Node.js + PostgreSQL stack',
        familiarityWithApplication: 'High',
        familiarityWithTechnology: 'High',
        projectSize: 'Medium',
        compatibility: 'Payroll REST API adapter required',
        familiarityWithBusinessDomain: 'High',
        infrastructureReadiness: 'AWS cloud-ready',
        securityAndCompliance: 'ISO 27001 / GDPR'
    });

    fs.addCostOrBenefit('developmentCosts', 'Dev Team (6 months)', 120000);
    fs.addCostOrBenefit('developmentCosts', 'Infrastructure Setup', 15000);
    fs.addCostOrBenefit('operationalCosts', 'Annual Hosting', 8000);
    fs.addCostOrBenefit('tangibleBenefits', 'Admin Time Reduction', 60000);
    fs.addCostOrBenefit('tangibleBenefits', 'Error Reduction (cost avoidance)', 20000);
    fs.addCostOrBenefit('intangibleBenefits', 'Staff satisfaction improvement', 0);

    ['identifyCostsAndBenefits', 'assignValues', 'determineCashFlows', 'determineBreakEven'].forEach(
        step => fs.markStepComplete(step)
    );
    fs.calculateFinancialMetrics(5);

    t.assert(fs.economic.metrics.npv !== null, '9.4 NPV calculated from financial data');
    t.assert(typeof fs.economic.metrics.roi === 'number', '9.5 ROI is a number');

    fs.setStrategicAlignment(
        'Aligns with 5-year digital transformation strategy',
        '89% of staff prefer digital leave management in survey'
    );
    fs.addStakeholder('Director of Ops', 'Project Sponsor', 'High', 'High');
    fs.addStakeholder('HR Manager', 'Key User', 'High', 'Medium');
    fs.addStakeholder('IT Manager', 'Technical Lead', 'Medium', 'High');
    fs.addRisk('Staff resistance to change', 'Change management training program');
    fs.setVerdict(true);

    // Gate 2 block — not approved
    const gate2Block = workflow.canProceedToDetailedPlanning(sr, fs);
    t.assert(!gate2Block.allowed, '9.6 GATE 2 blocks — FS not yet approved');

    fs.approve('CTO-David');
    auditLog.logEvent('CTO-David', 'DOCUMENT_APPROVED', 'Feasibility Study approved. Verdict: PROCEED.');
    docManager.saveDocument(PROJECT_ID, 'FEASIBILITY_STUDY', fs, 'CTO-David');

    const gate2Pass = workflow.canProceedToDetailedPlanning(sr, fs);
    t.assert(gate2Pass.allowed, '9.7 GATE 2 passes — SR + FS approved with PROCEED verdict');

    // ─── STEP 3: Project Planning ────────────────────────────────────────────
    const pp = new ApiService.ProjectPlanning(PROJECT_ID, sr, fs);
    pp.setProjectManager('Jane PM');

    pp.methodologySelection.setInsights({
        clarityOfUserRequirements: 'High',
        familiarityWithTechnology: 'High',
        systemComplexity: 'Medium',
        systemReliability: 'High',
        shortTimeSchedule: false,
        scheduleVisibility: 'Required'
    });
    pp.methodologySelection.selectMethodology('WATERFALL', 'Parallel', 'Clear and stable requirements; high familiarity');
    t.assertEqual(pp.methodologySelection.selectedCategory, 'WATERFALL', '9.8 Methodology selected correctly');

    pp.workPlan.setEstimates('Medium', 6);
    pp.workPlan.addWBSPhase('WP1', 'Analysis');
    pp.workPlan.addWBSPhase('WP2', 'Design');
    pp.workPlan.addTask('WP1', { id: 'T01', name: 'Requirements Workshop', type: 'Analysis', durationDays: 3, milestone: true, deliverable: 'Requirements Document', assignedTo: 'Jane PM' });
    pp.workPlan.addTask('WP2', { id: 'T02', name: 'System Architecture', type: 'Design', durationDays: 5, milestone: true, deliverable: 'Architecture Diagram', assignedTo: 'Dev-Lead' });
    pp.workPlan.finalizeWorkPlan();

    pp.staffing.addStaffingNeed('Developer', 3, ['React', 'Node.js', 'PostgreSQL']);
    pp.staffing.addStaffingNeed('QA Engineer', 1, ['Automated testing']);
    pp.staffing.assignStaffMember('Dev-Alice', 'Developer');
    pp.staffing.assignStaffMember('Dev-Bob', 'Developer');
    pp.staffing.assignStaffMember('QA-Carol', 'QA Engineer');
    pp.staffing.finalizeStaffing();

    pp.manageAndControl.addTrackingTool('Jira for sprint tracking');
    pp.manageAndControl.addStandard('Coding', 'ESLint + Prettier enforced via CI');
    pp.manageAndControl.addRisk('R01', 'Payroll API unavailability', 'Medium', 'High', 'Mock API for development phase');
    pp.manageAndControl.addRisk('R02', 'Staff adoption resistance', 'Low', 'Medium', 'Early user training sessions');
    pp.manageAndControl.finalizeManagementPlan();

    t.assertEqual(pp.staffing.assignedStaff.length, 3, '9.9 3 staff members assigned');
    t.assertEqual(pp.manageAndControl.risks[0].severity, 'Critical', '9.10 Medium×High risk = Critical severity');
    t.assertEqual(pp.manageAndControl.risks[1].severity, 'Low', '9.11 Low×Medium risk = Low severity');

    auditLog.logEvent('Jane PM', 'PLANNING_COMPLETED', 'ProjectPlanning object finalized. Ready for Analysis gate.');
    docManager.saveDocument(PROJECT_ID, 'PROJECT_PLANNING', pp, 'Jane PM');

    // ─── STEP 4: GATE 3 — Birth of Analysis Phase ───────────────────────────
    const ap = new ApiService.AnalysisPhase(PROJECT_ID, sr, fs, pp);

    t.assertNotNull(ap.phase1Binder, '9.12 AnalysisPhase has Phase1Binder attached');
    t.assertEqual(ap.phase1Binder.projectPlanning.projectManager, 'Jane PM', '9.13 PM derived from binder');
    t.assert(Object.isFrozen(ap.phase1Binder), '9.14 Phase1Binder is frozen (immutable)');

    auditLog.logEvent('System', 'PHASE2_BORN',
        `Analysis Phase created. Binder ID: ${ap.phase1Binder.binderId}`);

    // ─── STEP 5: Analysis sub-sections ──────────────────────────────────────
    // Requirements
    ap.requirementsDetermination.setDefinitionStatement({
        projectName: 'HR Leave Portal', preparedBy: 'Jane PM',
        overview: 'Web-based leave management system',
        scope: 'Leave request, approval, and reporting',
        constraints: ['Budget: $135k', 'Timeline: 6 months'],
        assumptions: ['All users have browser access', 'Payroll API will be available by month 3']
    });
    ap.requirementsDetermination.addInterview('HR Director', 'Stakeholder', '2026-10-05', 'Discussed current pain points', '3-day average approval time');
    ap.requirementsDetermination.addJADSession('Jane PM', ['HR', 'IT', 'Finance'], '2026-10-07', 'Requirements elicitation', 'Identified 12 core requirements');
    ap.requirementsDetermination.applyStrategy('problemAnalysis', { findings: 'Paper process causes 3-day delays and data entry errors' });
    ap.requirementsDetermination.applyStrategy('rootCauseAnalysis', { causes: [{ problem: 'Delay', rootCause: 'Manual routing', evidence: 'Time-motion study' }], findings: 'Manual routing is root cause' });
    ap.requirementsDetermination.addFunctionalRequirement('FR-01', 'Employee submits leave online', 'High', 'JAD Session');
    ap.requirementsDetermination.addFunctionalRequirement('FR-02', 'Manager receives email notification', 'High', 'Interview');
    ap.requirementsDetermination.addFunctionalRequirement('FR-03', 'HR views dashboard reports', 'Medium', 'JAD Session');
    ap.requirementsDetermination.addNonFunctionalRequirement('NFR-01', 'Response time < 2 seconds', 'Performance', 'Survey');
    ap.requirementsDetermination.compileRequirementsDocument();
    ap.requirementsDetermination.approveRequirementsDocument('CTO-David');
    ap.requirementsDetermination.finalize();

    t.assertEqual(ap.requirementsDetermination.functionalRequirements.length, 3, '9.15 3 FRs added');
    t.assertEqual(ap.requirementsDetermination.requirementsDefinitionDocument.status, 'APPROVED', '9.16 RDD is APPROVED');

    // Use cases
    ap.useCaseAnalysis.addActor('A1', 'Employee', 'Primary', 'Submits and views leave');
    ap.useCaseAnalysis.addActor('A2', 'Manager', 'Secondary', 'Approves or rejects leave');
    ap.useCaseAnalysis.identifyUseCase('UC-01', 'Submit Leave Request', 'Employee', 'Submit a leave application');
    ap.useCaseAnalysis.addFullyDressedUseCase({
        id: 'UC-01', name: 'Submit Leave Request',
        briefDescription: 'Employee submits leave via web portal.',
        primaryActor: 'Employee',
        preconditions: ['Employee logged in', 'Leave balance available'],
        mainFlow: ['Employee selects Leave', 'Fills form', 'Submits', 'System notifies manager'],
        postconditions: ['Request recorded', 'Manager notified'],
        linkedRequirementIds: ['FR-01', 'FR-02']
    });
    ap.useCaseAnalysis.linkUseCaseToRequirements('UC-01', 'Submit Leave Request', ['FR-01', 'FR-02']);
    ap.useCaseAnalysis.finalize();
    t.assertEqual(ap.useCaseAnalysis.fullyDressedUseCases.length, 1, '9.17 Fully dressed UC added');

    // Process Modeling
    ap.processModeling.setIntroduction('Process modeling shows data flows through the system.', 'To validate that all processes and data are accounted for.');
    ap.processModeling.setContextDiagram(
        'HR Leave Portal',
        [{ id: 'E1', name: 'Employee', description: 'Submits leave' }, { id: 'E2', name: 'Manager', description: 'Approves leave' }],
        [{ from: 'Employee', description: 'Leave Request Form' }, { from: 'Manager', description: 'Approval Decision' }],
        [{ to: 'Employee', description: 'Confirmation Email' }, { to: 'Manager', description: 'Notification Email' }]
    );
    ap.processModeling.addLevel0Process('1.0', 'Process Leave Request', 'Validates and routes leave requests');
    ap.processModeling.addLevel0DataStore('D1', 'Leave Request Store');
    ap.processModeling.addLevel0DataFlow('Employee', '1.0', 'Leave request data');
    ap.processModeling.validateDFD(true, true, []);
    ap.processModeling.finalize();
    t.assert(ap.processModeling.validation.isValidated, '9.18 Process model validated');

    // Data Modeling
    ap.dataModeling.setIntroduction('Data modeling defines the data structures required by the system.', 'To ensure all data is captured and correctly related.');
    ap.dataModeling.addEntity('E1', 'Employee', 'A staff member who can submit leave', [
        { name: 'employee_id', dataType: 'INT', isPrimaryKey: true, isForeignKey: false, isRequired: true, description: 'Unique identifier' },
        { name: 'name', dataType: 'VARCHAR(100)', isPrimaryKey: false, isForeignKey: false, isRequired: true, description: 'Full name' }
    ]);
    ap.dataModeling.addEntity('E2', 'LeaveRequest', 'A leave application submitted by an employee', [
        { name: 'request_id', dataType: 'INT', isPrimaryKey: true, isForeignKey: false, isRequired: true, description: 'Unique identifier' },
        { name: 'employee_id', dataType: 'INT', isPrimaryKey: false, isForeignKey: true, isRequired: true, description: 'FK to Employee' },
        { name: 'start_date', dataType: 'DATE', isPrimaryKey: false, isForeignKey: false, isRequired: true, description: 'Leave start' }
    ]);
    ap.dataModeling.addRelationship('R1', 'Employee', 'LeaveRequest', '1', 'M', 'An employee can submit many leave requests');
    ap.dataModeling.addDataDictionaryEntry('employee_id', 'Attribute', 'Unique numeric identifier for a staff member', '1001');
    ap.dataModeling.applyNormalization(true, '1NF: All atomic values. 2NF: No partial dependencies. 3NF: No transitive dependencies.');
    ap.dataModeling.prepareDesignPrerequisites(true, 'ERD, Data Dictionary, and Normalization notes packaged for Design Phase handoff.');
    ap.dataModeling.finalize();

    t.assertEqual(ap.dataModeling.entities.length, 2, '9.19 Two entities defined in ERD');
    t.assertEqual(ap.dataModeling.relationships.length, 1, '9.20 Relationship defined');
    t.assert(ap.dataModeling.development.normalizationApplied, '9.21 Normalization applied');
    t.assert(ap.dataModeling.development.designPrerequisitesCreated, '9.22 Design prerequisites created');

    // ─── STEP 6: Exit Gate ───────────────────────────────────────────────────
    t.assert(ap.allSectionsComplete(), '9.23 All 4 sections are COMPLETED');

    const proposalResult = ap.compileSystemProposal(
        'A web-based HR Leave Portal to replace paper processes, delivering $120k annual savings. ' +
        'System will handle leave submission, manager approval, and HR reporting. ' +
        'Recommended methodology: Waterfall/Parallel. Delivery: 6 months.'
    );
    t.assert(proposalResult.success, '9.24 System Proposal compiled successfully');
    t.assertEqual(ap.systemProposal.status, 'DRAFT', '9.25 System Proposal is in DRAFT state');

    // Exit gate blocked before approval
    const exitBlock = workflow.canProceedToDesign(ap);
    t.assert(!exitBlock.allowed, '9.26 EXIT GATE blocked — System Proposal not yet approved');

    ap.approveSystemProposal('CTO-David');
    auditLog.logEvent('CTO-David', 'SYSTEM_PROPOSAL_APPROVED', 'Analysis Phase complete. System Proposal approved.');
    docManager.saveDocument(PROJECT_ID, 'ANALYSIS_PHASE', ap, 'CTO-David');

    const exitPass = workflow.canProceedToDesign(ap);
    t.assert(exitPass.allowed, '9.27 EXIT GATE passes — System Proposal approved');
    t.assertContains(exitPass.reason, 'GATE PASSED', '9.28 Exit gate reason confirms passage');
    t.assertEqual(exitPass.binderId, ap.phase1Binder.binderId, '9.29 Exit gate returns binderId — chain of custody intact');

    // Audit trail
    const logs = auditLog.getLogs();
    t.assert(logs.length >= 5, '9.30 Audit trail has at least 5 events recorded');
    const auditHtml = auditLog.renderAuditReportHTML();
    t.assertContains(auditHtml, 'PROJECT_CREATED', '9.31 Audit trail includes project creation');
    t.assertContains(auditHtml, 'PHASE2_BORN', '9.32 Audit trail records Phase 2 birth');
    t.assertContains(auditHtml, 'SYSTEM_PROPOSAL_APPROVED', '9.33 Audit trail records final approval');

    // Full toJSON chain
    const fullJson = ap.toJSON();
    t.assertEqual(Object.keys(fullJson)[3], 'phase1Binder', '9.34 phase1Binder is first content field in serialized output');
    t.assertNotNull(fullJson.phase1Binder.systemRequest, '9.35 SR snapshot preserved in final JSON output');
    t.assertNotNull(fullJson.dataModeling.development, '9.36 Data modeling development section in JSON');

    return t.getSummary();
}
