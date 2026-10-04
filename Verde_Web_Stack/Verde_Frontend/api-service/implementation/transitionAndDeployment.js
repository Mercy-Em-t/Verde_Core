export default class TransitionAndDeployment {
    constructor() {
        this.status = 'PENDING';
        this.conversionStyle = null; // Direct, Parallel
        this.conversionLocation = null; // Pilot, Phased, Simultaneous
        this.conversionModules = null; // Whole, Modular
        this.businessContingencyPlan = '';
    }

    setConversionStrategy(style, location, modules, contingencyPlan) {
        this.conversionStyle = style;
        this.conversionLocation = location;
        this.conversionModules = modules;
        this.businessContingencyPlan = contingencyPlan;
        if (this.status === 'PENDING') this.status = 'IN_PROGRESS';
    }

    finalize() {
        this.status = 'COMPLETED';
    }

    renderAsHTML() {
        return `
            <div style="border:1px solid #ccc;padding:15px;border-radius:5px;margin-bottom:20px;">
                <h4 style="margin-top:0;">4. Transition & Deployment Strategy</h4>
                <p><strong>Status:</strong> ${this.status}</p>
                <p><strong>Conversion Style:</strong> ${this.conversionStyle || 'Not set'}</p>
                <p><strong>Conversion Location:</strong> ${this.conversionLocation || 'Not set'}</p>
                <p><strong>Conversion Modules:</strong> ${this.conversionModules || 'Not set'}</p>
                <p><strong>Business Contingency Plan:</strong> ${this.businessContingencyPlan || 'Not set'}</p>
            </div>
        `;
    }
}
