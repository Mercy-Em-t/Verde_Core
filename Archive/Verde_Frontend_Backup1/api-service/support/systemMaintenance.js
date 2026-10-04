export default class SystemMaintenance {
    constructor() {
        this.status = 'ACTIVE';
        this.maintenanceTasks = [];
    }

    addTask(id, type, description) {
        // Types: 'BUG_FIX', 'ENHANCEMENT', 'PATCH'
        this.maintenanceTasks.push({ id, type, description, status: 'PENDING' });
    }

    completeTask(id) {
        const task = this.maintenanceTasks.find(t => t.id === id);
        if (task) {
            task.status = 'COMPLETED';
        }
    }

    renderAsHTML() {
        const buildHtml = this.maintenanceTasks.map(t => `
            <li style="margin-bottom: 5px;">
                <strong>[${t.id}]</strong> [${t.type}] ${t.description} - 
                <em>${t.status}</em>
            </li>`).join('') || '<li>No maintenance tasks logged.</li>';
        
        return `
            <div style="border:1px solid #ccc;padding:15px;border-radius:5px;margin-bottom:20px;">
                <h4 style="margin-top:0;">2. System Maintenance</h4>
                <p><strong>Maintenance Status:</strong> ${this.status}</p>
                <ul style="list-style-type:none; padding-left:0;">${buildHtml}</ul>
            </div>
        `;
    }
}
