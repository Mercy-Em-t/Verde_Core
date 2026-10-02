// tests/phase1.test.js
// Test Suite: Phase 1 — SystemRequest, FeasibilityStudy, ProjectPlanning & sub-objects

import { TestRunner } from './testRunner.js';
import ApiService from '../api-service/index.js';

// ─────────────────────────────────────────────
// HELPERS — Build valid Phase 1 objects
// ─────────────────────────────────────────────
function buildApprovedSR() {
    const sr = new ApiService.SystemRequest('PRJ-TEST');
    sr.setProjectSponsor('Alice Smith');
    sr.setBusinessNeed('Automate manual HR processes');
    sr.addBusinessRequirement('REQ-01: Staff must be able to submit leave online');
    sr.addBusinessRequirement('REQ-02: Manager approval via email notification');
    sr.setBusinessValue('Reduce HR processing time by 40%');
    sr.setSpecialIssues('Legacy payroll system integration required');
    sr.approve('Admin-John');
    return sr;
}

function buildApprovedFS(projectId = 'PRJ-TEST') {
    const fs = new ApiService.FeasibilityStudy(projectId);
    fs.setTechnicalAssessment({
        description: 'Web-based HR system',
        familiarityWithApplication: 'High',
        familiarityWithTechnology: 'Medium',
        projectSize: 'Medium',
        compatibility: 'Requires API adapter for payroll',
        familiarityWithBusinessDomain: 'High',
        infrastructureReadiness: 'Cloud-ready',
        securityAndCompliance: 'GDPR compliant'
    });
    fs.addCostOrBenefit('developmentCosts', 'Dev Team', 80000);
    fs.addCostOrBenefit('tangibleBenefits', 'Reduced admin hours', 40000);
    fs.markStepComplete('identifyCostsAndBenefits');
    fs.markStepComplete('assignValues');
    fs.markStepComplete('determineCashFlows');
    fs.markStepComplete('determineBreakEven');
    fs.calculateFinancialMetrics(5);
    fs.setStrategicAlignment('Supports digital transformation', 'User survey: 85% approval');
    fs.addStakeholder('Alice Smith', 'Sponsor', 'High', 'High');
    fs.setVerdict(true);
    fs.approve('Admin-John');
    return fs;
}

function buildCompletePP(sr, fs) {
    const pp = new ApiService.ProjectPlanning('PRJ-TEST', sr, fs);
    pp.setProjectManager('Bob Jones');
    pp.methodologySelection.setInsights({
        clarityOfUserRequirements: 'High',
        familiarityWithTechnology: 'Medium',
        systemComplexity: 'Medium',
        systemReliability: 'High',
        shortTimeSchedule: false,
        scheduleVisibility: 'Required'
    });
    pp.methodologySelection.selectMethodology('WATERFALL', 'Parallel', 'Requirements are clear and stable');
    pp.workPlan.setEstimates('Medium', 6);
    pp.workPlan.addWBSPhase('P1', 'Initiation');
    pp.workPlan.addTask('P1', { id: 'T1', name: 'Kickoff Meeting', type: 'Management', durationDays: 1, milestone: false, deliverable: 'Meeting Minutes', assignedTo: 'Bob Jones' });
    pp.workPlan.finalizeWorkPlan();
    pp.staffing.addStaffingNeed('Developer', 2, ['JavaScript', 'Node.js']);
    pp.staffing.assignStaffMember('Carol White', 'Developer');
    pp.staffing.finalizeStaffing();
    pp.manageAndControl.addStandard('Coding', 'ES6+ JavaScript standards');
    pp.manageAndControl.addRisk('R01', 'Integration failure with payroll', 'Medium', 'High', 'Build API adapter early');
    pp.manageAndControl.finalizeManagementPlan();
    return pp;
}

// ─────────────────────────────────────────────
// SUITE 1: SystemRequest
// ─────────────────────────────────────────────
export function runSystemRequestTests() {
    const t = new TestRunner('Suite 1 — SystemRequest');

    // Construction
    const sr = new ApiService.SystemRequest('PRJ-001');
    t.assertEqual(sr.status, 'DRAFT', '1.1 New SR has DRAFT status');
    t.assertNull(sr.approvedBy, '1.2 New SR has no approver');

    // Setters
    sr.setProjectSponsor('Alice');
    sr.setBusinessNeed('Need automation');
    sr.addBusinessRequirement('REQ-01');
    sr.addBusinessRequirement('REQ-02');
    sr.setBusinessValue('Save $50k/yr');
    sr.setSpecialIssues('Legacy system');
    t.assertEqual(sr.projectSponsor, 'Alice', '1.3 Sponsor set correctly');
    t.assertEqual(sr.businessRequirements.length, 2, '1.4 Two requirements added');

    // isApproved before approve
    t.assert(!sr.isApproved(), '1.5 isApproved() is false before approval');

    // Approval
    sr.approve('Admin-Jane');
    t.assertEqual(sr.status, 'APPROVED', '1.6 Status changes to APPROVED after approve()');
    t.assertEqual(sr.approvedBy, 'Admin-Jane', '1.7 approvedBy set correctly');
    t.assert(sr.isApproved(), '1.8 isApproved() returns true after approval');
    t.assertNotNull(sr.approvedAt, '1.9 approvedAt timestamp is set');

    // toJSON
    const json = sr.toJSON();
    t.assertEqual(json.projectId, 'PRJ-001', '1.10 toJSON includes projectId');
    t.assertEqual(json.projectSponsor, 'Alice', '1.11 toJSON includes sponsor');

    // renderAsHTML
    const html = sr.renderAsHTML();
    t.assertContains(html, 'OFFICIAL DOCUMENT', '1.12 Approved SR renders OFFICIAL stamp');
    t.assertContains(html, 'Alice', '1.13 Sponsor appears in rendered HTML');
    t.assertContains(html, 'REQ-01', '1.14 Requirements appear in rendered HTML');

    // Draft renders as DRAFT
    const draftSr = new ApiService.SystemRequest('PRJ-002');
    t.assertContains(draftSr.renderAsHTML(), 'DRAFT', '1.15 Unapproved SR renders DRAFT stamp');

    return t.getSummary();
}

// ─────────────────────────────────────────────
// SUITE 2: FeasibilityStudy
// ─────────────────────────────────────────────
export function runFeasibilityStudyTests() {
    const t = new TestRunner('Suite 2 — FeasibilityStudy');

    const fs = new ApiService.FeasibilityStudy('PRJ-001');
    t.assertEqual(fs.status, 'DRAFT', '2.1 FeasibilityStudy constructs');

    // Technical assessment
    fs.setTechnicalAssessment({
        description: 'Cloud system', familiarityWithApplication: 'High',
        familiarityWithTechnology: 'High', projectSize: 'Large',
        compatibility: 'Standalone', familiarityWithBusinessDomain: 'Medium',
        infrastructureReadiness: 'Ready', securityAndCompliance: 'SOC2'
    });
    t.assertEqual(fs.technical.projectSize, 'Large', '2.2 Technical assessment stored correctly');

    // Costs and benefits
    fs.addCostOrBenefit('developmentCosts', 'Dev', 100000);
    fs.addCostOrBenefit('tangibleBenefits', 'Revenue gain', 60000);
    t.assertEqual(fs.economic.developmentCosts.length, 1, '2.3 Development cost added');
    t.assertEqual(fs.economic.tangibleBenefits.length, 1, '2.4 Tangible benefit added');

    // Financial metrics
    fs.calculateFinancialMetrics(5);
    t.assertNotNull(fs.economic.metrics.npv, '2.5 NPV calculated');
    t.assertNotNull(fs.economic.metrics.roi, '2.6 ROI calculated');

    // Stakeholders
    fs.addStakeholder('Bob', 'PM', 'High', 'Medium');
    t.assertEqual(fs.organizational.stakeholderAnalysis.length, 1, '2.7 Stakeholder added');

    // Verdict
    t.assertNull(fs.finalVerdict, '2.8 No verdict before setVerdict()');
    fs.setVerdict(true);
    t.assertEqual(fs.finalVerdict, 'PROCEED', '2.9 PROCEED verdict set correctly');

    fs.setVerdict(false);
    t.assertEqual(fs.finalVerdict, 'DO_NOT_PROCEED', '2.10 DO_NOT_PROCEED set correctly');

    // Approval
    t.assert(!fs.isApproved(), '2.11 Not approved before approve()');
    fs.approve('Admin-Jane');
    t.assert(fs.isApproved(), '2.12 Approved after approve()');

    // toJSON
    const json = fs.toJSON();
    t.assertEqual(json.finalVerdict, 'DO_NOT_PROCEED', '2.13 toJSON includes finalVerdict');
    t.assertNotNull(json.economic.metrics, '2.14 toJSON includes metrics');

    // renderAsHTML
    const html = fs.renderAsHTML();
    t.assertContains(html, 'OFFICIAL', '2.15 Approved FS renders official stamp');
    t.assertContains(html, 'DO NOT PROCEED', '2.16 Verdict appears in rendered HTML');

    return t.getSummary();
}

// ─────────────────────────────────────────────
// SUITE 3: ProjectPlanning — Gates & Sub-objects
// ─────────────────────────────────────────────
export function runProjectPlanningTests() {
    const t = new TestRunner('Suite 3 — ProjectPlanning (Gates & Sub-objects)');

    const sr = buildApprovedSR();
    const fs = buildApprovedFS();

    // Gate: No SR
    t.assertThrows(
        () => new ApiService.ProjectPlanning('PRJ-001', null, fs),
        'GATE BLOCKED',
        '3.1 Gate blocks if SystemRequest is null'
    );

    // Gate: Unapproved SR
    const unapprovedSR = new ApiService.SystemRequest('PRJ-001');
    t.assertThrows(
        () => new ApiService.ProjectPlanning('PRJ-001', unapprovedSR, fs),
        'GATE BLOCKED',
        '3.2 Gate blocks if SystemRequest is not approved'
    );

    // Gate: No FS
    t.assertThrows(
        () => new ApiService.ProjectPlanning('PRJ-001', sr, null),
        'GATE BLOCKED',
        '3.3 Gate blocks if FeasibilityStudy is null'
    );

    // Gate: FS not approved
    const unapprovedFS = new ApiService.FeasibilityStudy('PRJ-001');
    unapprovedFS.setVerdict(true);
    t.assertThrows(
        () => new ApiService.ProjectPlanning('PRJ-001', sr, unapprovedFS),
        'GATE BLOCKED',
        '3.4 Gate blocks if FeasibilityStudy is not approved'
    );

    // Gate: FS approved but DO_NOT_PROCEED
    const dntFS = buildApprovedFS();
    dntFS.finalVerdict = 'DO_NOT_PROCEED';
    t.assertThrows(
        () => new ApiService.ProjectPlanning('PRJ-001', sr, dntFS),
        'GATE BLOCKED',
        '3.5 Gate blocks if verdict is DO_NOT_PROCEED'
    );

    // Happy path
    t.assertDoesNotThrow(
        () => new ApiService.ProjectPlanning('PRJ-001', sr, fs),
        '3.6 ProjectPlanning creates successfully with valid SR and FS'
    );

    const pp = new ApiService.ProjectPlanning('PRJ-001', sr, fs);
    pp.setProjectManager('Bob Jones');
    t.assertEqual(pp.projectManager, 'Bob Jones', '3.7 Project Manager assigned');

    // MethodologySelector
    pp.methodologySelection.setInsights({ clarityOfUserRequirements: 'High' });
    pp.methodologySelection.selectMethodology('WATERFALL', 'Parallel', 'Stable requirements');
    t.assertEqual(pp.methodologySelection.selectedCategory, 'WATERFALL', '3.8 Methodology selected');
    t.assertEqual(pp.methodologySelection.status, 'COMPLETED', '3.9 Methodology status is COMPLETED');

    // WorkPlan
    pp.workPlan.setEstimates('Medium', 4);
    pp.workPlan.addWBSPhase('P1', 'Planning');
    pp.workPlan.addTask('P1', { id: 'T1', name: 'Kickoff', type: 'Mgmt', durationDays: 1, milestone: true, deliverable: 'Minutes', assignedTo: 'Bob' });
    t.assertEqual(pp.workPlan.taskList.length, 1, '3.10 Task added to flat task list');
    t.assertEqual(pp.workPlan.wbs.length, 1, '3.11 WBS phase added');
    t.assertThrows(() => pp.workPlan.addTask('NONEXISTENT', {}), 'not found', '3.12 Task throws for unknown phase');
    pp.workPlan.finalizeWorkPlan();
    t.assertEqual(pp.workPlan.status, 'COMPLETED', '3.13 WorkPlan status COMPLETED after finalize');

    // StaffingPlan
    pp.staffing.addStaffingNeed('Developer', 2, ['JS']);
    pp.staffing.assignStaffMember('Carol', 'Developer');
    t.assertEqual(pp.staffing.assignedStaff.length, 1, '3.14 Staff member assigned');
    pp.staffing.finalizeStaffing();
    t.assertEqual(pp.staffing.status, 'COMPLETED', '3.15 Staffing status COMPLETED');

    // ManageAndControl — Risk Severity auto-calculation
    pp.manageAndControl.addRisk('R01', 'Integration failure', 'High', 'High', 'Build adapter early');
    const risk = pp.manageAndControl.risks[0];
    t.assertEqual(risk.severity, 'Critical', '3.16 High × High risk auto-calculates to Critical');

    pp.manageAndControl.addRisk('R02', 'Minor UI delay', 'Low', 'Low', 'Monitor performance');
    const risk2 = pp.manageAndControl.risks[1];
    t.assertEqual(risk2.severity, 'Low', '3.17 Low × Low risk auto-calculates to Low');

    // toJSON cascades
    const json = pp.toJSON();
    t.assertNotNull(json.methodologySelection, '3.18 toJSON includes methodologySelection');
    t.assertNotNull(json.workPlan, '3.19 toJSON includes workPlan');
    t.assertNotNull(json.staffing, '3.20 toJSON includes staffing');
    t.assertNotNull(json.manageAndControl, '3.21 toJSON includes manageAndControl');

    return t.getSummary();
}

// ─────────────────────────────────────────────
// SUITE 4: DocumentManager (Versioning + Hybrid)
// ─────────────────────────────────────────────
export function runDocumentManagerTests() {
    const t = new TestRunner('Suite 4 — DocumentManager (Versioning & Hybrid)');

    const dm = new ApiService.DocumentManager();
    const sr = buildApprovedSR();

    // First save
    const v1 = dm.saveDocument('PRJ-001', 'SYSTEM_REQUEST', sr, 'Alice');
    t.assertEqual(v1.version, 1, '4.1 First save is version 1');
    t.assertNull(v1.previousId, '4.2 v1 has no previousId (it is the original)');
    t.assertEqual(v1.author, 'Alice', '4.3 Author recorded correctly');
    t.assertNotNull(v1.id, '4.4 v1 has a generated ID');

    // Second save — linked to first
    const v2 = dm.saveDocument('PRJ-001', 'SYSTEM_REQUEST', sr, 'Bob');
    t.assertEqual(v2.version, 2, '4.5 Second save is version 2');
    t.assertEqual(v2.previousId, v1.id, '4.6 v2.previousId points to v1.id (linked list)');

    // getLatest returns tail
    const latest = dm.getLatestDocument('PRJ-001', 'SYSTEM_REQUEST');
    t.assertEqual(latest.version, 2, '4.7 getLatestDocument returns version 2');

    // History
    const history = dm.getDocumentHistory('PRJ-001', 'SYSTEM_REQUEST');
    t.assertEqual(history.length, 2, '4.8 History contains 2 versions');

    // Multi-project isolation
    dm.saveDocument('PRJ-002', 'SYSTEM_REQUEST', sr, 'Carol');
    const p2latest = dm.getLatestDocument('PRJ-002', 'SYSTEM_REQUEST');
    t.assertEqual(p2latest.version, 1, '4.9 PRJ-002 starts at v1 (isolated from PRJ-001)');
    const p1latest = dm.getLatestDocument('PRJ-001', 'SYSTEM_REQUEST');
    t.assertEqual(p1latest.version, 2, '4.10 PRJ-001 unaffected by PRJ-002 operations');

    // Null for unknown project
    const unknown = dm.getLatestDocument('PRJ-999', 'SYSTEM_REQUEST');
    t.assertNull(unknown, '4.11 getLatestDocument returns null for unknown project');

    // Hybrid attachment
    dm.attachFileToVersion('PRJ-001', 'SYSTEM_REQUEST', 1, 'Signed_SR.pdf', '/uploads/sr.pdf');
    const v1Updated = dm.getDocumentHistory('PRJ-001', 'SYSTEM_REQUEST')[0];
    t.assertEqual(v1Updated.attachments.length, 1, '4.12 Attachment added to v1');
    t.assertEqual(v1Updated.attachments[0].fileName, 'Signed_SR.pdf', '4.13 Attachment filename correct');

    // Attach throws for unknown version
    t.assertThrows(
        () => dm.attachFileToVersion('PRJ-001', 'SYSTEM_REQUEST', 99, 'test.pdf', '/test.pdf'),
        'not found',
        '4.14 attachFileToVersion throws for unknown version'
    );

    // HTML render includes version history
    const html = dm.renderHistoryAsHTML('PRJ-001', 'SYSTEM_REQUEST');
    t.assertContains(html, 'v1', '4.15 Version history HTML shows v1');
    t.assertContains(html, 'v2', '4.16 Version history HTML shows v2');
    t.assertContains(html, 'Signed_SR.pdf', '4.17 Attachment appears in version history');
    t.assertContains(html, 'Current', '4.18 Latest version marked as Current');
    t.assertContains(html, 'Archived', '4.19 Older version marked as Archived');

    return t.getSummary();
}
