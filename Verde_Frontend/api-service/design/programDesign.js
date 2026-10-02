export default class ProgramDesign {
    constructor() {
        this.status = 'PENDING';
        
        this.introduction = null;
        
        this.physicalProcessModels = {
            physicalDFD: null,
            appliedConcepts: null
        };
        
        this.programDesign = {
            structureCharts: [],
            syntax: null,
            designGuidelines: null,
            appliedConcepts: null
        };
        
        this.programSpecification = {
            syntax: null,
            appliedConcepts: null
        };
    }

    // --- Setters ---
    setIntroduction(intro) { this.introduction = intro; this._updateStatus(); }
    
    setPhysicalProcessModels(physicalDFD, appliedConcepts) {
        this.physicalProcessModels = { physicalDFD, appliedConcepts };
        this._updateStatus();
    }
    
    addStructureChart(id, name, modules) {
        this.programDesign.structureCharts.push({ id, name, modules });
        this._updateStatus();
    }

    setProgramDesignConcepts(syntax, guidelines, appliedConcepts) {
        this.programDesign.syntax = syntax;
        this.programDesign.designGuidelines = guidelines;
        this.programDesign.appliedConcepts = appliedConcepts;
        this._updateStatus();
    }
    
    setProgramSpecification(syntax, appliedConcepts) {
        this.programSpecification = { syntax, appliedConcepts };
        this._updateStatus();
    }

    // --- Lifecycle ---
    _updateStatus() { if (this.status === 'PENDING') this.status = 'IN_PROGRESS'; }
    finalize() { this.status = 'COMPLETED'; }

    // --- Public Contracts ---
    toJSON() {
        return {
            status: this.status,
            introduction: this.introduction,
            physicalProcessModels: this.physicalProcessModels,
            programDesign: this.programDesign,
            programSpecification: this.programSpecification
        };
    }

    renderAsHTML() {
        return `
            <div style="font-family:sans-serif;margin-bottom:20px;border:1px solid #ddd;border-radius:6px;padding:15px;">
                <h3 style="color:#0056b3;margin-top:0;">4. Program Design</h3>
                <p><strong>Status:</strong> ${this.status}</p>
                
                <h4>Introduction</h4>
                <p>${this.introduction || '<em>Pending</em>'}</p>

                <h4>Physical Process Models</h4>
                <p><strong>Physical DFD:</strong> ${this.physicalProcessModels.physicalDFD || '<em>Pending</em>'}</p>
                <p><strong>Applied Concepts:</strong> ${this.physicalProcessModels.appliedConcepts || '<em>Pending</em>'}</p>

                <h4>Designing the Programs</h4>
                <ul>
                    <li><strong>Syntax:</strong> ${this.programDesign.syntax || '<em>Pending</em>'}</li>
                    <li><strong>Guidelines:</strong> ${this.programDesign.designGuidelines || '<em>Pending</em>'}</li>
                    <li><strong>Structure Charts:</strong> ${this.programDesign.structureCharts.length} defined</li>
                    <li><strong>Applied Concepts:</strong> ${this.programDesign.appliedConcepts || '<em>Pending</em>'}</li>
                </ul>

                <h4>Program Specification</h4>
                <p><strong>Syntax:</strong> ${this.programSpecification.syntax || '<em>Pending</em>'}</p>
                <p><strong>Applied Concepts:</strong> ${this.programSpecification.appliedConcepts || '<em>Pending</em>'}</p>
            </div>
        `;
    }
}
