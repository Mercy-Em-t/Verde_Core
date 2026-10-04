import re
import glob

def run():
    # Copy layout from admin-services.html
    with open('admin-services.html', 'r', encoding='utf-8') as f:
        html = f.read()

    pattern_main = r'<main class="flex-1 p-8 overflow-y-auto">.*?</main>'
    
    portfolio_main = """
    <main class="flex-1 p-8 overflow-y-auto">
        <header class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-2xl font-bold text-[#0B1325]">Portfolio Management</h1>
                <p class="text-sm text-slate-500">Manage case studies and past projects for the public portfolio.</p>
            </div>
            <button onclick="openModal('add-portfolio-modal')" class="px-4 py-2 bg-[#0B1325] text-white rounded font-semibold shadow hover:bg-slate-800 transition-colors">
                <i class="fa-solid fa-plus mr-2"></i> Add Case Study
            </button>
        </header>

        <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <table class="w-full text-left text-sm">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                        <th class="px-6 py-4">Project Title</th>
                        <th class="px-6 py-4">Client</th>
                        <th class="px-6 py-4">Category</th>
                        <th class="px-6 py-4">Status</th>
                        <th class="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody id="portfolio-table-body" class="divide-y divide-slate-100">
                    <!-- Dynamic -->
                </tbody>
            </table>
        </div>
    </main>
    
    <!-- Add/Edit Portfolio Modal -->
    <div id="add-portfolio-modal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm hidden z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-full">
            <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 id="modal-title" class="font-bold text-[#0B1325] text-lg">Add Case Study</h3>
                <button onclick="closeModal('add-portfolio-modal')" class="text-slate-400 hover:text-slate-600"><i class="fa-solid fa-times"></i></button>
            </div>
            <div class="p-6 overflow-y-auto">
                <form id="portfolio-form" onsubmit="savePortfolio(event)">
                    <input type="hidden" id="p-id" value="">
                    
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-1">Project Title</label>
                            <input type="text" id="p-title" required class="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-[#0B1325]">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-1">Client Name</label>
                            <input type="text" id="p-client" class="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-[#0B1325]">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                            <input type="text" id="p-category" placeholder="e.g. Web Architecture" class="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-[#0B1325]">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-1">Timeline</label>
                            <input type="text" id="p-timeline" class="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-[#0B1325]">
                        </div>
                    </div>

                    <label class="block text-sm font-semibold text-slate-700 mb-1">Description (Summary)</label>
                    <textarea id="p-desc" required rows="2" class="w-full border border-slate-300 rounded p-2 mb-4 focus:outline-none focus:border-[#0B1325]"></textarea>
                    
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-1">Challenges</label>
                            <textarea id="p-challenges" rows="3" class="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-[#0B1325]"></textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-1">Solutions</label>
                            <textarea id="p-solutions" rows="3" class="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-[#0B1325]"></textarea>
                        </div>
                    </div>

                    <div class="grid grid-cols-3 gap-4 mb-6">
                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-1">Tech Stack</label>
                            <input type="text" id="p-tech" placeholder="Python, React..." class="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-[#0B1325]">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-1">ROI / Impact</label>
                            <input type="text" id="p-roi" class="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-[#0B1325]">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                            <select id="p-status" class="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-[#0B1325]">
                                <option value="true">Active (Visible)</option>
                                <option value="false">Inactive (Hidden)</option>
                            </select>
                        </div>
                    </div>

                    <label class="block text-sm font-semibold text-slate-700 mb-1">Image URL</label>
                    <input type="text" id="p-img" class="w-full border border-slate-300 rounded p-2 mb-4 focus:outline-none focus:border-[#0B1325]">
                    
                    <div class="flex justify-end space-x-3 pt-4 border-t border-slate-100 mt-4">
                        <button type="button" onclick="closeModal('add-portfolio-modal')" class="px-4 py-2 border border-slate-300 rounded text-slate-600 font-semibold hover:bg-slate-50 transition-colors">Cancel</button>
                        <button type="submit" class="px-4 py-2 bg-[#0B1325] text-white rounded font-semibold hover:bg-slate-800 transition-colors">Save Case Study</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    """
    html = re.sub(pattern_main, portfolio_main, html, flags=re.DOTALL)
    
    script_pattern = r'<script>.*?let allServices = \[\];.*?</script>'
    
    scripts = """
<script>
    if (!TMAPI.hasSession() || localStorage.getItem('verde_role') !== 'Admin') {
        window.location.href = 'login.html';
    }
    
    let allProjects = [];

    async function loadPortfolio() {
        try {
            allProjects = await TMAPI.adminPortfolio(); 
            renderTable();
        } catch(e) {
            console.error(e);
            alert("Failed to load portfolio");
        }
    }

    function renderTable() {
        const tbody = document.getElementById('portfolio-table-body');
        tbody.innerHTML = '';
        allProjects.forEach(p => {
            const statusBadge = p.is_active 
                ? '<span class="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">ACTIVE</span>'
                : '<span class="px-2 py-1 bg-slate-200 text-slate-600 rounded text-xs font-bold">INACTIVE</span>';
                
            tbody.innerHTML += `
                <tr class="hover:bg-slate-50 transition-colors">
                    <td class="px-6 py-4 font-semibold text-[#0B1325]">${p.title}</td>
                    <td class="px-6 py-4 text-slate-500">${p.client}</td>
                    <td class="px-6 py-4 text-slate-500">${p.category}</td>
                    <td class="px-6 py-4">${statusBadge}</td>
                    <td class="px-6 py-4 text-right">
                        <button onclick="editPortfolio(${p.id})" class="text-indigo-600 hover:text-indigo-800 font-semibold text-sm mr-3">Edit</button>
                        <a href="portfolio-detail.html?id=${p.id}" target="_blank" class="text-slate-400 hover:text-slate-600 font-semibold text-sm">Preview</a>
                    </td>
                </tr>
            `;
        });
    }
    
    function openModal(id) {
        document.getElementById(id).classList.remove('hidden');
    }
    function closeModal(id) {
        document.getElementById(id).classList.add('hidden');
        document.getElementById('portfolio-form').reset();
        document.getElementById('p-id').value = '';
        document.getElementById('modal-title').innerText = 'Add Case Study';
    }
    
    function editPortfolio(id) {
        const p = allProjects.find(x => x.id === id);
        if(!p) return;
        document.getElementById('p-id').value = p.id;
        document.getElementById('p-title').value = p.title;
        document.getElementById('p-client').value = p.client;
        document.getElementById('p-category').value = p.category;
        document.getElementById('p-desc').value = p.description;
        document.getElementById('p-challenges').value = p.challenges;
        document.getElementById('p-solutions').value = p.solutions;
        document.getElementById('p-tech').value = p.tech_stack;
        document.getElementById('p-timeline').value = p.timeline;
        document.getElementById('p-roi').value = p.roi;
        document.getElementById('p-img').value = p.image_url;
        document.getElementById('p-status').value = p.is_active ? 'true' : 'false';
        
        document.getElementById('modal-title').innerText = 'Edit Case Study';
        openModal('add-portfolio-modal');
    }
    
    async function savePortfolio(e) {
        e.preventDefault();
        const id = document.getElementById('p-id').value;
        const data = {
            title: document.getElementById('p-title').value,
            client: document.getElementById('p-client').value,
            category: document.getElementById('p-category').value,
            description: document.getElementById('p-desc').value,
            challenges: document.getElementById('p-challenges').value,
            solutions: document.getElementById('p-solutions').value,
            tech_stack: document.getElementById('p-tech').value,
            timeline: document.getElementById('p-timeline').value,
            roi: document.getElementById('p-roi').value,
            image_url: document.getElementById('p-img').value,
            is_active: document.getElementById('p-status').value === 'true'
        };
        
        try {
            if (id) {
                await TMAPI.updatePortfolio(id, data);
            } else {
                await TMAPI.createPortfolio(data);
            }
            closeModal('add-portfolio-modal');
            loadPortfolio(); 
        } catch(err) {
            alert(err.message || 'Failed to save.');
        }
    }

    document.addEventListener("DOMContentLoaded", loadPortfolio);
</script>
    """
    html = re.sub(script_pattern, scripts, html, flags=re.DOTALL)
    
    with open('admin-portfolio.html', 'w', encoding='utf-8') as f:
        f.write(html)
        
    admin_files = glob.glob('admin*.html')
    admin_files.append('admin.html')
    
    nav_link = """
            <a href="admin-portfolio.html" class="flex items-center px-4 py-3 text-sm font-semibold text-slate-500 rounded-lg hover:bg-slate-50 hover:text-[#0B1325] transition-all group">
                <i class="fa-solid fa-briefcase w-5 h-5 mr-3 text-slate-400 group-hover:text-[#0B1325] transition-colors"></i> Portfolio
            </a>"""
            
    for f_name in set(admin_files):
        with open(f_name, 'r', encoding='utf-8') as f:
            content = f.read()
            if 'admin-portfolio.html' not in content:
                idx = content.find('<a href="admin-services.html"')
                if idx != -1:
                    content = content[:idx] + nav_link + "\n            " + content[idx:]
                    with open(f_name, 'w', encoding='utf-8') as f:
                        f.write(content)

if __name__ == '__main__':
    run()
