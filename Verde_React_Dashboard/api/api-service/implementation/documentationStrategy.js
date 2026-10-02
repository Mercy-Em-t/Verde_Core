export default class DocumentationStrategy {
    constructor() {
        this.status = 'PENDING';
        this.systemDocs = [];
        this.userDocs = [];
    }

    addSystemDoc(title, description, url) {
        this.systemDocs.push({ title, description, url });
        if (this.status === 'PENDING') this.status = 'IN_PROGRESS';
    }

    addUserDoc(title, description, audience) {
        this.userDocs.push({ title, description, audience });
        if (this.status === 'PENDING') this.status = 'IN_PROGRESS';
    }

    finalize() {
        this.status = 'COMPLETED';
    }

    renderAsHTML() {
        const sysHtml = this.systemDocs.map(d => `<li><strong>${d.title}</strong>: ${d.description} <br/> <a href="${d.url}">Link</a></li>`).join('') || '<li>None</li>';
        const usrHtml = this.userDocs.map(d => `<li><strong>${d.title}</strong> (For: ${d.audience})<br/>${d.description}</li>`).join('') || '<li>None</li>';
        
        return `
            <div style="border:1px solid #ccc;padding:15px;border-radius:5px;margin-bottom:20px;">
                <h4 style="margin-top:0;">3. Documentation Strategy</h4>
                <p><strong>Status:</strong> ${this.status}</p>
                <h5>System Documentation</h5>
                <ul>${sysHtml}</ul>
                <h5>User Documentation</h5>
                <ul>${usrHtml}</ul>
            </div>
        `;
    }
}
