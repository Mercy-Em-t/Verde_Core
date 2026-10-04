// api-service/documentManager.js

/**
 * DocumentRecord Class
 * A wrapper for any SDLC document that adds versioning and linked-list capabilities.
 */
class DocumentRecord {
    constructor(projectId, docType, contentObj, version, author, previousId = null) {
        this.id = `${docType}_${projectId}_v${version}_${Math.random().toString(36).substr(2, 6)}`;
        this.projectId = projectId;
        this.docType = docType;           // e.g., 'SYSTEM_REQUEST', 'FEASIBILITY_STUDY'
        this.content = contentObj;        // The actual object (SystemRequest, etc.)
        this.version = version;           // Integer version number
        this.author = author;
        this.createdAt = new Date().toISOString();
        
        // Hybrid Approach: Store physical files (PDFs) alongside the native data object
        this.attachments = []; // Array of { fileName, fileUrl, uploadedAt }
        
        // Linked list pointer to the previous version
        this.previousId = previousId; 
    }

    addAttachment(fileName, fileUrl) {
        this.attachments.push({
            fileName,
            fileUrl,
            uploadedAt: new Date().toISOString()
        });
    }
}

/**
 * DocumentManager Class
 * Acts as an in-memory database to handle multi-project isolation and document versioning.
 * Prevents contamination and overwriting by using a strict append-only linked list approach.
 */
class DocumentManager {
    constructor() {
        // Multi-tenant database structure
        // store[projectId][docType] = [ DocumentRecord_v1, DocumentRecord_v2, ... ]
        this.store = {};
    }

    /**
     * Ensures the project and document type buckets exist.
     */
    _initializeBuckets(projectId, docType) {
        if (!this.store[projectId]) {
            this.store[projectId] = {};
        }
        if (!this.store[projectId][docType]) {
            this.store[projectId][docType] = [];
        }
    }

    /**
     * Saves a new version of a document for a specific project.
     * Automatically links it to the previous version.
     */
    saveDocument(projectId, docType, contentObj, author) {
        this._initializeBuckets(projectId, docType);
        
        const history = this.store[projectId][docType];
        const newVersionNumber = history.length + 1;
        
        let previousId = null;
        if (history.length > 0) {
            // Get the ID of the current latest document to use as the tail pointer
            previousId = history[history.length - 1].id;
        }

        const newRecord = new DocumentRecord(projectId, docType, contentObj, newVersionNumber, author, previousId);
        
        // Append the new version
        history.push(newRecord);
        
        return newRecord; // Returns the saved record with its generated ID and version
    }

    /**
     * Retrieves the most recent (default) version of a document.
     */
    getLatestDocument(projectId, docType) {
        if (!this.store[projectId] || !this.store[projectId][docType] || this.store[projectId][docType].length === 0) {
            return null;
        }
        const history = this.store[projectId][docType];
        return history[history.length - 1]; // Return the tail of the list
    }

    /**
     * Retrieves the entire linked list history of a document from v1 to latest.
     */
    getDocumentHistory(projectId, docType) {
        if (!this.store[projectId] || !this.store[projectId][docType]) {
            return [];
        }
        return this.store[projectId][docType];
    }

    /**
     * Attaches a physical file (like a signed PDF) to a specific document version.
     */
    attachFileToVersion(projectId, docType, version, fileName, fileUrl) {
        const history = this.getDocumentHistory(projectId, docType);
        const targetRecord = history.find(r => r.version === version);
        if (!targetRecord) throw new Error("Document version not found.");
        
        targetRecord.addAttachment(fileName, fileUrl);
        return targetRecord;
    }

    /**
     * Renders a chronological version history table for a specific document type.
     */
    renderHistoryAsHTML(projectId, docType) {
        const history = this.getDocumentHistory(projectId, docType);
        
        if (history.length === 0) {
            return `<div style="color: #666;">No versions exist for ${docType}.</div>`;
        }

        const rows = history.map(record => {
            const attachmentsHtml = record.attachments.map(att => 
                `<div>📎 <a href="${att.fileUrl}" target="_blank" style="color: #0056b3;">${att.fileName}</a></div>`
            ).join('');

            return `
            <tr>
                <td style="border: 1px solid #ccc; padding: 5px; text-align: center;">v${record.version}</td>
                <td style="border: 1px solid #ccc; padding: 5px;">${new Date(record.createdAt).toLocaleString()}</td>
                <td style="border: 1px solid #ccc; padding: 5px;">${record.author}</td>
                <td style="border: 1px solid #ccc; padding: 5px; font-family: monospace; font-size: 0.9em;">
                    ${record.previousId ? `← ${record.previousId.split('_').pop()}` : '<em>(Original)</em>'}
                </td>
                <td style="border: 1px solid #ccc; padding: 5px;">
                    ${attachmentsHtml || '<em style="color:#aaa;">No attachments</em>'}
                </td>
                <td style="border: 1px solid #ccc; padding: 5px; text-align: center;">
                    ${record.version === history.length ? '<span style="color: green; font-weight: bold;">Current</span>' : '<span style="color: #888;">Archived</span>'}
                </td>
            </tr>
            `;
        }).reverse().join(''); // Reverse to show latest at top

        return `
            <div class="version-history-container" style="border: 1px solid #ccc; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <h4 style="margin-top: 0;">Revision History: ${docType} (Project: ${projectId})</h4>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="background: #f4f4f4;">
                        <th style="border: 1px solid #ddd; padding: 5px;">Version</th>
                        <th style="border: 1px solid #ddd; padding: 5px;">Saved At</th>
                        <th style="border: 1px solid #ddd; padding: 5px;">Author</th>
                        <th style="border: 1px solid #ddd; padding: 5px;">Linked Previous</th>
                        <th style="border: 1px solid #ddd; padding: 5px;">Attachments (Redundancy)</th>
                        <th style="border: 1px solid #ddd; padding: 5px;">Status</th>
                    </tr>
                    ${rows}
                </table>
            </div>
        `;
    }
}

export default DocumentManager;
