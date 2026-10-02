import ApiService from './api-service/index.js';

export function generateProject(PROJECT_ID, STOP_PHASE = 5, pmName = 'Alice Smith (Project Manager)') {
    const ADMIN = 'System Admin';
    const PM = pmName;

    const logger = new ApiService.AuditLogger(PROJECT_ID);
    const workflow = ApiService.createWorkflow(PROJECT_ID);

// ============================================================================
// PHASE 1: PLANNING
// ============================================================================
console.log('\n--- PHASE 1: PLANNING ---');
console.log('1. Creating System Request...');
const sr = new ApiService.SystemRequest(PROJECT_ID);
sr.setProjectSponsor('John Doe, HR Director');
sr.setBusinessNeed('Automate leave requests and tracking to reduce manual HR overhead.');
sr.addBusinessRequirement('Employee portal for requesting leave');
sr.addBusinessRequirement('Manager portal for approvals');
sr.addBusinessRequirement('Automated PTO balance calculation');
sr.setBusinessValue('Save $50k in HR hours; reduce payroll errors by 20%');
sr.setSpecialIssues(['Must comply with new labor laws starting next year']);
logger.logEvent(PM, 'SYS_REQ_DRAFTED', 'System request was drafted with business requirements.');
sr.approve(ADMIN);
logger.logEvent(ADMIN, 'SYS_REQ_APPROVED', 'System request formally approved.');

console.log('2. Conducting Feasibility Study...');
const fsStudy = new ApiService.FeasibilityStudy(PROJECT_ID);
fsStudy.setTechnicalAssessment({
    description: 'Cloud-based web application', familiarityWithApplication: 'High', familiarityWithTechnology: 'Medium',
    projectSize: 'Medium', compatibility: 'High', familiarityWithBusinessDomain: 'High',
    infrastructureReadiness: 'Ready', securityAndCompliance: 'High requirements (PII data)'
});
fsStudy.addCostOrBenefit('developmentCosts', 'Software Licenses', 5000);
fsStudy.addCostOrBenefit('developmentCosts', 'Development Labor', 40000);
fsStudy.addCostOrBenefit('tangibleBenefits', 'Time saved by HR (Hours)', 25000);
fsStudy.calculateFinancialMetrics(3);
fsStudy.addStakeholder('HR Team', 'Core Users', 'High', 'High');
fsStudy.addStakeholder('IT Dept', 'Maintainers', 'Medium', 'Medium');
fsStudy.setVerdict(true); // PROCEED
fsStudy.approve(ADMIN);

console.log('3. Project Planning...');
const pp = new ApiService.ProjectPlanning(PROJECT_ID, sr, fsStudy);
pp.setProjectManager(PM);

// Let's add detailed Project Planning data
pp.methodologySelection.selectMethodology('AGILE', 'Scrum', 'Fast iterations for HR tool.');
pp.workPlan.addWBSPhase('P1', 'Planning');
pp.workPlan.addTask('P1', { id: 'T1', name: 'Kickoff', type: 'Meeting', durationDays: 1, deliverable: 'Notes', milestone: true, assignedTo: 'Alice Smith' });
pp.staffing.addStaffingNeed('Frontend Developer', 2, ['React', 'JavaScript']);
pp.staffing.addStaffingNeed('Backend Developer', 1, ['Node.js', 'SQL']);
pp.manageAndControl.addRisk('R1', 'Scope Creep', 'High', 'High', 'Strict change control process.');
pp.manageAndControl.addStandard('Coding', 'ESLint, Prettier, Code Reviews');

// Demonstrate how we can incrementally update in a "parallel path" before locking
pp.workPlan.addTask('P1', { id: 'T2', name: 'Draft Charter', type: 'Documentation', durationDays: 2, deliverable: 'Project Charter', milestone: false, assignedTo: 'Alice Smith' });
pp.manageAndControl.addRisk('R2', 'Staff Turnover', 'Medium', 'High', 'Ensure cross-training.');
logger.logEvent(PM, 'PHASE1_PLANNING_UPDATED', 'Added WBS tasks, Staffing, and Risks to Project Plan (Parallel Path).');

// Lock the sub-phases to turn them from IN_PROGRESS -> COMPLETED
pp.workPlan.finalizeWorkPlan();
pp.staffing.finalizeStaffing();
pp.manageAndControl.finalizeManagementPlan();
logger.logEvent(PM, 'PHASE1_PLANNING_LOCKED', 'Finalized the Work Plan, Staffing, and Control sections.');

pp.compileDeliverables();
logger.logEvent('System', 'DELIVERABLES_COMPILED', 'Project Planning Deliverables Checklist auto-compiled.');

// ============================================================================
// PHASE 2: ANALYSIS
// ============================================================================
console.log('\n--- PHASE 2: ANALYSIS ---');
console.log('1. Generating Phase 1 Binder and Booting Analysis Phase...');
const analysisPhase = new ApiService.AnalysisPhase(PROJECT_ID, sr, fsStudy, pp);

console.log('2. Requirements Determination...');
const rd = analysisPhase.requirementsDetermination;
rd.setDefinition('The HR system must allow employees to submit requests and managers to approve them.', ['Functional', 'Non-Functional']);
rd.addFunctionalRequirement('REQ-F01', 'Employees can view PTO balance.', 'High', 'HR Director');
rd.addFunctionalRequirement('REQ-F02', 'Managers receive email notifications for pending approvals.', 'Medium', 'Managers');
rd.addNonFunctionalRequirement('REQ-NF01', 'System must load within 2 seconds.', 'Performance', 'IT Dept');
rd.setDefinitionStatement({
    projectName: 'HR Leave Portal', preparedBy: PM, overview: 'Modernize leave tracking',
    scope: 'Phase 1 covers standard PTO and Sick Leave.', constraints: ['Budget cap $45k'], assumptions: ['All users have internet access']
});
rd.compileRequirementsDocument();
rd.approveRequirementsDocument(ADMIN);
rd.finalize();

console.log('3. Use Case Analysis...');
const uca = analysisPhase.useCaseAnalysis;
uca.addFullyDressedUseCase({
    id: 'UC-01', name: 'Request Leave', briefDescription: 'Employee requests time off.',
    primaryActor: 'Employee', preconditions: ['User is logged in'],
    mainFlow: ['1. Select dates', '2. Submit', '3. Notify Manager'], postconditions: ['Leave is marked PENDING'],
    linkedRequirementIds: ['REQ-F01']
});
uca.addFullyDressedUseCase({
    id: 'UC-02', name: 'Approve Leave', briefDescription: 'Manager approves requested time off.',
    primaryActor: 'Manager', preconditions: ['User is manager', 'Leave is PENDING'],
    mainFlow: ['1. Review request', '2. Click Approve', '3. Notify Employee'], postconditions: ['Leave is APPROVED', 'PTO balance deducted'],
    linkedRequirementIds: ['REQ-F02']
});
uca.finalize();

console.log('4. Process Modeling...');
const pmModeling = analysisPhase.processModeling;
pmModeling.setContextDiagram('HR System', [{id: 'E1', name: 'Employee'}], [{from: 'Employee', description: 'Leave Request'}], [{to: 'Employee', description: 'Status Update'}]);
pmModeling.validateDFD(true, true, [{issue: 'Missing admin flow', resolution: 'Added IT maintenance flow'}]);
pmModeling.finalize();

console.log('5. Data Modeling...');
const dm = analysisPhase.dataModeling;
dm.addEntity('E1', 'Employee', 'System user', [{name: 'id', dataType: 'INT', isPrimaryKey: true, isRequired: true}]);
dm.addEntity('E2', 'LeaveRequest', 'A PTO request', [{name: 'req_id', dataType: 'INT', isPrimaryKey: true, isRequired: true}]);
dm.addRelationship('R1', 'Employee', 'LeaveRequest', '1', 'M', 'Employee submits LeaveRequest');
dm.applyNormalization(true, 'Normalized to 3NF');
dm.finalize();

console.log('6. Compiling System Proposal...');
analysisPhase.compileSystemProposal('This proposal covers the HR Leave Portal Phase 1 implementation.');
analysisPhase.approveSystemProposal(ADMIN);

// ============================================================================
// PHASE 3: DESIGN
// ============================================================================
console.log('\n--- PHASE 3: DESIGN ---');
console.log('1. Generating Phase 2 Binder and Booting Design Phase...');
const designPhase = new ApiService.DesignPhase(analysisPhase);

console.log('2. Moving Into Design...');
const mid = designPhase.movingIntoDesign;
mid.setAcquisitionStrategies('Build in-house using React/Node', 'Buy SAP SuccessFactors', 'Outsource to DevShop');
mid.addAlternativeMatrixOption('Custom Build', 85, 'Perfect fit', 'Takes 3 months');
mid.addAlternativeMatrixOption('Packaged', 70, 'Instant deploy', 'Expensive licensing');
mid.selectAcquisitionStrategy('Custom Build', 'Long-term cost savings and flexibility.');
mid.finalize();

console.log('3. Architecture Design...');
const ad = designPhase.architectureDesign;
ad.setElements('Web Client, API Server, DB Server', '3-Tier Web', 'Presentation, Logic, Data', 'N/A', 'Responsive Web App', 'Docker Containers', '3-Tier selected for scalability');
ad.addRequirement('securityRequirements', 'SEC-1', 'Must use OAuth 2.0 SSO');
ad.addHardwareSpec('Database Server', 'AWS RDS PostgreSQL - db.t3.medium');
ad.finalize();

console.log('4. User Interface Design...');
const uid = designPhase.userInterfaceDesign;
uid.setIntroduction('Material Design based responsive web UI.');
uid.setPrinciples('Grid-based', 'Breadcrumbs', 'Clean', 'Novice', 'High', '3-click maximum', 'Large touch targets for mobile view');
uid.finalize();

console.log('5. Program Design...');
const prog = designPhase.programDesign;
prog.addStructureChart('SC-01', 'Auth Module', ['Login', 'Verify Token', 'Logout']);
prog.addStructureChart('SC-02', 'Leave Module', ['Submit Request', 'Calculate Balance', 'Notify Manager']);
prog.finalize();

console.log('6. Data Storage Design...');
const dsd = designPhase.dataStorageDesign;
dsd.setStorageFormats('Local JSON for configs', 'PostgreSQL for relational data', 'PostgreSQL', 'Applied RDBMS rules');
dsd.setPhysicalDataModels('Generated SQL Schema', 'Updated CRUD for SQL roles', 'Mapped ERD to Tables');
dsd.finalize();

console.log('7. Compiling System Specification...');
const specResult = designPhase.compileSystemSpecification('Comprehensive System Specification for the custom-built 3-tier HR Leave Portal.');
if (!specResult.success) {
    console.error('FAILED TO COMPILE SYSTEM SPEC:', specResult.reason);
    process.exit(1);
}
designPhase.approveSystemSpecification(ADMIN);

// ============================================================================
// PHASE 4: IMPLEMENTATION & DEPLOYMENT
// ============================================================================
console.log('\n--- PHASE 4: IMPLEMENTATION ---');
console.log('1. Generating Phase 3 Binder and Booting Implementation Phase...');
const implPhase = new ApiService.ImplementationPhase(designPhase);

console.log('2. System Construction...');
implPhase.systemConstruction.setEnvironment('VS Code', 'JavaScript / Node.js', 'React / Express');
implPhase.systemConstruction.addRepository('Verde_Core', 'https://github.com/company/verde-core');
implPhase.systemConstruction.finalize();
logger.logEvent(PM, 'SYS_CONSTRUCT_FINISHED', 'Code repositories linked and development environment set.');

console.log('3. Testing Strategy...');
implPhase.testingStrategy.addTestPlan('unit', 'Frontend Component Tests', 145, 0);
implPhase.testingStrategy.addTestPlan('integration', 'Backend API Tests', 82, 0);
implPhase.testingStrategy.addTestPlan('system', 'Full E2E Testing', 20, 0);
implPhase.testingStrategy.addTestPlan('acceptance', 'UAT with HR team', 5, 0);
implPhase.testingStrategy.finalize();
logger.logEvent(PM, 'TESTING_FINISHED', 'All test phases passed successfully.');

console.log('4. Documentation Strategy...');
implPhase.documentationStrategy.addSystemDoc('Backend API Spec', 'Swagger docs for Verde', 'https://internal.wiki/verde-api');
implPhase.documentationStrategy.addUserDoc('Verde HR User Manual', 'How to request PTO and manage timesheets', 'All Employees');
implPhase.documentationStrategy.finalize();

console.log('5. Transition & Deployment...');
implPhase.transitionAndDeployment.setConversionStrategy('Direct Cutover', 'Phased (Department by Department)', 'Whole System', 'Rollback to legacy DB backup if critical failure within 4 hours.');
implPhase.transitionAndDeployment.finalize();

console.log('6. Compiling and Approving Final System...');
implPhase.compileFinalSystem('Verde HR System v1.0 successfully built, tested, and documented.');
implPhase.approveFinalSystem(ADMIN);
logger.logEvent(ADMIN, 'SYSTEM_DEPLOYED', 'Final System deployed into production environment.');

// ============================================================================
// PHASE 5: SUPPORT & MAINTENANCE
// ============================================================================
console.log('\n--- PHASE 5: SUPPORT & MAINTENANCE ---');
console.log('1. Generating Phase 4 Binder and Booting Support Phase...');
const supportPhase = new ApiService.SupportPhase(implPhase);

console.log('2. System Support (Help Desk)...');
supportPhase.systemSupport.addTicket('TK-001', 'Login page loads slowly on mobile', 'High', 'Jane Doe');
supportPhase.systemSupport.addTicket('TK-002', 'Cannot export timesheet to PDF', 'Medium', 'John Smith');
supportPhase.systemSupport.resolveTicket('TK-001');
logger.logEvent(PM, 'SUPPORT_TICKET_RESOLVED', 'Resolved TK-001: Mobile login optimization.');

console.log('3. System Maintenance...');
supportPhase.systemMaintenance.addTask('M-001', 'BUG_FIX', 'Patch PDF export library version');
supportPhase.systemMaintenance.addTask('M-002', 'ENHANCEMENT', 'Add dark mode toggle');
supportPhase.systemMaintenance.completeTask('M-001');
logger.logEvent(PM, 'MAINTENANCE_APPLIED', 'Applied patch M-001 to production environment.');

console.log('4. Project Assessment (Post-Mortem)...');
supportPhase.projectAssessment.addTeamReview('Alice Smith', 'Excellent', 'Managed agile sprints perfectly.');
supportPhase.projectAssessment.addTeamReview('Bob Developer', 'Good', 'Struggled initially with CI/CD but adapted well.');
supportPhase.projectAssessment.addLessonLearned('Communication', 'Need clearer requirements gathering for edge cases.');
supportPhase.projectAssessment.addLessonLearned('Tech Stack', 'React worked well, but state management was complex.');
supportPhase.projectAssessment.finalizeAssessment();

console.log('5. Closing the Project...');
supportPhase.closeProject(ADMIN);
logger.logEvent(ADMIN, 'PROJECT_CLOSED', 'All SDLC phases completed. Project officially closed and retired.');

// ============================================================================
// WORKFLOW VERIFICATION
// ============================================================================
console.log('\n--- VERIFICATION ---');
const exitGate = workflow.isProjectClosed(supportPhase);
console.log('Is Project Officially Closed?', exitGate.allowed ? '✅ YES' : '❌ NO');
console.log('Gate Reason:', exitGate.reason);

const navBar = `
        <div class="no-print" style="background: #2c3e50; padding: 15px; text-align: center; margin-bottom: 20px; border-radius: 5px; font-weight: bold;">
            <a href="/" style="color: #fff; margin-right: 30px; text-decoration: none; padding: 5px 10px; background: #34495e; border-radius: 3px;">🏠 Dashboard</a>
            <a href="/project/${PROJECT_ID}/binder" style="color: #3498db; margin-right: 30px; text-decoration: none; padding: 5px 10px; background: white; border-radius: 3px;">📄 View Master Binder</a>
            <a href="/project/${PROJECT_ID}/audit" style="color: #3498db; margin-right: 30px; text-decoration: none; padding: 5px 10px; background: white; border-radius: 3px;">🕒 View Audit Trail</a>
            <button id="print-btn" onclick="downloadAndPrint()" style="background: #27ae60; color: white; border: none; padding: 6px 15px; border-radius: 3px; cursor: pointer; font-weight: bold; font-size: 1em; transition: background 0.3s;">📥 Download & Print A4 Book</button>
        </div>
`;

const commonHead = `
    <style>
        body { background: #f4f7f6; padding: 20px; font-family: sans-serif; }
        .document-container { max-width: 1000px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-radius: 8px; }
        details { border: 1px solid #aaa; border-radius: 4px; padding: 0.5em 0.5em 0; margin-bottom: 20px; background: #fff; }
        summary { font-weight: bold; margin: -0.5em -0.5em 0; padding: 1em; cursor: pointer; border-radius: 4px; background: #3498db; color: white; font-size: 1.2em; transition: background 0.2s; }
        summary:hover { background: #2980b9; }
        details[open] { padding: 0.5em; }
        details[open] summary { border-bottom: 1px solid #aaa; margin-bottom: 1em; border-bottom-left-radius: 0; border-bottom-right-radius: 0; }
        .phase-summary { background: #eef; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 5px solid #3498db; }
        
        /* A4 Print Slicing Styles */
        @media print {
            @page { size: A4 portrait; margin: 20mm; }
            body { background: white; padding: 0; margin: 0; }
            .document-container { box-shadow: none; border: none; padding: 0; max-width: 100%; }
            .no-print { display: none !important; }
            
            /* Expand accordions and style for book print */
            details { border: none; padding: 0; margin-bottom: 40px; display: block; }
            summary { background: transparent; color: black; border-bottom: 2px solid black; padding: 0; margin: 0 0 15px 0; font-size: 1.5em; page-break-after: avoid; }
            
            /* Prevent awkward page breaks */
            h1, h2, h3, h4, h5 { page-break-after: avoid; margin-top: 20px; }
            table { page-break-inside: auto; width: 100%; border-collapse: collapse; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            .document-section, .phase-summary { page-break-inside: avoid; }
            img { max-width: 100% !important; page-break-inside: avoid; }
        }
    </style>
    <script>
        // Security pool of allowed export IDs
        let idPool = [9482, 1058, 4492, 7301, 2219, 8834, 5612];
        
        function downloadAndPrint() {
            if (idPool.length === 0) {
                alert("SECURITY LOCK: Document export limit reached. No more IDs left in the pool.");
                return;
            }
            
            // Randomly strike an ID off the list
            const index = Math.floor(Math.random() * idPool.length);
            const assignedId = idPool.splice(index, 1)[0];
            const newFileName = "Verde_Project_Binder_" + assignedId;
            
            // 1. Alter Document Title so "Save as PDF" uses the unique name
            document.title = newFileName;
            
            // 2. Open all accordions for print slicing
            document.querySelectorAll('details').forEach(d => d.setAttribute('open', 'true'));
            
            // 3. Visual feedback on the button showing the struck-off ID
            const btn = document.getElementById('print-btn');
            btn.innerText = "⏳ Exporting ID: " + assignedId + " (" + idPool.length + " left)";
            btn.style.background = "#e67e22"; // Orange processing state
            
            // 4. Force a physical HTML download to the Downloads folder
            const htmlContent = document.documentElement.outerHTML;
            const blob = new Blob([htmlContent], {type: 'text/html'});
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = newFileName + ".html";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // 5. Trigger physical printer dialog
            setTimeout(() => { 
                window.print(); 
                // Reset button
                setTimeout(() => { 
                    btn.innerText = "📥 Download & Print A4 Book"; 
                    btn.style.background = "#27ae60"; 
                }, 2000);
            }, 800);
        }
    </script>
`;

console.log('\n📝 Rendering Output Documents (2 Pages)...');

// PAGE 1: MASTER BINDER
const binderHtmlOutput = `
<!DOCTYPE html>
<html>
<head>
    <title>Verde SDLC - Sample Project Final Binder</title>
    ${commonHead}
</head>
<body>
    <div class="document-container">
        ${navBar}
        <h1 style="text-align: center; color: #2c3e50; page-break-before: avoid;">Verde SDLC: Master Output Binder</h1>
        <p style="text-align: center; color: #7f8c8d; font-weight: bold; font-size: 1.2em;">Project: ${PROJECT_ID}</p>
        <hr style="margin-bottom: 30px;"/>
        
        <details>
            <summary>Phase 1: Planning Phase</summary>
            <div class="phase-summary">
                <p><strong>System Request Status:</strong> ${sr.status}</p>
                <p><strong>Feasibility Study Verdict:</strong> ${fsStudy.finalVerdict}</p>
                <p><strong>Project Manager:</strong> ${pp.projectManager}</p>
            </div>
            ${sr.renderAsHTML()}
            ${fsStudy.renderAsHTML()}
            ${pp.renderAsHTML()}
        </details>
        
        <details style="page-break-before: always;">
            <summary>Phase 2: Analysis Phase</summary>
            <div class="phase-summary">
                <p><strong>System Proposal Status:</strong> ${analysisPhase.systemProposal.status}</p>
                <p><strong>Requirements Definition Document Status:</strong> ${rd.requirementsDefinitionDocument.status}</p>
            </div>
            ${analysisPhase.renderAsHTML()}
        </details>

        <details>
            <summary>Phase 3: Design Phase</summary>
            ${designPhase.renderAsHTML()}
        </details>

        <details style="page-break-before: always;">
            <summary>Phase 4: Implementation Phase</summary>
            ${implPhase.renderAsHTML()}
        </details>

        <details open style="page-break-before: always;">
            <summary>Phase 5: Support & Maintenance Phase</summary>
            ${supportPhase.renderAsHTML()}
        </details>
    </div>
</body>
</html>
`;

// PAGE 2: AUDIT TRAIL
const auditHtmlOutput = `
<!DOCTYPE html>
<html>
<head>
    <title>Verde SDLC - Project Audit Trail</title>
    ${commonHead}
</head>
<body>
    <div class="document-container">
        ${navBar}
        <h1 style="text-align: center; color: #2c3e50;">Verde SDLC: Security & Audit Portal</h1>
        <p style="text-align: center; color: #7f8c8d; font-weight: bold; font-size: 1.2em;">Project: ${PROJECT_ID}</p>
        <hr style="margin-bottom: 30px;"/>
        
        ${logger.renderAuditReportHTML()}
    </div>
</body>
</html>
`;

    return { binderHtml: binderHtmlOutput, auditHtml: auditHtmlOutput };
}

