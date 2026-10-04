import re

def run():
    with open('my-project.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # We will use regex to find the entire Promise.all block and replace it
    pattern = r"const \[projRes, phasesRes, commsRes, docsRes\] = await Promise\.all\(\[[\s\S]*?const docsData = await docsRes\.json\(\);"
    
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
    
    new_html = re.sub(pattern, new_promise_all.strip(), html)

    # We also need to fix the single fetch for documents further down
    pattern_docs = r"const res = await fetch\(`http://127\.0\.0\.1:8081/api/projects/\$\{window\.projectId\}/documents`,\s*\{\s*headers:\s*\{\s*'Authorization':\s*'Bearer\s*'\s*\+\s*token\s*\}\s*\}\s*\);\s*const data = await res\.json\(\);"
    
    new_docs = """
                let data = await window.TMAPI.listDocuments(window.projectId).catch(() => ({documents:[]}));
                if (Array.isArray(data)) data = {documents: data};
    """
    
    new_html = re.sub(pattern_docs, new_docs.strip(), new_html)

    with open('my-project.html', 'w', encoding='utf-8') as f:
        f.write(new_html)
    print("Replaced!")

if __name__ == '__main__':
    run()
