// api-service/workPlan.js

/**
 * WorkPlan Class
 * Handles the creation of the Work Breakdown Structure (WBS) and the Task List.
 * Guided by standard Project Management Lifecycle guidelines.
 */
class WorkPlan {
    constructor() {
        this.status = 'PENDING';
        
        // High-level estimates
        this.estimates = {
            totalEstimatedDuration: 0, // e.g. in days or weeks
            estimatedSize: '' // e.g. LOC, Function Points, or T-Shirt sizing
        };

        // Work Breakdown Structure (Hierarchical)
        this.wbs = []; // Array of Phase objects containing tasks

        // Flat Task List (derived from WBS)
        this.taskList = [];
    }

    setEstimates(sizeEstimate, durationEstimate) {
        this.estimates.estimatedSize = sizeEstimate;
        this.estimates.totalEstimatedDuration = durationEstimate;
        if (this.status === 'PENDING') this.status = 'IN_PROGRESS';
    }

    // Add a top-level phase to the WBS
    addWBSPhase(phaseId, phaseName) {
        const phase = { id: phaseId, name: phaseName, tasks: [] };
        this.wbs.push(phase);
        return phase;
    }

    // Add a specific task to a WBS phase
    addTask(phaseId, taskObj) {
        // taskObj should look like: { id, name, type, durationDays, milestone, deliverable, assignedTo }
        const phase = this.wbs.find(p => p.id === phaseId);
        if (!phase) throw new Error(`Phase ${phaseId} not found in WBS.`);
        
        // Ensure default fields
        const newTask = {
            id: taskObj.id,
            name: taskObj.name,
            type: taskObj.type || 'Standard',
            durationDays: taskObj.durationDays || 0,
            milestone: taskObj.milestone || false,
            deliverable: taskObj.deliverable || 'None',
            assignedTo: taskObj.assignedTo || 'Unassigned'
        };

        phase.tasks.push(newTask);
        this.syncTaskList(); // Automatically update the flat task list
    }

    // Flattens the hierarchical WBS into a straight Task List
    syncTaskList() {
        this.taskList = [];
        this.wbs.forEach(phase => {
            phase.tasks.forEach(task => {
                this.taskList.push({
                    phaseName: phase.name,
                    ...task
                });
            });
        });
    }

    // Method to assign a staff member to a task
    assignStaffToTask(taskId, staffName) {
        let found = false;
        this.wbs.forEach(phase => {
            const task = phase.tasks.find(t => t.id === taskId);
            if (task) {
                task.assignedTo = staffName;
                found = true;
            }
        });
        if (found) this.syncTaskList();
    }

    finalizeWorkPlan() {
        this.status = 'COMPLETED';
    }

    renderAsHTML() {
        const taskRows = this.taskList.map(t => `
            <tr>
                <td style="border: 1px solid #ccc; padding: 5px;">${t.phaseName}</td>
                <td style="border: 1px solid #ccc; padding: 5px;"><strong>${t.name}</strong><br/><small>ID: ${t.id}</small></td>
                <td style="border: 1px solid #ccc; padding: 5px;">${t.type}</td>
                <td style="border: 1px solid #ccc; padding: 5px;">${t.durationDays} days</td>
                <td style="border: 1px solid #ccc; padding: 5px;">${t.deliverable}</td>
                <td style="border: 1px solid #ccc; padding: 5px;">${t.milestone ? '⭐ Yes' : 'No'}</td>
                <td style="border: 1px solid #ccc; padding: 5px;">
                    <span style="color: ${t.assignedTo === 'Unassigned' ? 'red' : 'green'};">${t.assignedTo}</span>
                </td>
            </tr>
        `).join('');

        return `
            <div class="work-plan-container" style="border: 1px solid #ccc; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <h4 style="margin-top: 0;">2. Project Work Plan (WBS & Task List)</h4>
                
                <div style="margin-bottom: 15px;">
                    <strong>Overall Estimates:</strong><br/>
                    Size Estimate: ${this.estimates.estimatedSize || '<em>Not set</em>'}<br/>
                    Duration Estimate: ${this.estimates.totalEstimatedDuration || '0'} days
                </div>

                <table style="width: 100%; text-align: left; border-collapse: collapse;">
                    <tr style="background: #f4f4f4;">
                        <th style="border: 1px solid #ddd; padding: 5px;">WBS Phase</th>
                        <th style="border: 1px solid #ddd; padding: 5px;">Task</th>
                        <th style="border: 1px solid #ddd; padding: 5px;">Type</th>
                        <th style="border: 1px solid #ddd; padding: 5px;">Duration</th>
                        <th style="border: 1px solid #ddd; padding: 5px;">Deliverable</th>
                        <th style="border: 1px solid #ddd; padding: 5px;">Milestone?</th>
                        <th style="border: 1px solid #ddd; padding: 5px;">Assigned Staff</th>
                    </tr>
                    ${taskRows || '<tr><td colspan="7" style="text-align:center; padding: 10px;">No tasks mapped out yet.</td></tr>'}
                </table>
            </div>
        `;
    }

    toJSON() {
        return {
            status: this.status,
            estimates: this.estimates,
            wbs: this.wbs,
            taskList: this.taskList
        };
    }
}

export default WorkPlan;
