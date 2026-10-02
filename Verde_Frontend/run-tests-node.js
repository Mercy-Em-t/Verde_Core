import { runSystemRequestTests, runFeasibilityStudyTests, runProjectPlanningTests, runDocumentManagerTests } from './tests/phase1.test.js';
import { runPhase1BinderTests, runAnalysisPhaseTests, runRequirementsDeterminationTests, runUseCaseAnalysisTests } from './tests/phase2.test.js';
import { runIntegrationTests } from './tests/integration.test.js';
import { runProcessModelingTests, runDataModelingTests, runAuditLoggerTests, runWorkflowEngineTests } from './tests/extra.test.js';
import { runPhase2BinderTests, runDesignPhaseTests, runArchitectureDesignTests, runOtherDesignTests } from './tests/phase3.test.js';

const SUITES = [
    { name: 'Phase 1 — SystemRequest',          fn: runSystemRequestTests },
    { name: 'Phase 1 — FeasibilityStudy',       fn: runFeasibilityStudyTests },
    { name: 'Phase 1 — ProjectPlanning',        fn: runProjectPlanningTests },
    { name: 'Phase 1 — DocumentManager',        fn: runDocumentManagerTests },
    { name: 'Phase 2 — Phase1Binder',           fn: runPhase1BinderTests },
    { name: 'Phase 2 — AnalysisPhase',          fn: runAnalysisPhaseTests },
    { name: 'Phase 2 — RequirementsDetermination', fn: runRequirementsDeterminationTests },
    { name: 'Phase 2 — UseCaseAnalysis',        fn: runUseCaseAnalysisTests },
    { name: 'Phase 2 — ProcessModeling',        fn: runProcessModelingTests },
    { name: 'Phase 2 — DataModeling',           fn: runDataModelingTests },
    { name: 'Phase 3 — Phase2Binder',           fn: runPhase2BinderTests },
    { name: 'Phase 3 — DesignPhase Container',  fn: runDesignPhaseTests },
    { name: 'Phase 3 — Arch & Moving Design',   fn: runArchitectureDesignTests },
    { name: 'Phase 3 — UI, Prog, Storage',      fn: runOtherDesignTests },
    { name: 'System  — AuditLogger',            fn: runAuditLoggerTests },
    { name: 'System  — WorkflowEngine',         fn: runWorkflowEngineTests },
    { name: 'Integration — Full SDLC Flow',     fn: runIntegrationTests },
];

async function run() {
    let totalPassed = 0;
    let totalFailed = 0;
    
    console.log("=== VERDE SDLC TEST SUITE EXECUTION ===");

    for (const suite of SUITES) {
        console.log(`\nRunning Suite: ${suite.name}...`);
        try {
            const summary = await suite.fn();
            const fails = summary.results.filter(r => r.status === 'FAIL');
            
            console.log(`  Passed: ${summary.passed}/${summary.total}`);
            
            if (fails.length > 0) {
                console.log(`  FAILED TESTS:`);
                fails.forEach(f => console.log(`    ❌ ${f.label}: ${f.detail}`));
            }
            
            totalPassed += summary.passed;
            totalFailed += summary.failed;
        } catch (err) {
            console.error(`  CRITICAL SUITE FAILURE: ${err.message}`);
            console.error(err.stack);
            totalFailed++;
        }
    }
    
    console.log("\n=== EXECUTION SUMMARY ===");
    console.log(`Total Passed: ${totalPassed}`);
    console.log(`Total Failed: ${totalFailed}`);
    
    if (totalFailed > 0) {
        process.exit(1);
    }
}

run();
