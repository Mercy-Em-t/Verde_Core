import re

def run():
    with open('services.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # Find the grid div and replace its contents.
    pattern = r'(<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ml-5">)(.*?)(</div>\s*<!-- Section 2:)'
    
    html = re.sub(pattern, r'<div id="services-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ml-5"></div>\n<!-- Section 2:', html, flags=re.DOTALL)
    
    # If the above didn't match perfectly, just forcefully find the grid and replace contents.
    if 'services-grid' not in html:
        # Fallback manual replacement
        idx = html.find('<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ml-5">')
        if idx != -1:
            end_idx = html.find('<!-- Section 2', idx)
            html = html[:idx] + '<div id="services-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ml-5"></div>\n\n            ' + html[end_idx:]
    
    script_block = """
<script src="config.js"></script>
<script src="api-client.js"></script>
<script>
async function loadServices() {
    try {
        const res = await window.TMAPI.services();
        const grid = document.getElementById('services-grid');
        if (!grid) return;
        grid.innerHTML = '';
        res.services.forEach(svc => {
            grid.innerHTML += `
            <div class="catalog-card">
                <div class="card-header flex justify-between items-start">
                    <div>
                        <span class="badge badge-addon mb-2">Service</span>
                        <h3 class="font-bold text-lg">${svc.name}</h3>
                    </div>
                </div>
                <div class="card-body text-slate-600 text-sm">
                    <p>${svc.description}</p>
                </div>
                <div class="card-footer flex justify-between items-center">
                    <span class="font-bold text-[#0B1325]">$${svc.price.toLocaleString()}</span>
                    <a href="start-project.html?service=${svc.id}" class="text-indigo-600 font-bold text-sm hover:underline">Request</a>
                </div>
            </div>`;
        });
    } catch(e) {
        console.error("Failed to load services", e);
    }
}
document.addEventListener("DOMContentLoaded", loadServices);
</script>
</body>
"""
    if 'api-client.js' not in html:
        html = html.replace('</body>', script_block)

    with open('services.html', 'w', encoding='utf-8') as f:
        f.write(html)

if __name__ == '__main__':
    run()
