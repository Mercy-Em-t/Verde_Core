(function(){
  const cfg = window.TM_CONFIG || {}; 
  const TOKEN = 'verde_api_token';

  function getToken() { return localStorage.getItem(TOKEN) || ''; }
  
  async function request(path, options = {}) {
    if (!cfg.apiEnabled) throw new Error('API mode is disabled.');
    
    const headers = { ...(options.headers || {}) }; 
    if (!(options.body instanceof FormData)) { 
        headers['Content-Type'] = 'application/json'; 
    }
    
    const token = getToken(); 
    if (token) headers.Authorization = 'Bearer ' + token;
    
    const url = (cfg.apiBaseUrl || '/api') + path;
    const r = await fetch(url, { ...options, headers });
    
    if (r.status === 204) return null; 
    
    // For file downloads
    if (r.headers.get('content-type')?.includes('application/pdf') || 
        r.headers.get('content-disposition')?.includes('attachment')) {
        return await r.blob();
    }

    const body = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(body.detail || body.error || 'Request failed'); 
    return body;
  }

  window.TMAPI = {
    getToken,
    enabled: () => !!cfg.apiEnabled,
    hasSession: () => !!getToken(),
    
    // Auth
    login: async (email, password) => {
        const out = await request('/login', { method: 'POST', body: JSON.stringify({ userid: email, password }) });
        if (out.token) {
            localStorage.setItem(TOKEN, out.token);
            if (out.role) localStorage.setItem('verde_role', out.role);
            if (out.userid) localStorage.setItem('verde_userid', out.userid);
        }
        return out;
    },
    logout: () => {
        localStorage.removeItem(TOKEN);
        localStorage.removeItem('verde_role');
        localStorage.removeItem('verde_userid');
        return request('/logout', { method: 'POST' }).catch(() => null);
    },
    
    // Simulate /auth/me strictly on the frontend without hitting the backend
    me: async () => {
        if (!getToken()) throw new Error("No session");
        return {
            email: localStorage.getItem('verde_userid') || 'User',
            role: localStorage.getItem('verde_role') || 'User'
        };
    },

    // Dashboards
    adminDashboard: (entity) => request('/admin/' + encodeURIComponent(entity)), // leads, projects, clients, payments, workers, services
    clientProjects: () => request('/client/projects'),
    workerProjects: () => request('/worker/projects'),

    // Leads & Conversions
    createLead: (data) => request('/leads', { method: 'POST', body: JSON.stringify(data) }),
    transitionLead: (id, newState) => request('/leads/' + encodeURIComponent(id) + '/transition', { method: 'POST', body: JSON.stringify({ new_state: newState }) }),
    convertLead: (data) => request('/convert_lead', { method: 'POST', body: JSON.stringify(data) }),

    // Legacy Stubs and Aliases (Prevents UI crashes for deprecated/updated features)
    proposals: async () => [],
    cms: async () => ({}),
    createChangeOrder: async () => ({}),
    leads: () => window.TMAPI.adminDashboard('leads').then(res => res.data.map(row => ({ id: row[0], name: row[1], email: row[2], state: row[5] }))), // Map array rows to objects expected by old UI
    projects: () => window.TMAPI.adminDashboard('projects').then(res => res.data.map(row => ({ id: row[0], name: "Project " + row[0], state: row[3] }))),

    // Documents
    listDocuments: (projectId) => request('/projects/' + encodeURIComponent(projectId) + '/documents'),
    clientDashboard: () => request('/client/projects'),
    uploadDocument: (projectId, formData) => request('/projects/' + encodeURIComponent(projectId) + '/documents', { method: 'POST', body: formData }), // expects FormData (file, doc_type, target_phase)
    signDocument: (projectId, docId) => request('/projects/' + encodeURIComponent(projectId) + '/documents/' + encodeURIComponent(docId) + '/sign', { method: 'POST' }),
    downloadDocument: async (projectId, docId) => {
        const blob = await request('/projects/' + encodeURIComponent(projectId) + '/documents/' + encodeURIComponent(docId) + '/download');
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "document";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    },

    // Services, Invoices, and Payments
    services: () => request('/services'),
    adminServices: () => request('/admin/services'),
    createService: (data) => request('/admin/services', { method: 'POST', body: JSON.stringify(data) }),
    updateService: (id, data) => request('/admin/services/' + encodeURIComponent(id), { method: 'PATCH', body: JSON.stringify(data) }),
    quoteServices: (serviceIds) => request('/services/quote', { method: 'POST', body: JSON.stringify({ service_ids: serviceIds }) }),
    
    
    // My-Project specific stubs/mocks
    getProject: async (projectId) => {
        // Return a mock project based on ID so the UI doesn't crash
        return { project: { id: projectId, name: "Enterprise Build", status: "Active", stage: "Phase 1" } };
    },
    getProjectPhases: (projectId) => request('/projects/' + encodeURIComponent(projectId) + '/phases'),
    getProjectCommunications: async (projectId) => {
        return { communications: [
            { id: 1, type: "system", body: "Welcome to your Verde workspace.", created_at: new Date().toISOString(), sender: "System" }
        ]};
    },
    
    // Portfolio
    portfolio: () => request('/portfolio'),
    getPortfolio: (id) => request('/portfolio/' + encodeURIComponent(id)),
    adminPortfolio: () => request('/admin/portfolio'),
    createPortfolio: (data) => request('/admin/portfolio', { method: 'POST', body: JSON.stringify(data) }),
    updatePortfolio: (id, data) => request('/admin/portfolio/' + encodeURIComponent(id), { method: 'PATCH', body: JSON.stringify(data) }),
    createInvoice: (projectId, targetPhase, serviceIds) => request('/projects/' + encodeURIComponent(projectId) + '/invoices', { method: 'POST', body: JSON.stringify({ target_phase: targetPhase, service_ids: serviceIds }) }),
    createPayment: (projectId, targetPhase, amount) => request('/projects/' + encodeURIComponent(projectId) + '/payments', { method: 'POST', body: JSON.stringify({ target_phase: targetPhase, amount: amount }) }),

    // Workers
    createWorker: (data) => request('/admin/workers', { method: 'POST', body: JSON.stringify(data) }),
    assignWorker: (projectId, data) => request('/projects/' + encodeURIComponent(projectId) + '/assign', { method: 'POST', body: JSON.stringify(data) })
  };
})();
