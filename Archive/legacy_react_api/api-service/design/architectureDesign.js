export default class ArchitectureDesign {
    constructor() {
        this.status = 'PENDING';
        
        this.introduction = null;
        
        this.elements = {
            architecturalComponents: null,
            clientServerArchitectures: null,
            clientServerTiers: null,
            serverBasedArchitecture: null,
            mobileApplicationsArchitecture: null,
            advancesInConfiguration: null,
            comparingOptions: null
        };
        
        this.creatingArchitecture = {
            operationalRequirements: [],
            performanceRequirements: [],
            securityRequirements: [],
            culturalAndPoliticalRequirements: [],
            designDetails: null
        };
        
        this.hardwareAndSoftwareSpec = {
            hardware: [],
            software: []
        };
        
        this.appliedConcepts = null;
    }

    // --- Setters ---
    setIntroduction(intro) {
        this.introduction = intro;
        this._updateStatus();
    }

    setElements(components, clientServer, tiers, serverBased, mobile, advances, comparison) {
        this.elements = {
            architecturalComponents: components,
            clientServerArchitectures: clientServer,
            clientServerTiers: tiers,
            serverBasedArchitecture: serverBased,
            mobileApplicationsArchitecture: mobile,
            advancesInConfiguration: advances,
            comparingOptions: comparison
        };
        this._updateStatus();
    }

    addRequirement(category, id, description) {
        if (!this.creatingArchitecture[category]) {
            throw new Error(`Invalid requirement category: ${category}`);
        }
        this.creatingArchitecture[category].push({ id, description });
        this._updateStatus();
    }

    setArchitectureDesignDetails(details) {
        this.creatingArchitecture.designDetails = details;
        this._updateStatus();
    }

    addHardwareSpec(item, specification) {
        this.hardwareAndSoftwareSpec.hardware.push({ item, specification });
        this._updateStatus();
    }

    addSoftwareSpec(item, specification) {
        this.hardwareAndSoftwareSpec.software.push({ item, specification });
        this._updateStatus();
    }

    applyConcepts(applicationDetails) {
        this.appliedConcepts = applicationDetails;
        this._updateStatus();
    }

    // --- Lifecycle ---
    _updateStatus() {
        if (this.status === 'PENDING') this.status = 'IN_PROGRESS';
    }

    finalize() {
        this.status = 'COMPLETED';
    }

    // --- Public Contracts ---
    toJSON() {
        return {
            status: this.status,
            introduction: this.introduction,
            elements: this.elements,
            creatingArchitecture: this.creatingArchitecture,
            hardwareAndSoftwareSpec: this.hardwareAndSoftwareSpec,
            appliedConcepts: this.appliedConcepts
        };
    }

    renderAsHTML() {
        const reqList = (reqs) => reqs.length > 0 
            ? `<ul>${reqs.map(r => `<li><strong>${r.id}:</strong> ${r.description}</li>`).join('')}</ul>` 
            : '<p><em>None specified</em></p>';

        const specList = (specs) => specs.length > 0
            ? `<ul>${specs.map(s => `<li><strong>${s.item}:</strong> ${s.specification}</li>`).join('')}</ul>`
            : '<p><em>None specified</em></p>';

        return `
            <div style="font-family:sans-serif;margin-bottom:20px;border:1px solid #ddd;border-radius:6px;padding:15px;">
                <h3 style="color:#0056b3;margin-top:0;">2. Architecture Design</h3>
                <p><strong>Status:</strong> ${this.status}</p>
                
                <h4>Introduction</h4>
                <p>${this.introduction || '<em>Pending</em>'}</p>

                <h4>Elements of Architecture Design</h4>
                <ul>
                    <li><strong>Components:</strong> ${this.elements.architecturalComponents || '<em>Pending</em>'}</li>
                    <li><strong>Client-Server Architectures:</strong> ${this.elements.clientServerArchitectures || '<em>Pending</em>'}</li>
                    <li><strong>Tiers:</strong> ${this.elements.clientServerTiers || '<em>Pending</em>'}</li>
                    <li><strong>Server-Based:</strong> ${this.elements.serverBasedArchitecture || '<em>Pending</em>'}</li>
                    <li><strong>Mobile:</strong> ${this.elements.mobileApplicationsArchitecture || '<em>Pending</em>'}</li>
                    <li><strong>Advances:</strong> ${this.elements.advancesInConfiguration || '<em>Pending</em>'}</li>
                    <li><strong>Comparison:</strong> ${this.elements.comparingOptions || '<em>Pending</em>'}</li>
                </ul>

                <h4>Creating an Architecture Design</h4>
                <h5>Operational Requirements</h5>
                ${reqList(this.creatingArchitecture.operationalRequirements)}
                <h5>Performance Requirements</h5>
                ${reqList(this.creatingArchitecture.performanceRequirements)}
                <h5>Security Requirements</h5>
                ${reqList(this.creatingArchitecture.securityRequirements)}
                <h5>Cultural & Political Requirements</h5>
                ${reqList(this.creatingArchitecture.culturalAndPoliticalRequirements)}
                <h5>Architecture Design Details</h5>
                <p>${this.creatingArchitecture.designDetails || '<em>Pending</em>'}</p>

                <h4>Hardware and Software Specification</h4>
                <h5>Hardware</h5>
                ${specList(this.hardwareAndSoftwareSpec.hardware)}
                <h5>Software</h5>
                ${specList(this.hardwareAndSoftwareSpec.software)}

                <h4>Applied Concepts</h4>
                <p>${this.appliedConcepts || '<em>Pending</em>'}</p>
            </div>
        `;
    }
}
