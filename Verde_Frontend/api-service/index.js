// api-service/index.js

import SDLC_PHASES from './phases.js';
import WorkflowEngine from './workflow.js';
import SystemRequest from './systemRequest.js';
import FeasibilityStudy from './feasibilityStudy.js';
import ProjectPlanning from './projectPlanning.js';
import AuditLogger from './auditLogger.js';
import DocumentManager from './documentManager.js';
import AnalysisPhase from './analysis/analysisPhase.js';
import Phase1Binder from './analysis/phase1Binder.js';
import DesignPhase from './design/designPhase.js';
import Phase2Binder from './design/phase2Binder.js';
import ImplementationPhase from './implementation/implementationPhase.js';
import Phase3Binder from './implementation/phase3Binder.js';

/**
 * Verde SDLC API Service
 * Central module for interacting with the system development phases and workflows.
 */
const ApiService = {
    phases: SDLC_PHASES,
    
    // Classes for document objects
    SystemRequest: SystemRequest,
    FeasibilityStudy: FeasibilityStudy,
    ProjectPlanning: ProjectPlanning,
    AuditLogger: AuditLogger,
    DocumentManager: DocumentManager,
    AnalysisPhase: AnalysisPhase,
    Phase1Binder: Phase1Binder,
    DesignPhase: DesignPhase,
    Phase2Binder: Phase2Binder,
    ImplementationPhase: ImplementationPhase,
    Phase3Binder: Phase3Binder,

    // Factory method to create a workflow engine for a specific project
    createWorkflow: (projectId, initialState = null) => {
        return new WorkflowEngine(projectId, initialState);
    }
};

export default ApiService;

// Make it available globally so other non-module scripts (like older UI parts) can use it
if (typeof window !== 'undefined') {
    window.VerdeApiService = ApiService;
}
