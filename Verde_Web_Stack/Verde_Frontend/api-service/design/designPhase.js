import Phase2Binder from './phase2Binder.js';
import MovingIntoDesign from './movingIntoDesign.js';
import ArchitectureDesign from './architectureDesign.js';
import UserInterfaceDesign from './userInterfaceDesign.js';
import ProgramDesign from './programDesign.js';
import DataStorageDesign from './dataStorageDesign.js';

export default class DesignPhase {
    /**
     * @param {Object} analysisPhase - The fully approved Phase 2 Analysis object.
     */
    constructor(analysisPhase) {
        // 1. Strict Gate: The Phase 2 Binder MUST be issued first.
        // It validates the analysisPhase and throws if it's not approved.
        this.phase2Binder = new Phase2Binder(analysisPhase);

        // 2. Identity derived from binder (chain of custody)
        this.projectId = analysisPhase.projectId;
        this.projectManager = this.phase2Binder.projectManager;
        this.createdAt = new Date().toISOString();

        // 3. Instantiate Phase 3 Sub-sections
        this.movingIntoDesign = new MovingIntoDesign();
        this.architectureDesign = new ArchitectureDesign();
        this.userInterfaceDesign = new UserInterfaceDesign();
        this.programDesign = new ProgramDesign();
        this.dataStorageDesign = new DataStorageDesign();

        // 4. Final Deliverable
        this.systemSpecification = {
            status: 'NOT_CREATED',
            compiledAt: null,
            compiledBy: null,
            approvedBy: null,
            approvedAt: null,
            summary: null
        };
    }

    // --- Deliverable Management ---
    allSectionsComplete() {
        return this.movingIntoDesign.status === 'COMPLETED' &&
               this.architectureDesign.status === 'COMPLETED' &&
               this.userInterfaceDesign.status === 'COMPLETED' &&
               this.programDesign.status === 'COMPLETED' &&
               this.dataStorageDesign.status === 'COMPLETED';
    }

    compileSystemSpecification(summaryText) {
        if (!this.allSectionsComplete()) {
            return {
                success: false,
                reason: "All Design sub-sections (Moving Into Design, Architecture, UI, Program, Data Storage) must be COMPLETED before compiling the System Specification."
            };
        }

        this.systemSpecification.status = 'DRAFT';
        this.systemSpecification.summary = summaryText;
        this.systemSpecification.compiledAt = new Date().toISOString();
        this.systemSpecification.compiledBy = this.projectManager;

        return { success: true, document: this.systemSpecification };
    }

    approveSystemSpecification(adminName) {
        if (this.systemSpecification.status !== 'DRAFT') {
            throw new Error('System Specification must be compiled (DRAFT) before it can be approved.');
        }

        this.systemSpecification.status = 'APPROVED';
        this.systemSpecification.approvedBy = adminName;
        this.systemSpecification.approvedAt = new Date().toISOString();
    }

    isApproved() {
        return this.systemSpecification.status === 'APPROVED';
    }

    // --- Exit Gate to Phase 4 (Implementation) ---
    canProceedToImplementation() {
        if (!this.isApproved()) {
            return {
                allowed: false,
                reason: "GATE BLOCKED: System Specification is not APPROVED."
            };
        }
        return {
            allowed: true,
            reason: "GATE PASSED: System Specification is APPROVED. Ready for Implementation Phase.",
            binderId: this.phase2Binder.binderId
        };
    }

    // --- Serialization & Rendering ---
    toJSON() {
        return {
            projectId: this.projectId,
            projectManager: this.projectManager,
            createdAt: this.createdAt,
            // Phase 2 passport is serialized first for chain-of-custody verification
            phase2Binder: this.phase2Binder.toJSON(),
            movingIntoDesign: this.movingIntoDesign.toJSON(),
            architectureDesign: this.architectureDesign.toJSON(),
            userInterfaceDesign: this.userInterfaceDesign.toJSON(),
            programDesign: this.programDesign.toJSON(),
            dataStorageDesign: this.dataStorageDesign.toJSON(),
            systemSpecification: this.systemSpecification
        };
    }

    renderAsHTML() {
        const docStatus = (status) => {
            if (status === 'APPROVED') return '<span style="color:green;font-weight:bold;">OFFICIAL</span>';
            if (status === 'DRAFT') return '<span style="color:orange;font-weight:bold;">DRAFT</span>';
            return '<span style="color:gray;">NOT CREATED</span>';
        };

        return `
            <div style="font-family: sans-serif; max-width: 900px; margin: 0 auto; line-height: 1.6;">
                <h1 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
                    Phase 3: Design Phase
                </h1>
                
                <!-- Origin Binder -->
                ${this.phase2Binder.renderAsHTML()}

                <!-- Sub-sections -->
                <div style="margin-top: 30px;">
                    ${this.movingIntoDesign.renderAsHTML()}
                    ${this.architectureDesign.renderAsHTML()}
                    ${this.userInterfaceDesign.renderAsHTML()}
                    ${this.programDesign.renderAsHTML()}
                    ${this.dataStorageDesign.renderAsHTML()}
                </div>

                <!-- Final Deliverable -->
                <div style="margin-top: 30px; padding: 20px; background: #e8f4f8; border-radius: 8px; border: 1px solid #bce8f1;">
                    <h3 style="color: #31708f; margin-top: 0;">System Specification Document</h3>
                    <p><strong>Status:</strong> ${docStatus(this.systemSpecification.status)}</p>
                    ${this.systemSpecification.summary ? `<p><strong>Summary:</strong> ${this.systemSpecification.summary}</p>` : ''}
                    ${this.systemSpecification.approvedBy ? `<p><strong>Approved By:</strong> ${this.systemSpecification.approvedBy} on ${new Date(this.systemSpecification.approvedAt).toLocaleDateString()}</p>` : ''}
                </div>
            </div>
        `;
    }
}
