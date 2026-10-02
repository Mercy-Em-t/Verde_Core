// api-service/systemRequest.js

/**
 * SystemRequest Class
 * Represents the System Request document created during Project Initiation.
 * Holds data for the 5 key elements:
 * 1. Project Sponsor
 * 2. Business Need
 * 3. Business Requirements
 * 4. Business Value
 * 5. Special Issues
 */
class SystemRequest {
    constructor(projectId) {
        this.projectId = projectId;
        
        // Document fields
        this.projectSponsor = '';
        this.businessNeed = '';
        this.businessRequirements = [];
        this.businessValue = '';
        this.specialIssues = '';

        // Status & Approval workflow
        this.status = 'DRAFT'; // DRAFT or APPROVED
        this.approvedBy = null;
        this.approvedAt = null;
    }

    // Approval Method
    approve(adminName) {
        this.status = 'APPROVED';
        this.approvedBy = adminName;
        this.approvedAt = new Date().toISOString();
    }

    isApproved() {
        return this.status === 'APPROVED';
    }

    // Setters for the various sections
    setProjectSponsor(sponsor) {
        this.projectSponsor = sponsor;
    }

    setBusinessNeed(need) {
        this.businessNeed = need;
    }

    addBusinessRequirement(requirement) {
        this.businessRequirements.push(requirement);
    }

    setBusinessValue(value) {
        this.businessValue = value;
    }

    setSpecialIssues(issues) {
        this.specialIssues = issues;
    }

    /**
     * Renders the System Request as an HTML document view.
     * This allows the frontend to easily display the object as a document.
     */
    renderAsHTML() {
        const requirementsList = this.businessRequirements
            .map(req => `<li>${req}</li>`)
            .join('');

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

        return `
            <div class="system-request-document">
                <h2>System Request Form</h2>
                ${approvalStamp}
                <div class="document-section">
                    <h3>1. Project Sponsor</h3>
                    <p>${this.projectSponsor || '<em>Not specified</em>'}</p>
                </div>
                
                <div class="document-section">
                    <h3>2. Business Need</h3>
                    <p>${this.businessNeed || '<em>Not specified</em>'}</p>
                </div>
                
                <div class="document-section">
                    <h3>3. Business Requirements</h3>
                    <ul>
                        ${requirementsList || '<li><em>No requirements specified</em></li>'}
                    </ul>
                </div>
                
                <div class="document-section">
                    <h3>4. Business Value</h3>
                    <p>${this.businessValue || '<em>Not specified</em>'}</p>
                </div>
                
                <div class="document-section">
                    <h3>5. Special Issues</h3>
                    <p>${this.specialIssues || '<em>None</em>'}</p>
                </div>
            </div>
        `;
    }

    // Returns a plain JSON representation of the document
    toJSON() {
        return {
            projectId: this.projectId,
            projectSponsor: this.projectSponsor,
            businessNeed: this.businessNeed,
            businessRequirements: this.businessRequirements,
            businessValue: this.businessValue,
            specialIssues: this.specialIssues
        };
    }
}

export default SystemRequest;
