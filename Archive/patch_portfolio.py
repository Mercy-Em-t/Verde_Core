import os
import json

def run():
    # 1. Create the dedicated asset folder and a JSON index
    os.makedirs('assets/portfolio', exist_ok=True)
    portfolio_data = [
        {
            "id": 1,
            "title": "FinTech Payment Gateway",
            "client": "KeshaBank",
            "type": "Web Architecture",
            "description": "Engineered a high-throughput transaction processing engine handling 10,000 TPS with zero data loss.",
            "timeline": "8 Weeks",
            "tech_stack": "FastAPI, PostgreSQL, Redis",
            "image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80"
        },
        {
            "id": 2,
            "title": "Smart Logistics Platform",
            "client": "EcoFreight",
            "type": "Full-Stack System",
            "description": "Built a complete supply chain tracking system with real-time GPS websocket integration.",
            "timeline": "12 Weeks",
            "tech_stack": "Vue.js, Node.js, MongoDB",
            "image": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&q=80"
        }
    ]
    with open('assets/portfolio/projects.json', 'w', encoding='utf-8') as f:
        json.dump(portfolio_data, f, indent=4)

    # 2. Patch portfolio.html to read from the JSON file
    with open('portfolio.html', 'r', encoding='utf-8') as f:
        html = f.read()

    idx = html.find('<div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">')
    if idx != -1:
        end_idx = html.find('<!-- End Grid -->', idx)
        if end_idx == -1: 
            # try to guess end
            end_idx = html.find('<div class="mt-16 text-center">', idx)
            
        html = html[:idx] + '<div id="portfolio-grid" class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"></div>\n' + html[end_idx:]

    script_block = """
<script>
async function loadPortfolio() {
    try {
        const res = await fetch('assets/portfolio/projects.json');
        const projects = await res.json();
        const grid = document.getElementById('portfolio-grid');
        if (!grid) return;
        grid.innerHTML = '';
        projects.forEach(p => {
            grid.innerHTML += `
            <div class="project-card flex flex-col h-full">
                <div class="h-48 bg-slate-200 overflow-hidden relative">
                    <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover">
                    <div class="absolute top-4 left-4 bg-white/90 backdrop-blur text-[#0B1325] text-xs font-bold px-3 py-1 rounded">
                        ${p.type}
                    </div>
                </div>
                <div class="p-6 flex flex-col flex-grow">
                    <h3 class="text-xl font-bold mb-1">${p.title}</h3>
                    <p class="text-sm text-slate-500 font-semibold mb-4">Client: ${p.client}</p>
                    <p class="text-slate-600 text-sm mb-6 flex-grow">${p.description}</p>
                    
                    <div class="grid grid-cols-2 gap-4 text-sm border-t border-slate-100 pt-4">
                        <div>
                            <span class="block font-bold text-[#0B1325]">Timeline</span>
                            <span class="text-slate-500">${p.timeline}</span>
                        </div>
                        <div>
                            <span class="block font-bold text-[#0B1325]">Tech Stack</span>
                            <span class="text-slate-500">${p.tech_stack}</span>
                        </div>
                    </div>
                </div>
            </div>`;
        });
    } catch(e) {
        console.error("Failed to load portfolio", e);
    }
}
document.addEventListener("DOMContentLoaded", loadPortfolio);
</script>
</body>
"""
    if 'loadPortfolio' not in html:
        html = html.replace('</body>', script_block)

    with open('portfolio.html', 'w', encoding='utf-8') as f:
        f.write(html)

if __name__ == '__main__':
    run()
