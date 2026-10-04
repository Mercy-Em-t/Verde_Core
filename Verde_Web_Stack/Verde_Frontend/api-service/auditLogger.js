// api-service/auditLogger.js

/**
 * AuditLogger Class
 * Tracks all major events in the project lifecycle to provide a third-person audit trail.
 */
class AuditLogger {
    constructor(projectId) {
        this.projectId = projectId;
        this.events = [];
    }

    /**
     * Logs a new event into the audit trail.
     * @param {string} user - The person or system performing the action.
     * @param {string} action - Short identifier for the action (e.g., 'APPROVED', 'CREATED').
     * @param {string} details - Human-readable description of what happened.
     */
    logEvent(user, action, details) {
        const timestamp = new Date().toISOString();
        this.events.push({
            id: 'evt_' + Math.random().toString(36).substr(2, 9),
            timestamp,
            user,
            action,
            details
        });
    }

    // Retrieve all logs sorted chronologically
    getLogs() {
        return this.events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    // Generate a printable JSON format for database persistence
    toJSON() {
        return {
            projectId: this.projectId,
            events: this.events
        };
    }

    /**
     * Renders a chronological timeline of the project for third-person viewing.
     */
    renderAuditReportHTML() {
        const logs = this.getLogs();
        
        if (logs.length === 0) {
            return `<div style="padding: 20px; text-align: center; color: #666;">No events have been logged yet for this project.</div>`;
        }

        const timelineHtml = logs.map(log => {
            const dateObj = new Date(log.timestamp);
            const formattedDate = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString();
            
            return `
                <div style="margin-bottom: 15px; padding-left: 15px; border-left: 3px solid #0056b3;">
                    <div style="font-size: 0.85em; color: #888;">${formattedDate}</div>
                    <div style="font-weight: bold; color: #333;">${log.action}</div>
                    <div style="color: #555;">${log.details}</div>
                    <div style="font-size: 0.85em; color: #0056b3; margin-top: 5px;">User: ${log.user}</div>
                </div>
            `;
        }).join('');

        return `
            <div class="audit-report-container" style="font-family: sans-serif; line-height: 1.5; background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                <h2 style="border-bottom: 2px solid #eee; padding-bottom: 10px;">Project History & Audit Trail</h2>
                <p style="color: #666; margin-bottom: 30px;">
                    This document provides a third-person view of the project's entire lifecycle. It guarantees accountability by logging exactly who took what action and when.
                </p>
                <div class="timeline">
                    ${timelineHtml}
                </div>
            </div>
        `;
    }
}

export default AuditLogger;
