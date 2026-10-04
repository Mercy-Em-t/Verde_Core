// api-service/staffingPlan.js

/**
 * StaffingPlan Class
 * Identifies project staffing requirements and coordinates assignment.
 */
class StaffingPlan {
    constructor() {
        this.status = 'PENDING';
        
        this.staffingNeeds = []; // E.g., { role: 'Backend Dev', count: 2, requiredSkills: ['Node.js'] }
        this.assignedStaff = []; // E.g., { name: 'Alice', role: 'Backend Dev' }
    }

    // Step 1: Identify Needs
    addStaffingNeed(role, count, requiredSkills) {
        this.staffingNeeds.push({ role, count, requiredSkills });
        if (this.status === 'PENDING') this.status = 'IN_PROGRESS';
    }

    // Step 2: Assign specific people to fulfill the needs
    assignStaffMember(name, role) {
        this.assignedStaff.push({ name, role });
    }

    finalizeStaffing() {
        this.status = 'COMPLETED';
    }

    renderAsHTML() {
        const needsRows = this.staffingNeeds.map(n => `
            <tr>
                <td style="border: 1px solid #ccc; padding: 5px;">${n.role}</td>
                <td style="border: 1px solid #ccc; padding: 5px;">${n.count}</td>
                <td style="border: 1px solid #ccc; padding: 5px;">${n.requiredSkills.join(', ')}</td>
            </tr>
        `).join('');

        const assignedRows = this.assignedStaff.map(s => `
            <tr>
                <td style="border: 1px solid #ccc; padding: 5px;"><strong>${s.name}</strong></td>
                <td style="border: 1px solid #ccc; padding: 5px;">${s.role}</td>
            </tr>
        `).join('');

        return `
            <div class="staffing-plan-container" style="border: 1px solid #ccc; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <h4 style="margin-top: 0;">3. Staffing Requirements & Assignments</h4>
                
                <div style="display: flex; gap: 20px;">
                    <div style="flex: 1;">
                        <h5>Identified Needs</h5>
                        <table style="width: 100%; text-align: left; border-collapse: collapse;">
                            <tr style="background: #f4f4f4;">
                                <th style="border: 1px solid #ddd; padding: 5px;">Role</th>
                                <th style="border: 1px solid #ddd; padding: 5px;">Count</th>
                                <th style="border: 1px solid #ddd; padding: 5px;">Skills</th>
                            </tr>
                            ${needsRows || '<tr><td colspan="3" style="text-align:center;">No needs identified.</td></tr>'}
                        </table>
                    </div>
                    
                    <div style="flex: 1;">
                        <h5>Assigned Project Team</h5>
                        <table style="width: 100%; text-align: left; border-collapse: collapse;">
                            <tr style="background: #f4f4f4;">
                                <th style="border: 1px solid #ddd; padding: 5px;">Name</th>
                                <th style="border: 1px solid #ddd; padding: 5px;">Role</th>
                            </tr>
                            ${assignedRows || '<tr><td colspan="2" style="text-align:center;">No staff assigned yet.</td></tr>'}
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    toJSON() {
        return {
            status: this.status,
            staffingNeeds: this.staffingNeeds,
            assignedStaff: this.assignedStaff
        };
    }
}

export default StaffingPlan;
