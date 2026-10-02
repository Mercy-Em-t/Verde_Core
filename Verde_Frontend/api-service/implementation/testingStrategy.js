export default class TestingStrategy {
    constructor() {
        this.status = 'PENDING';
        this.tests = { unit: [], integration: [], system: [], acceptance: [] };
    }

    addTestPlan(category, description, casesPassed, casesFailed) {
        if (!this.tests[category]) throw new Error('Invalid test category: ' + category);
        this.tests[category].push({ description, passed: casesPassed, failed: casesFailed });
        if (this.status === 'PENDING') this.status = 'IN_PROGRESS';
    }

    finalize() {
        this.status = 'COMPLETED';
    }

    renderAsHTML() {
        const buildHtml = (arr) => arr.map(t => `<li>${t.description} (Pass: ${t.passed}, Fail: ${t.failed})</li>`).join('') || '<li>No tests planned</li>';
        
        return `
            <div style="border:1px solid #ccc;padding:15px;border-radius:5px;margin-bottom:20px;">
                <h4 style="margin-top:0;">2. Testing Strategy</h4>
                <p><strong>Status:</strong> ${this.status}</p>
                <h5>Unit Tests</h5>
                <ul>${buildHtml(this.tests.unit)}</ul>
                <h5>Integration Tests</h5>
                <ul>${buildHtml(this.tests.integration)}</ul>
                <h5>System Tests</h5>
                <ul>${buildHtml(this.tests.system)}</ul>
                <h5>Acceptance Tests</h5>
                <ul>${buildHtml(this.tests.acceptance)}</ul>
            </div>
        `;
    }
}
