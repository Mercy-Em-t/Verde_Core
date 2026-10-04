import re

def run():
    with open('admin.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # Find the + New Project button and replace its onclick
    old_btn = r'<button onclick="alert\([^)]+\)" class="bg-[#0B1325] text-white px-4 py-2 rounded font-bold text-sm hover:bg-slate-800 transition">\s*\+ New Project\s*</button>'
    new_btn = r'<button onclick="openCommissionModal()" class="bg-[#0B1325] text-white px-4 py-2 rounded font-bold text-sm hover:bg-slate-800 transition shadow">\+ Instantiate Project</button>'
    
    html = re.sub(old_btn, new_btn, html)

    # If already replaced but not exact match, fallback to finding the literal string
    if '+ Instantiate Project' not in html:
        html = html.replace("onclick=\"alert('CAPACITY GUARDRAIL", 'onclick="openCommissionModal()" data-removed="')
        html = html.replace("+ New Project", "+ Instantiate Project")

    # Inject the Modal HTML right before closing </body>
    modal_html = """
  <!-- Project Commissioning Modal -->
  <div id="commissionModal" class="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center hidden z-50">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
          <div class="bg-[#0B1325] p-5 flex justify-between items-center text-white">
              <h2 class="text-xl font-bold">Instantiate New Project</h2>
              <button onclick="closeCommissionModal()" class="text-slate-400 hover:text-white"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="p-6 space-y-5">
              <div class="bg-amber-50 text-amber-800 text-sm p-3 rounded border border-amber-200 flex items-start space-x-2 font-medium">
                  <i class="fa-solid fa-shield-halved mt-0.5"></i>
                  <p>This action converts a Qualified Lead into an Active Project, provisioning a Client Portal and locking Phase 1 behind an MSA and Retainer Invoice.</p>
              </div>

              <div>
                  <label class="block text-sm font-bold text-slate-700 mb-1">Select Qualified Lead</label>
                  <select id="leadSelect" class="w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-[#0B1325] outline-none bg-slate-50">
                      <option value="">Loading qualified leads...</option>
                  </select>
              </div>

              <div>
                  <label class="block text-sm font-bold text-slate-700 mb-1">Starting Phase Template</label>
                  <select id="phaseSelect" class="w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-[#0B1325] outline-none bg-slate-50">
                      <option value="Phase 1: Discovery">Phase 1: Discovery & Viability Audit</option>
                      <option value="Phase 2: Analysis">Phase 2: Requirements Architecture</option>
                      <option value="Phase 3: Execution">Phase 3: Technical Execution</option>
                  </select>
              </div>

              <button id="execCommissionBtn" onclick="executeCommissioning()" class="w-full py-3 bg-indigo-600 text-white font-bold rounded shadow hover:bg-indigo-700 transition flex items-center justify-center">
                  <i class="fa-solid fa-rocket mr-2"></i> Execute Project Conversion
              </button>
          </div>
      </div>
  </div>

  <script>
      async function openCommissionModal() {
          document.getElementById('commissionModal').classList.remove('hidden');
          const select = document.getElementById('leadSelect');
          select.innerHTML = '<option value="">Fetching pool...</option>';
          try {
              const leads = await window.TMAPI.leads();
              // Normalize status due to previous mapping
              const qualified = leads.filter(l => l.status && l.status.toLowerCase() === 'qualified');
              
              if (qualified.length === 0) {
                  select.innerHTML = '<option value="">No qualified leads found in pipeline.</option>';
                  document.getElementById('execCommissionBtn').disabled = true;
                  document.getElementById('execCommissionBtn').classList.add('opacity-50', 'cursor-not-allowed');
              } else {
                  select.innerHTML = qualified.map(l => `<option value="${l.id}">${l.name} (${l.email})</option>`).join('');
                  document.getElementById('execCommissionBtn').disabled = false;
                  document.getElementById('execCommissionBtn').classList.remove('opacity-50', 'cursor-not-allowed');
              }
          } catch(e) {
              select.innerHTML = '<option value="">Error fetching leads</option>';
          }
      }

      function closeCommissionModal() {
          document.getElementById('commissionModal').classList.add('hidden');
      }

      async function executeCommissioning() {
          const leadId = document.getElementById('leadSelect').value;
          const phase = document.getElementById('phaseSelect').value;
          if(!leadId) return;

          const btn = document.getElementById('execCommissionBtn');
          btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-2"></i> Provisioning Architecture...';
          btn.disabled = true;

          try {
              const token = localStorage.getItem('verde_api_token');
              const res = await fetch('http://127.0.0.1:8081/api/admin/projects/commission-from-lead', {
                  method: 'POST',
                  headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
                  body: JSON.stringify({ lead_id: parseInt(leadId), start_phase: phase })
              });
              
              if(!res.ok) throw new Error("Commissioning failed.");
              
              const data = await res.json();
              alert(`Success! Client Portal Provisioned. Project ID: ${data.project_id}\\nPending MSA and Phase Retainer attached.`);
              closeCommissionModal();
              window.location.reload();
          } catch(e) {
              alert(e.message);
              btn.innerHTML = '<i class="fa-solid fa-rocket mr-2"></i> Execute Project Conversion';
              btn.disabled = false;
          }
      }
  </script>
"""

    if "commissionModal" not in html:
        html = html.replace("</body>", modal_html + "\n</body>")
        with open('admin.html', 'w', encoding='utf-8') as f:
            f.write(html)
        print("Frontend Commission Modal injected.")
    else:
        print("Already injected.")

if __name__ == '__main__':
    run()
