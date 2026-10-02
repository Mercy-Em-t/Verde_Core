import Phase3Binder from './phase3Binder.js';
import SystemConstruction from './systemConstruction.js';
import TestingStrategy from './testingStrategy.js';
import DocumentationStrategy from './documentationStrategy.js';
import TransitionAndDeployment from './transitionAndDeployment.js';

export default class ImplementationPhase {
    constructor(designPhase) {
        this.phase3Binder = new Phase3Binder(designPhase);
        
        // Initialize sub-sections
        this.systemConstruction = new SystemConstruction();
        this.testingStrategy = new TestingStrategy();
        this.documentationStrategy = new DocumentationStrategy();
        this.transitionAndDeployment = new TransitionAndDeployment();

        this.finalSystem = {
            status: 'NOT_CREATED',
            compiledAt: null,
            approvedBy: null,
            approvedAt: null,
            summary: ''
        };
    }

    allSectionsComplete() {
        return this.systemConstruction.status === 'COMPLETED' &&
               this.testingStrategy.status === 'COMPLETED' &&
               this.documentationStrategy.status === 'COMPLETED' &&
               this.transitionAndDeployment.status === 'COMPLETED';
    }

    compileFinalSystem(summary) {
        if (!this.allSectionsComplete()) {
            return { success: false, reason: 'Cannot compile Final System. All implementation sections must be COMPLETED.' };
        }
        this.finalSystem.status = 'DRAFT';
        this.finalSystem.compiledAt = new Date().toISOString();
        this.finalSystem.summary = summary;
        return { success: true };
    }

    approveFinalSystem(adminName) {
        if (this.finalSystem.status !== 'DRAFT') {
            throw new Error('Final System must be compiled into a DRAFT before it can be approved.');
        }
        this.finalSystem.status = 'APPROVED';
        this.finalSystem.approvedBy = adminName;
        this.finalSystem.approvedAt = new Date().toISOString();
    }

    canProceedToSupport() {
        if (this.finalSystem.status === 'APPROVED') {
            return { allowed: true, reason: 'GATE PASSED: Final System is APPROVED. Ready for Support/Maintenance Phase.', binderId: this.phase3Binder.binderId };
        }
        return { allowed: false, reason: 'GATE BLOCKED: Final System is not APPROVED.' };
    }

    renderAsHTML() {
        const docStamp = this.finalSystem.status === 'APPROVED' 
            ? `<div style="color:green;border:2px solid green;padding:8px;margin-bottom:10px;">✔ <strong>Final System & Deployment - OFFICIAL</strong><br/>Deployed by: ${this.finalSystem.approvedBy}</div>`
            : `<div style="color:red;border:2px dashed red;padding:8px;margin-bottom:10px;">❌ <strong>Final System - Not Yet Deployed</strong></div>`;

        return `
            <div class="implementation-phase-document" style="font-family: sans-serif; line-height: 1.6;">
                <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px;">Phase 4: Implementation Phase</h2>
                
                <div style="background: #e9ecef; padding: 10px; border-left: 4px solid #0056b3; margin-bottom: 20px;">
                    <strong>Phase 3 Binder Verified:</strong> ${this.phase3Binder.binderId} <br/>
                    <em>Carrying legacy custody of Phase 2 Binder: ${this.phase3Binder.phase2BinderId}</em>
                </div>

                ${docStamp}
                
                ${this.systemConstruction.renderAsHTML()}
                ${this.testingStrategy.renderAsHTML()}
                ${this.documentationStrategy.renderAsHTML()}
                ${this.transitionAndDeployment.renderAsHTML()}
            </div>
        `;
    }
}
