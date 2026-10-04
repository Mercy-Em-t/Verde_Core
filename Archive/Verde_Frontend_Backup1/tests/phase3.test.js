// tests/phase3.test.js
// Test Suite: Phase 3 — Phase2Binder, DesignPhase & all sub-objects

import { TestRunner } from './testRunner.js';
import ApiService from '../api-service/index.js';

// ─────────────────────────────────────────────
// HELPERS — Build valid Phase 1 and 2 objects
// ─────────────────────────────────────────────
function buildApprovedAnalysis() {
    const sr = new ApiService.SystemRequest('PRJ-PH3');
    sr.approve('Admin');
    const fs = new ApiService.FeasibilityStudy('PRJ-PH3');
    fs.setVerdict(true);
    fs.approve('Admin');
    const pp = new ApiService.ProjectPlanning('PRJ-PH3', sr, fs);
    pp.setProjectManager('Alice PM');
    
    const ap = new ApiService.AnalysisPhase('PRJ-PH3', sr, fs, pp);
    
    ap.requirementsDetermination.setDefinition('Requirements are conditions.', ['Functional']);
    ap.requirementsDetermination.addFunctionalRequirement('REQ-1', 'Must do X', 'High', 'Admin');
    ap.requirementsDetermination.setDefinitionStatement({ projectName: 'Test', preparedBy: 'Alice PM', overview: '', scope: '', constraints: [], assumptions: [] });
    ap.requirementsDetermination.compileRequirementsDocument();
    ap.requirementsDetermination.approveRequirementsDocument('Admin');
    ap.requirementsDetermination.finalize();
    
    ap.useCaseAnalysis.addFullyDressedUseCase({ id: 'UC-01', name: 'Test', briefDescription: '', primaryActor: '', preconditions: [], mainFlow: [], postconditions: [], linkedRequirementIds: [] });
    ap.useCaseAnalysis.finalize();
    
    ap.processModeling.validateDFD(true, true, []);
    ap.processModeling.finalize();
    
    ap.dataModeling.addEntity('E1', 'Test', '', []);
    ap.dataModeling.finalize();
    
    ap.compileSystemProposal('Summary');
    ap.approveSystemProposal('Admin');
    
    return ap;
}

// ─────────────────────────────────────────────
// SUITE 14: Phase2Binder
// ─────────────────────────────────────────────
export function runPhase2BinderTests() {
    const t = new TestRunner('Suite 14 — Phase2Binder (Phase 2 Passport)');

    t.assertThrows(() => new ApiService.Phase2Binder(null), 'missing', '14.1 Binder blocks if Analysis Phase is missing');

    const ap = buildApprovedAnalysis();
    const unapprovedAp = Object.create(Object.getPrototypeOf(ap));
    Object.assign(unapprovedAp, ap);
    unapprovedAp.systemProposal = { ...ap.systemProposal, status: 'DRAFT' };
    
    t.assertThrows(() => new ApiService.Phase2Binder(unapprovedAp), 'APPROVED', '14.2 Binder blocks if Analysis Phase is not approved');
    
    const binder = new ApiService.Phase2Binder(ap);
    t.assertNotNull(binder.binderId, '14.3 Binder issues unique binderId');
    t.assert(binder.binderId.startsWith('PH2-BINDER-'), '14.4 Binder ID follows format');
    t.assertEqual(binder.projectManager, 'Alice PM', '14.5 PM carried forward successfully');
    t.assertNotNull(binder.phase1BinderId, '14.6 Phase 1 chain of custody maintained');
    
    t.assertEqual(binder.analysisPhaseSnapshot.majorUseCasesCount, 1, '14.7 UCA snapshot extracted');
    t.assertEqual(binder.analysisPhaseSnapshot.erdEntitiesCount, 1, '14.8 ERD snapshot extracted');
    t.assert(binder.analysisPhaseSnapshot.dfdValidationStatus, '14.9 DFD validation snapshot extracted');
    
    t.assertThrows(() => { binder.projectManager = 'Hacked'; }, undefined, '14.10 Binder is frozen against mutation');

    return t.getSummary();
}

// ─────────────────────────────────────────────
// SUITE 15: DesignPhase Container & Gate
// ─────────────────────────────────────────────
export function runDesignPhaseTests() {
    const t = new TestRunner('Suite 15 — DesignPhase Container & Gate');

    const ap = buildApprovedAnalysis();
    const dp = new ApiService.DesignPhase(ap);

    t.assertNotNull(dp.phase2Binder, '15.1 Phase2Binder initialized in DesignPhase');
    t.assertNotNull(dp.movingIntoDesign, '15.2 MovingIntoDesign subsection instantiated');
    t.assertEqual(dp.systemSpecification.status, 'NOT_CREATED', '15.3 System Specification starts as NOT_CREATED');

    t.assert(!dp.compileSystemSpecification('Sum').success, '15.4 Compile blocked if sections are not complete');

    dp.movingIntoDesign.finalize();
    dp.architectureDesign.finalize();
    dp.userInterfaceDesign.finalize();
    dp.programDesign.finalize();
    dp.dataStorageDesign.finalize();

    t.assert(dp.allSectionsComplete(), '15.5 allSectionsComplete() returns true when finished');

    const compileResult = dp.compileSystemSpecification('Specs summary');
    t.assert(compileResult.success, '15.6 Compile succeeds when sections are finished');
    t.assertEqual(dp.systemSpecification.status, 'DRAFT', '15.7 Status becomes DRAFT after compile');

    const exitGatePre = dp.canProceedToImplementation();
    t.assert(!exitGatePre.allowed, '15.8 Gate to Implementation blocks if unapproved');

    dp.approveSystemSpecification('Admin');
    t.assertEqual(dp.systemSpecification.status, 'APPROVED', '15.9 Status becomes APPROVED');
    
    const exitGatePost = dp.canProceedToImplementation();
    t.assert(exitGatePost.allowed, '15.10 Gate to Implementation passes after approval');
    t.assertEqual(exitGatePost.binderId, dp.phase2Binder.binderId, '15.11 Exit gate returns Phase 2 binder ID');

    return t.getSummary();
}

// ─────────────────────────────────────────────
// SUITE 16: MovingIntoDesign & ArchitectureDesign
// ─────────────────────────────────────────────
export function runArchitectureDesignTests() {
    const t = new TestRunner('Suite 16 — Design Subsections 1 & 2');
    
    const ap = buildApprovedAnalysis();
    const dp = new ApiService.DesignPhase(ap);
    
    // MovingIntoDesign
    const mid = dp.movingIntoDesign;
    mid.setAcquisitionStrategies('Build from scratch', 'Buy COTS', 'Hire agency');
    mid.addAlternativeMatrixOption('Custom', 85, 'Flexible', 'Expensive');
    mid.addAlternativeMatrixOption('Packaged', 60, 'Cheap', 'Rigid');
    mid.selectAcquisitionStrategy('Custom', 'Flexibility outweighs cost');
    
    t.assertEqual(mid.alternativeMatrix.options.length, 2, '16.1 Alternative matrix options added');
    t.assertEqual(mid.alternativeMatrix.selected, 'Custom', '16.2 Acquisition strategy selected');
    
    // ArchitectureDesign
    const ad = dp.architectureDesign;
    ad.addRequirement('operationalRequirements', 'OP-1', 'Must run on AWS');
    t.assertThrows(() => ad.addRequirement('invalid', 'ID', 'desc'), 'Invalid requirement category', '16.3 Rejects invalid requirement category');
    
    ad.addHardwareSpec('Server', '32GB RAM, 8 Core');
    t.assertEqual(ad.hardwareAndSoftwareSpec.hardware.length, 1, '16.4 Hardware spec added');

    return t.getSummary();
}

// ─────────────────────────────────────────────
// SUITE 17: UI, Program & Data Storage Design
// ─────────────────────────────────────────────
export function runOtherDesignTests() {
    const t = new TestRunner('Suite 17 — Design Subsections 3, 4 & 5');
    
    const ap = buildApprovedAnalysis();
    const dp = new ApiService.DesignPhase(ap);
    
    // UserInterfaceDesign
    const uid = dp.userInterfaceDesign;
    uid.setPrinciples('Grid', 'High', 'Minimalist', 'Expert', 'Strict', 'High', 'Fat-finger spacing');
    t.assertEqual(uid.principles.touchscreenIssues, 'Fat-finger spacing', '17.1 UI Principles saved');
    
    // ProgramDesign
    const pd = dp.programDesign;
    pd.addStructureChart('SC-01', 'Main Loop', ['Init', 'Process', 'Teardown']);
    t.assertEqual(pd.programDesign.structureCharts.length, 1, '17.2 Structure Chart added');
    
    // DataStorageDesign
    const dsd = dp.dataStorageDesign;
    dsd.setStorageFormats('Logs', 'PostgreSQL', 'PostgreSQL', 'Applied RDBMS');
    t.assertEqual(dsd.storageFormats.selectedFormat, 'PostgreSQL', '17.3 Storage format selected');

    return t.getSummary();
}
