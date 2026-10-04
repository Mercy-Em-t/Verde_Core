// api-service/analysis/useCaseAnalysis.js

/**
 * UseCaseAnalysis Class
 *
 * Structure:
 * 1. What Use Cases Are (concept & definition)
 * 2. Use Case Format & Elements
 * 3. Casual Use Case Format
 * 4. Use Cases in Sequence (sequence descriptions)
 * 5. Fully Dressed Use Case Format
 * 6. Applying Use Cases
 * 7. Use Case Practicum Tip
 * 8. Use Cases and Functional Requirements (traceability)
 * 9. Use Case Testing
 * 10. Creating Use Cases
 *     - 10a. Identify Major Use Cases
 *     - 10b. Elaborate on Use Cases
 */
class UseCaseAnalysis {
    constructor() {
        this.status = 'PENDING';

        // -----------------------------------------------
        // SECTION 1: Concept & Definition
        // -----------------------------------------------
        this.concept = {
            definition: '',          // What a use case is
            purpose: '',             // Why use cases are used in analysis
            keyPrinciples: []        // e.g. ['Actor-driven', 'Scenario-based', ...]
        };

        // -----------------------------------------------
        // SECTION 2: Use Case Format & Elements
        // -----------------------------------------------
        this.formatElements = {
            // The standard named elements of any use case
            elements: [
                'Use Case Name',
                'ID',
                'Brief Description',
                'Actors',
                'Preconditions',
                'Main Flow (Basic Course)',
                'Alternate Flows (Exception Courses)',
                'Postconditions'
            ],
            notes: ''
        };

        // -----------------------------------------------
        // SECTION 3: Casual Use Case Format
        // (Lightweight — paragraph prose, 2-3 sentences)
        // -----------------------------------------------
        this.casualUseCases = []; // { id, name, actor, description }

        // -----------------------------------------------
        // SECTION 4: Use Cases in Sequence
        // (Numbered steps, linear flow per use case)
        // -----------------------------------------------
        this.sequenceUseCases = []; // { id, name, actor, steps: ['Step 1...', ...] }

        // -----------------------------------------------
        // SECTION 5: Fully Dressed Use Case Format
        // (The complete, formal structured format)
        // -----------------------------------------------
        this.fullyDressedUseCases = []; 
        /* Each fully dressed use case:
        {
            id, name,
            briefDescription,
            actors: { primary, secondary },
            preconditions: [],
            mainFlow: [],           // Numbered interaction steps between actor & system
            alternateFlows: [       // { condition, steps: [] }
                { condition, steps }
            ],
            exceptionFlows: [       // { condition, steps: [] }
                { condition, steps }
            ],
            postconditions: [],
            businessRules: [],
            nonFunctionalReqs: [],
            linkedRequirementIds: [],
            openIssues: []
        }
        */

        // -----------------------------------------------
        // SECTION 6: Applying Use Cases
        // -----------------------------------------------
        this.applicationNotes = {
            howApplied: '',          // Notes on how this project applies use cases
            scopeBoundary: '',       // What is inside vs outside system scope
            levelOfDetail: ''        // Overview vs System vs Subsystem level
        };

        // -----------------------------------------------
        // SECTION 7: Use Case Practicum Tips
        // -----------------------------------------------
        this.practicumTips = []; // Analyst-added tips e.g. 'Keep use cases goal-oriented'

        // -----------------------------------------------
        // SECTION 8: Use Cases & Functional Requirements (Traceability Matrix)
        // -----------------------------------------------
        this.traceabilityMatrix = []; // { useCaseId, useCaseName, linkedFRIds: [] }

        // -----------------------------------------------
        // SECTION 9: Use Case Testing
        // -----------------------------------------------
        this.testing = {
            approach: '',           // How use cases will be used to drive testing
            testCases: []           // { useCaseId, testScenario, expectedOutcome, status }
                                    // status: PENDING, PASSED, FAILED
        };

        // -----------------------------------------------
        // SECTION 10: Creating Use Cases
        // -----------------------------------------------
        this.creation = {
            // 10a: Identify Major Use Cases
            identifiedUseCases: [], // { id, name, actor, goal, identified: true/false }

            // 10b: Elaborate on Use Cases
            // (elaboration means choosing the format: casual, sequence, or fully dressed)
            elaborationDecisions: [] // { useCaseId, chosenFormat, reason }
        };

        // Actors registry (shared across all use case formats)
        this.actors = []; // { id, name, type, description }
                          // type: Primary, Secondary, System
    }

    // =============================================
    // SECTION 1: Concept
    // =============================================
    setConcept(definition, purpose, keyPrinciples = []) {
        this.concept = { definition, purpose, keyPrinciples };
        if (this.status === 'PENDING') this.status = 'IN_PROGRESS';
    }

    // =============================================
    // SECTION 2: Format Elements
    // =============================================
    setFormatNotes(notes) {
        this.formatElements.notes = notes;
    }

    // =============================================
    // ACTORS (shared)
    // =============================================
    addActor(id, name, type, description) {
        // type: Primary, Secondary, System
        this.actors.push({ id, name, type, description });
        if (this.status === 'PENDING') this.status = 'IN_PROGRESS';
    }

    // =============================================
    // SECTION 3: Casual Use Case
    // =============================================
    addCasualUseCase(id, name, actor, description) {
        this.casualUseCases.push({ id, name, actor, description });
    }

    // =============================================
    // SECTION 4: Sequence Use Case
    // =============================================
    addSequenceUseCase(id, name, actor, steps = []) {
        this.sequenceUseCases.push({ id, name, actor, steps });
    }

    // =============================================
    // SECTION 5: Fully Dressed Use Case
    // =============================================
    addFullyDressedUseCase({
        id, name, briefDescription,
        primaryActor, secondaryActors = [],
        preconditions = [], mainFlow = [],
        alternateFlows = [], exceptionFlows = [],
        postconditions = [], businessRules = [],
        nonFunctionalReqs = [], linkedRequirementIds = [],
        openIssues = []
    }) {
        this.fullyDressedUseCases.push({
            id, name, briefDescription,
            actors: { primary: primaryActor, secondary: secondaryActors },
            preconditions, mainFlow,
            alternateFlows, exceptionFlows,
            postconditions, businessRules,
            nonFunctionalReqs, linkedRequirementIds,
            openIssues
        });
        if (this.status === 'PENDING') this.status = 'IN_PROGRESS';
    }

    // =============================================
    // SECTION 6: Application Notes
    // =============================================
    setApplicationNotes(howApplied, scopeBoundary, levelOfDetail) {
        this.applicationNotes = { howApplied, scopeBoundary, levelOfDetail };
    }

    // =============================================
    // SECTION 7: Practicum Tips
    // =============================================
    addPracticumTip(tip) {
        this.practicumTips.push(tip);
    }

    // =============================================
    // SECTION 8: Traceability Matrix
    // =============================================
    linkUseCaseToRequirements(useCaseId, useCaseName, linkedFRIds = []) {
        const existing = this.traceabilityMatrix.find(r => r.useCaseId === useCaseId);
        if (existing) {
            existing.linkedFRIds = [...new Set([...existing.linkedFRIds, ...linkedFRIds])];
        } else {
            this.traceabilityMatrix.push({ useCaseId, useCaseName, linkedFRIds });
        }
    }

    // =============================================
    // SECTION 9: Testing
    // =============================================
    setTestingApproach(approach) {
        this.testing.approach = approach;
    }

    addTestCase(useCaseId, testScenario, expectedOutcome) {
        this.testing.testCases.push({
            useCaseId, testScenario, expectedOutcome, status: 'PENDING'
        });
    }

    updateTestCaseStatus(useCaseId, testScenario, status) {
        // status: PENDING, PASSED, FAILED
        const tc = this.testing.testCases.find(
            t => t.useCaseId === useCaseId && t.testScenario === testScenario
        );
        if (tc) tc.status = status;
    }

    // =============================================
    // SECTION 10: Creating Use Cases
    // =============================================
    // 10a: Identify
    identifyUseCase(id, name, actor, goal) {
        this.creation.identifiedUseCases.push({ id, name, actor, goal, identified: true });
        if (this.status === 'PENDING') this.status = 'IN_PROGRESS';
    }

    // 10b: Elaborate
    elaborateUseCase(useCaseId, chosenFormat, reason) {
        // chosenFormat: 'casual' | 'sequence' | 'fullyDressed'
        this.creation.elaborationDecisions.push({ useCaseId, chosenFormat, reason });
    }

    finalize() { this.status = 'COMPLETED'; }

    // =============================================
    // toJSON
    // =============================================
    toJSON() {
        return {
            status: this.status,
            concept: this.concept,
            formatElements: this.formatElements,
            actors: this.actors,
            casualUseCases: this.casualUseCases,
            sequenceUseCases: this.sequenceUseCases,
            fullyDressedUseCases: this.fullyDressedUseCases,
            applicationNotes: this.applicationNotes,
            practicumTips: this.practicumTips,
            traceabilityMatrix: this.traceabilityMatrix,
            testing: this.testing,
            creation: this.creation
        };
    }

    // =============================================
    // renderAsHTML
    // =============================================
    renderAsHTML() {
        // --- Actors ---
        const actorRows = this.actors.map(a => `
            <tr>
                <td style="border:1px solid #ccc;padding:5px;">${a.id}</td>
                <td style="border:1px solid #ccc;padding:5px;"><strong>${a.name}</strong></td>
                <td style="border:1px solid #ccc;padding:5px;">${a.type}</td>
                <td style="border:1px solid #ccc;padding:5px;">${a.description}</td>
            </tr>`).join('');

        // --- Casual UCs ---
        const casualCards = this.casualUseCases.map(uc => `
            <div style="border:1px solid #ddd;padding:8px;margin-bottom:6px;border-radius:4px;">
                <strong>${uc.id}: ${uc.name}</strong> <em style="color:#666;">(Actor: ${uc.actor})</em>
                <p style="margin:4px 0;">${uc.description}</p>
            </div>`).join('') || '<p style="color:#aaa;">None defined.</p>';

        // --- Sequence UCs ---
        const seqCards = this.sequenceUseCases.map(uc => `
            <div style="border:1px solid #ddd;padding:8px;margin-bottom:6px;border-radius:4px;">
                <strong>${uc.id}: ${uc.name}</strong> <em style="color:#666;">(Actor: ${uc.actor})</em>
                <ol style="margin:4px 0;">${uc.steps.map(s => `<li>${s}</li>`).join('')}</ol>
            </div>`).join('') || '<p style="color:#aaa;">None defined.</p>';

        // --- Fully Dressed UCs ---
        const fdCards = this.fullyDressedUseCases.map(uc => {
            const altFlows = uc.alternateFlows.map(af =>
                `<li><strong>${af.condition}:</strong> ${af.steps.join(' → ')}</li>`
            ).join('');
            const excFlows = uc.exceptionFlows.map(ef =>
                `<li><strong>${ef.condition}:</strong> ${ef.steps.join(' → ')}</li>`
            ).join('');

            return `
            <div style="border:1px solid #b0c4de;padding:12px;margin-bottom:12px;border-radius:4px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <strong style="font-size:1.05em;">${uc.id}: ${uc.name}</strong>
                    ${uc.linkedRequirementIds.length
                        ? `<span style="font-size:0.8em;color:#0056b3;">↔ FRs: ${uc.linkedRequirementIds.join(', ')}</span>`
                        : ''}
                </div>
                <p style="margin:5px 0;color:#555;">${uc.briefDescription}</p>
                <table style="width:100%;border-collapse:collapse;font-size:0.88em;">
                    <tr>
                        <td style="border:1px solid #eee;padding:4px;width:30%;background:#f8f8f8;"><strong>Primary Actor</strong></td>
                        <td style="border:1px solid #eee;padding:4px;">${uc.actors.primary}</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #eee;padding:4px;background:#f8f8f8;"><strong>Secondary Actors</strong></td>
                        <td style="border:1px solid #eee;padding:4px;">${uc.actors.secondary.join(', ') || 'None'}</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #eee;padding:4px;background:#f8f8f8;"><strong>Preconditions</strong></td>
                        <td style="border:1px solid #eee;padding:4px;">${uc.preconditions.join('; ') || 'None'}</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #eee;padding:4px;background:#f8f8f8;"><strong>Main Flow</strong></td>
                        <td style="border:1px solid #eee;padding:4px;">
                            <ol style="margin:0;padding-left:15px;">${uc.mainFlow.map(s => `<li>${s}</li>`).join('')}</ol>
                        </td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #eee;padding:4px;background:#f8f8f8;"><strong>Alternate Flows</strong></td>
                        <td style="border:1px solid #eee;padding:4px;"><ul style="margin:0;padding-left:15px;">${altFlows || '<li>None</li>'}</ul></td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #eee;padding:4px;background:#f8f8f8;"><strong>Exception Flows</strong></td>
                        <td style="border:1px solid #eee;padding:4px;"><ul style="margin:0;padding-left:15px;">${excFlows || '<li>None</li>'}</ul></td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #eee;padding:4px;background:#f8f8f8;"><strong>Postconditions</strong></td>
                        <td style="border:1px solid #eee;padding:4px;">${uc.postconditions.join('; ') || 'None'}</td>
                    </tr>
                    ${uc.businessRules.length ? `
                    <tr>
                        <td style="border:1px solid #eee;padding:4px;background:#f8f8f8;"><strong>Business Rules</strong></td>
                        <td style="border:1px solid #eee;padding:4px;">${uc.businessRules.join('; ')}</td>
                    </tr>` : ''}
                    ${uc.openIssues.length ? `
                    <tr>
                        <td style="border:1px solid #eee;padding:4px;background:#fff3cd;"><strong>Open Issues</strong></td>
                        <td style="border:1px solid #eee;padding:4px;color:#856404;">${uc.openIssues.join('; ')}</td>
                    </tr>` : ''}
                </table>
            </div>`;
        }).join('') || '<p style="color:#aaa;">None defined.</p>';

        // --- Traceability Matrix ---
        const traceRows = this.traceabilityMatrix.map(t => `
            <tr>
                <td style="border:1px solid #ccc;padding:5px;">${t.useCaseId}</td>
                <td style="border:1px solid #ccc;padding:5px;">${t.useCaseName}</td>
                <td style="border:1px solid #ccc;padding:5px;">${t.linkedFRIds.join(', ') || '—'}</td>
            </tr>`).join('');

        // --- Test Cases ---
        const statusColor = s => s === 'PASSED' ? 'green' : s === 'FAILED' ? 'red' : '#888';
        const tcRows = this.testing.testCases.map(t => `
            <tr>
                <td style="border:1px solid #ccc;padding:5px;">${t.useCaseId}</td>
                <td style="border:1px solid #ccc;padding:5px;">${t.testScenario}</td>
                <td style="border:1px solid #ccc;padding:5px;">${t.expectedOutcome}</td>
                <td style="border:1px solid #ccc;padding:5px;color:${statusColor(t.status)};font-weight:bold;">${t.status}</td>
            </tr>`).join('');

        // --- Identified UCs (10a) ---
        const identifiedRows = this.creation.identifiedUseCases.map(u => `
            <tr>
                <td style="border:1px solid #ccc;padding:5px;">${u.id}</td>
                <td style="border:1px solid #ccc;padding:5px;"><strong>${u.name}</strong></td>
                <td style="border:1px solid #ccc;padding:5px;">${u.actor}</td>
                <td style="border:1px solid #ccc;padding:5px;">${u.goal}</td>
            </tr>`).join('');

        // --- Elaboration Decisions (10b) ---
        const elabRows = this.creation.elaborationDecisions.map(e => `
            <tr>
                <td style="border:1px solid #ccc;padding:5px;">${e.useCaseId}</td>
                <td style="border:1px solid #ccc;padding:5px;text-transform:capitalize;">${e.chosenFormat}</td>
                <td style="border:1px solid #ccc;padding:5px;">${e.reason}</td>
            </tr>`).join('');

        return `
            <div style="border:1px solid #ccc;padding:15px;border-radius:5px;margin-bottom:20px;">
                <h4 style="margin-top:0;">2. Use Case Analysis</h4>

                <h5>2.1 What Use Cases Are</h5>
                <div style="background:#f8f9fa;padding:10px;border-radius:4px;margin-bottom:12px;">
                    <p style="margin:0;"><strong>Definition:</strong> ${this.concept.definition || '<em>Not yet defined</em>'}</p>
                    <p style="margin:5px 0;"><strong>Purpose:</strong> ${this.concept.purpose || '—'}</p>
                    ${this.concept.keyPrinciples.length
                        ? `<p style="margin:5px 0;"><strong>Key Principles:</strong> ${this.concept.keyPrinciples.join(', ')}</p>`
                        : ''}
                </div>

                <h5>2.2 Use Case Format & Elements</h5>
                <ul style="columns:2;margin-bottom:12px;">
                    ${this.formatElements.elements.map(e => `<li>${e}</li>`).join('')}
                </ul>
                ${this.formatElements.notes ? `<p><em>${this.formatElements.notes}</em></p>` : ''}

                <h5>Actors</h5>
                <table style="width:100%;border-collapse:collapse;margin-bottom:15px;">
                    <tr style="background:#f4f4f4;">
                        <th style="border:1px solid #ddd;padding:5px;">ID</th>
                        <th style="border:1px solid #ddd;padding:5px;">Name</th>
                        <th style="border:1px solid #ddd;padding:5px;">Type</th>
                        <th style="border:1px solid #ddd;padding:5px;">Description</th>
                    </tr>
                    ${actorRows || '<tr><td colspan="4" style="text-align:center;padding:8px;">No actors defined yet.</td></tr>'}
                </table>

                <h5>2.3 Casual Use Case Format</h5>
                ${casualCards}

                <h5>2.4 Use Cases in Sequence</h5>
                ${seqCards}

                <h5>2.5 Fully Dressed Use Case Format</h5>
                ${fdCards}

                <h5>2.6 Applying Use Cases</h5>
                <div style="background:#f8f9fa;padding:10px;border-radius:4px;margin-bottom:12px;">
                    <p style="margin:3px 0;"><strong>How Applied:</strong> ${this.applicationNotes.howApplied || '—'}</p>
                    <p style="margin:3px 0;"><strong>Scope Boundary:</strong> ${this.applicationNotes.scopeBoundary || '—'}</p>
                    <p style="margin:3px 0;"><strong>Level of Detail:</strong> ${this.applicationNotes.levelOfDetail || '—'}</p>
                </div>

                <h5>2.7 Use Case Practicum Tips</h5>
                <ul>
                    ${this.practicumTips.map(t => `<li>${t}</li>`).join('') || '<li style="color:#aaa;">No tips recorded.</li>'}
                </ul>

                <h5>2.8 Use Cases & Functional Requirements (Traceability)</h5>
                <table style="width:100%;border-collapse:collapse;margin-bottom:15px;">
                    <tr style="background:#f4f4f4;">
                        <th style="border:1px solid #ddd;padding:5px;">UC ID</th>
                        <th style="border:1px solid #ddd;padding:5px;">Use Case Name</th>
                        <th style="border:1px solid #ddd;padding:5px;">Linked FR IDs</th>
                    </tr>
                    ${traceRows || '<tr><td colspan="3" style="text-align:center;padding:8px;">No traceability mapped yet.</td></tr>'}
                </table>

                <h5>2.9 Use Case Testing</h5>
                <p><strong>Approach:</strong> ${this.testing.approach || '<em>Not defined</em>'}</p>
                <table style="width:100%;border-collapse:collapse;margin-bottom:15px;">
                    <tr style="background:#f4f4f4;">
                        <th style="border:1px solid #ddd;padding:5px;">UC ID</th>
                        <th style="border:1px solid #ddd;padding:5px;">Test Scenario</th>
                        <th style="border:1px solid #ddd;padding:5px;">Expected Outcome</th>
                        <th style="border:1px solid #ddd;padding:5px;">Status</th>
                    </tr>
                    ${tcRows || '<tr><td colspan="4" style="text-align:center;padding:8px;">No test cases defined yet.</td></tr>'}
                </table>

                <h5>2.10 Creating Use Cases</h5>

                <h6>a) Identified Major Use Cases</h6>
                <table style="width:100%;border-collapse:collapse;margin-bottom:12px;">
                    <tr style="background:#f4f4f4;">
                        <th style="border:1px solid #ddd;padding:5px;">ID</th>
                        <th style="border:1px solid #ddd;padding:5px;">Name</th>
                        <th style="border:1px solid #ddd;padding:5px;">Actor</th>
                        <th style="border:1px solid #ddd;padding:5px;">Goal</th>
                    </tr>
                    ${identifiedRows || '<tr><td colspan="4" style="text-align:center;padding:8px;">None identified yet.</td></tr>'}
                </table>

                <h6>b) Elaboration Decisions</h6>
                <table style="width:100%;border-collapse:collapse;">
                    <tr style="background:#f4f4f4;">
                        <th style="border:1px solid #ddd;padding:5px;">UC ID</th>
                        <th style="border:1px solid #ddd;padding:5px;">Chosen Format</th>
                        <th style="border:1px solid #ddd;padding:5px;">Reason</th>
                    </tr>
                    ${elabRows || '<tr><td colspan="3" style="text-align:center;padding:8px;">No elaboration decisions yet.</td></tr>'}
                </table>
            </div>`;
    }
}

export default UseCaseAnalysis;
