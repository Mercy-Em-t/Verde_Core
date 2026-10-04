import re

def run():
    # 1. Update api-client.js with mocks for my-project.html
    with open('api-client.js', 'r', encoding='utf-8') as f:
        js = f.read()

    new_mocks = """
    // My-Project specific stubs/mocks
    getProject: async (projectId) => {
        // Return a mock project based on ID so the UI doesn't crash
        return { project: { id: projectId, name: "Enterprise Build", status: "Active", stage: "Phase 1" } };
    },
    getProjectPhases: async (projectId) => {
        return { phases: [
            { id: 1, name: "Phase 1: Discovery & Architecture", status: "Active", start_date: "2026-10-01" },
            { id: 2, name: "Phase 2: Core Engineering", status: "Pending", start_date: null }
        ]};
    },
    getProjectCommunications: async (projectId) => {
        return { communications: [
            { id: 1, type: "system", body: "Welcome to your Verde workspace.", created_at: new Date().toISOString(), sender: "System" }
        ]};
    },
    """
    
    if 'getProjectPhases:' not in js:
        js = js.replace('// Portfolio', new_mocks + '\n    // Portfolio')
        with open('api-client.js', 'w', encoding='utf-8') as f:
            f.write(js)

    # 2. Patch my-project.html
    with open('my-project.html', 'r', encoding='utf-8') as f:
        html = f.read()

    if 'api-client.js' not in html:
        html = html.replace('</body>', '<script src="config.js"></script>\n<script src="api-client.js"></script>\n</body>')

    # Replace Promise.all block
    old_promise_all = """
                const [projRes, phasesRes, commsRes, docsRes] = await Promise.all([
                    fetch(`http://127.0.0.1:8081/api/projects/${projectId}`, { headers: { 'Authorization': 'Bearer ' + token }}),
                    fetch(`http://127.0.0.1:8081/api/projects/${projectId}/phases`, { headers: { 'Authorization': 'Bearer ' + token }}),
                    fetch(`http://127.0.0.1:8081/api/projects/${projectId}/communications`, { headers: { 'Authorization': 'Bearer ' + token }}),
                    fetch(`http://127.0.0.1:8081/api/projects/${projectId}/documents`, { headers: { 'Authorization': 'Bearer ' + token }})
                ]);
                
                if (!projRes.ok) throw new Error('Project not found');

                const projData = await projRes.json();
                const phasesData = await phasesRes.json();
                const commsData = await commsRes.json();
                const docsData = await docsRes.json();
    """
    
    new_promise_all = """
                if (!window.TMAPI) throw new Error("TMAPI not loaded");
                const [projData, phasesData, commsData, docsRes] = await Promise.all([
                    window.TMAPI.getProject(projectId),
                    window.TMAPI.getProjectPhases(projectId),
                    window.TMAPI.getProjectCommunications(projectId),
                    window.TMAPI.listDocuments(projectId).catch(() => ({documents:[]}))
                ]);
                const docsData = docsRes.documents ? docsRes : { documents: docsRes };
    """
    html = html.replace(old_promise_all.strip(), new_promise_all.strip())
    
    # We also need to find any manual fetch for documents
    html = re.sub(
        r"const res = await fetch\(`http://127\.0\.0\.1:8081/api/projects/\$\{window\.projectId\}/documents`, \{[\s\S]*?\}\);.*?const data = await res\.json\(\);",
        "const data = await window.TMAPI.listDocuments(window.projectId).catch(() => ({documents:[]}));\nif (Array.isArray(data)) data = {documents: data};",
        html, flags=re.DOTALL
    )

    with open('my-project.html', 'w', encoding='utf-8') as f:
        f.write(html)

if __name__ == '__main__':
    run()
