// api-service/analysis/processModeling.js

/**
 * ProcessModeling Class
 * 
 * Structure:
 * 1. Introduction to Process Modeling
 * 2. Data Flow Diagrams (Theory & Basics)
 *    - Reading DFDs
 *    - Elements of DFDs
 *    - Using DFDs to Define Business Processes
 *    - Process Descriptions
 * 3. Creating Data Flow Diagrams (The Practice)
 *    - Context Diagram
 *    - Level 0 DFD
 *    - Level 1 DFDs & Below
 * 4. Developing the Process Model
 *    - DFD Fragments
 *    - Level 2 DFDs & Below
 *    - Validating the Data Flow Diagrams
 */
class ProcessModeling {
    constructor() {
        this.status = 'PENDING';

        // -----------------------------------------------
        // SECTION 1: Introduction
        // -----------------------------------------------
        this.introduction = {
            definition: '',
            purpose: ''
        };

        // -----------------------------------------------
        // SECTION 2: Data Flow Diagrams (Theory & Basics)
        // -----------------------------------------------
        this.dfdBasics = {
            readingDFDs: '',             // Guidelines on how to read DFDs
            elements: {                  // Standard elements used
                processes: 'An activity or a function performed for some specific business reason',
                dataFlows: 'A single piece of data, or a logical collection of several pieces of information',
                dataStores: 'A collection of data that is stored in some way',
                externalEntities: 'A person, organization, or system that is external to the system but interacts with it'
            },
            definingBusinessProcesses: '', // How DFDs map to business processes
            processDescriptions: []      // { processId, type, description } (Type: Structured English, Decision Tree, Decision Table)
        };

        // -----------------------------------------------
        // SECTION 3: Creating Data Flow Diagrams
        // -----------------------------------------------
        this.contextDiagram = {
            systemName: '',
            externalEntities: [], // { id, name, description }
            dataFlowsIn: [],      // { from, description }
            dataFlowsOut: []      // { to, description }
        };

        this.level0DFD = {
            processes: [],   // { id, name, description }
            dataStores: [],  // { id, name }
            dataFlows: []    // { from, to, description }
        };

        this.level1DFDs = {}; // { [parentProcessId]: { processes, dataStores, dataFlows } }

        // -----------------------------------------------
        // SECTION 4: Developing the Process Model
        // -----------------------------------------------
        this.dfdFragments = []; // { id, name, description, process, dataFlowsIn, dataFlowsOut }
        
        this.level2DFDs = {}; // { [parentProcessId]: { processes, dataStores, dataFlows } }

        this.validation = {
            syntaxErrorsChecked: false,   // Layout, naming, balancing rules
            semanticsErrorsChecked: false, // Does the model accurately reflect the business?
            issuesFound: [],              // { issue, resolution }
            isValidated: false
        };
    }

    // =============================================
    // SECTION 1: Introduction
    // =============================================
    setIntroduction(definition, purpose) {
        this.introduction = { definition, purpose };
        if (this.status === 'PENDING') this.status = 'IN_PROGRESS';
    }

    // =============================================
    // SECTION 2: DFD Basics
    // =============================================
    setDFDBasicsNotes(readingDFDs, definingBusinessProcesses) {
        this.dfdBasics.readingDFDs = readingDFDs;
        this.dfdBasics.definingBusinessProcesses = definingBusinessProcesses;
    }

    addProcessDescription(processId, type, description) {
        // type: Structured English, Decision Tree, Decision Table
        this.dfdBasics.processDescriptions.push({ processId, type, description });
    }

    // =============================================
    // SECTION 3: Creating DFDs
    // =============================================
    // Context Diagram
    setContextDiagram(systemName, externalEntities = [], dataFlowsIn = [], dataFlowsOut = []) {
        this.contextDiagram = { systemName, externalEntities, dataFlowsIn, dataFlowsOut };
        if (this.status === 'PENDING') this.status = 'IN_PROGRESS';
    }

    // Level 0 DFD
    addLevel0Process(id, name, description) {
        this.level0DFD.processes.push({ id, name, description });
    }
    addLevel0DataStore(id, name) {
        this.level0DFD.dataStores.push({ id, name });
    }
    addLevel0DataFlow(from, to, description) {
        this.level0DFD.dataFlows.push({ from, to, description });
    }

    // Level 1 DFD
    initLevel1(parentProcessId) {
        if (!this.level1DFDs[parentProcessId]) {
            this.level1DFDs[parentProcessId] = { processes: [], dataStores: [], dataFlows: [] };
        }
    }
    addLevel1Process(parentProcessId, id, name, description) {
        this.initLevel1(parentProcessId);
        this.level1DFDs[parentProcessId].processes.push({ id, name, description });
    }
    addLevel1DataStore(parentProcessId, id, name) {
        this.initLevel1(parentProcessId);
        this.level1DFDs[parentProcessId].dataStores.push({ id, name });
    }
    addLevel1DataFlow(parentProcessId, from, to, description) {
        this.initLevel1(parentProcessId);
        this.level1DFDs[parentProcessId].dataFlows.push({ from, to, description });
    }

    // =============================================
    // SECTION 4: Developing the Process Model
    // =============================================
    // DFD Fragments
    addDFDFragment(id, name, description, process, dataFlowsIn = [], dataFlowsOut = []) {
        this.dfdFragments.push({ id, name, description, process, dataFlowsIn, dataFlowsOut });
    }

    // Level 2 DFDs
    initLevel2(parentProcessId) {
        if (!this.level2DFDs[parentProcessId]) {
            this.level2DFDs[parentProcessId] = { processes: [], dataStores: [], dataFlows: [] };
        }
    }
    addLevel2Process(parentProcessId, id, name, description) {
        this.initLevel2(parentProcessId);
        this.level2DFDs[parentProcessId].processes.push({ id, name, description });
    }
    addLevel2DataStore(parentProcessId, id, name) {
        this.initLevel2(parentProcessId);
        this.level2DFDs[parentProcessId].dataStores.push({ id, name });
    }
    addLevel2DataFlow(parentProcessId, from, to, description) {
        this.initLevel2(parentProcessId);
        this.level2DFDs[parentProcessId].dataFlows.push({ from, to, description });
    }

    // Validation
    validateDFD(syntaxChecked, semanticsChecked, issues = []) {
        this.validation.syntaxErrorsChecked = syntaxChecked;
        this.validation.semanticsErrorsChecked = semanticsChecked;
        this.validation.issuesFound = issues;
        this.validation.isValidated = syntaxChecked && semanticsChecked && issues.every(i => i.resolution);
    }

    finalize() { this.status = 'COMPLETED'; }

    // =============================================
    // toJSON
    // =============================================
    toJSON() {
        return {
            status: this.status,
            introduction: this.introduction,
            dfdBasics: this.dfdBasics,
            contextDiagram: this.contextDiagram,
            level0DFD: this.level0DFD,
            level1DFDs: this.level1DFDs,
            dfdFragments: this.dfdFragments,
            level2DFDs: this.level2DFDs,
            validation: this.validation
        };
    }

    // =============================================
    // renderAsHTML
    // =============================================
    _renderDFDTable(processes, dataStores, dataFlows) {
        const procRows = processes.map(p => `
            <tr>
                <td style="border:1px solid #ccc;padding:5px;"><strong>${p.id}</strong></td>
                <td style="border:1px solid #ccc;padding:5px;">${p.name}</td>
                <td style="border:1px solid #ccc;padding:5px;">${p.description}</td>
            </tr>`).join('');

        const storeRows = dataStores.map(d => `
            <tr><td colspan="3" style="border:1px solid #ccc;padding:5px;background:#f9f9f9;">
                🗄 <strong>${d.id}:</strong> ${d.name}
            </td></tr>`).join('');

        const flowRows = dataFlows.map(f => `
            <tr>
                <td style="border:1px solid #ccc;padding:5px;">${f.from}</td>
                <td style="border:1px solid #ccc;padding:5px;text-align:center;">→</td>
                <td style="border:1px solid #ccc;padding:5px;">${f.to}<br/><small style="color:#666;">${f.description}</small></td>
            </tr>`).join('');

        return `
            <table style="width:100%;border-collapse:collapse;margin-bottom:10px;">
                <tr style="background:#e9ecef;"><th colspan="3" style="border:1px solid #ddd;padding:6px;">Processes</th></tr>
                ${procRows || '<tr><td colspan="3" style="text-align:center;padding:5px;">None defined.</td></tr>'}
                <tr style="background:#e9ecef;"><th colspan="3" style="border:1px solid #ddd;padding:6px;">Data Stores</th></tr>
                ${storeRows || '<tr><td colspan="3" style="text-align:center;padding:5px;">None defined.</td></tr>'}
                <tr style="background:#e9ecef;"><th colspan="3" style="border:1px solid #ddd;padding:6px;">Data Flows (From → To)</th></tr>
                ${flowRows || '<tr><td colspan="3" style="text-align:center;padding:5px;">None defined.</td></tr>'}
            </table>`;
    }

    renderAsHTML() {
        // Elements
        const elementsHtml = `
            <ul>
                <li><strong>Processes:</strong> ${this.dfdBasics.elements.processes}</li>
                <li><strong>Data Flows:</strong> ${this.dfdBasics.elements.dataFlows}</li>
                <li><strong>Data Stores:</strong> ${this.dfdBasics.elements.dataStores}</li>
                <li><strong>External Entities:</strong> ${this.dfdBasics.elements.externalEntities}</li>
            </ul>
        `;

        // Process Descriptions
        const pDescRows = this.dfdBasics.processDescriptions.map(pd => `
            <tr>
                <td style="border:1px solid #ccc;padding:5px;">${pd.processId}</td>
                <td style="border:1px solid #ccc;padding:5px;">${pd.type}</td>
                <td style="border:1px solid #ccc;padding:5px;">${pd.description}</td>
            </tr>`).join('');

        // Context Diagram
        const ctxEntities = this.contextDiagram.externalEntities.map(e => `<li><strong>${e.name}</strong>: ${e.description}</li>`).join('');
        const ctxIn = this.contextDiagram.dataFlowsIn.map(f => `<li>${f.from} → <em>${f.description}</em></li>`).join('');
        const ctxOut = this.contextDiagram.dataFlowsOut.map(f => `<li>→ ${f.to}: <em>${f.description}</em></li>`).join('');

        // Level 1
        const l1Sections = Object.keys(this.level1DFDs).map(pid => `
            <div style="margin-top:12px;">
                <h6 style="margin-bottom:5px;">Level 1 — Decomposition of Process ${pid}</h6>
                ${this._renderDFDTable(
                    this.level1DFDs[pid].processes,
                    this.level1DFDs[pid].dataStores,
                    this.level1DFDs[pid].dataFlows
                )}
            </div>`).join('');

        // Fragments
        const fragmentsHtml = this.dfdFragments.map(f => `
            <div style="border:1px solid #ddd;padding:8px;margin-bottom:6px;border-radius:4px;">
                <strong>Fragment ${f.id}: ${f.name}</strong><br/>
                <small>${f.description}</small>
                <div><em>Process:</em> ${f.process}</div>
                <div><em>Inputs:</em> ${f.dataFlowsIn.join(', ') || 'None'}</div>
                <div><em>Outputs:</em> ${f.dataFlowsOut.join(', ') || 'None'}</div>
            </div>`).join('');

        // Level 2
        const l2Sections = Object.keys(this.level2DFDs).map(pid => `
            <div style="margin-top:12px;">
                <h6 style="margin-bottom:5px;">Level 2 — Explosion of Process ${pid}</h6>
                ${this._renderDFDTable(
                    this.level2DFDs[pid].processes,
                    this.level2DFDs[pid].dataStores,
                    this.level2DFDs[pid].dataFlows
                )}
            </div>`).join('');

        // Validation Issues
        const valIssues = this.validation.issuesFound.map(i => `
            <li><strong>Issue:</strong> ${i.issue} <br/> <strong>Resolution:</strong> ${i.resolution || '<span style="color:red;">Pending</span>'}</li>
        `).join('');

        return `
            <div style="border:1px solid #ccc;padding:15px;border-radius:5px;margin-bottom:20px;">
                <h4 style="margin-top:0;">3. Process Modeling</h4>

                <h5>3.1 Introduction</h5>
                <div style="background:#f8f9fa;padding:10px;border-radius:4px;margin-bottom:12px;">
                    <p style="margin:0;"><strong>Definition:</strong> ${this.introduction.definition || '<em>Not yet defined</em>'}</p>
                    <p style="margin:5px 0;"><strong>Purpose:</strong> ${this.introduction.purpose || '—'}</p>
                </div>

                <h5>3.2 Data Flow Diagrams (Basics)</h5>
                <p><strong>Reading DFDs:</strong> ${this.dfdBasics.readingDFDs || '—'}</p>
                <p><strong>Elements of DFDs:</strong></p>
                ${elementsHtml}
                <p><strong>Using DFDs:</strong> ${this.dfdBasics.definingBusinessProcesses || '—'}</p>
                
                <h6>Process Descriptions</h6>
                <table style="width:100%;border-collapse:collapse;margin-bottom:15px;">
                    <tr style="background:#f4f4f4;">
                        <th style="border:1px solid #ddd;padding:5px;">Process ID</th>
                        <th style="border:1px solid #ddd;padding:5px;">Type</th>
                        <th style="border:1px solid #ddd;padding:5px;">Description</th>
                    </tr>
                    ${pDescRows || '<tr><td colspan="3" style="text-align:center;padding:8px;">No process descriptions defined yet.</td></tr>'}
                </table>

                <h5>3.3 Creating Data Flow Diagrams</h5>
                <h6>Context Diagram (Level 0 context) — ${this.contextDiagram.systemName || 'System'}</h6>
                <div style="display:flex;gap:20px;font-size:0.9em;margin-bottom:12px;">
                    <div style="flex:1;"><strong>External Entities:</strong><ul>${ctxEntities || '<li>None</li>'}</ul></div>
                    <div style="flex:1;"><strong>Inputs to System:</strong><ul>${ctxIn || '<li>None</li>'}</ul></div>
                    <div style="flex:1;"><strong>Outputs from System:</strong><ul>${ctxOut || '<li>None</li>'}</ul></div>
                </div>

                <h6>Level 0 DFD</h6>
                ${this._renderDFDTable(this.level0DFD.processes, this.level0DFD.dataStores, this.level0DFD.dataFlows)}

                <h6>Level 1 DFDs</h6>
                ${l1Sections || '<p style="color:#aaa;">No Level 1 DFDs defined.</p>'}

                <h5>3.4 Developing the Process Model</h5>
                <h6>DFD Fragments</h6>
                ${fragmentsHtml || '<p style="color:#aaa;">No DFD fragments defined.</p>'}

                <h6>Level 2 DFDs and Below</h6>
                ${l2Sections || '<p style="color:#aaa;">No Level 2 DFDs defined.</p>'}

                <h6>Validation</h6>
                <div style="background:${this.validation.isValidated ? '#d4edda' : '#f8d7da'};padding:10px;border-radius:4px;margin-bottom:12px;">
                    <p style="margin:0;"><strong>Syntax Checked:</strong> ${this.validation.syntaxErrorsChecked ? '✅' : '❌'}</p>
                    <p style="margin:5px 0;"><strong>Semantics Checked:</strong> ${this.validation.semanticsErrorsChecked ? '✅' : '❌'}</p>
                    <p style="margin:5px 0;"><strong>Is Validated:</strong> ${this.validation.isValidated ? '✅ Yes' : '❌ No'}</p>
                    ${valIssues ? `<ul>${valIssues}</ul>` : ''}
                </div>
            </div>`;
    }
}

export default ProcessModeling;
