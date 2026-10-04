// api-service/manageAndControl.js

/**
 * ManageAndControl Class
 * Handles the final step of Project Planning: preparing to manage and control the project.
 * Includes tracking tools, project standards, and the formal Risk Assessment.
 */
class ManageAndControl {
    constructor() {
        this.status = 'PENDING';
        
        // Project Tracking & Management Tools
        this.trackingTools = []; // e.g. ['Jira for Issue Tracking', 'Confluence for Docs']
        
        // Standards List
        this.standardsList = []; // Array of { category, description }
        
        // Risk Assessment Plan
        this.risks = []; // Array of { id, risk, likelihood, impact, severity, mitigation }
    }

    addTrackingTool(toolDescription) {
        this.trackingTools.push(toolDescription);
        if (this.status === 'PENDING') this.status = 'IN_PROGRESS';
    }

    addStandard(category, description) {
        this.standardsList.push({ category, description });
        if (this.status === 'PENDING') this.status = 'IN_PROGRESS';
    }

    addRisk(id, riskDescription, likelihood, impact, mitigation) {
        // Calculate a basic severity score if likelihood and impact are out of 5
        // Or just handle them as strings if they are "High/Medium/Low"
        let severity = 'Unknown';
        const levels = { 'Low': 1, 'Medium': 2, 'High': 3 };
        if (levels[likelihood] && levels[impact]) {
            const score = levels[likelihood] * levels[impact];
            if (score >= 6) severity = 'Critical';
            else if (score >= 3) severity = 'Moderate';
            else severity = 'Low';
        }

        this.risks.push({
            id,
            risk: riskDescription,
            likelihood,
            impact,
            severity,
            mitigation
        });
        
        if (this.status === 'PENDING') this.status = 'IN_PROGRESS';
    }

    finalizeManagementPlan() {
        this.status = 'COMPLETED';
    }

    renderAsHTML() {
        const toolsHtml = this.trackingTools.map(t => `<li>${t}</li>`).join('');
        
        const standardsHtml = this.standardsList.map(s => `
            <tr>
                <td style="border: 1px solid #ccc; padding: 5px;"><strong>${s.category}</strong></td>
                <td style="border: 1px solid #ccc; padding: 5px;">${s.description}</td>
            </tr>
        `).join('');

        const risksHtml = this.risks.map(r => {
            const sevColor = r.severity === 'Critical' ? 'red' : (r.severity === 'Moderate' ? 'orange' : 'green');
            return `
            <tr>
                <td style="border: 1px solid #ccc; padding: 5px;">${r.id}</td>
                <td style="border: 1px solid #ccc; padding: 5px;">${r.risk}</td>
                <td style="border: 1px solid #ccc; padding: 5px;">${r.likelihood}</td>
                <td style="border: 1px solid #ccc; padding: 5px;">${r.impact}</td>
                <td style="border: 1px solid #ccc; padding: 5px; color: ${sevColor}; font-weight: bold;">${r.severity}</td>
                <td style="border: 1px solid #ccc; padding: 5px;">${r.mitigation}</td>
            </tr>
            `;
        }).join('');

        return `
            <div class="manage-control-container" style="border: 1px solid #ccc; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <h4 style="margin-top: 0;">4. Manage and Control Project</h4>
                
                <div style="margin-bottom: 15px;">
                    <h5>Tracking Tools</h5>
                    <ul>
                        ${toolsHtml || '<li>No tools defined.</li>'}
                    </ul>
                </div>

                <div style="margin-bottom: 15px;">
                    <h5>Project Standards List</h5>
                    <table style="width: 100%; text-align: left; border-collapse: collapse;">
                        <tr style="background: #f4f4f4;">
                            <th style="border: 1px solid #ddd; padding: 5px;">Category</th>
                            <th style="border: 1px solid #ddd; padding: 5px;">Standard Description</th>
                        </tr>
                        ${standardsHtml || '<tr><td colspan="2" style="text-align:center;">No standards defined.</td></tr>'}
                    </table>
                </div>

                <div>
                    <h5>Risk Assessment Matrix</h5>
                    <table style="width: 100%; text-align: left; border-collapse: collapse;">
                        <tr style="background: #f4f4f4;">
                            <th style="border: 1px solid #ddd; padding: 5px;">Risk ID</th>
                            <th style="border: 1px solid #ddd; padding: 5px;">Description</th>
                            <th style="border: 1px solid #ddd; padding: 5px;">Likelihood</th>
                            <th style="border: 1px solid #ddd; padding: 5px;">Impact</th>
                            <th style="border: 1px solid #ddd; padding: 5px;">Severity</th>
                            <th style="border: 1px solid #ddd; padding: 5px;">Mitigation Strategy</th>
                        </tr>
                        ${risksHtml || '<tr><td colspan="6" style="text-align:center;">No risks mapped.</td></tr>'}
                    </table>
                </div>
            </div>
        `;
    }

    toJSON() {
        return {
            status: this.status,
            trackingTools: this.trackingTools,
            standardsList: this.standardsList,
            risks: this.risks
        };
    }
}

export default ManageAndControl;
