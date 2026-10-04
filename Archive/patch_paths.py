import os

files = ['qa-sprint14-integration.mjs', 'qa-sprint16-uat.mjs', 'qa-sprint17-preflight.mjs']

for file in files:
    if os.path.exists(file):
        with open(file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # We know it's on line 4 or 5
        for i, line in enumerate(lines):
            if line.startswith('const root = process.cwd()'):
                lines[i] = "const root = process.cwd() + '/';\n"
                break
            if 'import.meta.url' in line:
                lines[i] = "const root = process.cwd() + '/';\n"
                break
                
        with open(file, 'w', encoding='utf-8') as f:
            f.writelines(lines)
