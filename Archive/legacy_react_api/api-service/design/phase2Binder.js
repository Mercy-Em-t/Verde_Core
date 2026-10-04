export default class Phase2Binder {
    /**
     * @param {Object} analysisPhase - The completely approved Phase 2 object.
     */
    constructor(analysisPhase) {
        if (!analysisPhase) {
            throw new Error("PHASE 3 BIRTH BLOCKED: Analysis Phase object is missing.");
        }
        if (!analysisPhase.isApproved()) {
            throw new Error("PHASE 3 BIRTH BLOCKED: The Analysis Phase (System Proposal) must be APPROVED by an administrator before Phase 3 can begin.");
        }
        if (!analysisPhase.phase1Binder) {
            throw new Error("PHASE 3 BIRTH BLOCKED: The Analysis Phase is missing its Phase 1 Binder. Chain of custody broken.");
        }

        const ts = new Date();
        this.binderId = `PH2-BINDER-${analysisPhase.projectId}-${ts.getTime()}`;
        this.issuedAt = ts.toISOString();
        this.issuedForPhase = 'DESIGN';

        // Chain of custody: Link back to Phase 1
        this.phase1BinderId = analysisPhase.phase1Binder.binderId;
        this.projectManager = analysisPhase.projectManager;

        // Extract frozen snapshot of key Phase 2 deliverables
        this.analysisPhaseSnapshot = {
            requirementsDefinitionDocumentStatus: analysisPhase.requirementsDetermination.requirementsDefinitionDocument.status,
            systemProposalStatus: analysisPhase.systemProposal.status,
            systemProposalApprovedBy: analysisPhase.systemProposal.approvedBy,
            majorUseCasesCount: analysisPhase.useCaseAnalysis.fullyDressedUseCases.length,
            dfdValidationStatus: analysisPhase.processModeling.validation.isValidated,
            erdEntitiesCount: analysisPhase.dataModeling.entities.length
        };

        // Deep freeze to ensure immutability
        Object.freeze(this.analysisPhaseSnapshot);
        Object.freeze(this);
    }

    toJSON() {
        return {
            binderId: this.binderId,
            issuedAt: this.issuedAt,
            issuedForPhase: this.issuedForPhase,
            phase1BinderId: this.phase1BinderId,
            projectManager: this.projectManager,
            analysisPhaseSnapshot: this.analysisPhaseSnapshot
        };
    }

    renderAsHTML() {
        return `
            <div style="border: 2px solid #2e8b57; border-radius: 8px; padding: 15px; margin-bottom: 20px; background-color: #f4fff8; font-family: sans-serif;">
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #2e8b57; padding-bottom: 10px; margin-bottom: 15px;">
                    <h3 style="margin: 0; color: #1e5a39;">📜 Phase 2 Origin Binder</h3>
                    <span style="background: #2e8b57; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold;">SEALED</span>
                </div>
                
                <table style="width: 100%; font-size: 0.9em; border-collapse: collapse;">
                    <tr><td style="padding: 4px 0;"><strong>Binder ID:</strong></td><td><code>${this.binderId}</code></td></tr>
                    <tr><td style="padding: 4px 0;"><strong>Inherited Phase 1 ID:</strong></td><td><code>${this.phase1BinderId}</code></td></tr>
                    <tr><td style="padding: 4px 0;"><strong>Issued For:</strong></td><td>${this.issuedForPhase} Phase</td></tr>
                    <tr><td style="padding: 4px 0;"><strong>Issued At:</strong></td><td>${new Date(this.issuedAt).toLocaleString()}</td></tr>
                    <tr><td style="padding: 4px 0;"><strong>Project Manager:</strong></td><td>${this.projectManager}</td></tr>
                </table>

                <div style="margin-top: 15px;">
                    <h5 style="margin: 0 0 6px; color: #1e5a39;">Analysis Phase Snapshot</h5>
                    <ul style="margin: 0; padding-left: 20px; font-size: 0.85em; color: #444;">
                        <li>System Proposal: <strong>${this.analysisPhaseSnapshot.systemProposalStatus}</strong> (by ${this.analysisPhaseSnapshot.systemProposalApprovedBy})</li>
                        <li>Requirements Definition Document: <strong>${this.analysisPhaseSnapshot.requirementsDefinitionDocumentStatus}</strong></li>
                        <li>Major Use Cases: <strong>${this.analysisPhaseSnapshot.majorUseCasesCount}</strong> mapped</li>
                        <li>DFD Validated: <strong>${this.analysisPhaseSnapshot.dfdValidationStatus ? 'Yes' : 'No'}</strong></li>
                        <li>ERD Entities: <strong>${this.analysisPhaseSnapshot.erdEntitiesCount}</strong> defined</li>
                    </ul>
                </div>
            </div>
        `;
    }
}
