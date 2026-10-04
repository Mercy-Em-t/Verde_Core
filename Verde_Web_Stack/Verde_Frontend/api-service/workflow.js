// api-service/workflow.js

import SDLC_PHASES from './phases.js';

class WorkflowEngine {
    constructor(projectId, initialState = null) {
        this.projectId = projectId;
        this.state = initialState || {
            currentPhaseId: 'phase_project_identification',
            currentTrackId: null, // e.g., 'bpm'
            completedSteps: []
        };
    }

    getAvailablePhases() {
        return Object.values(SDLC_PHASES);
    }

    getCurrentPhaseDetails() {
        // Look up by ID
        return Object.values(SDLC_PHASES).find(p => p.id === this.state.currentPhaseId);
    }

    // Helper to validate if we can move to Feasibility Study
    canStartFeasibilityStudy(systemRequestObject) {
        if (!systemRequestObject) {
            return { allowed: false, reason: "System Request document is missing." };
        }
        if (!systemRequestObject.isApproved()) {
            return { allowed: false, reason: "System Request must be approved by an Admin to become an official document before starting Feasibility Analysis." };
        }
        return { allowed: true, reason: "System Request approved. Ready for Feasibility Analysis." };
    }

    // --- GATE POINT: Transition from Initiation to Planning ---
    // This validates that both the System Request and Feasibility Study are officially signed/approved
    // before we can move into the detailed Planning phase.
    canProceedToDetailedPlanning(systemRequestObject, feasibilityStudyObject) {
        if (!systemRequestObject || !systemRequestObject.isApproved()) {
            return { allowed: false, reason: "GATE BLOCKED: A signed and approved System Request is required." };
        }
        if (!feasibilityStudyObject || !feasibilityStudyObject.isApproved()) {
            return { allowed: false, reason: "GATE BLOCKED: A signed and approved Feasibility Study is required." };
        }
        if (feasibilityStudyObject.finalVerdict !== 'PROCEED') {
            return { allowed: false, reason: "GATE BLOCKED: The Feasibility Study must have a 'PROCEED' verdict." };
        }

        return { allowed: true, reason: "GATE PASSED: Both documents are validated and approved. Ready for detailed planning." };
    }

    // --- GATE POINT: Transition from Analysis to Design ---
    canProceedToDesign(analysisPhaseObject) {
        if (!analysisPhaseObject) {
            return { allowed: false, reason: 'GATE BLOCKED: No Analysis Phase object found.' };
        }
        return analysisPhaseObject.canProceedToDesign();
    }

    // --- GATE POINT: Transition from Design to Implementation ---
    canProceedToImplementation(designPhaseObject) {
        if (!designPhaseObject) {
            return { allowed: false, reason: 'GATE BLOCKED: No Design Phase object found.' };
        }
        return designPhaseObject.canProceedToImplementation();
    }

    // --- GATE POINT: Transition from Implementation to Support/Maintenance ---
    canProceedToSupport(implementationPhaseObject) {
        if (!implementationPhaseObject) {
            return { allowed: false, reason: 'GATE BLOCKED: No Implementation Phase object found.' };
        }
        return implementationPhaseObject.canProceedToSupport();
    }

    // --- GATE POINT: Final Project Closure ---
    isProjectClosed(supportPhaseObject) {
        if (!supportPhaseObject) {
            return { allowed: false, reason: 'GATE BLOCKED: No Support Phase object found.' };
        }
        if (supportPhaseObject.isClosed) {
            return { allowed: true, reason: 'GATE PASSED: Project successfully closed.' };
        }
        return { allowed: false, reason: 'GATE BLOCKED: Project Assessment is not signed off by Admin.' };
    }

    markStepComplete(stepId) {
        if (!this.state.completedSteps.includes(stepId)) {
            this.state.completedSteps.push(stepId);
        }
    }

    isStepCompleted(stepId) {
        return this.state.completedSteps.includes(stepId);
    }

    // Helper to evaluate if BPM is complete based on its 4 steps
    isBPMCompleted() {
        const bpmSteps = SDLC_PHASES.PROJECT_IDENTIFICATION.subTracks.BPM.steps.map(s => s.stepId);
        return bpmSteps.every(stepId => this.isStepCompleted(stepId));
    }
}

export default WorkflowEngine;
