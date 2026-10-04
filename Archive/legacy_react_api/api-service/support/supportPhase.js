import Phase4Binder from './phase4Binder.js';
import SystemSupport from './systemSupport.js';
import SystemMaintenance from './systemMaintenance.js';
import ProjectAssessment from './projectAssessment.js';

export default class SupportPhase {
    constructor(implementationPhase) {
        this.phase4Binder = new Phase4Binder(implementationPhase);
        
        // Initialize sub-sections
        this.systemSupport = new SystemSupport();
        this.systemMaintenance = new SystemMaintenance();
        this.projectAssessment = new ProjectAssessment();
        this.isClosed = false;
    }

    closeProject(adminName) {
        if (this.projectAssessment.status !== 'COMPLETED') {
            throw new Error('Cannot close project until Project Assessment is COMPLETED.');
        }
        this.isClosed = true;
        this.closedBy = adminName;
        this.closedAt = new Date().toISOString();
    }

    renderAsHTML() {
        const docStamp = this.isClosed 
            ? `<div style="color:white;background:#2c3e50;padding:15px;margin-bottom:10px;text-align:center;border-radius:5px;">
                🏆 <strong>PROJECT OFFICIALLY CLOSED</strong><br/>Signed off by: ${this.closedBy} on ${new Date(this.closedAt).toLocaleDateString()}
               </div>`
            : `<div style="color:#856404;background:#fff3cd;padding:15px;margin-bottom:10px;border-radius:5px;">
                ⚙️ <strong>PROJECT IN ACTIVE SUPPORT/MAINTENANCE</strong>
               </div>`;

        return `
            <div class="support-phase-document" style="font-family: sans-serif; line-height: 1.6;">
                <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px;">Phase 5: Support & Maintenance Phase</h2>
                
                <div style="background: #e9ecef; padding: 10px; border-left: 4px solid #0056b3; margin-bottom: 20px;">
                    <strong>Phase 4 Binder Verified:</strong> ${this.phase4Binder.binderId} <br/>
                    <em>Carrying legacy custody of Phase 3 Binder: ${this.phase4Binder.phase3BinderId}</em>
                </div>

                ${docStamp}
                
                ${this.systemSupport.renderAsHTML()}
                ${this.systemMaintenance.renderAsHTML()}
                ${this.projectAssessment.renderAsHTML()}
            </div>
        `;
    }
}
