import re

def run():
    with open('my-project.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # Remove the ones at the bottom
    html = html.replace('<script src="config.js"></script>\n<script src="api-client.js"></script>\n</body>', '</body>')
    
    # Add them before the main script
    if 'api-client.js' not in html:
        html = html.replace('<script>', '<script src="config.js"></script>\n    <script src="api-client.js"></script>\n    <script>', 1)
        
    with open('my-project.html', 'w', encoding='utf-8') as f:
        f.write(html)

if __name__ == '__main__':
    run()
