import re

def run():
    with open('admin-services.html', 'r', encoding='utf-8') as f:
        html = f.read()
        
    pattern = r'if \(id\) \{\s*await window\.TMAPI\.adminMutate\(\'services/\' \+ id, payload, \'PATCH\'\);\s*\} else \{\s*await window\.TMAPI\.adminMutate\(\'services\', payload, \'POST\'\);\s*\}'
    
    replace_str = """
                const endpoint = id ? 'http://127.0.0.1:8081/api/admin/services/' + id : 'http://127.0.0.1:8081/api/admin/services';
                const method = id ? 'PATCH' : 'POST';
                const token = localStorage.getItem('verde_api_token');
                
                const response = await fetch(endpoint, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify(payload)
                });
                
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.detail || 'API Error');
                }
    """
    
    html = re.sub(pattern, replace_str, html, flags=re.DOTALL)
    
    with open('admin-services.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Fixed admin-services.html fetch logic")

if __name__ == '__main__':
    run()
