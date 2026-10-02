// api-service/analysis/requirementsDetermination.js

/**
 * RequirementsDetermination Class
 * 
 * Structure:
 * 1. What Requirements Are (definition & classification)
 * 2. Process of Determining Requirements (workflow steps)
 * 3. Requirements Definition Statement
 * 4. Requirement Elicitation Techniques
 *    - Interviews, JAD, Questionnaires, Document Analysis, Observation
 *    - Selected Technique Justification
 * 5. Requirement Analysis Strategies
 *    - Problem Analysis, Root Cause, Duration, Activity-Based Costing,
 *      Informal Benchmarking, Outcome Analysis, Technology Analysis,
 *      Activity Elimination, Compare Analysis
 * 
 * Deliverables:
 *    - Requirements Definition Document
 *    - System Proposal (compiled from this + all Analysis sections)
 */
class RequirementsDetermination {
    constructor() {
        this.status = 'PENDING';

        // -----------------------------------------------
        // SECTION 1: Definition of Requirements
        // -----------------------------------------------
        this.definition = {
            whatRequirementsAre: '',        // Formal definition entered by the analyst
            typesOfRequirements: []         // e.g. Functional, Non-Functional, Business, Technical
        };

        // -----------------------------------------------
        // SECTION 2: Process of Determining Requirements
        // -----------------------------------------------
        this.determinationProcess = {
            steps: [],  // Ordered list of steps the team is following
            currentStep: 0
        };

        // -----------------------------------------------
        // SECTION 3: Requirements Definition Statement
        // -----------------------------------------------
        this.definitionStatement = {
            projectName: '',
            preparedBy: '',
            date: null,
            overview: '',
            scope: '',
            constraints: [],
            assumptions: []
        };

        // -----------------------------------------------
        // SECTION 4: Elicitation Techniques (Data Collection)
        // -----------------------------------------------
        this.elicitation = {
            interviews: [],       // { participant, role, date, notes, keyFindings }
            jadSessions: [],      // { facilitator, participants, date, agenda, outcomes }
            questionnaires: [],   // { title, targetGroup, questionCount, responseCount, summary }
            documentAnalysis: [], // { documentName, source, date, relevantData }
            observations: [],     // { observer, process, date, findings }
            selectedTechniqueJustification: '' // Why these techniques were chosen for this project
        };

        // -----------------------------------------------
        // SECTION 5: Analysis Strategies
        // -----------------------------------------------
        this.analysisStrategies = {
            problemAnalysis: {
                applied: false,
                findings: ''
                // Understand the AS-IS system and identify specific problems
            },
            rootCauseAnalysis: {
                applied: false,
                causes: [],     // { problem, rootCause, evidence }
                findings: ''
                // Dig to the underlying cause of each problem
            },
            durationAnalysis: {
                applied: false,
                activities: [], // { activity, totalDuration, valueAddedDuration, percentageValueAdded }
                findings: ''
                // Compare total duration vs. value-added duration of activities
            },
            activityBasedCosting: {
                applied: false,
                activities: [], // { activity, cost, valueAdded }
                findings: ''
                // Assign costs to activities to identify waste
            },
            informalBenchmarking: {
                applied: false,
                comparisons: [], // { competitor, practice, ourPractice, gap }
                findings: ''
                // Compare with other organizations' best practices
            },
            outcomeAnalysis: {
                applied: false,
                desiredOutcomes: [],
                findings: ''
                // What does the customer really want to achieve?
            },
            technologyAnalysis: {
                applied: false,
                technologies: [], // { technology, applicability, feasibility }
                findings: ''
                // What new technologies could improve the process?
            },
            activityElimination: {
                applied: false,
                activitiesToEliminate: [], // { activity, reason }
                findings: ''
                // Which activities add no value and can be removed?
            },
            compareAnalysisStrategies: {
                applied: false,
                strategiesCompared: [],
                selectedStrategy: '',
                justification: ''
                // Compare the strategies used and justify the combination chosen
            }
        };

        // -----------------------------------------------
        // SECTION 6: Consolidated Requirements List
        // -----------------------------------------------
        this.functionalRequirements = [];    // { id, description, priority, source }
        this.nonFunctionalRequirements = []; // { id, description, category, source }

        // -----------------------------------------------
        // DELIVERABLE: Requirements Definition Document
        // -----------------------------------------------
        this.requirementsDefinitionDocument = {
            status: 'NOT_CREATED', // NOT_CREATED, DRAFT, APPROVED
            compiledAt: null,
            approvedBy: null,
            approvedAt: null
        };
    }

    // =============================================
    // SECTION 1: Definition
    // =============================================
    setDefinition(whatRequirementsAre, typesOfRequirements) {
        this.definition.whatRequirementsAre = whatRequirementsAre;
        this.definition.typesOfRequirements = typesOfRequirements;
        if (this.status === 'PENDING') this.status = 'IN_PROGRESS';
    }

    // =============================================
    // SECTION 2: Determination Process
    // =============================================
    setDeterminationSteps(steps) {
        this.determinationProcess.steps = steps;
    }

    advanceProcessStep() {
        if (this.determinationProcess.currentStep < this.determinationProcess.steps.length - 1) {
            this.determinationProcess.currentStep++;
        }
    }

    // =============================================
    // SECTION 3: Definition Statement
    // =============================================
    setDefinitionStatement({ projectName, preparedBy, overview, scope, constraints = [], assumptions = [] }) {
        this.definitionStatement = {
            projectName,
            preparedBy,
            date: new Date().toISOString(),
            overview,
            scope,
            constraints,
            assumptions
        };
    }

    // =============================================
    // SECTION 4: Elicitation Technique Methods
    // =============================================
    addInterview(participant, role, date, notes, keyFindings) {
        this.elicitation.interviews.push({ participant, role, date, notes, keyFindings });
        if (this.status === 'PENDING') this.status = 'IN_PROGRESS';
    }

    addJADSession(facilitator, participants, date, agenda, outcomes) {
        this.elicitation.jadSessions.push({ facilitator, participants, date, agenda, outcomes });
        if (this.status === 'PENDING') this.status = 'IN_PROGRESS';
    }

    addQuestionnaire(title, targetGroup, questionCount, responseCount, summary) {
        this.elicitation.questionnaires.push({ title, targetGroup, questionCount, responseCount, summary });
        if (this.status === 'PENDING') this.status = 'IN_PROGRESS';
    }

    addDocumentAnalysis(documentName, source, date, relevantData) {
        this.elicitation.documentAnalysis.push({ documentName, source, date, relevantData });
        if (this.status === 'PENDING') this.status = 'IN_PROGRESS';
    }

    addObservation(observer, process, date, findings) {
        this.elicitation.observations.push({ observer, process, date, findings });
        if (this.status === 'PENDING') this.status = 'IN_PROGRESS';
    }

    setSelectedTechniqueJustification(text) {
        this.elicitation.selectedTechniqueJustification = text;
    }

    // =============================================
    // SECTION 5: Analysis Strategy Methods
    // =============================================
    applyStrategy(strategyKey, data) {
        if (!this.analysisStrategies[strategyKey]) {
            throw new Error(`Unknown analysis strategy: ${strategyKey}`);
        }
        this.analysisStrategies[strategyKey] = {
            ...this.analysisStrategies[strategyKey],
            applied: true,
            ...data
        };
    }

    // =============================================
    // SECTION 6: Requirements
    // =============================================
    addFunctionalRequirement(id, description, priority, source) {
        this.functionalRequirements.push({ id, description, priority, source });
    }

    addNonFunctionalRequirement(id, description, category, source) {
        this.nonFunctionalRequirements.push({ id, description, category, source });
    }

    // =============================================
    // DELIVERABLE: Requirements Definition Document
    // =============================================
    compileRequirementsDocument() {
        const hasRequirements = this.functionalRequirements.length > 0;
        const hasDefinitionStatement = !!this.definitionStatement.projectName;

        if (!hasRequirements || !hasDefinitionStatement) {
            return { success: false, reason: 'Cannot compile: Add at least one functional requirement and complete the Definition Statement.' };
        }

        this.requirementsDefinitionDocument.status = 'DRAFT';
        this.requirementsDefinitionDocument.compiledAt = new Date().toISOString();
        return { success: true, reason: 'Requirements Definition Document compiled as DRAFT.' };
    }

    approveRequirementsDocument(adminName) {
        if (this.requirementsDefinitionDocument.status !== 'DRAFT') {
            throw new Error('Document must be compiled before it can be approved.');
        }
        this.requirementsDefinitionDocument.status = 'APPROVED';
        this.requirementsDefinitionDocument.approvedBy = adminName;
        this.requirementsDefinitionDocument.approvedAt = new Date().toISOString();
    }

    finalize() { this.status = 'COMPLETED'; }

    // =============================================
    // toJSON
    // =============================================
    toJSON() {
        return {
            status: this.status,
            definition: this.definition,
            determinationProcess: this.determinationProcess,
            definitionStatement: this.definitionStatement,
            elicitation: this.elicitation,
            analysisStrategies: this.analysisStrategies,
            functionalRequirements: this.functionalRequirements,
            nonFunctionalRequirements: this.nonFunctionalRequirements,
            requirementsDefinitionDocument: this.requirementsDefinitionDocument
        };
    }

    // =============================================
    // renderAsHTML
    // =============================================
    renderAsHTML() {
        const priorityColor = p => p === 'High' ? 'red' : p === 'Medium' ? 'orange' : 'green';

        // --- Section 1 ---
        const defHTML = `
            <div style="background:#f8f9fa;padding:10px;border-radius:4px;margin-bottom:12px;">
                <strong>What Requirements Are:</strong>
                <p style="margin:4px 0;">${this.definition.whatRequirementsAre || '<em>Not yet defined</em>'}</p>
                <strong>Types:</strong> ${this.definition.typesOfRequirements.join(', ') || '<em>None listed</em>'}
            </div>`;

        // --- Section 2 ---
        const procHTML = this.determinationProcess.steps.length
            ? `<ol>${this.determinationProcess.steps.map((s, i) =>
                `<li style="color:${i <= this.determinationProcess.currentStep ? 'green' : '#aaa'}">${s}</li>`
              ).join('')}</ol>`
            : '<p style="color:#aaa;">No steps defined.</p>';

        // --- Section 3 ---
        const stmtHTML = this.definitionStatement.projectName ? `
            <div style="background:#f8f9fa;padding:10px;border-radius:4px;margin-bottom:12px;">
                <strong>Project:</strong> ${this.definitionStatement.projectName} &nbsp;|&nbsp;
                <strong>Prepared by:</strong> ${this.definitionStatement.preparedBy} &nbsp;|&nbsp;
                <strong>Date:</strong> ${this.definitionStatement.date ? new Date(this.definitionStatement.date).toLocaleDateString() : '—'}<br/>
                <strong>Overview:</strong> ${this.definitionStatement.overview}<br/>
                <strong>Scope:</strong> ${this.definitionStatement.scope}<br/>
                <strong>Constraints:</strong> ${this.definitionStatement.constraints.join('; ') || 'None'}<br/>
                <strong>Assumptions:</strong> ${this.definitionStatement.assumptions.join('; ') || 'None'}
            </div>` : '<p style="color:#aaa;">Definition Statement not yet completed.</p>';

        // --- Section 4 Elicitation summary ---
        const elicSummary = [
            `Interviews: <strong>${this.elicitation.interviews.length}</strong>`,
            `JAD Sessions: <strong>${this.elicitation.jadSessions.length}</strong>`,
            `Questionnaires: <strong>${this.elicitation.questionnaires.length}</strong>`,
            `Document Reviews: <strong>${this.elicitation.documentAnalysis.length}</strong>`,
            `Observations: <strong>${this.elicitation.observations.length}</strong>`
        ].join(' &nbsp;|&nbsp; ');

        // --- Section 5 Strategies ---
        const stratRows = Object.entries(this.analysisStrategies).map(([key, val]) => {
            const label = key.replace(/([A-Z])/g, ' $1').trim();
            return `<tr>
                <td style="border:1px solid #ccc;padding:5px;">${label}</td>
                <td style="border:1px solid #ccc;padding:5px;text-align:center;">${val.applied ? '✅ Applied' : '—'}</td>
                <td style="border:1px solid #ccc;padding:5px;">${val.findings || val.justification || ''}</td>
            </tr>`;
        }).join('');

        // --- Requirements ---
        const frRows = this.functionalRequirements.map(r => `
            <tr>
                <td style="border:1px solid #ccc;padding:5px;">${r.id}</td>
                <td style="border:1px solid #ccc;padding:5px;">${r.description}</td>
                <td style="border:1px solid #ccc;padding:5px;color:${priorityColor(r.priority)};font-weight:bold;">${r.priority}</td>
                <td style="border:1px solid #ccc;padding:5px;">${r.source}</td>
            </tr>`).join('');

        const nfrRows = this.nonFunctionalRequirements.map(r => `
            <tr>
                <td style="border:1px solid #ccc;padding:5px;">${r.id}</td>
                <td style="border:1px solid #ccc;padding:5px;">${r.description}</td>
                <td style="border:1px solid #ccc;padding:5px;">${r.category}</td>
                <td style="border:1px solid #ccc;padding:5px;">${r.source}</td>
            </tr>`).join('');

        // --- RDD Stamp ---
        const rdd = this.requirementsDefinitionDocument;
        const rddStamp = rdd.status === 'APPROVED'
            ? `<div style="color:green;border:2px solid green;padding:8px;margin-bottom:10px;">
                ✅ <strong>Requirements Definition Document — OFFICIAL</strong><br/>
                Approved by: ${rdd.approvedBy} | ${new Date(rdd.approvedAt).toLocaleString()}
               </div>`
            : rdd.status === 'DRAFT'
            ? `<div style="color:orange;border:2px dashed orange;padding:8px;margin-bottom:10px;">
                ⏳ <strong>Requirements Definition Document — DRAFT</strong><br/>
                Compiled: ${new Date(rdd.compiledAt).toLocaleString()} — Pending approval.
               </div>`
            : `<div style="color:red;border:2px dashed red;padding:8px;margin-bottom:10px;">
                ❌ <strong>Requirements Definition Document — Not Yet Compiled</strong>
               </div>`;

        return `
            <div style="border:1px solid #ccc;padding:15px;border-radius:5px;margin-bottom:20px;">
                <h4 style="margin-top:0;">1. Requirements Determination</h4>
                ${rddStamp}

                <h5>1.1 What Requirements Are</h5>
                ${defHTML}

                <h5>1.2 Process of Determining Requirements</h5>
                ${procHTML}

                <h5>1.3 Requirements Definition Statement</h5>
                ${stmtHTML}

                <h5>1.4 Elicitation Techniques Used</h5>
                <div style="background:#f8f9fa;padding:8px;margin-bottom:8px;border-radius:4px;font-size:0.9em;">${elicSummary}</div>
                ${this.elicitation.selectedTechniqueJustification
                    ? `<p><strong>Why these techniques were selected:</strong> ${this.elicitation.selectedTechniqueJustification}</p>`
                    : ''}

                <h5>1.5 Analysis Strategies Applied</h5>
                <table style="width:100%;border-collapse:collapse;margin-bottom:15px;">
                    <tr style="background:#f4f4f4;">
                        <th style="border:1px solid #ddd;padding:5px;">Strategy</th>
                        <th style="border:1px solid #ddd;padding:5px;">Status</th>
                        <th style="border:1px solid #ddd;padding:5px;">Findings / Notes</th>
                    </tr>
                    ${stratRows}
                </table>

                <h5>1.6 Functional Requirements</h5>
                <table style="width:100%;border-collapse:collapse;margin-bottom:12px;">
                    <tr style="background:#f4f4f4;">
                        <th style="border:1px solid #ddd;padding:5px;">ID</th>
                        <th style="border:1px solid #ddd;padding:5px;">Description</th>
                        <th style="border:1px solid #ddd;padding:5px;">Priority</th>
                        <th style="border:1px solid #ddd;padding:5px;">Source</th>
                    </tr>
                    ${frRows || '<tr><td colspan="4" style="text-align:center;padding:8px;">None added yet.</td></tr>'}
                </table>

                <h5>1.7 Non-Functional Requirements</h5>
                <table style="width:100%;border-collapse:collapse;">
                    <tr style="background:#f4f4f4;">
                        <th style="border:1px solid #ddd;padding:5px;">ID</th>
                        <th style="border:1px solid #ddd;padding:5px;">Description</th>
                        <th style="border:1px solid #ddd;padding:5px;">Category</th>
                        <th style="border:1px solid #ddd;padding:5px;">Source</th>
                    </tr>
                    ${nfrRows || '<tr><td colspan="4" style="text-align:center;padding:8px;">None added yet.</td></tr>'}
                </table>
            </div>`;
    }
}

export default RequirementsDetermination;
