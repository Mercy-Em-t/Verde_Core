def run():
    with open('api-client.js', 'r', encoding='utf-8') as f:
        js = f.read()
    
    # Just fix the exact line
    bad_line = 'projects: () => window.TMAPI.adminDashboard(\'projects\').then(res => res.data.map(row => ({ id: row[0], name: "Project " + row[0], state: row[3] })))'
    good_line = bad_line + ','
    js = js.replace(bad_line, good_line)
    
    with open('api-client.js', 'w', encoding='utf-8') as f:
        f.write(js)

if __name__ == '__main__':
    run()
