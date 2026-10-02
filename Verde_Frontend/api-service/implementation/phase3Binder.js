export default class Phase3Binder {
    constructor(designPhase) {
        if (!designPhase) {
            throw new Error('Phase3Binder requires a completed Design Phase object.');
        }
        if (designPhase.systemSpecification.status !== 'APPROVED') {
            throw new Error('Cannot issue Phase 3 Binder: System Specification is not APPROVED.');
        }

        this.binderId = 'PH3-BINDER-' + designPhase.projectId + '-' + Date.now();
        this.projectId = designPhase.projectId;
        this.projectManager = designPhase.phase2Binder.projectManager;
        this.phase2BinderId = designPhase.phase2Binder.binderId;
        this.issuedAt = new Date().toISOString();

        // Freeze key metrics from Design Phase
        this.designSnapshot = Object.freeze({
            acquisitionStrategy: designPhase.movingIntoDesign.alternativeMatrix.selected,
            structureChartsCount: designPhase.programDesign.programDesign.structureCharts.length,
            hardwareSpecsCount: designPhase.architectureDesign.hardwareAndSoftwareSpec.hardware.length,
            uiPrinciplesCount: Object.keys(designPhase.userInterfaceDesign.principles).length
        });

        Object.freeze(this);
    }

    toJSON() {
        return {
            binderId: this.binderId,
            projectId: this.projectId,
            projectManager: this.projectManager,
            phase2BinderId: this.phase2BinderId,
            issuedAt: this.issuedAt,
            designSnapshot: this.designSnapshot
        };
    }
}
