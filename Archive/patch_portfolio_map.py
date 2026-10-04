import re

def run():
    with open('admin-portfolio.html', 'r', encoding='utf-8') as f:
        html = f.read()

    html = html.replace('localPortfolio = data.portfolio || [];', 'localPortfolio = data.portfolio || data.data || data || []; if(!Array.isArray(localPortfolio)) localPortfolio = Object.values(localPortfolio); if(!Array.isArray(localPortfolio)) localPortfolio = [];')
    
    with open('admin-portfolio.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Fixed localPortfolio mapping in admin-portfolio.html")

if __name__ == '__main__':
    run()
