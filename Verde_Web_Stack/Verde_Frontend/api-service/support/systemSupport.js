export default class SystemSupport {
    constructor() {
        this.status = 'ACTIVE';
        this.tickets = [];
    }

    addTicket(id, issue, priority, reporter) {
        this.tickets.push({ id, issue, priority, reporter, status: 'OPEN', resolvedAt: null });
    }

    resolveTicket(id) {
        const ticket = this.tickets.find(t => t.id === id);
        if (ticket) {
            ticket.status = 'RESOLVED';
            ticket.resolvedAt = new Date().toISOString();
        }
    }

    renderAsHTML() {
        const buildHtml = this.tickets.map(t => `
            <li style="margin-bottom: 5px;">
                <strong>[${t.id}]</strong> (${t.priority}) ${t.issue} - 
                <em>${t.status}</em> ${t.status === 'RESOLVED' ? '✅' : '❌'}
            </li>`).join('') || '<li>No support tickets logged.</li>';
        
        return `
            <div style="border:1px solid #ccc;padding:15px;border-radius:5px;margin-bottom:20px;">
                <h4 style="margin-top:0;">1. System Support (Help Desk)</h4>
                <p><strong>Support Status:</strong> ${this.status}</p>
                <ul style="list-style-type:none; padding-left:0;">${buildHtml}</ul>
            </div>
        `;
    }
}
