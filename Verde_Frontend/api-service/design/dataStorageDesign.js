export default class DataStorageDesign {
    constructor() {
        this.status = 'PENDING';
        
        this.introduction = null;
        
        this.storageFormats = {
            files: null,
            databases: null,
            selectedFormat: null,
            appliedConcepts: null
        };
        
        this.physicalDataModels = {
            physicalERD: null,
            revisitCRUDMatrix: null,
            appliedConcepts: null
        };
        
        this.optimizeDataStorage = {
            optimizeEfficiency: null,
            optimizeAccessSpeed: null,
            estimateStorageSize: null,
            appliedConcepts: null
        };
    }

    // --- Setters ---
    setIntroduction(intro) { this.introduction = intro; this._updateStatus(); }
    
    setStorageFormats(filesDesc, databasesDesc, selectedFormat, appliedConcepts) {
        this.storageFormats = { files: filesDesc, databases: databasesDesc, selectedFormat, appliedConcepts };
        this._updateStatus();
    }
    
    setPhysicalDataModels(physicalERD, revisitCRUDMatrix, appliedConcepts) {
        this.physicalDataModels = { physicalERD, revisitCRUDMatrix, appliedConcepts };
        this._updateStatus();
    }
    
    setOptimizeDataStorage(efficiency, speed, size, appliedConcepts) {
        this.optimizeDataStorage = { optimizeEfficiency: efficiency, optimizeAccessSpeed: speed, estimateStorageSize: size, appliedConcepts };
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
            storageFormats: this.storageFormats,
            physicalDataModels: this.physicalDataModels,
            optimizeDataStorage: this.optimizeDataStorage
        };
    }

    renderAsHTML() {
        return `
            <div style="font-family:sans-serif;margin-bottom:20px;border:1px solid #ddd;border-radius:6px;padding:15px;">
                <h3 style="color:#0056b3;margin-top:0;">5. Data Storage Design</h3>
                <p><strong>Status:</strong> ${this.status}</p>
                
                <h4>Introduction</h4>
                <p>${this.introduction || '<em>Pending</em>'}</p>

                <h4>Data Storage Formats</h4>
                <ul>
                    <li><strong>Files:</strong> ${this.storageFormats.files || '<em>Pending</em>'}</li>
                    <li><strong>Databases:</strong> ${this.storageFormats.databases || '<em>Pending</em>'}</li>
                    <li><strong>Selected Format:</strong> ${this.storageFormats.selectedFormat || '<em>Pending</em>'}</li>
                    <li><strong>Applied Concepts:</strong> ${this.storageFormats.appliedConcepts || '<em>Pending</em>'}</li>
                </ul>

                <h4>Physical Data Models</h4>
                <ul>
                    <li><strong>Physical ERD:</strong> ${this.physicalDataModels.physicalERD || '<em>Pending</em>'}</li>
                    <li><strong>Revisit CRUD Matrix:</strong> ${this.physicalDataModels.revisitCRUDMatrix || '<em>Pending</em>'}</li>
                    <li><strong>Applied Concepts:</strong> ${this.physicalDataModels.appliedConcepts || '<em>Pending</em>'}</li>
                </ul>

                <h4>Optimize Data Storage</h4>
                <ul>
                    <li><strong>Efficiency:</strong> ${this.optimizeDataStorage.optimizeEfficiency || '<em>Pending</em>'}</li>
                    <li><strong>Access Speed:</strong> ${this.optimizeDataStorage.optimizeAccessSpeed || '<em>Pending</em>'}</li>
                    <li><strong>Storage Size Estimate:</strong> ${this.optimizeDataStorage.estimateStorageSize || '<em>Pending</em>'}</li>
                    <li><strong>Applied Concepts:</strong> ${this.optimizeDataStorage.appliedConcepts || '<em>Pending</em>'}</li>
                </ul>
            </div>
        `;
    }
}
