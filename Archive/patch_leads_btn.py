import re

def run():
    with open('admin-leads.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Fix getDynamicActionButton
    # In api-client.js, status is Titlecased. 'New', 'In_review', 'Contacted', 'Discovery', 'Qualified'
    new_btn_logic = """
        function getDynamicActionButton(lead) {
            const stat = (lead.status || '').toLowerCase();
            if (stat === 'new') {
                return `<button onclick="advanceLeadStatus('${lead.id}', 'IN_REVIEW')" class="px-4 py-2 text-sm bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700 transition shadow">Review Lead <i class="fa-solid fa-arrow-right ml-1"></i></button>`;
            } else if (stat === 'in_review') {
                return `<button onclick="advanceLeadStatus('${lead.id}', 'CONTACTED')" class="px-4 py-2 text-sm bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700 transition shadow">Mark Contacted <i class="fa-solid fa-arrow-right ml-1"></i></button>`;
            } else if (stat === 'contacted') {
                return `<button onclick="advanceLeadStatus('${lead.id}', 'DISCOVERY')" class="px-4 py-2 text-sm bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700 transition shadow">Book Discovery <i class="fa-solid fa-arrow-right ml-1"></i></button>`;
            } else if (stat === 'discovery') {
                return `<button onclick="advanceLeadStatus('${lead.id}', 'QUALIFIED')" class="px-4 py-2 text-sm bg-emerald-600 text-white rounded font-bold hover:bg-emerald-700 transition shadow">Mark Qualified <i class="fa-solid fa-check ml-1"></i></button>`;
            }
            return '';
        }
    """
    
    # 2. Fix advanceLeadStatus to hit the right API
    new_advance_logic = """
        async function advanceLeadStatus(leadId, targetStatus) {
            try {
                const btn = event.currentTarget;
                const oldHtml = btn.innerHTML;
                btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';
                btn.disabled = true;

                const res = await fetch(`http://127.0.0.1:8081/api/leads/${leadId}/transition`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                    body: JSON.stringify({ new_state: targetStatus })
                });
                if (!res.ok) throw new Error('Failed to update lead');
                
                // wait 2s for worker to process transition
                setTimeout(() => { loadLeads(); }, 2000);
            } catch (err) { alert('Error: ' + err.message); }
        }
    """

    # We need to replace the old logic using regex
    pattern1 = r'function getDynamicActionButton\(lead\)\s*\{.*?return \'\';\s*\}'
    html = re.sub(pattern1, new_btn_logic.strip(), html, flags=re.DOTALL)

    pattern2 = r'async function advanceLeadStatus\(leadId, targetStatus\)\s*\{.*?catch \(err\) \{ alert\(\'Error: \' \+ err\.message\); \}\s*\}'
    html = re.sub(pattern2, new_advance_logic.strip(), html, flags=re.DOTALL)

    with open('admin-leads.html', 'w', encoding='utf-8') as f:
        f.write(html)
    
    print("Patched admin-leads.html dynamic buttons and transition API.")

if __name__ == '__main__':
    run()
