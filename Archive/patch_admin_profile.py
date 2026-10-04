import re

def run():
    with open('admin-client-profile.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # I'll inject a "Commission Phase" module into the sidebar or below the main header.
    # Let's find a good insertion point. 
    # Maybe after <!-- Main Profile Area -->
    
    inject_ui = """
        <!-- COMMISSION PHASE MODULE -->
        <div class="bg-white border border-slate-200 shadow-sm rounded-lg p-6 mb-8 mt-8">
            <h3 class="text-lg font-bold text-[#0B1325] mb-4 border-b border-slate-100 pb-2">Phase Commissioning Engine</h3>
            <div class="flex space-x-4 items-center mb-6">
                <select id="phaseTemplateSelect" class="flex-grow border-slate-300 rounded focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                    <option value="phase_2">Phase 2: Requirements Analysis (SOP)</option>
                </select>
                <button onclick="commissionSelectedPhase()" class="px-6 py-2 bg-[#0B1325] text-white text-sm font-bold rounded shadow hover:bg-slate-800 transition"><i class="fa-solid fa-rocket mr-2"></i>Commission Phase</button>
            </div>
            
            <h4 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Attached Project Phases</h4>
            <div id="attachedPhasesList" class="space-y-4">
                <div class="text-sm text-slate-500">Loading phases...</div>
            </div>
        </div>

        <script>
            async function commissionSelectedPhase() {
                const template = document.getElementById('phaseTemplateSelect').value;
                const token = localStorage.getItem('verde_api_token');
                if(!token) return alert("Not logged in");
                
                try {
                    const res = await fetch(`http://127.0.0.1:8081/api/admin/projects/${window.projectId}/phases/commission`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        },
                        body: JSON.stringify({ template_id: template })
                    });
                    if (res.ok) {
                        loadAttachedPhases();
                    } else {
                        const err = await res.json();
                        alert("Error: " + err.detail);
                    }
                } catch(e) {
                    console.error(e);
                    alert("Failed to commission phase");
                }
            }
            
            async function loadAttachedPhases() {
                const token = localStorage.getItem('verde_api_token');
                try {
                    const res = await fetch(`http://127.0.0.1:8081/api/projects/${window.projectId}/phases`, {
                        headers: { 'Authorization': 'Bearer ' + token }
                    });
                    const container = document.getElementById('attachedPhasesList');
                    if(res.ok) {
                        const data = await res.json();
                        if(data.phases.length === 0) {
                            container.innerHTML = '<div class="text-sm text-slate-500">No phases attached to this project.</div>';
                            return;
                        }
                        
                        container.innerHTML = data.phases.map(p => `
                            <div class="border border-slate-200 rounded p-4 bg-slate-50">
                                <div class="flex justify-between items-center mb-4">
                                    <h5 class="font-bold text-indigo-700 text-lg"><i class="fa-solid fa-layer-group mr-2"></i>${p.name}</h5>
                                    <span class="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold uppercase shadow-sm">${p.status}</span>
                                </div>
                                <div class="grid grid-cols-2 gap-6">
                                    <div>
                                        <h6 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Prerequisites</h6>
                                        <ul class="text-sm space-y-1">
                                            ${p.prerequisites.map(req => `<li><i class="fa-solid fa-${req.completed ? 'check-circle text-green-500' : 'circle text-slate-300'} mr-2"></i>${req.name}</li>`).join('')}
                                        </ul>
                                    </div>
                                    <div>
                                        <h6 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Internal Steps</h6>
                                        <ul class="text-sm space-y-1">
                                            ${p.steps.map(step => `<li><i class="fa-solid fa-${step.completed ? 'check-circle text-green-500' : 'clock text-amber-500'} mr-2"></i>${step.name}</li>`).join('')}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        `).join('');
                    }
                } catch(e) {
                    console.error(e);
                }
            }
            
            // Add a hook to load phases when page loads
            document.addEventListener('DOMContentLoaded', () => {
                const urlParams = new URLSearchParams(window.location.search);
                window.projectId = urlParams.get('projectId');
                setTimeout(loadAttachedPhases, 500);
            });
        </script>
    """
    
    # We will inject it right after the header of the main content
    pattern = r'(<!-- Page Header -->.*?</header>)'
    
    if "COMMISSION PHASE MODULE" not in html:
        new_html = re.sub(pattern, r'\1' + inject_ui, html, flags=re.DOTALL)
        with open('admin-client-profile.html', 'w', encoding='utf-8') as f:
            f.write(new_html)
        print("Injected into admin-client-profile.html")
    else:
        print("Already injected")

if __name__ == '__main__':
    run()
