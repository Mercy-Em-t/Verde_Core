import os
import re

def run():
    with open('admin-leads.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # We want to replace the <main> block and the <script src="patch_admin.js"> with our custom logic for services
    pattern_main = r'<main class="flex-1 p-8 overflow-y-auto">.*?</main>'
    
    services_main = """
    <main class="flex-1 p-8 overflow-y-auto">
        <header class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-2xl font-bold text-[#0B1325]">Service Catalog Management</h1>
                <p class="text-sm text-slate-500">Manage active/inactive services, pricing, and descriptions.</p>
            </div>
            <button onclick="openModal('add-service-modal')" class="px-4 py-2 bg-[#0B1325] text-white rounded font-semibold shadow hover:bg-slate-800 transition-colors">
                <i class="fa-solid fa-plus mr-2"></i> Add New Service
            </button>
        </header>

        <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <table class="w-full text-left text-sm">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                        <th class="px-6 py-4">ID</th>
                        <th class="px-6 py-4">Service Name</th>
                        <th class="px-6 py-4">Description</th>
                        <th class="px-6 py-4">Price (KES)</th>
                        <th class="px-6 py-4">Status</th>
                        <th class="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody id="services-table-body" class="divide-y divide-slate-100">
                    <!-- Dynamic -->
                </tbody>
            </table>
        </div>
    </main>
    
    <!-- Add/Edit Service Modal -->
    <div id="add-service-modal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm hidden z-50 flex items-center justify-center">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 id="modal-title" class="font-bold text-[#0B1325] text-lg">Add New Service</h3>
                <button onclick="closeModal('add-service-modal')" class="text-slate-400 hover:text-slate-600"><i class="fa-solid fa-times"></i></button>
            </div>
            <div class="p-6 overflow-y-auto">
                <form id="service-form" onsubmit="saveService(event)">
                    <input type="hidden" id="service-id" value="">
                    
                    <label class="block text-sm font-semibold text-slate-700 mb-1">Service Name</label>
                    <input type="text" id="service-name" required class="w-full border border-slate-300 rounded p-2 mb-4 focus:outline-none focus:border-[#0B1325] focus:ring-1 focus:ring-[#0B1325]">
                    
                    <label class="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                    <textarea id="service-desc" required rows="3" class="w-full border border-slate-300 rounded p-2 mb-4 focus:outline-none focus:border-[#0B1325] focus:ring-1 focus:ring-[#0B1325]"></textarea>
                    
                    <label class="block text-sm font-semibold text-slate-700 mb-1">Price (KES)</label>
                    <input type="number" id="service-price" required min="0" step="0.01" class="w-full border border-slate-300 rounded p-2 mb-4 focus:outline-none focus:border-[#0B1325] focus:ring-1 focus:ring-[#0B1325]">
                    
                    <label class="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                    <select id="service-status" class="w-full border border-slate-300 rounded p-2 mb-6 focus:outline-none focus:border-[#0B1325]">
                        <option value="true">Active (Visible)</option>
                        <option value="false">Inactive (Hidden)</option>
                    </select>
                    
                    <div class="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                        <button type="button" onclick="closeModal('add-service-modal')" class="px-4 py-2 border border-slate-300 rounded text-slate-600 font-semibold hover:bg-slate-50 transition-colors">Cancel</button>
                        <button type="submit" class="px-4 py-2 bg-[#0B1325] text-white rounded font-semibold hover:bg-slate-800 transition-colors">Save Service</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    """
    html = re.sub(pattern_main, services_main, html, flags=re.DOTALL)
    
    # Remove patch_admin.js
    html = re.sub(r'<script src="patch_admin\.js"></script>', '', html)
    
    scripts = """
<script src="config.js"></script>
<script src="api-client.js"></script>
<script>
    // Ensure admin
    if (!TMAPI.hasSession() || localStorage.getItem('verde_role') !== 'Admin') {
        window.location.href = 'login.html';
    }
    
    let allServices = [];

    async function loadServices() {
        try {
            const res = await TMAPI.adminServices(); // returns list directly
            allServices = res;
            renderTable();
        } catch(e) {
            console.error(e);
            alert("Failed to load services");
        }
    }

    function renderTable() {
        const tbody = document.getElementById('services-table-body');
        tbody.innerHTML = '';
        allServices.forEach(svc => {
            const statusBadge = svc.is_active 
                ? '<span class="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">ACTIVE</span>'
                : '<span class="px-2 py-1 bg-slate-200 text-slate-600 rounded text-xs font-bold">INACTIVE</span>';
                
            tbody.innerHTML += `
                <tr class="hover:bg-slate-50 transition-colors">
                    <td class="px-6 py-4 font-mono text-xs text-slate-500">#${svc.id}</td>
                    <td class="px-6 py-4 font-semibold text-[#0B1325]">${svc.name}</td>
                    <td class="px-6 py-4 text-slate-500 max-w-xs truncate" title="${svc.description}">${svc.description}</td>
                    <td class="px-6 py-4 font-mono text-slate-600">${svc.price.toLocaleString()}</td>
                    <td class="px-6 py-4">${statusBadge}</td>
                    <td class="px-6 py-4 text-right">
                        <button onclick="editService(${svc.id})" class="text-indigo-600 hover:text-indigo-800 font-semibold text-sm">Edit</button>
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
        document.getElementById('service-form').reset();
        document.getElementById('service-id').value = '';
        document.getElementById('modal-title').innerText = 'Add New Service';
    }
    
    function editService(id) {
        const svc = allServices.find(s => s.id === id);
        if(!svc) return;
        document.getElementById('service-id').value = svc.id;
        document.getElementById('service-name').value = svc.name;
        document.getElementById('service-desc').value = svc.description;
        document.getElementById('service-price').value = svc.price;
        document.getElementById('service-status').value = svc.is_active ? 'true' : 'false';
        
        document.getElementById('modal-title').innerText = 'Edit Service';
        openModal('add-service-modal');
    }
    
    async function saveService(e) {
        e.preventDefault();
        const id = document.getElementById('service-id').value;
        const data = {
            name: document.getElementById('service-name').value,
            description: document.getElementById('service-desc').value,
            price: parseFloat(document.getElementById('service-price').value),
            is_active: document.getElementById('service-status').value === 'true'
        };
        
        try {
            if (id) {
                await TMAPI.updateService(id, data);
            } else {
                await TMAPI.createService(data);
            }
            closeModal('add-service-modal');
            loadServices(); // refresh table
        } catch(err) {
            alert(err.message || 'Failed to save service.');
        }
    }

    document.addEventListener("DOMContentLoaded", loadServices);
</script>
    """
    html = html.replace('</body>', scripts + '\n</body>')
    
    with open('admin-services.html', 'w', encoding='utf-8') as f:
        f.write(html)
        
    # Now we must patch the sidebar across all admin files to include the Services Tab
    import glob
    admin_files = glob.glob('admin*.html')
    admin_files.append('admin.html')
    
    nav_link = """
            <a href="admin-services.html" class="flex items-center px-4 py-3 text-sm font-semibold text-slate-500 rounded-lg hover:bg-slate-50 hover:text-[#0B1325] transition-all group">
                <i class="fa-solid fa-list-check w-5 h-5 mr-3 text-slate-400 group-hover:text-[#0B1325] transition-colors"></i> Services Catalog
            </a>"""
            
    for f_name in set(admin_files):
        with open(f_name, 'r', encoding='utf-8') as f:
            content = f.read()
            # Find a good place to insert the nav link. Right after Settings or Finance
            if 'admin-services.html' not in content:
                content = content.replace('admin-settings.html"', 'admin-settings.html"')
                # Let's just insert it before Settings
                idx = content.find('<a href="admin-settings.html"')
                if idx != -1:
                    content = content[:idx] + nav_link + "\n            " + content[idx:]
                    with open(f_name, 'w', encoding='utf-8') as f:
                        f.write(content)

if __name__ == '__main__':
    run()
