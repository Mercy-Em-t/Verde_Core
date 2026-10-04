// api-service/feasibilityStudy.js

class FeasibilityStudy {
    constructor(projectId) {
        this.projectId = projectId;
        
        // Status & Approval workflow
        this.status = 'DRAFT'; // DRAFT or APPROVED
        this.approvedBy = null;
        this.approvedAt = null;

        // --- 1. Technical Feasibility ---
        this.technical = {
            description: "Evaluates the extent to which the system can be designed, developed, and installed by IT.",
            familiarityWithApplication: '',
            familiarityWithTechnology: '',
            projectSize: '', // e.g., small, medium, large, team size, duration
            compatibility: '', // e.g., integration with existing systems
            // Added factors for wider coverage:
            familiarityWithBusinessDomain: '', 
            infrastructureReadiness: '',
            securityAndCompliance: '',
            overallRiskScore: 0 // e.g., 0-100
        };

        // --- 2. Economic Feasibility ---
        this.economic = {
            description: "Performs Cost-Benefit Analysis to answer: Should we build the system?",
            
            // Workflow States for Economic Feasibility
            steps: {
                identifyCostsAndBenefits: false, // Step 1
                assignValues: false,             // Step 2
                calculateCashFlows: false,       // Step 3
                measureFinancialWorthiness: false // Step 4
            },

            // Categorized Data
            developmentCosts: [], // e.g., [{ name: 'Server Setup', value: 5000 }]
            operationalCosts: [], // e.g., [{ name: 'Cloud Hosting', value: 1200, frequency: 'yearly' }]
            tangibleBenefits: [], // e.g., [{ name: 'Increased Sales', value: 20000 }]
            intangibleBenefits: [], // e.g., ['Improved User Experience', 'Brand Recognition']
            
            // Cash flow projections (yearly)
            cashFlows: [], 
            
            // Financial Metrics
            metrics: {
                discountRate: 0.05, // Assumed 5% discount rate for NPV
                roi: 0,
                breakEvenPointYears: 0,
                npv: 0 // Net Present Value
            }
        };

        // --- 3. Organizational Feasibility ---
        this.organizational = {
            description: "Evaluates if the system will be accepted by its users. (If we build it, will they come?)",
            strategicAlignment: '',
            stakeholderAnalysis: [], // Array of { name, role, supportLevel, influence }
            userSurveysSummary: ''
        };

        this.risks = [];
        this.finalVerdict = null; // 'PROCEED' or 'DO_NOT_PROCEED'
    }

    // --- Approval Method ---
    approve(adminName) {
        this.status = 'APPROVED';
        this.approvedBy = adminName;
        this.approvedAt = new Date().toISOString();
    }

    isApproved() {
        return this.status === 'APPROVED';
    }

    // --- Technical Methods ---
    setTechnicalAssessment(data) {
        this.technical = { ...this.technical, ...data };
    }

    // --- Economic Workflow Methods ---
    // Step 1: Identify
    addCostOrBenefit(category, item, value = 0) {
        if (this.economic[category]) {
            this.economic[category].push({ name: item, value: value });
        }
    }
    
    markStepComplete(stepName) {
        if (this.economic.steps.hasOwnProperty(stepName)) {
            this.economic.steps[stepName] = true;
        }
    }

    // Step 3 & 4: Calculations
    calculateFinancialMetrics(yearsToProject = 5) {
        // Only run if values are assigned
        if (!this.economic.steps.assignValues) return;

        const devCostTotal = this.economic.developmentCosts.reduce((acc, curr) => acc + curr.value, 0);
        const opCostTotal = this.economic.operationalCosts.reduce((acc, curr) => acc + curr.value, 0);
        const benefitTotal = this.economic.tangibleBenefits.reduce((acc, curr) => acc + curr.value, 0);
        
        let cumulativeCashFlow = -devCostTotal;
        let npv = -devCostTotal;
        let breakEvenYear = null;

        this.economic.cashFlows = [];

        // Year 0
        this.economic.cashFlows.push({ year: 0, cashFlow: -devCostTotal, cumulative: cumulativeCashFlow });

        for (let year = 1; year <= yearsToProject; year++) {
            const yearlyNet = benefitTotal - opCostTotal;
            cumulativeCashFlow += yearlyNet;
            
            // NPV Calculation: PV = FV / (1 + r)^n
            const pv = yearlyNet / Math.pow(1 + this.economic.metrics.discountRate, year);
            npv += pv;

            this.economic.cashFlows.push({ year: year, cashFlow: yearlyNet, cumulative: cumulativeCashFlow });

            if (breakEvenYear === null && cumulativeCashFlow >= 0) {
                // Precise BEP interpolation
                const previousCumulative = this.economic.cashFlows[year - 1].cumulative;
                const fraction = Math.abs(previousCumulative) / yearlyNet;
                breakEvenYear = (year - 1) + fraction;
            }
        }

        // ROI Calculation: (Total Benefits - Total Costs) / Total Costs
        const totalBenefits = benefitTotal * yearsToProject;
        const totalCosts = devCostTotal + (opCostTotal * yearsToProject);
        const roi = totalCosts > 0 ? ((totalBenefits - totalCosts) / totalCosts) * 100 : 0;

        this.economic.metrics = {
            ...this.economic.metrics,
            roi: roi,
            breakEvenPointYears: breakEvenYear || 'Does not break even',
            npv: npv
        };

        this.markStepComplete('calculateCashFlows');
        this.markStepComplete('measureFinancialWorthiness');
    }

    addRisk(riskDescription, mitigationStrategy) {
        this.risks.push({ risk: riskDescription, mitigation: mitigationStrategy });
    }

    // --- Organizational Methods ---
    setStrategicAlignment(alignmentDesc, surveySummary) {
        this.organizational.strategicAlignment = alignmentDesc;
        this.organizational.userSurveysSummary = surveySummary;
    }

    addStakeholder(name, role, supportLevel, influence) {
        this.organizational.stakeholderAnalysis.push({ name, role, supportLevel, influence });
    }

    setVerdict(proceed) {
        this.finalVerdict = proceed ? 'PROCEED' : 'DO_NOT_PROCEED';
    }

    // --- Renderer ---
    renderAsHTML() {
        // Helper to format currency
        const formatMoney = (val) => '$' + Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        
        // Approval Stamp
        const approvalStamp = this.isApproved() 
            ? `<div class="approval-stamp" style="color: green; border: 2px solid green; padding: 10px; margin-bottom: 20px;">
                 <strong>OFFICIAL DOCUMENT</strong><br/>
                 Approved by: ${this.approvedBy}<br/>
                 Date: ${new Date(this.approvedAt).toLocaleString()}
               </div>`
            : `<div class="draft-stamp" style="color: red; border: 2px dashed red; padding: 10px; margin-bottom: 20px;">
                 <strong>DRAFT - UNOFFICIAL</strong><br/>
                 Pending Admin Approval
               </div>`;

        // Economic Workflow Progress
        const steps = this.economic.steps;
        const econProgressHtml = `
            <ul style="list-style: none; padding-left: 0;">
                <li>${steps.identifyCostsAndBenefits ? '✅' : '⏳'} 1. Identify Costs & Benefits</li>
                <li>${steps.assignValues ? '✅' : '⏳'} 2. Assign Dollar Values</li>
                <li>${steps.calculateCashFlows ? '✅' : '⏳'} 3. Calculate Future Cash Flows</li>
                <li>${steps.measureFinancialWorthiness ? '✅' : '⏳'} 4. Measure Financial Worthiness</li>
            </ul>
        `;

        const cashFlowHtml = this.economic.cashFlows.map(cf => 
            `<tr>
                <td style="border: 1px solid #ccc; padding: 5px;">Year ${cf.year}</td>
                <td style="border: 1px solid #ccc; padding: 5px;">${formatMoney(cf.cashFlow)}</td>
                <td style="border: 1px solid #ccc; padding: 5px;">${formatMoney(cf.cumulative)}</td>
            </tr>`
        ).join('');

        const stakeholdersHtml = this.organizational.stakeholderAnalysis.map(sh => 
            `<tr>
                <td style="border: 1px solid #ccc; padding: 5px;">${sh.name}</td>
                <td style="border: 1px solid #ccc; padding: 5px;">${sh.role}</td>
                <td style="border: 1px solid #ccc; padding: 5px;">${sh.supportLevel}</td>
                <td style="border: 1px solid #ccc; padding: 5px;">${sh.influence}</td>
            </tr>`
        ).join('');

        const verdictHtml = this.finalVerdict === 'PROCEED' 
            ? `<h3 style="color: green;">VERDICT: PROCEED</h3>` 
            : (this.finalVerdict === 'DO_NOT_PROCEED' ? `<h3 style="color: red;">VERDICT: DO NOT PROCEED</h3>` : `<h3>VERDICT: PENDING ANALYSIS</h3>`);

        return `
            <div class="feasibility-study-document" style="font-family: sans-serif; line-height: 1.6;">
                <h2>Feasibility Study Report</h2>
                ${approvalStamp}
                
                <div class="document-section">
                    <h3>1. Technical Feasibility</h3>
                    <p><em>${this.technical.description}</em></p>
                    <ul>
                        <li><strong>Familiarity with Application:</strong> ${this.technical.familiarityWithApplication}</li>
                        <li><strong>Familiarity with Technology:</strong> ${this.technical.familiarityWithTechnology}</li>
                        <li><strong>Project Size:</strong> ${this.technical.projectSize}</li>
                        <li><strong>Compatibility (Integration):</strong> ${this.technical.compatibility}</li>
                        <li><strong>Business Domain Knowledge:</strong> ${this.technical.familiarityWithBusinessDomain}</li>
                        <li><strong>Infrastructure Readiness:</strong> ${this.technical.infrastructureReadiness}</li>
                        <li><strong>Security & Compliance:</strong> ${this.technical.securityAndCompliance}</li>
                    </ul>
                </div>
                
                <div class="document-section">
                    <h3>2. Economic Feasibility</h3>
                    <p><em>${this.economic.description}</em></p>
                    
                    <h4>Economic Analysis Progress:</h4>
                    ${econProgressHtml}
                    
                    <h4>Financial Metrics (Over 5 Years)</h4>
                    <ul>
                        <li><strong>Net Present Value (NPV):</strong> ${formatMoney(this.economic.metrics.npv)}</li>
                        <li><strong>Return on Investment (ROI):</strong> ${this.economic.metrics.roi.toFixed(2)}%</li>
                        <li><strong>Break-Even Point:</strong> ${typeof this.economic.metrics.breakEvenPointYears === 'number' ? this.economic.metrics.breakEvenPointYears.toFixed(2) + ' Years' : this.economic.metrics.breakEvenPointYears}</li>
                    </ul>

                    <h4>Cash Flow Projections</h4>
                    <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
                        <tr style="background: #f4f4f4;">
                            <th style="border: 1px solid #ccc; padding: 5px;">Year</th>
                            <th style="border: 1px solid #ccc; padding: 5px;">Net Cash Flow</th>
                            <th style="border: 1px solid #ccc; padding: 5px;">Cumulative Cash Flow</th>
                        </tr>
                        ${cashFlowHtml}
                    </table>
                </div>

                <div class="document-section">
                    <h3>3. Organizational Feasibility</h3>
                    <p><em>${this.organizational.description}</em></p>
                    <ul>
                        <li><strong>Strategic Alignment:</strong> ${this.organizational.strategicAlignment}</li>
                        <li><strong>User Survey Summary:</strong> ${this.organizational.userSurveysSummary}</li>
                    </ul>
                    
                    <h4>Stakeholder Analysis</h4>
                    <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
                        <tr style="background: #f4f4f4;">
                            <th style="border: 1px solid #ccc; padding: 5px;">Name</th>
                            <th style="border: 1px solid #ccc; padding: 5px;">Role</th>
                            <th style="border: 1px solid #ccc; padding: 5px;">Support Level</th>
                            <th style="border: 1px solid #ccc; padding: 5px;">Influence</th>
                        </tr>
                        ${stakeholdersHtml || '<tr><td colspan="4" style="text-align: center; border: 1px solid #ccc; padding: 5px;">No stakeholders analyzed yet.</td></tr>'}
                    </table>
                </div>

                <div class="document-section verdict-section" style="margin-top: 30px; padding: 15px; border-top: 2px solid #ccc;">
                    ${verdictHtml}
                </div>
            </div>
        `;
    }

    toJSON() {
        return {
            projectId: this.projectId,
            status: this.status,
            approvedBy: this.approvedBy,
            approvedAt: this.approvedAt,
            technical: this.technical,
            economic: {
                steps: this.economic.steps,
                developmentCosts: this.economic.developmentCosts,
                operationalCosts: this.economic.operationalCosts,
                tangibleBenefits: this.economic.tangibleBenefits,
                intangibleBenefits: this.economic.intangibleBenefits,
                cashFlows: this.economic.cashFlows,
                metrics: this.economic.metrics
            },
            organizational: this.organizational,
            risks: this.risks,
            finalVerdict: this.finalVerdict
        };
    }
}

export default FeasibilityStudy;
