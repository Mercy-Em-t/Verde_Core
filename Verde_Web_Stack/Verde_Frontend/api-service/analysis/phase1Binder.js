// api-service/analysis/phase1Binder.js

/**
 * Phase1Binder Class
 * 
 * This is the "birth certificate" of the Analysis Phase.
 * 
 * When Phase 2 (Analysis) is instantiated, it must pass all three Phase 1
 * objects (SystemRequest, FeasibilityStudy, ProjectPlanning) through this binder.
 * 
 * The binder:
 *   1. Validates that all Phase 1 prerequisites are met (gate check).
 *   2. Extracts and seals a snapshot of all critical Phase 1 metadata.
 *   3. Stamps a unique Phase2 birth ID and timestamp.
 *   4. Becomes immutable — it is stored as a frozen record on the AnalysisPhase.
 * 
 * This means Phase 2 always carries proof of its Phase 1 lineage.
 * It cannot be created, and cannot pretend to exist, without it.
 */
class Phase1Binder {
    constructor(systemRequest, feasibilityStudy, projectPlanning) {

        // =============================================
        // GATE CHECK — All three Phase 1 objects must be valid
        // =============================================
        const errors = [];

        if (!systemRequest)
            errors.push('System Request is missing.');
        else if (!systemRequest.isApproved())
            errors.push('System Request must be APPROVED (Admin stamped) before Analysis can begin.');

        if (!feasibilityStudy)
            errors.push('Feasibility Study is missing.');
        else if (!feasibilityStudy.isApproved())
            errors.push('Feasibility Study must be APPROVED before Analysis can begin.');
        else if (feasibilityStudy.finalVerdict !== 'PROCEED')
            errors.push(`Feasibility Study verdict is "${feasibilityStudy.finalVerdict}". Only a PROCEED verdict allows Analysis to begin.`);

        if (!projectPlanning)
            errors.push('Project Planning is missing.');
        else if (!projectPlanning.projectManager)
            errors.push('Project Planning must have an assigned Project Manager before Analysis can begin.');

        if (errors.length > 0) {
            throw new Error(
                `PHASE 2 BIRTH BLOCKED — Phase 1 prerequisites not met:\n  • ${errors.join('\n  • ')}`
            );
        }

        // =============================================
        // BIRTH CERTIFICATE — Sealed metadata snapshot
        // =============================================
        this.binderId = `PH1-BINDER-${systemRequest.projectId}-${Date.now()}`;
        this.issuedAt = new Date().toISOString();
        this.issuedForPhase = 'ANALYSIS';

        // --- From System Request ---
        this.systemRequest = {
            projectId:            systemRequest.projectId,
            projectSponsor:       systemRequest.projectSponsor,
            businessNeed:         systemRequest.businessNeed,
            businessRequirements: [...systemRequest.businessRequirements],
            businessValue:        systemRequest.businessValue,
            specialIssues:        systemRequest.specialIssues,
            approvedBy:           systemRequest.approvedBy,
            approvedAt:           systemRequest.approvedAt
        };

        // --- From Feasibility Study ---
        this.feasibilityStudy = {
            projectId:      feasibilityStudy.projectId,
            finalVerdict:   feasibilityStudy.finalVerdict,
            approvedBy:     feasibilityStudy.approvedBy,
            approvedAt:     feasibilityStudy.approvedAt,
            // Key economic metrics carried forward
            metrics: {
                npv:                  feasibilityStudy.economic?.metrics?.npv     ?? null,
                roi:                  feasibilityStudy.economic?.metrics?.roi     ?? null,
                breakEvenPointYears:  feasibilityStudy.economic?.metrics?.breakEvenPointYears ?? null
            },
            // Stakeholders carried forward for requirements context
            stakeholders: feasibilityStudy.organizational?.stakeholderAnalysis
                ? [...feasibilityStudy.organizational.stakeholderAnalysis]
                : [],
            // Technical feasibility snapshot
            technical: {
                familiarityWithApplication:  feasibilityStudy.technical?.familiarityWithApplication  ?? '',
                familiarityWithTechnology:   feasibilityStudy.technical?.familiarityWithTechnology   ?? '',
                projectSize:                 feasibilityStudy.technical?.projectSize                 ?? '',
                compatibility:               feasibilityStudy.technical?.compatibility               ?? ''
            }
        };

        // --- From Project Planning ---
        this.projectPlanning = {
            projectId:      projectPlanning.projectId,
            projectManager: projectPlanning.projectManager,
            // Methodology seeded into analysis context
            methodology: {
                selectedCategory:      projectPlanning.methodologySelection?.selectedCategory       ?? null,
                selectedSpecificMethod: projectPlanning.methodologySelection?.selectedSpecificMethod ?? null,
                justification:         projectPlanning.methodologySelection?.justification          ?? ''
            },
            // Team already assigned — used to seed staffing context for analysis
            assignedStaff: projectPlanning.staffing?.assignedStaff
                ? [...projectPlanning.staffing.assignedStaff]
                : [],
            // Risk context carried forward
            risks: projectPlanning.manageAndControl?.risks
                ? [...projectPlanning.manageAndControl.risks]
                : [],
            // Standards carried forward
            standardsList: projectPlanning.manageAndControl?.standardsList
                ? [...projectPlanning.manageAndControl.standardsList]
                : []
        };

        // Freeze the binder — it is immutable once issued
        Object.freeze(this.systemRequest);
        Object.freeze(this.feasibilityStudy.metrics);
        Object.freeze(this.feasibilityStudy.technical);
        Object.freeze(this.feasibilityStudy);
        Object.freeze(this.projectPlanning.methodology);
        Object.freeze(this.projectPlanning);
        Object.freeze(this);
    }

    // =============================================
    // Render: Phase 1 Binder Panel
    // =============================================
    renderAsHTML() {
        const sr = this.systemRequest;
        const fs = this.feasibilityStudy;
        const pp = this.projectPlanning;

        const stakeholderRows = fs.stakeholders.map(s => `
            <tr>
                <td style="border:1px solid #b8860b;padding:4px;">${s.name}</td>
                <td style="border:1px solid #b8860b;padding:4px;">${s.role}</td>
                <td style="border:1px solid #b8860b;padding:4px;">${s.supportLevel}</td>
                <td style="border:1px solid #b8860b;padding:4px;">${s.influence}</td>
            </tr>`).join('');

        const staffRows = pp.assignedStaff.map(s => `
            <tr>
                <td style="border:1px solid #b8860b;padding:4px;">${s.name}</td>
                <td style="border:1px solid #b8860b;padding:4px;">${s.role}</td>
            </tr>`).join('');

        const riskRows = pp.risks.map(r => `
            <tr>
                <td style="border:1px solid #b8860b;padding:4px;">${r.id}</td>
                <td style="border:1px solid #b8860b;padding:4px;">${r.description}</td>
                <td style="border:1px solid #b8860b;padding:4px;">${r.severity}</td>
            </tr>`).join('');

        return `
            <div style="
                background: linear-gradient(135deg, #fefae0, #fff8dc);
                border: 2px solid #b8860b;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 25px;
                font-family: sans-serif;
                box-shadow: 0 2px 8px rgba(184,134,11,0.2);
            ">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                    <div>
                        <h3 style="margin:0;color:#7a5c00;">📋 Phase 1 Origin Binder</h3>
                        <p style="margin:4px 0;color:#7a5c00;font-size:0.9em;">
                            This Analysis Phase was born from a completed and approved Planning Phase.
                        </p>
                    </div>
                    <div style="text-align:right;font-size:0.8em;color:#7a5c00;">
                        <div><strong>Binder ID:</strong> ${this.binderId}</div>
                        <div><strong>Issued:</strong> ${new Date(this.issuedAt).toLocaleString()}</div>
                        <div><strong>Issued For:</strong> Phase — ${this.issuedForPhase}</div>
                    </div>
                </div>

                <hr style="border:1px solid #b8860b;margin:12px 0;" />

                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:15px;">

                    <!-- System Request Column -->
                    <div>
                        <h5 style="margin:0 0 8px;color:#7a5c00;border-bottom:1px solid #b8860b;padding-bottom:4px;">
                            ① System Request
                        </h5>
                        <div style="font-size:0.85em;">
                            <div><strong>Project ID:</strong> ${sr.projectId}</div>
                            <div><strong>Sponsor:</strong> ${sr.projectSponsor}</div>
                            <div><strong>Business Need:</strong> ${sr.businessNeed || '—'}</div>
                            <div><strong>Business Value:</strong> ${sr.businessValue || '—'}</div>
                            <div style="margin-top:5px;color:green;"><strong>✅ Approved by:</strong> ${sr.approvedBy}</div>
                            <div style="color:green;"><strong>At:</strong> ${new Date(sr.approvedAt).toLocaleString()}</div>
                        </div>
                    </div>

                    <!-- Feasibility Study Column -->
                    <div>
                        <h5 style="margin:0 0 8px;color:#7a5c00;border-bottom:1px solid #b8860b;padding-bottom:4px;">
                            ② Feasibility Study
                        </h5>
                        <div style="font-size:0.85em;">
                            <div><strong>Verdict:</strong> <span style="color:green;font-weight:bold;">${fs.finalVerdict}</span></div>
                            <div><strong>NPV:</strong> ${fs.metrics.npv !== null ? '$' + fs.metrics.npv.toLocaleString() : '—'}</div>
                            <div><strong>ROI:</strong> ${fs.metrics.roi !== null ? fs.metrics.roi.toFixed(2) + '%' : '—'}</div>
                            <div><strong>Break-Even:</strong> ${fs.metrics.breakEvenPointYears !== null ? fs.metrics.breakEvenPointYears.toFixed(2) + ' yrs' : '—'}</div>
                            <div><strong>Tech Familiarity (App):</strong> ${fs.technical.familiarityWithApplication || '—'}</div>
                            <div><strong>Project Size:</strong> ${fs.technical.projectSize || '—'}</div>
                            <div style="margin-top:5px;color:green;"><strong>✅ Approved by:</strong> ${fs.approvedBy}</div>
                            <div style="color:green;"><strong>At:</strong> ${new Date(fs.approvedAt).toLocaleString()}</div>
                        </div>
                    </div>

                    <!-- Project Planning Column -->
                    <div>
                        <h5 style="margin:0 0 8px;color:#7a5c00;border-bottom:1px solid #b8860b;padding-bottom:4px;">
                            ③ Project Planning
                        </h5>
                        <div style="font-size:0.85em;">
                            <div><strong>Project Manager:</strong> ${pp.projectManager}</div>
                            <div><strong>Methodology:</strong> ${pp.methodology.selectedCategory || '—'}${pp.methodology.selectedSpecificMethod ? ' → ' + pp.methodology.selectedSpecificMethod : ''}</div>
                        </div>
                    </div>
                </div>

                <!-- Stakeholders -->
                ${stakeholderRows ? `
                <div style="margin-top:12px;">
                    <h5 style="margin:0 0 6px;color:#7a5c00;">Inherited Stakeholders</h5>
                    <table style="width:100%;border-collapse:collapse;font-size:0.85em;">
                        <tr style="background:#f5e6aa;">
                            <th style="border:1px solid #b8860b;padding:4px;">Name</th>
                            <th style="border:1px solid #b8860b;padding:4px;">Role</th>
                            <th style="border:1px solid #b8860b;padding:4px;">Support</th>
                            <th style="border:1px solid #b8860b;padding:4px;">Influence</th>
                        </tr>
                        ${stakeholderRows}
                    </table>
                </div>` : ''}

                <!-- Assigned Staff -->
                ${staffRows ? `
                <div style="margin-top:12px;">
                    <h5 style="margin:0 0 6px;color:#7a5c00;">Inherited Project Team</h5>
                    <table style="width:100%;border-collapse:collapse;font-size:0.85em;">
                        <tr style="background:#f5e6aa;">
                            <th style="border:1px solid #b8860b;padding:4px;">Name</th>
                            <th style="border:1px solid #b8860b;padding:4px;">Role</th>
                        </tr>
                        ${staffRows}
                    </table>
                </div>` : ''}

                <!-- Risks inherited -->
                ${riskRows ? `
                <div style="margin-top:12px;">
                    <h5 style="margin:0 0 6px;color:#7a5c00;">Inherited Risk Register</h5>
                    <table style="width:100%;border-collapse:collapse;font-size:0.85em;">
                        <tr style="background:#f5e6aa;">
                            <th style="border:1px solid #b8860b;padding:4px;">Risk ID</th>
                            <th style="border:1px solid #b8860b;padding:4px;">Description</th>
                            <th style="border:1px solid #b8860b;padding:4px;">Severity</th>
                        </tr>
                        ${riskRows}
                    </table>
                </div>` : ''}

            </div>`;
    }

    toJSON() {
        return {
            binderId:       this.binderId,
            issuedAt:       this.issuedAt,
            issuedForPhase: this.issuedForPhase,
            systemRequest:  this.systemRequest,
            feasibilityStudy: this.feasibilityStudy,
            projectPlanning:  this.projectPlanning
        };
    }
}

export default Phase1Binder;
