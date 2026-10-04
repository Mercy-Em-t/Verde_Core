import MethodologySelector from './methodologySelector.js';
import WorkPlan from './workPlan.js';
import StaffingPlan from './staffingPlan.js';
import ManageAndControl from './manageAndControl.js';

/**
 * ProjectPlanning Class
 * Represents the second part of the Planning phase: Project Planning and Management.
 * Driven by the Project Manager, this object requires a valid System Request and Feasibility Study to initialize.
 */
class ProjectPlanning {
    constructor(projectId, systemRequest, feasibilityStudy) {
        // 1. Strict Prerequisite Gate
        if (!systemRequest || !systemRequest.isApproved() || !feasibilityStudy || !feasibilityStudy.isApproved()) {
            throw new Error("GATE BLOCKED: Cannot start Project Planning. An approved System Request and Feasibility Study must be present.");
        }
        if (feasibilityStudy.finalVerdict !== 'PROCEED') {
            throw new Error(`GATE BLOCKED: Feasibility Study verdict is "${feasibilityStudy.finalVerdict}". Only a PROCEED verdict allows Project Planning to begin.`);
        }
        
        this.projectId = projectId;
        this.projectManager = null;
        
        // --- The 4 Core Sub-Sections ---

        // 1. Select Project Methodology
        this.methodologySelection = new MethodologySelector();

        // 2. Create Project Work Plan
        this.workPlan = new WorkPlan();

        // 3. Identify Project and Staffing Requirements
        this.staffing = new StaffingPlan();

        // 4. Prepare to Manage and Control the Project
        this.manageAndControl = new ManageAndControl();

        // --- Deliverables ---
        this.deliverables = {
            projectCharter: null,
            workPlan: null,       
            staffingPlan: null,   
            standardsList: null,  
            riskAssessment: null  
        };
    }

    setProjectManager(managerName) {
        this.projectManager = managerName;
    }

    compileDeliverables() {
        if (this.methodologySelection.status === 'COMPLETED') {
            this.deliverables.projectCharter = 'COMPLETED';
        }
        if (this.workPlan.wbs.length > 0) {
            this.deliverables.workPlan = 'COMPLETED';
        }
        if (this.staffing.staffingNeeds.length > 0) {
            this.deliverables.staffingPlan = 'COMPLETED';
        }
        if (this.manageAndControl.standardsList.length > 0) {
            this.deliverables.standardsList = 'COMPLETED';
        }
        if (this.manageAndControl.risks.length > 0) {
            this.deliverables.riskAssessment = 'COMPLETED';
        }
        return this.deliverables;
    }

    // --- Renderer ---
    renderAsHTML() {
        const formatStatus = (status) => {
            if (status === 'COMPLETED') return `<span style="color: green;">✅ Completed</span>`;
            if (status === 'IN_PROGRESS') return `<span style="color: orange;">⏳ In Progress</span>`;
            return `<span style="color: red;">🔒 Pending</span>`;
        };

        const deliverableStatus = (doc) => doc ? `<span style="color: green;">✅ Created</span>` : `<span style="color: red;">❌ Missing</span>`;

        return `
            <div class="project-planning-document" style="font-family: sans-serif; line-height: 1.6;">
                <h2>Project Planning & Management</h2>
                <p><strong>Project Manager:</strong> ${this.projectManager || '<em>Unassigned</em>'}</p>
                <div style="background: #e9ecef; padding: 10px; border-left: 4px solid #0056b3; margin-bottom: 20px;">
                    <em>Prerequisites Verified: Project Selected, System Request Approved, Feasibility Study Approved.</em>
                </div>

                <div class="document-section">
                    <h3>Sub-Phases Tracking</h3>
                    <table style="border-collapse: collapse; width: 100%; max-width: 800px;">
                        <tr style="background: #f4f4f4;">
                            <th style="border: 1px solid #ccc; padding: 8px;">Phase</th>
                            <th style="border: 1px solid #ccc; padding: 8px;">Description</th>
                            <th style="border: 1px solid #ccc; padding: 8px;">Status</th>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ccc; padding: 8px;">1. Select Methodology</td>
                            <td style="border: 1px solid #ccc; padding: 8px;">Evaluating project characteristics to select SDLC approach.</td>
                            <td style="border: 1px solid #ccc; padding: 8px;">${formatStatus(this.methodologySelection.status)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ccc; padding: 8px;">2. Create Work Plan</td>
                            <td style="border: 1px solid #ccc; padding: 8px;">Estimating size/duration and building the WBS.</td>
                            <td style="border: 1px solid #ccc; padding: 8px;">${formatStatus(this.workPlan.status)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ccc; padding: 8px;">3. Staffing Requirements</td>
                            <td style="border: 1px solid #ccc; padding: 8px;">Identifying needs and assigning tasks.</td>
                            <td style="border: 1px solid #ccc; padding: 8px;">${formatStatus(this.staffing.status)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ccc; padding: 8px;">4. Manage & Control</td>
                            <td style="border: 1px solid #ccc; padding: 8px;">Setting project standards and risk management procedures.</td>
                            <td style="border: 1px solid #ccc; padding: 8px;">${formatStatus(this.manageAndControl.status)}</td>
                        </tr>
                    </table>
                </div>

                <div class="document-section" id="methodology-section">
                    <h3>1. Methodology Selection</h3>
                    ${this.methodologySelection.renderAsHTML()}
                </div>

                <div class="document-section" id="work-plan-section">
                    ${this.workPlan.renderAsHTML()}
                </div>

                <div class="document-section" id="staffing-plan-section">
                    ${this.staffing.renderAsHTML()}
                </div>

                <div class="document-section" id="manage-control-section">
                    ${this.manageAndControl.renderAsHTML()}
                </div>

                <div class="document-section" style="margin-top: 20px; background: #e8f4f8; padding: 15px; border-radius: 5px;">
                    <h3>Deliverables Checklist & Document Links</h3>
                    <ul style="list-style-type: none; padding-left: 0;">
                        <li style="margin-bottom: 8px;">
                            <strong>Project Charter:</strong> ${deliverableStatus(this.deliverables.projectCharter)}
                            ${this.deliverables.projectCharter ? `<a href="#methodology-section" style="margin-left: 10px; color: #3498db; text-decoration: none;">📄 View Charter (Methodology & Scope)</a>` : ''}
                        </li>
                        <li style="margin-bottom: 8px;">
                            <strong>Work Plan:</strong> ${deliverableStatus(this.deliverables.workPlan)}
                            ${this.deliverables.workPlan ? `<a href="#work-plan-section" style="margin-left: 10px; color: #3498db; text-decoration: none;">📄 View Work Plan (WBS & Tasks)</a>` : ''}
                        </li>
                        <li style="margin-bottom: 8px;">
                            <strong>Staffing Plan:</strong> ${deliverableStatus(this.deliverables.staffingPlan)}
                            ${this.deliverables.staffingPlan ? `<a href="#staffing-plan-section" style="margin-left: 10px; color: #3498db; text-decoration: none;">📄 View Staffing Plan</a>` : ''}
                        </li>
                        <li style="margin-bottom: 8px;">
                            <strong>Standards List:</strong> ${deliverableStatus(this.deliverables.standardsList)}
                            ${this.deliverables.standardsList ? `<a href="#manage-control-section" style="margin-left: 10px; color: #3498db; text-decoration: none;">📄 View Standards</a>` : ''}
                        </li>
                        <li style="margin-bottom: 8px;">
                            <strong>Risk Assessment:</strong> ${deliverableStatus(this.deliverables.riskAssessment)}
                            ${this.deliverables.riskAssessment ? `<a href="#manage-control-section" style="margin-left: 10px; color: #3498db; text-decoration: none;">📄 View Risk Matrix</a>` : ''}
                        </li>
                    </ul>
                </div>
            </div>
        `;
    }

    toJSON() {
        return {
            projectId: this.projectId,
            projectManager: this.projectManager,
            methodologySelection: this.methodologySelection.toJSON(),
            workPlan: this.workPlan.toJSON(),
            staffing: this.staffing.toJSON(),
            manageAndControl: this.manageAndControl.toJSON(),
            deliverables: this.deliverables
        };
    }
}

export default ProjectPlanning;
