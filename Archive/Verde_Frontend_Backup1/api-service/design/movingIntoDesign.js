export default class MovingIntoDesign {
    constructor() {
        this.status = 'PENDING';
        
        // Sections
        this.transition = {
            description: null
        };
        
        this.acquisitionStrategies = {
            custom: null,
            packaged: null,
            outsourcing: null
        };
        
        this.influences = {
            businessNeeds: null,
            inHouseExperience: null,
            projectSkills: null,
            projectManagement: null,
            timeFrame: null
        };
        
        this.alternativeMatrix = {
            options: [],     // Array of strategy options evaluated
            selected: null,  // The chosen strategy
            rationale: null
        };
        
        this.appliedConcepts = null; // How these concepts are applied to the project
    }

    // --- Setters ---
    setTransition(description) {
        this.transition.description = description;
        this._updateStatus();
    }

    setAcquisitionStrategies(customDesc, packagedDesc, outsourcingDesc) {
        this.acquisitionStrategies.custom = customDesc;
        this.acquisitionStrategies.packaged = packagedDesc;
        this.acquisitionStrategies.outsourcing = outsourcingDesc;
        this._updateStatus();
    }

    setInfluences(businessNeeds, inHouseExperience, projectSkills, projectManagement, timeFrame) {
        this.influences = { businessNeeds, inHouseExperience, projectSkills, projectManagement, timeFrame };
        this._updateStatus();
    }

    addAlternativeMatrixOption(optionName, score, pros, cons) {
        this.alternativeMatrix.options.push({ optionName, score, pros, cons });
        this._updateStatus();
    }

    selectAcquisitionStrategy(selectedOption, rationale) {
        this.alternativeMatrix.selected = selectedOption;
        this.alternativeMatrix.rationale = rationale;
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
            transition: this.transition,
            acquisitionStrategies: this.acquisitionStrategies,
            influences: this.influences,
            alternativeMatrix: this.alternativeMatrix,
            appliedConcepts: this.appliedConcepts
        };
    }

    renderAsHTML() {
        const matrixRows = this.alternativeMatrix.options.map(opt => `
            <tr>
                <td style="border:1px solid #ddd;padding:4px;">${opt.optionName}</td>
                <td style="border:1px solid #ddd;padding:4px;">${opt.score}</td>
                <td style="border:1px solid #ddd;padding:4px;">${opt.pros}</td>
                <td style="border:1px solid #ddd;padding:4px;">${opt.cons}</td>
            </tr>
        `).join('');

        return `
            <div style="font-family:sans-serif;margin-bottom:20px;border:1px solid #ddd;border-radius:6px;padding:15px;">
                <h3 style="color:#0056b3;margin-top:0;">1. Moving into Design</h3>
                <p><strong>Status:</strong> ${this.status}</p>
                
                <h4>Transition</h4>
                <p>${this.transition.description || '<em>Not defined yet</em>'}</p>

                <h4>Acquisition Strategies</h4>
                <ul>
                    <li><strong>Custom:</strong> ${this.acquisitionStrategies.custom || '<em>Pending</em>'}</li>
                    <li><strong>Packaged:</strong> ${this.acquisitionStrategies.packaged || '<em>Pending</em>'}</li>
                    <li><strong>Outsourcing:</strong> ${this.acquisitionStrategies.outsourcing || '<em>Pending</em>'}</li>
                </ul>

                <h4>Influences on Strategy</h4>
                <ul>
                    <li><strong>Business Needs:</strong> ${this.influences.businessNeeds || '<em>Pending</em>'}</li>
                    <li><strong>In-house Experience:</strong> ${this.influences.inHouseExperience || '<em>Pending</em>'}</li>
                    <li><strong>Project Skills:</strong> ${this.influences.projectSkills || '<em>Pending</em>'}</li>
                    <li><strong>Project Management:</strong> ${this.influences.projectManagement || '<em>Pending</em>'}</li>
                    <li><strong>Time Frame:</strong> ${this.influences.timeFrame || '<em>Pending</em>'}</li>
                </ul>

                <h4>Alternative Matrix</h4>
                ${this.alternativeMatrix.options.length > 0 ? `
                <table style="width:100%;border-collapse:collapse;font-size:0.9em;margin-bottom:10px;">
                    <tr style="background:#f4f4f4;">
                        <th style="border:1px solid #ddd;padding:4px;text-align:left;">Option</th>
                        <th style="border:1px solid #ddd;padding:4px;text-align:left;">Score</th>
                        <th style="border:1px solid #ddd;padding:4px;text-align:left;">Pros</th>
                        <th style="border:1px solid #ddd;padding:4px;text-align:left;">Cons</th>
                    </tr>
                    ${matrixRows}
                </table>
                ` : '<p><em>No matrix options added yet</em></p>'}
                <p><strong>Selected Strategy:</strong> ${this.alternativeMatrix.selected || '<em>Pending</em>'}</p>
                <p><strong>Rationale:</strong> ${this.alternativeMatrix.rationale || '<em>Pending</em>'}</p>

                <h4>Applied Concepts</h4>
                <p>${this.appliedConcepts || '<em>Pending</em>'}</p>
            </div>
        `;
    }
}
