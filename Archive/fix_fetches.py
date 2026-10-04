import glob

def run():
    for f_name in glob.glob('*.html'):
        with open(f_name, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace relative API paths
        content = content.replace("fetch('/api/", "fetch('http://127.0.0.1:8081/api/")
        content = content.replace('fetch("/api/', 'fetch("http://127.0.0.1:8081/api/')
        content = content.replace('fetch(`/api/', 'fetch(`http://127.0.0.1:8081/api/')
            
        with open(f_name, 'w', encoding='utf-8') as f:
            f.write(content)

if __name__ == '__main__':
    run()
