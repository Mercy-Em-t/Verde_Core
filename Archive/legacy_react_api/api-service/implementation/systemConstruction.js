export default class SystemConstruction {
    constructor() {
        this.status = 'PENDING';
        this.programmingEnvironment = { ide: '', language: '', framework: '' };
        this.repositories = [];
    }

    setEnvironment(ide, language, framework) {
        this.programmingEnvironment = { ide, language, framework };
        if (this.status === 'PENDING') this.status = 'IN_PROGRESS';
    }

    addRepository(name, url) {
        this.repositories.push({ name, url });
        if (this.status === 'PENDING') this.status = 'IN_PROGRESS';
    }

    finalize() {
        this.status = 'COMPLETED';
    }

    renderAsHTML() {
        const repoHtml = this.repositories.map(r => `<li><a href="${r.url}">${r.name}</a></li>`).join('') || '<li>None configured</li>';
        
        return `
            <div style="border:1px solid #ccc;padding:15px;border-radius:5px;margin-bottom:20px;">
                <h4 style="margin-top:0;">1. System Construction (Programming Environment)</h4>
                <p><strong>Status:</strong> ${this.status}</p>
                <p><strong>IDE/Tools:</strong> ${this.programmingEnvironment.ide}</p>
                <p><strong>Language:</strong> ${this.programmingEnvironment.language}</p>
                <p><strong>Framework:</strong> ${this.programmingEnvironment.framework}</p>
                <h5>Code Repositories</h5>
                <ul>${repoHtml}</ul>
            </div>
        `;
    }
}
