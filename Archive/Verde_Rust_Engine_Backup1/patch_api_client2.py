import re

def run():
    with open('api-client.js', 'r', encoding='utf-8') as f:
        code = f.read()

    # Find the getProjectPhases mock and replace it with a real request
    pattern = r"getProjectPhases:\s*async\s*\(.*?\)\s*=>\s*\{\s*return\s*\{\s*phases.*?\};\s*\},"
    
    new_code = "getProjectPhases: (projectId) => request('/projects/' + encodeURIComponent(projectId) + '/phases'),"
    
    code = re.sub(pattern, new_code, code, flags=re.DOTALL)
    
    with open('api-client.js', 'w', encoding='utf-8') as f:
        f.write(code)
    
    print("Replaced getProjectPhases mock")

if __name__ == '__main__':
    run()
