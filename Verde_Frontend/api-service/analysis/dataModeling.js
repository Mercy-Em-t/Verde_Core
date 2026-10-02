// api-service/analysis/dataModeling.js

/**
 * DataModeling Class
 * 
 * Structure:
 * 1. Introduction
 * 2. Entity Relationship Diagram (ERD)
 *    - Reading an ERD
 *    - Anatomy of an ERD
 *    - Data Dictionary & Metadata
 * 3. Creating an ERD
 *    - Building the ERD
 *    - Advanced Syntax
 *    - Parallel Development
 * 4. Validating an ERD
 *    - Design Guidelines
 *    - Normalization
 *    - Balancing ERDs with DFDs
 * 5. Developing the Data Model (Lab/Application)
 *    - Normalize the Data Model
 *    - Create Design Prerequisites (Documentation)
 */
class DataModeling {
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
        // SECTION 2: Entity Relationship Diagram (Basics)
        // -----------------------------------------------
        this.erdBasics = {
            readingERD: '',
            anatomy: '',
            metadataNotes: ''
        };

        // -----------------------------------------------
        // SECTION 3: Creating an ERD
        // -----------------------------------------------
        this.creationNotes = {
            buildingERD: '',
            advancedSyntax: '',
            parallelDevelopment: ''
        };

        this.entities = [];      // { id, name, description, attributes }
                                 // attributes: [{ name, dataType, isPrimaryKey, isForeignKey, isRequired, description }]
        
        this.relationships = []; // { id, entityA, entityB, cardinalityA, cardinalityB, description }

        this.dataDictionary = []; // { term, type, description, metadataExample }

        // -----------------------------------------------
        // SECTION 4: Validating an ERD
        // -----------------------------------------------
        this.validation = {
            designGuidelinesChecked: false,
            balancedWithDFD: false,
            balancingNotes: '',
            issuesFound: [] // { issue, resolution }
        };

        // -----------------------------------------------
        // SECTION 5: Developing the Data Model (Application)
        // -----------------------------------------------
        this.development = {
            normalizationApplied: false,
            normalizationNotes: '', // 1NF, 2NF, 3NF details
            designPrerequisitesCreated: false, // Ensures we have everything for the Design phase
            finalDocumentationNotes: ''
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
    // SECTION 2: ERD Basics
    // =============================================
    setERDBasics(readingERD, anatomy, metadataNotes) {
        this.erdBasics = { readingERD, anatomy, metadataNotes };
    }

    // =============================================
    // SECTION 3: Creating an ERD
    // =============================================
    setCreationNotes(buildingERD, advancedSyntax, parallelDevelopment) {
        this.creationNotes = { buildingERD, advancedSyntax, parallelDevelopment };
    }

    addEntity(id, name, description, attributes = []) {
        this.entities.push({ id, name, description, attributes });
        if (this.status === 'PENDING') this.status = 'IN_PROGRESS';
    }

    addAttributeToEntity(entityId, attribute) {
        const entity = this.entities.find(e => e.id === entityId);
        if (!entity) throw new Error(`Entity ${entityId} not found.`);
        entity.attributes.push(attribute);
    }

    addRelationship(id, entityA, entityB, cardinalityA, cardinalityB, description) {
        this.relationships.push({ id, entityA, entityB, cardinalityA, cardinalityB, description });
    }

    addDataDictionaryEntry(term, type, description, metadataExample = '') {
        this.dataDictionary.push({ term, type, description, metadataExample });
    }

    // =============================================
    // SECTION 4: Validating an ERD
    // =============================================
    validateERD(designGuidelinesChecked, balancedWithDFD, balancingNotes, issues = []) {
        this.validation = { designGuidelinesChecked, balancedWithDFD, balancingNotes, issuesFound: issues };
    }

    // =============================================
    // SECTION 5: Developing the Data Model
    // =============================================
    applyNormalization(applied, notes) {
        this.development.normalizationApplied = applied;
        this.development.normalizationNotes = notes;
    }

    prepareDesignPrerequisites(created, notes) {
        this.development.designPrerequisitesCreated = created;
        this.development.finalDocumentationNotes = notes;
    }

    finalize() { this.status = 'COMPLETED'; }

    // =============================================
    // toJSON
    // =============================================
    toJSON() {
        return {
            status: this.status,
            introduction: this.introduction,
            erdBasics: this.erdBasics,
            creationNotes: this.creationNotes,
            entities: this.entities,
            relationships: this.relationships,
            dataDictionary: this.dataDictionary,
            validation: this.validation,
            development: this.development
        };
    }

    // =============================================
    // renderAsHTML
    // =============================================
    renderAsHTML() {
        const entityCards = this.entities.map(e => {
            const attrRows = e.attributes.map(a => `
                <tr>
                    <td style="border:1px solid #ddd;padding:4px;">
                        ${a.isPrimaryKey ? '<strong>🔑 </strong>' : ''}
                        ${a.isForeignKey ? '<em>🔗 </em>' : ''}
                        ${a.name}
                    </td>
                    <td style="border:1px solid #ddd;padding:4px;">${a.dataType}</td>
                    <td style="border:1px solid #ddd;padding:4px;text-align:center;">${a.isRequired ? '✅' : '—'}</td>
                    <td style="border:1px solid #ddd;padding:4px;">${a.description || ''}</td>
                </tr>`).join('');

            return `
                <div style="border:1px solid #b0c4de;padding:10px;margin-bottom:10px;border-radius:4px;">
                    <strong>${e.id}: ${e.name}</strong> — <em>${e.description}</em>
                    <table style="width:100%;border-collapse:collapse;margin-top:6px;font-size:0.88em;">
                        <tr style="background:#e8f4f8;">
                            <th style="border:1px solid #ddd;padding:4px;">Attribute</th>
                            <th style="border:1px solid #ddd;padding:4px;">Data Type</th>
                            <th style="border:1px solid #ddd;padding:4px;">Required</th>
                            <th style="border:1px solid #ddd;padding:4px;">Description</th>
                        </tr>
                        ${attrRows || '<tr><td colspan="4" style="text-align:center;">No attributes defined.</td></tr>'}
                    </table>
                </div>`;
        }).join('');

        const relRows = this.relationships.map(r => `
            <tr>
                <td style="border:1px solid #ccc;padding:5px;">${r.id}</td>
                <td style="border:1px solid #ccc;padding:5px;text-align:center;"><strong>${r.entityA}</strong></td>
                <td style="border:1px solid #ccc;padding:5px;text-align:center;">${r.cardinalityA} : ${r.cardinalityB}</td>
                <td style="border:1px solid #ccc;padding:5px;text-align:center;"><strong>${r.entityB}</strong></td>
                <td style="border:1px solid #ccc;padding:5px;">${r.description}</td>
            </tr>`).join('');

        const ddRows = this.dataDictionary.map(d => `
            <tr>
                <td style="border:1px solid #ccc;padding:5px;"><strong>${d.term}</strong></td>
                <td style="border:1px solid #ccc;padding:5px;">${d.type}</td>
                <td style="border:1px solid #ccc;padding:5px;">${d.description}</td>
                <td style="border:1px solid #ccc;padding:5px;font-family:monospace;">${d.metadataExample || '—'}</td>
            </tr>`).join('');

        const valIssues = this.validation.issuesFound.map(i => `
            <li><strong>Issue:</strong> ${i.issue} <br/> <strong>Resolution:</strong> ${i.resolution || '<span style="color:red;">Pending</span>'}</li>
        `).join('');

        return `
            <div style="border:1px solid #ccc;padding:15px;border-radius:5px;margin-bottom:20px;">
                <h4 style="margin-top:0;">4. Data Modeling</h4>

                <h5>4.1 Introduction</h5>
                <div style="background:#f8f9fa;padding:10px;border-radius:4px;margin-bottom:12px;">
                    <p style="margin:0;"><strong>Definition:</strong> ${this.introduction.definition || '<em>Not yet defined</em>'}</p>
                    <p style="margin:5px 0;"><strong>Purpose:</strong> ${this.introduction.purpose || '—'}</p>
                </div>

                <h5>4.2 ERD Basics</h5>
                <p><strong>Reading an ERD:</strong> ${this.erdBasics.readingERD || '—'}</p>
                <p><strong>Anatomy of an ERD:</strong> ${this.erdBasics.anatomy || '—'}</p>
                <p><strong>Metadata Notes:</strong> ${this.erdBasics.metadataNotes || '—'}</p>
                
                <h5>4.3 Creating an ERD</h5>
                <p><strong>Building ERD Notes:</strong> ${this.creationNotes.buildingERD || '—'}</p>
                <p><strong>Advanced Syntax:</strong> ${this.creationNotes.advancedSyntax || '—'}</p>
                <p><strong>Parallel Development (Process & Data):</strong> ${this.creationNotes.parallelDevelopment || '—'}</p>

                <h6>Entities & Attributes</h6>
                ${entityCards || '<p style="color:#666;">No entities defined yet.</p>'}

                <h6 style="margin-top:15px;">Relationships</h6>
                <table style="width:100%;border-collapse:collapse;margin-bottom:15px;">
                    <tr style="background:#f4f4f4;">
                        <th style="border:1px solid #ddd;padding:5px;">ID</th>
                        <th style="border:1px solid #ddd;padding:5px;">Entity A</th>
                        <th style="border:1px solid #ddd;padding:5px;">Cardinality</th>
                        <th style="border:1px solid #ddd;padding:5px;">Entity B</th>
                        <th style="border:1px solid #ddd;padding:5px;">Description</th>
                    </tr>
                    ${relRows || '<tr><td colspan="5" style="text-align:center;padding:8px;">No relationships defined yet.</td></tr>'}
                </table>

                <h6>Data Dictionary & Metadata</h6>
                <table style="width:100%;border-collapse:collapse;">
                    <tr style="background:#f4f4f4;">
                        <th style="border:1px solid #ddd;padding:5px;">Term</th>
                        <th style="border:1px solid #ddd;padding:5px;">Type</th>
                        <th style="border:1px solid #ddd;padding:5px;">Description</th>
                        <th style="border:1px solid #ddd;padding:5px;">Metadata / Example</th>
                    </tr>
                    ${ddRows || '<tr><td colspan="4" style="text-align:center;padding:8px;">No data dictionary entries yet.</td></tr>'}
                </table>

                <h5>4.4 Validating an ERD</h5>
                <div style="background:${(this.validation.designGuidelinesChecked && this.validation.balancedWithDFD && this.validation.issuesFound.every(i=>i.resolution)) ? '#d4edda' : '#f8d7da'};padding:10px;border-radius:4px;margin-bottom:12px;">
                    <p style="margin:0;"><strong>Design Guidelines Followed:</strong> ${this.validation.designGuidelinesChecked ? '✅' : '❌'}</p>
                    <p style="margin:5px 0;"><strong>Balanced with DFDs:</strong> ${this.validation.balancedWithDFD ? '✅' : '❌'}</p>
                    <p style="margin:5px 0;"><strong>Balancing Notes:</strong> ${this.validation.balancingNotes || '—'}</p>
                    ${valIssues ? `<ul>${valIssues}</ul>` : ''}
                </div>

                <h5>4.5 Developing the Data Model (Lab)</h5>
                <div style="background:#e9ecef;padding:10px;border-radius:4px;">
                    <p style="margin:0;"><strong>Normalization Applied:</strong> ${this.development.normalizationApplied ? '✅ Yes' : '❌ No'}</p>
                    <p style="margin:5px 0;"><strong>Normalization Notes (1NF, 2NF, 3NF):</strong> ${this.development.normalizationNotes || '—'}</p>
                    <hr style="border:1px solid #ccc; margin: 10px 0;" />
                    <p style="margin:0;"><strong>Design Prerequisites Created:</strong> ${this.development.designPrerequisitesCreated ? '✅ Yes (Ready for Design Phase)' : '❌ No'}</p>
                    <p style="margin:5px 0;"><strong>Final Documentation Notes:</strong> ${this.development.finalDocumentationNotes || '—'}</p>
                </div>
            </div>`;
    }
}

export default DataModeling;
