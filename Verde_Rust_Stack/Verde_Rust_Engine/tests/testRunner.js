// tests/testRunner.js
// Lightweight browser-native test runner — no dependencies needed.

export class TestRunner {
    constructor(suiteName) {
        this.suiteName = suiteName;
        this.results = [];
        this.passed  = 0;
        this.failed  = 0;
    }

    // --- Assertion helpers ---
    assert(condition, label) {
        if (condition) {
            this.results.push({ label, status: 'PASS', detail: '' });
            this.passed++;
        } else {
            this.results.push({ label, status: 'FAIL', detail: 'Assertion returned false.' });
            this.failed++;
        }
    }

    assertEqual(actual, expected, label) {
        const ok = JSON.stringify(actual) === JSON.stringify(expected);
        this.results.push({
            label,
            status: ok ? 'PASS' : 'FAIL',
            detail: ok ? '' : `Expected: ${JSON.stringify(expected)} | Got: ${JSON.stringify(actual)}`
        });
        ok ? this.passed++ : this.failed++;
    }

    assertThrows(fn, expectedMsgFragment, label) {
        try {
            fn();
            this.results.push({ label, status: 'FAIL', detail: 'Expected an error to be thrown but none was.' });
            this.failed++;
        } catch (e) {
            const ok = !expectedMsgFragment || e.message.includes(expectedMsgFragment);
            this.results.push({
                label,
                status: ok ? 'PASS' : 'FAIL',
                detail: ok ? '' : `Expected error containing "${expectedMsgFragment}" but got: "${e.message}"`
            });
            ok ? this.passed++ : this.failed++;
        }
    }

    assertDoesNotThrow(fn, label) {
        try {
            fn();
            this.results.push({ label, status: 'PASS', detail: '' });
            this.passed++;
        } catch (e) {
            this.results.push({ label, status: 'FAIL', detail: `Unexpected error: ${e.message}` });
            this.failed++;
        }
    }

    assertContains(str, fragment, label) {
        const ok = typeof str === 'string' && str.includes(fragment);
        this.results.push({
            label,
            status: ok ? 'PASS' : 'FAIL',
            detail: ok ? '' : `Expected string to contain "${fragment}"`
        });
        ok ? this.passed++ : this.failed++;
    }

    assertNull(value, label) {
        const ok = value === null || value === undefined;
        this.results.push({
            label,
            status: ok ? 'PASS' : 'FAIL',
            detail: ok ? '' : `Expected null/undefined but got: ${JSON.stringify(value)}`
        });
        ok ? this.passed++ : this.failed++;
    }

    assertNotNull(value, label) {
        const ok = value !== null && value !== undefined;
        this.results.push({
            label,
            status: ok ? 'PASS' : 'FAIL',
            detail: ok ? '' : `Expected a non-null value but got null/undefined`
        });
        ok ? this.passed++ : this.failed++;
    }

    // --- Summary ---
    getSummary() {
        return {
            suite:  this.suiteName,
            total:  this.results.length,
            passed: this.passed,
            failed: this.failed,
            results: this.results
        };
    }

    renderHTML() {
        const rows = this.results.map(r => `
            <tr style="background:${r.status === 'PASS' ? '#f0fff0' : '#fff0f0'}">
                <td style="border:1px solid #ddd;padding:5px;text-align:center;font-weight:bold;color:${r.status === 'PASS' ? 'green' : 'red'}">
                    ${r.status === 'PASS' ? '✅' : '❌'}
                </td>
                <td style="border:1px solid #ddd;padding:5px;">${r.label}</td>
                <td style="border:1px solid #ddd;padding:5px;color:#666;font-size:0.85em;">${r.detail || '—'}</td>
            </tr>`).join('');

        const headerColor = this.failed === 0 ? '#28a745' : '#dc3545';
        return `
            <div style="margin-bottom:25px;font-family:sans-serif;">
                <div style="background:${headerColor};color:white;padding:10px 15px;border-radius:6px 6px 0 0;display:flex;justify-content:space-between;">
                    <strong>${this.suiteName}</strong>
                    <span>${this.passed}/${this.results.length} passed ${this.failed > 0 ? `| ${this.failed} FAILED` : ''}</span>
                </div>
                <table style="width:100%;border-collapse:collapse;border:1px solid #ddd;">
                    <tr style="background:#f4f4f4;">
                        <th style="border:1px solid #ddd;padding:5px;width:60px;">Result</th>
                        <th style="border:1px solid #ddd;padding:5px;">Test Case</th>
                        <th style="border:1px solid #ddd;padding:5px;">Detail</th>
                    </tr>
                    ${rows}
                </table>
            </div>`;
    }
}
