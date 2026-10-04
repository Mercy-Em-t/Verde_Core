export default class UserInterfaceDesign {
    constructor() {
        this.status = 'PENDING';
        
        this.introduction = null;
        this.usabilityConcept = null;
        
        this.principles = {
            layout: null,
            contentAwareness: null,
            aesthetics: null,
            usageLevel: null,
            consistency: null,
            minimizeUserEffort: null,
            touchscreenIssues: null
        };
        
        this.process = {
            understandUsers: null,
            organizeInterface: null,
            defineStandards: null,
            prototyping: null,
            evaluationTesting: null
        };
        
        this.navigationDesign = {
            basicPrinciples: null,
            menuTips: [],
            messageTips: []
        };
        
        this.inputDesign = {
            basicPrinciples: null,
            inputTips: [],
            inputValidationRules: []
        };
        
        this.outputDesign = {
            basicPrinciples: null,
            typesOfOutputs: [],
            media: []
        };
        
        this.appliedConcepts = {
            understandUsers: null,
            organizeInterface: null,
            defineStandards: null,
            interfaceTemplatesDesign: null,
            developPrototypes: null,
            interfaceEvaluationAndTesting: null
        };
    }

    // --- Setters ---
    setIntroduction(intro) { this.introduction = intro; this._updateStatus(); }
    setUsabilityConcept(concept) { this.usabilityConcept = concept; this._updateStatus(); }
    
    setPrinciples(layout, content, aesthetics, usage, consistency, effort, touchscreen) {
        this.principles = { layout, contentAwareness: content, aesthetics, usageLevel: usage, consistency, minimizeUserEffort: effort, touchscreenIssues: touchscreen };
        this._updateStatus();
    }
    
    setProcess(understand, organize, standards, prototyping, evaluation) {
        this.process = { understandUsers: understand, organizeInterface: organize, defineStandards: standards, prototyping, evaluationTesting: evaluation };
        this._updateStatus();
    }
    
    setNavigationDesign(principles, menus, messages) {
        this.navigationDesign = { basicPrinciples: principles, menuTips: menus, messageTips: messages };
        this._updateStatus();
    }
    
    setInputDesign(principles, tips, rules) {
        this.inputDesign = { basicPrinciples: principles, inputTips: tips, inputValidationRules: rules };
        this._updateStatus();
    }
    
    setOutputDesign(principles, types, media) {
        this.outputDesign = { basicPrinciples: principles, typesOfOutputs: types, media };
        this._updateStatus();
    }
    
    applyConcepts(understand, organize, standards, templates, prototypes, testing) {
        this.appliedConcepts = {
            understandUsers: understand,
            organizeInterface: organize,
            defineStandards: standards,
            interfaceTemplatesDesign: templates,
            developPrototypes: prototypes,
            interfaceEvaluationAndTesting: testing
        };
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
            usabilityConcept: this.usabilityConcept,
            principles: this.principles,
            process: this.process,
            navigationDesign: this.navigationDesign,
            inputDesign: this.inputDesign,
            outputDesign: this.outputDesign,
            appliedConcepts: this.appliedConcepts
        };
    }

    renderAsHTML() {
        return `
            <div style="font-family:sans-serif;margin-bottom:20px;border:1px solid #ddd;border-radius:6px;padding:15px;">
                <h3 style="color:#0056b3;margin-top:0;">3. User Interface Design</h3>
                <p><strong>Status:</strong> ${this.status}</p>
                
                <h4>Introduction & Usability</h4>
                <p>${this.introduction || '<em>Pending</em>'}</p>
                <p><strong>Usability:</strong> ${this.usabilityConcept || '<em>Pending</em>'}</p>

                <h4>UI Principles</h4>
                <ul>
                    <li><strong>Layout:</strong> ${this.principles.layout || '<em>Pending</em>'}</li>
                    <li><strong>Content Awareness:</strong> ${this.principles.contentAwareness || '<em>Pending</em>'}</li>
                    <li><strong>Aesthetics:</strong> ${this.principles.aesthetics || '<em>Pending</em>'}</li>
                    <li><strong>Usage Level:</strong> ${this.principles.usageLevel || '<em>Pending</em>'}</li>
                    <li><strong>Consistency:</strong> ${this.principles.consistency || '<em>Pending</em>'}</li>
                    <li><strong>Minimize Effort:</strong> ${this.principles.minimizeUserEffort || '<em>Pending</em>'}</li>
                    <li><strong>Touchscreen:</strong> ${this.principles.touchscreenIssues || '<em>Pending</em>'}</li>
                </ul>

                <h4>Design Details</h4>
                <p><strong>Navigation:</strong> ${this.navigationDesign.basicPrinciples || '<em>Pending</em>'}</p>
                <p><strong>Input:</strong> ${this.inputDesign.basicPrinciples || '<em>Pending</em>'}</p>
                <p><strong>Output:</strong> ${this.outputDesign.basicPrinciples || '<em>Pending</em>'}</p>

                <h4>Applied Concepts</h4>
                <ul>
                    <li><strong>Understand Users:</strong> ${this.appliedConcepts.understandUsers || '<em>Pending</em>'}</li>
                    <li><strong>Organize Interface:</strong> ${this.appliedConcepts.organizeInterface || '<em>Pending</em>'}</li>
                    <li><strong>Define Standards:</strong> ${this.appliedConcepts.defineStandards || '<em>Pending</em>'}</li>
                    <li><strong>Templates Design:</strong> ${this.appliedConcepts.interfaceTemplatesDesign || '<em>Pending</em>'}</li>
                    <li><strong>Prototypes:</strong> ${this.appliedConcepts.developPrototypes || '<em>Pending</em>'}</li>
                    <li><strong>Evaluation & Testing:</strong> ${this.appliedConcepts.interfaceEvaluationAndTesting || '<em>Pending</em>'}</li>
                </ul>
            </div>
        `;
    }
}
