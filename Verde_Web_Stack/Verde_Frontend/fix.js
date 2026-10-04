export function generateDynamicProject(state) {
    const logger = new ApiService.AuditLogger(state.id);
    const sr = new ApiService.SystemRequest(state.id);
    sr.setProjectSponsor(state.sponsor || 'TBD');
    sr.setBusinessNeed(state.need || 'TBD');
    const fsStudy = new ApiService.FeasibilityStudy(state.id);
    if (state.status === 'TERMINATED') { sr.status = 'TERMINATED'; fsStudy.finalVerdict = 'HALTED'; logger.logEvent(state.pm || 'System', 'PROJECT_HALTED', 'Terminated'); } else if (state.status === 'PHASE_1_APPROVED') { sr.approve('System Admin'); fsStudy.setVerdict(true); fsStudy.approve('System Admin'); logger.logEvent(state.pm || 'System', 'SYS_REQ_APPROVED', 'Approved'); }
    let ppHtml = '';
    if (state.status === 'PHASE_1_APPROVED') { const pp = new ApiService.ProjectPlanning(state.id, sr, fsStudy); ppHtml = pp.renderAsHTML(); }
    const binderHtmlOutput = '<!DOCTYPE html><html><head></head><body><h1>Project ' + state.id + '</h1><h2>Status: ' + state.status + '</h2>' + sr.renderAsHTML() + fsStudy.renderAsHTML() + ppHtml + '</body></html>';
    const auditHtmlOutput = '<!DOCTYPE html><html><head></head><body><h1>Audit: ' + state.id + '</h1>' + logger.renderAuditReportHTML() + '</body></html>';
    return { binderHtml: binderHtmlOutput, auditHtml: auditHtmlOutput };
}
