import os
import glob

def run():
    files = glob.glob('*.html')
    for f_name in files:
        with open(f_name, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if '|| !tm_user_raw' in content:
            content = content.replace('|| !tm_user_raw', '')
            with open(f_name, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Patched {f_name}")

if __name__ == '__main__':
    run()
