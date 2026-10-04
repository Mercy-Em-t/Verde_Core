// api-service/methodologySelector.js

/**
 * MethodologySelector Class
 * Handles the logic for the "Select Methodology" step in Project Planning.
 * Evaluates project characteristics to choose between Waterfall, RAD, and Agile.
 */
class MethodologySelector {
    constructor() {
        this.status = 'PENDING';
        
        // The available methodology options
        this.options = {
            WATERFALL: ['Parallel', 'V-Model'],
            RAD: ['Iterative', 'System Prototyping', 'Throwaway Prototyping'],
            AGILE: ['Extreme Programming (XP)', 'Scrum']
        };

        // Insights / Criteria (usually rated as High, Medium, Low, or Yes/No)
        this.insights = {
            clarityOfUserRequirements: 'Unknown',
            familiarityWithTechnology: 'Unknown',
            systemComplexity: 'Unknown',
            systemReliability: 'Unknown',
            shortTimeSchedule: 'Unknown',
            scheduleVisibility: 'Unknown'
        };

        this.selectedCategory = null; // WATERFALL, RAD, AGILE
        this.selectedSpecificMethod = null;
        this.justification = '';
    }

    // Set the insights gathered by the Project Manager
    setInsights(insightsData) {
        this.insights = { ...this.insights, ...insightsData };
        this.status = 'IN_PROGRESS';
    }

    // Officially select the methodology
    selectMethodology(category, specificMethod, justification) {
        if (!this.options[category] || !this.options[category].includes(specificMethod)) {
            throw new Error(`Invalid methodology selection: ${category} - ${specificMethod}`);
        }
        
        this.selectedCategory = category;
        this.selectedSpecificMethod = specificMethod;
        this.justification = justification;
        this.status = 'COMPLETED';
    }

    // Helper to generate a recommendation based on insights
    generateRecommendation() {
        // Simple heuristic engine based on standard Systems Analysis principles
        let recs = [];
        
        if (this.insights.clarityOfUserRequirements === 'Low' || this.insights.shortTimeSchedule === 'High') {
            recs.push({ category: 'AGILE', method: 'Extreme Programming (XP)', reason: 'Excellent for unclear requirements and short schedules.' });
            recs.push({ category: 'RAD', method: 'System Prototyping', reason: 'Good for clarifying requirements early.' });
        }
        
        if (this.insights.systemReliability === 'High' && this.insights.systemComplexity === 'High') {
            recs.push({ category: 'WATERFALL', method: 'V-Model', reason: 'V-Model ensures rigorous testing for high reliability/complexity.' });
            recs.push({ category: 'RAD', method: 'Throwaway Prototyping', reason: 'Helps tackle high complexity safely.' });
        }
        
        if (this.insights.clarityOfUserRequirements === 'High' && this.insights.familiarityWithTechnology === 'High') {
            recs.push({ category: 'WATERFALL', method: 'Parallel', reason: 'Requirements are clear and tech is known; parallel speeds up delivery.' });
        }

        return recs;
    }

    renderAsHTML() {
        return `
            <div class="methodology-selector" style="border: 1px solid #ccc; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <h4 style="margin-top: 0;">Methodology Selection Data</h4>
                
                <table style="width: 100%; text-align: left; margin-bottom: 15px; border-collapse: collapse;">
                    <tr style="background: #f4f4f4;">
                        <th style="border: 1px solid #ddd; padding: 5px;">Criteria Insight</th>
                        <th style="border: 1px solid #ddd; padding: 5px;">Evaluation</th>
                    </tr>
                    <tr><td style="border: 1px solid #ddd; padding: 5px;">Clarity of User Requirements</td><td style="border: 1px solid #ddd; padding: 5px;">${this.insights.clarityOfUserRequirements}</td></tr>
                    <tr><td style="border: 1px solid #ddd; padding: 5px;">Familiarity with Technology</td><td style="border: 1px solid #ddd; padding: 5px;">${this.insights.familiarityWithTechnology}</td></tr>
                    <tr><td style="border: 1px solid #ddd; padding: 5px;">System Complexity</td><td style="border: 1px solid #ddd; padding: 5px;">${this.insights.systemComplexity}</td></tr>
                    <tr><td style="border: 1px solid #ddd; padding: 5px;">System Reliability</td><td style="border: 1px solid #ddd; padding: 5px;">${this.insights.systemReliability}</td></tr>
                    <tr><td style="border: 1px solid #ddd; padding: 5px;">Short Time Schedule</td><td style="border: 1px solid #ddd; padding: 5px;">${this.insights.shortTimeSchedule}</td></tr>
                    <tr><td style="border: 1px solid #ddd; padding: 5px;">Schedule Visibility</td><td style="border: 1px solid #ddd; padding: 5px;">${this.insights.scheduleVisibility}</td></tr>
                </table>

                ${this.status === 'COMPLETED' ? `
                    <div style="background: #d4edda; color: #155724; padding: 10px; border-radius: 4px;">
                        <strong>Selected Methodology:</strong> ${this.selectedCategory} - ${this.selectedSpecificMethod}<br/>
                        <strong>Justification:</strong> ${this.justification}
                    </div>
                ` : `
                    <div style="background: #fff3cd; color: #856404; padding: 10px; border-radius: 4px;">
                        <em>Selection Pending based on insights...</em>
                    </div>
                `}
            </div>
        `;
    }

    toJSON() {
        return {
            status: this.status,
            insights: this.insights,
            selectedCategory: this.selectedCategory,
            selectedSpecificMethod: this.selectedSpecificMethod,
            justification: this.justification
        };
    }
}

export default MethodologySelector;
