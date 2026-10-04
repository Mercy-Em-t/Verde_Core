import re

def run():
    # Update portfolio.html
    with open('portfolio.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # The grid rendering should use TMAPI.portfolio() now, not the JSON file
    script_pattern = r'<script>.*?async function loadPortfolio\(\).*?</script>'
    new_script = """
<script src="config.js"></script>
<script src="api-client.js"></script>
<script>
async function loadPortfolio() {
    try {
        const res = await TMAPI.portfolio();
        const projects = res.portfolio;
        const grid = document.getElementById('portfolio-grid');
        if (!grid) return;
        grid.innerHTML = '';
        projects.forEach(p => {
            grid.innerHTML += `
            <a href="portfolio-detail.html?id=${p.id}" class="project-card flex flex-col h-full block cursor-pointer">
                <div class="h-48 bg-slate-200 overflow-hidden relative">
                    <img src="${p.image_url}" alt="${p.title}" class="w-full h-full object-cover">
                    <div class="absolute top-4 left-4 bg-white/90 backdrop-blur text-[#0B1325] text-xs font-bold px-3 py-1 rounded">
                        ${p.category}
                    </div>
                </div>
                <div class="p-6 flex flex-col flex-grow">
                    <h3 class="text-xl font-bold mb-1 group-hover:text-indigo-600">${p.title}</h3>
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
            </a>`;
        });
    } catch(e) {
        console.error("Failed to load portfolio", e);
    }
}
document.addEventListener("DOMContentLoaded", loadPortfolio);
</script>
"""
    html = re.sub(script_pattern, new_script, html, flags=re.DOTALL)
    
    with open('portfolio.html', 'w', encoding='utf-8') as f:
        f.write(html)

    # Create portfolio-detail.html
    detail_html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Case Study | Tryphene Murugat</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #F8FAFC; color: #0B1325; scroll-behavior: smooth; }
    </style>
</head>
<body class="min-h-screen flex flex-col">

    <nav class="w-full flex justify-center p-6 bg-white border-b border-slate-200 sticky top-0 z-50">
        <div class="w-full max-w-5xl flex justify-between items-center">
            <div class="text-2xl font-bold tracking-tight text-[#0B1325] cursor-pointer" onclick="window.location.href='index.html'">
                Tryphene<span class="font-light">Murugat</span>
            </div>
            <a href="portfolio.html" class="text-sm font-semibold text-slate-500 hover:text-[#0B1325]">← Back to Portfolio</a>
        </div>
    </nav>

    <main id="case-study-content" class="w-full max-w-5xl mx-auto px-4 py-16 hidden">
        <!-- Header -->
        <div class="mb-12 text-center max-w-3xl mx-auto">
            <span id="d-category" class="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full mb-4 uppercase tracking-wider"></span>
            <h1 id="d-title" class="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight"></h1>
            <p id="d-desc" class="text-xl text-slate-500 font-light"></p>
        </div>

        <!-- Hero Image -->
        <div class="w-full h-64 md:h-96 bg-slate-200 rounded-2xl overflow-hidden mb-16 shadow-lg">
            <img id="d-img" src="" class="w-full h-full object-cover">
        </div>

        <!-- Meta Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-white rounded-xl border border-slate-200 shadow-sm mb-16">
            <div>
                <span class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Client</span>
                <span id="d-client" class="font-bold text-[#0B1325]"></span>
            </div>
            <div>
                <span class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Timeline</span>
                <span id="d-timeline" class="font-bold text-[#0B1325]"></span>
            </div>
            <div>
                <span class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tech Stack</span>
                <span id="d-tech" class="font-bold text-[#0B1325]"></span>
            </div>
            <div>
                <span class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Business Impact</span>
                <span id="d-roi" class="font-bold text-emerald-600"></span>
            </div>
        </div>

        <!-- Content Split -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
                <h3 class="text-2xl font-bold mb-4 border-l-4 border-red-500 pl-4">The Challenge</h3>
                <p id="d-challenges" class="text-slate-600 leading-relaxed whitespace-pre-wrap"></p>
            </div>
            <div>
                <h3 class="text-2xl font-bold mb-4 border-l-4 border-emerald-500 pl-4">Our Solution</h3>
                <p id="d-solutions" class="text-slate-600 leading-relaxed whitespace-pre-wrap"></p>
            </div>
        </div>

        <!-- CTA -->
        <div class="mt-24 p-12 bg-[#0B1325] text-white rounded-2xl text-center">
            <h2 class="text-3xl font-bold mb-4">Ready to build something similar?</h2>
            <p class="text-slate-400 mb-8 max-w-xl mx-auto">Let's discuss how we can architect a scalable solution for your organization.</p>
            <a href="start-project.html" class="inline-block px-8 py-4 bg-white text-[#0B1325] font-bold rounded hover:bg-slate-100 transition-colors">Start the Conversation</a>
        </div>
    </main>

    <footer class="w-full py-8 text-center text-slate-500 text-sm border-t border-slate-200 mt-auto bg-white">
        <p>&copy; 2026 Tryphene Murugat Consultancy. Built for scale.</p>
    </footer>

    <script src="config.js"></script>
    <script src="api-client.js"></script>
    <script>
        async function loadCaseStudy() {
            const params = new URLSearchParams(window.location.search);
            const id = params.get('id');
            if (!id) return window.location.href = 'portfolio.html';

            try {
                const res = await TMAPI.getPortfolio(id);
                const p = res.project;
                
                document.getElementById('d-title').innerText = p.title;
                document.getElementById('d-category').innerText = p.category;
                document.getElementById('d-desc').innerText = p.description;
                document.getElementById('d-client').innerText = p.client;
                document.getElementById('d-timeline').innerText = p.timeline;
                document.getElementById('d-tech').innerText = p.tech_stack;
                document.getElementById('d-roi').innerText = p.roi;
                document.getElementById('d-challenges').innerText = p.challenges;
                document.getElementById('d-solutions').innerText = p.solutions;
                document.getElementById('d-img').src = p.image_url;

                document.getElementById('case-study-content').classList.remove('hidden');
                document.title = p.title + " | Case Study";
            } catch (err) {
                alert('Case study not found or server error.');
                window.location.href = 'portfolio.html';
            }
        }
        document.addEventListener('DOMContentLoaded', loadCaseStudy);
    </script>
</body>
</html>
"""
    with open('portfolio-detail.html', 'w', encoding='utf-8') as f:
        f.write(detail_html)

if __name__ == '__main__':
    run()
