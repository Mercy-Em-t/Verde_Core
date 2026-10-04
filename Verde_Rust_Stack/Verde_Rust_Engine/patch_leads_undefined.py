import re

def run():
    with open('admin-leads.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # Fix the undefined variables passed to openRejectModal
    # Replace openRejectModal('${lead.id}', '${lead.contact}', '${lead.organisation}')
    # with openRejectModal('${lead.id}', '${lead.name}', 'Unknown Organisation')
    html = html.replace("openRejectModal('${lead.id}', '${lead.contact}', '${lead.organisation}')", 
                        "openRejectModal('${lead.id}', '${lead.name}', 'your organization')")
                        
    # Replace 'Unknown Organisation' header if it's hardcoded to display name
    html = html.replace(">Unknown Organisation<", ">${lead.name}<")
    html = html.replace("• ${lead.contact}", "• ${lead.email}")
    html = html.replace("• alice@example.com", "• ${lead.email}")
    html = html.replace("• bob@example.com", "• ${lead.email}")
    
    # Fix undefined in the HTML template string:
    # "Dear ${contact || 'Client'}," -> "Dear ${name || 'Client'},"
    html = html.replace("openRejectModal(leadId, contact, org)", "openRejectModal(leadId, name, org)")
    html = html.replace("${contact || 'Client'}", "${name || 'Client'}")
    
    with open('admin-leads.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Fixed admin-leads.html undefined variables")

if __name__ == '__main__':
    run()
