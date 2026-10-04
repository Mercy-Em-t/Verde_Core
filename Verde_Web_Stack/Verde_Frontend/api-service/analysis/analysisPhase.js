// api-service/analysis/analysisPhase.js

import Phase1Binder from './phase1Binder.js';
import RequirementsDetermination from './requirementsDetermination.js';
import UseCaseAnalysis from './useCaseAnalysis.js';
import ProcessModeling from './processModeling.js';
import DataModeling from './dataModeling.js';

/**
 * AnalysisPhase Class — Phase 2
 * 
 * BIRTH REQUIREMENT:
 *   Phase 2 cannot be instantiated without passing all three approved
 *   Phase 1 objects: SystemRequest, FeasibilityStudy, ProjectPlanning.
 *   The Phase1Binder validates these, extracts a frozen metadata snapshot,
 *   and issues a unique Binder ID that lives permanently on this object.
 * 
 * STRUCTURE:
 *   phase1Binder        — Sealed proof of Phase 1 origin (birth certificate)
 *   ├── 1. Requirements Determination
 *   ├── 2. Use Case Analysis
 *   ├── 3. Process Modeling
 *   └── 4. Data Modeling
 * 
 * DELIVERABLES:
 *   - Requirements Definition Document (from section 1)
 *   - System Proposal (compiled from all 4 sections, Admin approved)
 * 
 * EXIT GATE:
 *   System Proposal must be APPROVED before Design Phase can begin.
 */
class AnalysisPhase {
    constructor(projectId, systemRequest, feasibilityStudy, projectPlanning) {

        // =============================================
        // BIRTH — Issue the Phase 1 Binder
        // (This throws if any Phase 1 prerequisite is missing or unapproved)
        // =============================================
        this.phase1Binder = new Phase1Binder(systemRequest, feasibilityStudy, projectPlanning);

        // Identity
        this.projectId      = projectId;
        this.projectManager = this.phase1Binder.projectPlanning.projectManager;
        this.createdAt      = new Date().toISOString();

        // =============================================
        // The 4 core Analysis sub-sections
        // =============================================
        this.requirementsDetermination = new RequirementsDetermination();
        this.useCaseAnalysis           = new UseCaseAnalysis();
        this.processModeling           = new ProcessModeling();
        this.dataModeling              = new DataModeling();

        // =============================================
        // DELIVERABLE 1: Requirements Definition Document
        // (tracked inside requirementsDetermination)
        // =============================================

        // =============================================
        // DELIVERABLE 2: System Proposal
        // =============================================
        this.systemProposal = {
            summary:    '',
            createdAt:  null,
            status:     'NOT_CREATED', // NOT_CREATED | DRAFT | APPROVED
            approvedBy: null,
            approvedAt: null
        };
    }

    // =============================================
    // Sub-Phase Progress
    // =============================================
    getSectionStatuses() {
        return {
            requirementsDetermination: this.requirementsDetermination.status,
            useCaseAnalysis:           this.useCaseAnalysis.status,
            processModeling:           this.processModeling.status,
            dataModeling:              this.dataModeling.status
        };
    }

    allSectionsComplete() {
        return Object.values(this.getSectionStatuses()).every(s => s === 'COMPLETED');
    }

    // =============================================
    // DELIVERABLE 2: System Proposal
    // =============================================
    compileSystemProposal(summary) {
        if (!this.allSectionsComplete()) {
            const statuses = this.getSectionStatuses();
            const pending = Object.entries(statuses)
                .filter(([, s]) => s !== 'COMPLETED')
                .map(([k]) => k);
            return {
                success: false,
                reason: `Cannot compile. The following sections are not yet COMPLETED: ${pending.join(', ')}.`
            };
        }
        if (this.requirementsDetermination.requirementsDefinitionDocument.status !== 'APPROVED') {
            return {
                success: false,
                reason: 'Cannot compile System Proposal until the Requirements Definition Document is APPROVED.'
            };
        }
        this.systemProposal.summary   = summary;
        this.systemProposal.createdAt = new Date().toISOString();
        this.systemProposal.status    = 'DRAFT';
        return { success: true, reason: 'System Proposal compiled. Pending Admin approval.' };
    }

    approveSystemProposal(adminName) {
        if (this.systemProposal.status !== 'DRAFT') {
            throw new Error('System Proposal must be DRAFT before it can be approved.');
        }
        this.systemProposal.status    = 'APPROVED';
        this.systemProposal.approvedBy = adminName;
        this.systemProposal.approvedAt = new Date().toISOString();
    }

    isApproved() {
        return this.systemProposal.status === 'APPROVED';
    }

    // =============================================
    // EXIT GATE — Called by WorkflowEngine
    // =============================================
    canProceedToDesign() {
        if (this.systemProposal.status !== 'APPROVED') {
            return {
                allowed: false,
                reason: 'GATE BLOCKED: System Proposal must be APPROVED before proceeding to the Design Phase.'
            };
        }
        return {
            allowed: true,
            reason: 'GATE PASSED: Analysis Phase complete. System Proposal approved. Phase 1 Binder verified. Ready for Design Phase.',
            binderId: this.phase1Binder.binderId
        };
    }

    // =============================================
    // toJSON
    // =============================================
    toJSON() {
        return {
            projectId:      this.projectId,
            projectManager: this.projectManager,
            createdAt:      this.createdAt,

            // Birth certificate always serialized first
            phase1Binder:   this.phase1Binder.toJSON(),

            // 4 sub-sections
            requirementsDetermination: this.requirementsDetermination.toJSON(),
            useCaseAnalysis:           this.useCaseAnalysis.toJSON(),
            processModeling:           this.processModeling.toJSON(),
            dataModeling:              this.dataModeling.toJSON(),

            // Deliverables
            requirementsDefinitionDocument: this.requirementsDetermination.requirementsDefinitionDocument,
            systemProposal: this.systemProposal
        };
    }

    // =============================================
    // renderAsHTML
    // =============================================
    renderAsHTML() {
        const formatStatus = (s) => {
            if (s === 'COMPLETED')   return `<span style="color:green;">✅ Completed</span>`;
            if (s === 'IN_PROGRESS') return `<span style="color:orange;">⏳ In Progress</span>`;
            return `<span style="color:red;">🔒 Pending</span>`;
        };

        const docStatus = (s) => {
            if (s === 'APPROVED') return `<span style="color:green;">✅ Approved</span>`;
            if (s === 'DRAFT')    return `<span style="color:orange;">⏳ Draft — Pending Approval</span>`;
            return `<span style="color:red;">❌ Not Created</span>`;
        };

        const proposalStamp = this.systemProposal.status === 'APPROVED'
            ? `<div style="color:green;border:2px solid green;padding:10px;border-radius:4px;margin-bottom:15px;">
                <strong>SYSTEM PROPOSAL — OFFICIAL DOCUMENT</strong><br/>
                Approved by: ${this.systemProposal.approvedBy}<br/>
                Date: ${new Date(this.systemProposal.approvedAt).toLocaleString()}
               </div>`
            : this.systemProposal.status === 'DRAFT'
            ? `<div style="color:orange;border:2px dashed orange;padding:10px;border-radius:4px;margin-bottom:15px;">
                <strong>SYSTEM PROPOSAL — DRAFT</strong><br/>
                Compiled: ${new Date(this.systemProposal.createdAt).toLocaleString()}<br/>
                Pending Admin approval.
               </div>`
            : `<div style="color:red;border:2px dashed red;padding:10px;border-radius:4px;margin-bottom:15px;">
                <strong>SYSTEM PROPOSAL — NOT YET COMPILED</strong><br/>
                Complete all 4 sections and approve the Requirements Definition Document first.
               </div>`;

        return `
            <div style="font-family:sans-serif;line-height:1.6;">

                <h2 style="margin-bottom:5px;">Analysis Phase — Phase 2</h2>
                <p style="color:#666;margin-top:0;">
                    Project: <strong>${this.projectId}</strong> &nbsp;|&nbsp;
                    Project Manager: <strong>${this.projectManager}</strong> &nbsp;|&nbsp;
                    Phase Started: <strong>${new Date(this.createdAt).toLocaleString()}</strong>
                </p>

                <!-- ① PHASE 1 BINDER (birth certificate) -->
                ${this.phase1Binder.renderAsHTML()}

                <!-- ② PROGRESS TRACKER -->
                <h3>Sub-Phase Progress</h3>
                <table style="border-collapse:collapse;width:100%;max-width:750px;margin-bottom:20px;">
                    <tr style="background:#f4f4f4;">
                        <th style="border:1px solid #ccc;padding:8px;">Section</th>
                        <th style="border:1px solid #ccc;padding:8px;">Status</th>
                    </tr>
                    <tr>
                        <td style="border:1px solid #ccc;padding:8px;">1. Requirements Determination</td>
                        <td style="border:1px solid #ccc;padding:8px;">${formatStatus(this.requirementsDetermination.status)}</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #ccc;padding:8px;">2. Use Case Analysis</td>
                        <td style="border:1px solid #ccc;padding:8px;">${formatStatus(this.useCaseAnalysis.status)}</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #ccc;padding:8px;">3. Process Modeling (DFDs)</td>
                        <td style="border:1px solid #ccc;padding:8px;">${formatStatus(this.processModeling.status)}</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #ccc;padding:8px;">4. Data Modeling (ERD)</td>
                        <td style="border:1px solid #ccc;padding:8px;">${formatStatus(this.dataModeling.status)}</td>
                    </tr>
                </table>

                <!-- ③ DELIVERABLES TRACKER -->
                <h3>Deliverables</h3>
                <table style="border-collapse:collapse;width:100%;max-width:750px;margin-bottom:20px;">
                    <tr style="background:#f4f4f4;">
                        <th style="border:1px solid #ccc;padding:8px;">Deliverable</th>
                        <th style="border:1px solid #ccc;padding:8px;">Status</th>
                    </tr>
                    <tr>
                        <td style="border:1px solid #ccc;padding:8px;">Requirements Definition Document</td>
                        <td style="border:1px solid #ccc;padding:8px;">
                            ${docStatus(this.requirementsDetermination.requirementsDefinitionDocument.status)}
                        </td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #ccc;padding:8px;">System Proposal</td>
                        <td style="border:1px solid #ccc;padding:8px;">
                            ${docStatus(this.systemProposal.status)}
                        </td>
                    </tr>
                </table>

                ${proposalStamp}
                ${this.systemProposal.summary
                    ? `<p><strong>System Proposal Summary:</strong> ${this.systemProposal.summary}</p>`
                    : ''}

                <!-- ④ THE 4 SUB-SECTIONS -->
                ${this.requirementsDetermination.renderAsHTML()}
                ${this.useCaseAnalysis.renderAsHTML()}
                ${this.processModeling.renderAsHTML()}
                ${this.dataModeling.renderAsHTML()}
            </div>`;
    }
}

export default AnalysisPhase;
