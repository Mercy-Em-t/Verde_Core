// tests/extra.test.js
// Test Suite: ProcessModeling, DataModeling, AuditLogger, WorkflowEngine

import { TestRunner } from './testRunner.js';
import ApiService from '../api-service/index.js';

// ─────────────────────────────────────────────
// SUITE 10: ProcessModeling
// ─────────────────────────────────────────────
export function runProcessModelingTests() {
    const t = new TestRunner('Suite 10 — ProcessModeling');

    const sr = new ApiService.SystemRequest('PRJ-TEST');
    sr.approve('Admin');
    const fs = new ApiService.FeasibilityStudy('PRJ-TEST');
    fs.setVerdict(true);
    fs.approve('Admin');
    const pp = new ApiService.ProjectPlanning('PRJ-TEST', sr, fs);
    pp.setProjectManager('PM');
    const ap = new ApiService.AnalysisPhase('PRJ-TEST', sr, fs, pp);
    const pmObj = ap.processModeling;

    t.assertEqual(pmObj.status, 'PENDING', '10.1 Initial status is PENDING');

    // Context Diagram
    pmObj.setContextDiagram(
        'System 1.0', 
        [{id: 'E1', name: 'User'}], 
        [{from: 'User', description: 'Data In'}], 
        [{to: 'User', description: 'Data Out'}]
    );
    t.assertEqual(pmObj.contextDiagram.externalEntities.length, 1, '10.2 Context diagram entities added');
    t.assertEqual(pmObj.contextDiagram.dataFlowsIn.length, 1, '10.3 Context diagram flows in added');
    t.assertEqual(pmObj.status, 'IN_PROGRESS', '10.4 Status updates to IN_PROGRESS');

    // Level 0
    pmObj.addLevel0Process('1.0', 'Process Data', 'Does something');
    pmObj.addLevel0DataStore('D1', 'Database');
    pmObj.addLevel0DataFlow('User', '1.0', 'Input');
    t.assertEqual(pmObj.level0DFD.processes.length, 1, '10.5 Level 0 process added');
    t.assertEqual(pmObj.level0DFD.dataStores.length, 1, '10.6 Level 0 data store added');

    // Fragments
    pmObj.addDFDFragment('1.0', ['User'], ['D1'], 'Handles user input to DB');
    t.assertEqual(pmObj.dfdFragments.length, 1, '10.7 DFD fragment added');

    // Validation
    pmObj.validateDFD(true, true, [{ issue: 'Missing flow to D1', resolution: 'Added flow' }]);
    t.assert(pmObj.validation.syntaxErrorsChecked, '10.8 Syntax rules validated');
    t.assertEqual(pmObj.validation.issuesFound.length, 1, '10.9 Syntax error logged');

    pmObj.finalize();
    t.assertEqual(pmObj.status, 'COMPLETED', '10.10 Finalized status');

    const html = pmObj.renderAsHTML();
    t.assertContains(html, 'System 1.0', '10.11 HTML renders context diagram name');
    t.assertContains(html, 'Process Data', '10.12 HTML renders process name');

    return t.getSummary();
}

// ─────────────────────────────────────────────
// SUITE 11: DataModeling
// ─────────────────────────────────────────────
export function runDataModelingTests() {
    const t = new TestRunner('Suite 11 — DataModeling');
    const sr = new ApiService.SystemRequest('PRJ-TEST');
    sr.approve('Admin');
    const fs = new ApiService.FeasibilityStudy('PRJ-TEST');
    fs.setVerdict(true);
    fs.approve('Admin');
    const pp = new ApiService.ProjectPlanning('PRJ-TEST', sr, fs);
    pp.setProjectManager('PM');
    const ap = new ApiService.AnalysisPhase('PRJ-TEST', sr, fs, pp);
    const dm = ap.dataModeling;

    t.assertEqual(dm.status, 'PENDING', '11.1 Initial status is PENDING');

    // ERD Entities
    dm.addEntity('E1', 'Customer', 'A system user', [
        { name: 'id', dataType: 'INT', isPrimaryKey: true, isForeignKey: false, isRequired: true }
    ]);
    dm.addEntity('E2', 'Order', 'A purchase', [
        { name: 'order_id', dataType: 'INT', isPrimaryKey: true, isForeignKey: false, isRequired: true }
    ]);
    
    t.assertEqual(dm.entities.length, 2, '11.2 Entities added successfully');
    t.assertEqual(dm.status, 'IN_PROGRESS', '11.3 Status changes to IN_PROGRESS');

    // Attributes
    t.assertThrows(() => dm.addAttributeToEntity('E99', { name: 'invalid' }), 'not found', '11.4 Throws when adding attribute to unknown entity');
    dm.addAttributeToEntity('E1', { name: 'email', dataType: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isRequired: true });
    t.assertEqual(dm.entities[0].attributes.length, 2, '11.5 Attribute added to existing entity');

    // Relationships
    dm.addRelationship('R1', 'Customer', 'Order', '1', 'M', 'Customer places Order');
    t.assertEqual(dm.relationships.length, 1, '11.6 Relationship added');
    t.assertEqual(dm.relationships[0].cardinalityB, 'M', '11.7 Cardinality formatted correctly');

    // Data Dictionary
    dm.addDataDictionaryEntry('email', 'Attribute', 'User email', 'VARCHAR(255)');
    t.assertEqual(dm.dataDictionary.length, 1, '11.8 Data dictionary entry added');

    // Normalization
    dm.applyNormalization(true, 'Moved to 3NF');
    t.assert(dm.development.normalizationApplied, '11.9 Normalization applied');

    dm.finalize();
    t.assertEqual(dm.status, 'COMPLETED', '11.10 Finalized status');

    const html = dm.renderAsHTML();
    t.assertContains(html, 'Customer places Order', '11.11 HTML renders relationship');
    t.assertContains(html, 'VARCHAR', '11.12 HTML renders attribute data type');

    return t.getSummary();
}

// ─────────────────────────────────────────────
// SUITE 12: AuditLogger
// ─────────────────────────────────────────────
export function runAuditLoggerTests() {
    const t = new TestRunner('Suite 12 — AuditLogger');
    
    const logger = new ApiService.AuditLogger('PRJ-AUDIT');
    t.assertEqual(logger.projectId, 'PRJ-AUDIT', '12.1 Logger initialized with project ID');

    logger.logEvent('System', 'INIT', 'Project created');
    logger.logEvent('Alice', 'UPDATE', 'Modified settings');
    
    const logs = logger.getLogs();
    t.assertEqual(logs.length, 2, '12.2 Events logged successfully');
    t.assertEqual(logs[0].action, 'INIT', '12.3 Action recorded correctly');
    t.assertEqual(logs[1].user, 'Alice', '12.4 User recorded correctly');
    
    t.assertNotNull(logs[0].timestamp, '12.5 Timestamps auto-generated');
    t.assert(new Date(logs[0].timestamp) <= new Date(logs[1].timestamp), '12.6 Chronological ordering maintained');

    const html = logger.renderAuditReportHTML();
    t.assertContains(html, 'INIT', '12.7 HTML renders action');
    t.assertContains(html, 'Alice', '12.8 HTML renders user');
    t.assertContains(html, 'Project created', '12.9 HTML renders details');

    return t.getSummary();
}

// ─────────────────────────────────────────────
// SUITE 13: WorkflowEngine
// ─────────────────────────────────────────────
export function runWorkflowEngineTests() {
    const t = new TestRunner('Suite 13 — WorkflowEngine');
    
    const wf = ApiService.createWorkflow('PRJ-WF');
    t.assertEqual(wf.projectId, 'PRJ-WF', '13.1 Workflow initialized');

    // canStartFeasibilityStudy
    t.assert(!wf.canStartFeasibilityStudy(null).allowed, '13.2 Gate 1 blocks null SR');
    const sr = new ApiService.SystemRequest('PRJ-WF');
    t.assert(!wf.canStartFeasibilityStudy(sr).allowed, '13.3 Gate 1 blocks unapproved SR');
    sr.approve('Admin');
    t.assert(wf.canStartFeasibilityStudy(sr).allowed, '13.4 Gate 1 passes approved SR');

    // canProceedToDetailedPlanning
    t.assert(!wf.canProceedToDetailedPlanning(sr, null).allowed, '13.5 Gate 2 blocks null FS');
    const fs = new ApiService.FeasibilityStudy('PRJ-WF');
    fs.setVerdict(true); // PROCEED
    t.assert(!wf.canProceedToDetailedPlanning(sr, fs).allowed, '13.6 Gate 2 blocks unapproved FS');
    fs.approve('Admin');
    t.assert(wf.canProceedToDetailedPlanning(sr, fs).allowed, '13.7 Gate 2 passes approved PROCEED FS');

    const fsBad = new ApiService.FeasibilityStudy('PRJ-WF');
    fsBad.setVerdict(false); // DO_NOT_PROCEED
    fsBad.approve('Admin');
    t.assert(!wf.canProceedToDetailedPlanning(sr, fsBad).allowed, '13.8 Gate 2 blocks approved DO_NOT_PROCEED FS');
    t.assertContains(wf.canProceedToDetailedPlanning(sr, fsBad).reason, 'PROCEED', '13.9 Gate 2 reason cites PROCEED requirement');

    return t.getSummary();
}
