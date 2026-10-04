// tests/phase2.test.js
// Test Suite: Phase 2 — Phase1Binder, AnalysisPhase & all sub-objects

import { TestRunner } from './testRunner.js';
import ApiService from '../api-service/index.js';

// ─────────────────────────────────────────────
// HELPERS — reuse approved Phase 1 objects
// ─────────────────────────────────────────────
function buildApprovedSR() {
    const sr = new ApiService.SystemRequest('PRJ-TEST');
    sr.setProjectSponsor('Alice Smith');
    sr.setBusinessNeed('Automate HR processes');
    sr.addBusinessRequirement('REQ-01: Online leave submission');
    sr.setBusinessValue('40% time saving');
    sr.approve('Admin-John');
    return sr;
}

function buildApprovedFS() {
    const fs = new ApiService.FeasibilityStudy('PRJ-TEST');
    fs.setTechnicalAssessment({
        description: 'Web HR system', familiarityWithApplication: 'High',
        familiarityWithTechnology: 'Medium', projectSize: 'Medium',
        compatibility: 'API needed', familiarityWithBusinessDomain: 'High',
        infrastructureReadiness: 'Ready', securityAndCompliance: 'GDPR'
    });
    fs.addCostOrBenefit('developmentCosts', 'Dev', 80000);
    fs.addCostOrBenefit('tangibleBenefits', 'Admin savings', 40000);
    fs.calculateFinancialMetrics(5);
    fs.setStrategicAlignment('Digital transformation', '85% user approval');
    fs.addStakeholder('Alice Smith', 'Sponsor', 'High', 'High');
    fs.setVerdict(true);
    fs.approve('Admin-John');
    return fs;
}

function buildCompletePP(sr, fs) {
    const pp = new ApiService.ProjectPlanning('PRJ-TEST', sr, fs);
    pp.setProjectManager('Bob Jones');
    pp.methodologySelection.selectMethodology('WATERFALL', 'Parallel', 'Stable requirements');
    pp.workPlan.setEstimates('Medium', 6);
    pp.workPlan.addWBSPhase('P1', 'Initiation');
    pp.workPlan.addTask('P1', { id: 'T1', name: 'Kickoff', type: 'Mgmt', durationDays: 1, milestone: false, deliverable: 'Minutes', assignedTo: 'Bob Jones' });
    pp.workPlan.finalizeWorkPlan();
    pp.staffing.assignStaffMember('Carol White', 'Developer');
    pp.staffing.finalizeStaffing();
    pp.manageAndControl.addRisk('R01', 'Integration risk', 'Medium', 'High', 'Early adapter build');
    pp.manageAndControl.finalizeManagementPlan();
    return pp;
}

// ─────────────────────────────────────────────
// SUITE 5: Phase1Binder — Birth Certificate
// ─────────────────────────────────────────────
export function runPhase1BinderTests() {
    const t = new TestRunner('Suite 5 — Phase1Binder (Birth Certificate)');

    const sr = buildApprovedSR();
    const fs = buildApprovedFS();
    const pp = buildCompletePP(sr, fs);

    // --- Gate failures ---
    t.assertThrows(
        () => new ApiService.Phase1Binder(null, fs, pp),
        'System Request is missing',
        '5.1 Binder blocks: SR is null'
    );

    const unapprovedSR = new ApiService.SystemRequest('PRJ-TEST');
    t.assertThrows(
        () => new ApiService.Phase1Binder(unapprovedSR, fs, pp),
        'must be APPROVED',
        '5.2 Binder blocks: SR not approved'
    );

    t.assertThrows(
        () => new ApiService.Phase1Binder(sr, null, pp),
        'Feasibility Study is missing',
        '5.3 Binder blocks: FS is null'
    );

    const unapprovedFS = new ApiService.FeasibilityStudy('PRJ-TEST');
    unapprovedFS.setVerdict(true);
    t.assertThrows(
        () => new ApiService.Phase1Binder(sr, unapprovedFS, pp),
        'must be APPROVED',
        '5.4 Binder blocks: FS not approved'
    );

    const dntFS = buildApprovedFS();
    dntFS.finalVerdict = 'DO_NOT_PROCEED'; // Force override for test
    t.assertThrows(
        () => new ApiService.Phase1Binder(sr, dntFS, pp),
        'PROCEED verdict',
        '5.5 Binder blocks: FS verdict is DO_NOT_PROCEED'
    );

    t.assertThrows(
        () => new ApiService.Phase1Binder(sr, fs, null),
        'Project Planning is missing',
        '5.6 Binder blocks: PP is null'
    );

    const ppNoManager = new ApiService.ProjectPlanning('PRJ-TEST', sr, fs);
    // do NOT set project manager
    t.assertThrows(
        () => new ApiService.Phase1Binder(sr, fs, ppNoManager),
        'Project Manager',
        '5.7 Binder blocks: PP has no Project Manager'
    );

    // --- Happy path ---
    t.assertDoesNotThrow(
        () => new ApiService.Phase1Binder(sr, fs, pp),
        '5.8 Binder issues successfully with all valid Phase 1 inputs'
    );

    const binder = new ApiService.Phase1Binder(sr, fs, pp);

    // ID and timestamp
    t.assertNotNull(binder.binderId, '5.9 Binder has a unique binderId');
    t.assert(binder.binderId.startsWith('PH1-BINDER-'), '5.10 Binder ID follows naming convention');
    t.assertNotNull(binder.issuedAt, '5.11 Binder has an issuedAt timestamp');
    t.assertEqual(binder.issuedForPhase, 'ANALYSIS', '5.12 Binder is issued for ANALYSIS phase');

    // SR snapshot
    t.assertEqual(binder.systemRequest.projectSponsor, 'Alice Smith', '5.13 SR sponsor captured in binder');
    t.assertEqual(binder.systemRequest.approvedBy, 'Admin-John', '5.14 SR approvedBy captured in binder');

    // FS snapshot
    t.assertEqual(binder.feasibilityStudy.finalVerdict, 'PROCEED', '5.15 FS verdict captured in binder');
    t.assertEqual(binder.feasibilityStudy.stakeholders.length, 1, '5.16 FS stakeholders captured in binder');
    t.assertNotNull(binder.feasibilityStudy.metrics.npv, '5.17 FS NPV captured in binder');

    // PP snapshot
    t.assertEqual(binder.projectPlanning.projectManager, 'Bob Jones', '5.18 PP project manager captured in binder');
    t.assertEqual(binder.projectPlanning.methodology.selectedCategory, 'WATERFALL', '5.19 PP methodology captured');
    t.assertEqual(binder.projectPlanning.assignedStaff.length, 1, '5.20 PP team captured in binder');

    // Immutability
    t.assertThrows(
        () => { binder.systemRequest.projectSponsor = 'HACKED'; },
        undefined,
        '5.21 SR sub-object is frozen (cannot be mutated)'
    );
    t.assertThrows(
        () => { binder.binderId = 'FAKE-ID'; },
        undefined,
        '5.22 Binder itself is frozen (cannot be mutated)'
    );

    // toJSON
    const json = binder.toJSON();
    t.assertEqual(json.binderId, binder.binderId, '5.23 toJSON preserves binderId');
    t.assertNotNull(json.systemRequest, '5.24 toJSON includes systemRequest snapshot');
    t.assertNotNull(json.feasibilityStudy, '5.25 toJSON includes feasibilityStudy snapshot');
    t.assertNotNull(json.projectPlanning, '5.26 toJSON includes projectPlanning snapshot');

    // renderAsHTML
    const html = binder.renderAsHTML();
    t.assertContains(html, 'Phase 1 Origin Binder', '5.27 HTML renders the binder title');
    t.assertContains(html, binder.binderId, '5.28 HTML renders the binder ID');
    t.assertContains(html, 'Alice Smith', '5.29 HTML shows sponsor from SR snapshot');
    t.assertContains(html, 'Bob Jones', '5.30 HTML shows PM from PP snapshot');

    return t.getSummary();
}

// ─────────────────────────────────────────────
// SUITE 6: AnalysisPhase — Container & Gates
// ─────────────────────────────────────────────
export function runAnalysisPhaseTests() {
    const t = new TestRunner('Suite 6 — AnalysisPhase (Container & Exit Gate)');

    const sr = buildApprovedSR();
    const fs = buildApprovedFS();
    const pp = buildCompletePP(sr, fs);

    // Construction requires all 3 Phase 1 objects
    t.assertThrows(
        () => new ApiService.AnalysisPhase('PRJ-TEST', null, fs, pp),
        'PHASE 2 BIRTH BLOCKED',
        '6.1 AnalysisPhase blocks if SR is missing'
    );
    t.assertThrows(
        () => new ApiService.AnalysisPhase('PRJ-TEST', sr, null, pp),
        'PHASE 2 BIRTH BLOCKED',
        '6.2 AnalysisPhase blocks if FS is missing'
    );
    t.assertThrows(
        () => new ApiService.AnalysisPhase('PRJ-TEST', sr, fs, null),
        'PHASE 2 BIRTH BLOCKED',
        '6.3 AnalysisPhase blocks if PP is missing'
    );

    // Happy path construction
    t.assertDoesNotThrow(
        () => new ApiService.AnalysisPhase('PRJ-TEST', sr, fs, pp),
        '6.4 AnalysisPhase creates successfully with valid Phase 1 inputs'
    );

    const ap = new ApiService.AnalysisPhase('PRJ-TEST', sr, fs, pp);

    // Binder correctly attached
    t.assertNotNull(ap.phase1Binder, '6.5 phase1Binder is attached to AnalysisPhase');
    t.assert(ap.phase1Binder.binderId.startsWith('PH1-BINDER-'), '6.6 Binder ID is valid');
    t.assertEqual(ap.projectManager, 'Bob Jones', '6.7 ProjectManager derived from binder, not re-entered');
    t.assertNotNull(ap.createdAt, '6.8 AnalysisPhase has a creation timestamp');

    // 4 sub-sections instantiated
    t.assertNotNull(ap.requirementsDetermination, '6.9 requirementsDetermination sub-object exists');
    t.assertNotNull(ap.useCaseAnalysis, '6.10 useCaseAnalysis sub-object exists');
    t.assertNotNull(ap.processModeling, '6.11 processModeling sub-object exists');
    t.assertNotNull(ap.dataModeling, '6.12 dataModeling sub-object exists');

    // Initial deliverable status
    t.assertEqual(ap.systemProposal.status, 'NOT_CREATED', '6.13 System Proposal starts as NOT_CREATED');

    // compileSystemProposal blocked — sections not complete
    const result1 = ap.compileSystemProposal('Automate HR system using web platform');
    t.assert(!result1.success, '6.14 compileSystemProposal fails when sections are incomplete');
    t.assertContains(result1.reason, 'COMPLETED', '6.15 Failure reason mentions COMPLETED requirement');

    // Complete all sections
    ap.requirementsDetermination.finalize();
    ap.useCaseAnalysis.finalize();
    ap.processModeling.finalize();
    ap.dataModeling.finalize();
    t.assert(ap.allSectionsComplete(), '6.16 allSectionsComplete() returns true after all finalized');

    // compileSystemProposal blocked — RDD not approved
    const result2 = ap.compileSystemProposal('System proposal summary');
    t.assert(!result2.success, '6.17 compileSystemProposal fails if RDD is not approved');
    t.assertContains(result2.reason, 'Requirements Definition Document', '6.18 Failure cites RDD requirement');

    // Approve RDD
    ap.requirementsDetermination.definitionStatement = {
        projectName: 'HR Automation', preparedBy: 'Bob Jones', date: new Date().toISOString(),
        overview: 'Full overview', scope: 'Leave management', constraints: [], assumptions: []
    };
    ap.requirementsDetermination.addFunctionalRequirement('FR-01', 'Online leave request', 'High', 'Interview');
    ap.requirementsDetermination.compileRequirementsDocument();
    ap.requirementsDetermination.approveRequirementsDocument('Admin-John');

    // compileSystemProposal should now work
    const result3 = ap.compileSystemProposal('Automate HR system using web platform');
    t.assert(result3.success, '6.19 compileSystemProposal succeeds after all conditions met');
    t.assertEqual(ap.systemProposal.status, 'DRAFT', '6.20 System Proposal status is DRAFT after compile');

    // approveSystemProposal
    ap.approveSystemProposal('Admin-Jane');
    t.assertEqual(ap.systemProposal.status, 'APPROVED', '6.21 System Proposal APPROVED after admin stamp');
    t.assertEqual(ap.systemProposal.approvedBy, 'Admin-Jane', '6.22 Approver name recorded');
    t.assert(ap.isApproved(), '6.23 isApproved() returns true');

    // Exit gate
    const gate = ap.canProceedToDesign();
    t.assert(gate.allowed, '6.24 canProceedToDesign() returns allowed: true');
    t.assertContains(gate.reason, 'GATE PASSED', '6.25 Gate passed reason returned');
    t.assertEqual(gate.binderId, ap.phase1Binder.binderId, '6.26 Exit gate returns binderId (chain of custody)');

    // toJSON — binder is first field
    const json = ap.toJSON();
    const keys = Object.keys(json);
    t.assertEqual(keys[3], 'phase1Binder', '6.27 phase1Binder is 4th key in toJSON (after identity fields)');
    t.assertNotNull(json.requirementsDefinitionDocument, '6.28 toJSON includes RDD status');
    t.assertNotNull(json.systemProposal, '6.29 toJSON includes systemProposal');

    // renderAsHTML — binder panel first
    const html = ap.renderAsHTML();
    t.assertContains(html, 'Phase 1 Origin Binder', '6.30 Binder renders at top of HTML');
    t.assertContains(html, 'Analysis Phase', '6.31 Phase title renders in HTML');
    t.assertContains(html, 'SYSTEM PROPOSAL — OFFICIAL', '6.32 Approved proposal stamp renders');

    return t.getSummary();
}

// ─────────────────────────────────────────────
// SUITE 7: RequirementsDetermination
// ─────────────────────────────────────────────
export function runRequirementsDeterminationTests() {
    const t = new TestRunner('Suite 7 — RequirementsDetermination');

    const rd = new ApiService.AnalysisPhase(
        'PRJ-TEST', buildApprovedSR(), buildApprovedFS(), buildCompletePP(buildApprovedSR(), buildApprovedFS())
    ).requirementsDetermination;

    // Initial state
    t.assertEqual(rd.status, 'PENDING', '7.1 Initial status is PENDING');

    // Definition
    rd.setDefinition('Requirements are conditions a system must meet.', ['Functional', 'Non-Functional']);

    // Use setDefinition if available
    if (rd.setDefinition) {
        t.assertEqual(rd.definition.typesOfRequirements.length, 2, '7.2 Types of requirements stored');
    }

    // Elicitation
    rd.addInterview('Jane Doe', 'HR Manager', '2026-10-01', 'Discussed leave system pain points', 'Manual process is slow');
    t.assertEqual(rd.elicitation.interviews.length, 1, '7.3 Interview added');
    t.assertEqual(rd.status, 'IN_PROGRESS', '7.4 Status moves to IN_PROGRESS on first data');

    rd.addJADSession('Bob Jones', ['HR', 'IT'], '2026-10-02', 'Requirements workshop', 'Agreed on core features');
    t.assertEqual(rd.elicitation.jadSessions.length, 1, '7.5 JAD session added');

    rd.addQuestionnaire('User Needs Survey', 'All Staff', 10, 87, '80% want mobile access');
    t.assertEqual(rd.elicitation.questionnaires.length, 1, '7.6 Questionnaire added');

    rd.addObservation('Carol', 'Leave approval process', '2026-10-03', '3 manual handoffs per request');
    t.assertEqual(rd.elicitation.observations.length, 1, '7.7 Observation added');

    rd.addDocumentAnalysis('Current Leave Policy', 'HR Dept', '2026-10-01', 'Defines 5 leave types');
    t.assertEqual(rd.elicitation.documentAnalysis.length, 1, '7.8 Document analysis added');

    // Analysis strategies
    rd.applyStrategy('problemAnalysis', { findings: 'Manual process causes 3-day delays' });
    t.assert(rd.analysisStrategies.problemAnalysis.applied, '7.9 Problem Analysis marked as applied');

    rd.applyStrategy('rootCauseAnalysis', {
        causes: [{ problem: 'Delays', rootCause: 'Paper forms', evidence: 'Observation log' }],
        findings: 'Paper-based process'
    });
    t.assert(rd.analysisStrategies.rootCauseAnalysis.applied, '7.10 Root Cause Analysis applied');
    t.assertEqual(rd.analysisStrategies.rootCauseAnalysis.causes.length, 1, '7.11 Root cause recorded');

    t.assertThrows(
        () => rd.applyStrategy('nonExistentStrategy', {}),
        'Unknown analysis strategy',
        '7.12 Throws for unknown strategy key'
    );

    // Requirements
    rd.addFunctionalRequirement('FR-01', 'Online leave request', 'High', 'Interview-JaneDoe');
    rd.addFunctionalRequirement('FR-02', 'Manager email notification', 'High', 'JAD-Session');
    rd.addNonFunctionalRequirement('NFR-01', 'Response time < 2s', 'Performance', 'Survey');
    t.assertEqual(rd.functionalRequirements.length, 2, '7.13 Two functional requirements added');
    t.assertEqual(rd.nonFunctionalRequirements.length, 1, '7.14 One NFR added');

    // RDD compile — fails without definition statement
    const compile1 = rd.compileRequirementsDocument();
    t.assert(!compile1.success, '7.15 compileRequirementsDocument fails without definition statement');

    // Set definition statement then compile
    rd.setDefinitionStatement({
        projectName: 'HR Leave System', preparedBy: 'Bob Jones',
        overview: 'Automate leave management', scope: 'Leave request and approval',
        constraints: ['Budget: $100k'], assumptions: ['Users have internet access']
    });
    const compile2 = rd.compileRequirementsDocument();
    t.assert(compile2.success, '7.16 compileRequirementsDocument succeeds with statement + requirements');
    t.assertEqual(rd.requirementsDefinitionDocument.status, 'DRAFT', '7.17 RDD status is DRAFT after compile');

    // Approve throws before compile (already compiled so test the guard the other way)
    rd.approveRequirementsDocument('Admin-John');
    t.assertEqual(rd.requirementsDefinitionDocument.status, 'APPROVED', '7.18 RDD APPROVED after admin stamps');

    // Approve throws if not DRAFT
    t.assertThrows(
        () => rd.approveRequirementsDocument('Admin-John'),
        'compiled before',
        '7.19 Throws if trying to approve a non-DRAFT RDD'
    );

    // Finalize
    rd.finalize();
    t.assertEqual(rd.status, 'COMPLETED', '7.20 Status is COMPLETED after finalize()');

    // toJSON
    const json = rd.toJSON();
    t.assertNotNull(json.elicitation, '7.21 toJSON includes elicitation data');
    t.assertNotNull(json.analysisStrategies, '7.22 toJSON includes analysis strategies');
    t.assertEqual(json.functionalRequirements.length, 2, '7.23 toJSON includes FRs');

    return t.getSummary();
}

// ─────────────────────────────────────────────
// SUITE 8: UseCaseAnalysis
// ─────────────────────────────────────────────
export function runUseCaseAnalysisTests() {
    const t = new TestRunner('Suite 8 — UseCaseAnalysis');

    const uca = new ApiService.AnalysisPhase(
        'PRJ-TEST', buildApprovedSR(), buildApprovedFS(), buildCompletePP(buildApprovedSR(), buildApprovedFS())
    ).useCaseAnalysis;

    t.assertEqual(uca.status, 'PENDING', '8.1 Initial status is PENDING');

    // Concept
    uca.setConcept('A use case describes a system interaction.', 'To capture functional requirements via scenarios.', ['Goal-oriented', 'Actor-driven']);
    t.assertEqual(uca.concept.keyPrinciples.length, 2, '8.2 Key principles stored');

    // Actors
    uca.addActor('A1', 'Employee', 'Primary', 'Staff member submitting leave');
    uca.addActor('A2', 'Manager', 'Secondary', 'Approves leave requests');
    t.assertEqual(uca.actors.length, 2, '8.3 Two actors added');
    t.assertEqual(uca.status, 'IN_PROGRESS', '8.4 Status moves to IN_PROGRESS on actor add');

    // Casual use case
    uca.addCasualUseCase('UC-01', 'Request Leave', 'Employee', 'Employee logs in and submits a leave request form.');
    t.assertEqual(uca.casualUseCases.length, 1, '8.5 Casual use case added');

    // Sequence use case
    uca.addSequenceUseCase('UC-02', 'Approve Leave', 'Manager', ['Manager receives notification', 'Manager reviews request', 'Manager approves or rejects']);
    t.assertEqual(uca.sequenceUseCases.length, 1, '8.6 Sequence use case added');
    t.assertEqual(uca.sequenceUseCases[0].steps.length, 3, '8.7 Sequence has 3 steps');

    // Fully dressed use case
    uca.addFullyDressedUseCase({
        id: 'UC-03', name: 'Submit Leave Request',
        briefDescription: 'Employee submits a leave request through the web portal.',
        primaryActor: 'Employee', secondaryActors: ['HR System'],
        preconditions: ['Employee is logged in'],
        mainFlow: ['Employee clicks Leave Request', 'System shows form', 'Employee fills and submits', 'System sends notification to Manager'],
        alternateFlows: [{ condition: 'Invalid dates', steps: ['System shows error', 'Employee corrects and resubmits'] }],
        exceptionFlows: [{ condition: 'System offline', steps: ['System shows maintenance page'] }],
        postconditions: ['Leave request recorded', 'Manager notified'],
        businessRules: ['Cannot request leave in past dates'],
        linkedRequirementIds: ['FR-01', 'FR-02'],
        openIssues: ['Confirm email template with HR team']
    });
    t.assertEqual(uca.fullyDressedUseCases.length, 1, '8.8 Fully dressed use case added');
    t.assertEqual(uca.fullyDressedUseCases[0].actors.primary, 'Employee', '8.9 Primary actor stored');
    t.assertEqual(uca.fullyDressedUseCases[0].mainFlow.length, 4, '8.10 Main flow has 4 steps');
    t.assertEqual(uca.fullyDressedUseCases[0].alternateFlows.length, 1, '8.11 Alternate flow stored');
    t.assertEqual(uca.fullyDressedUseCases[0].linkedRequirementIds.length, 2, '8.12 Linked requirements stored');

    // Traceability
    uca.linkUseCaseToRequirements('UC-03', 'Submit Leave Request', ['FR-01', 'FR-02']);
    t.assertEqual(uca.traceabilityMatrix.length, 1, '8.13 Traceability entry added');
    uca.linkUseCaseToRequirements('UC-03', 'Submit Leave Request', ['FR-03']); // add more FRs
    t.assertEqual(uca.traceabilityMatrix[0].linkedFRIds.length, 3, '8.14 Additional FR added via merge (no duplicates)');

    // Testing
    uca.setTestingApproach('Drive system tests from use case main flows');
    uca.addTestCase('UC-03', 'Happy path leave submission', 'Leave request created and manager notified');
    t.assertEqual(uca.testing.testCases.length, 1, '8.15 Test case added');
    t.assertEqual(uca.testing.testCases[0].status, 'PENDING', '8.16 Test case starts as PENDING');

    uca.updateTestCaseStatus('UC-03', 'Happy path leave submission', 'PASSED');
    t.assertEqual(uca.testing.testCases[0].status, 'PASSED', '8.17 Test case status updated to PASSED');

    // Creation — identify + elaborate
    uca.identifyUseCase('UC-04', 'View Leave Balance', 'Employee', 'Check available leave days');
    t.assertEqual(uca.creation.identifiedUseCases.length, 1, '8.18 Major use case identified');
    uca.elaborateUseCase('UC-04', 'casual', 'Simple read-only operation — casual format sufficient');
    t.assertEqual(uca.creation.elaborationDecisions.length, 1, '8.19 Elaboration decision recorded');
    t.assertEqual(uca.creation.elaborationDecisions[0].chosenFormat, 'casual', '8.20 Format choice stored correctly');

    // Finalize
    uca.finalize();
    t.assertEqual(uca.status, 'COMPLETED', '8.21 Status COMPLETED after finalize()');

    // toJSON
    const json = uca.toJSON();
    t.assertEqual(json.fullyDressedUseCases.length, 1, '8.22 toJSON includes fully dressed UCs');
    t.assertEqual(json.traceabilityMatrix.length, 1, '8.23 toJSON includes traceability matrix');

    // renderAsHTML
    const html = uca.renderAsHTML();
    t.assertContains(html, 'UC-03', '8.24 Fully dressed UC ID appears in HTML');
    t.assertContains(html, 'Alternate Flows', '8.25 Alternate flows section rendered');
    t.assertContains(html, 'FR-01', '8.26 Linked requirement appears in HTML');
    t.assertContains(html, 'PASSED', '8.27 Test case status appears in HTML');

    return t.getSummary();
}
