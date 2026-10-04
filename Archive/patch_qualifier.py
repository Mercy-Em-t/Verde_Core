import re

def run():
    with open('admin-leads.html', 'r', encoding='utf-8') as f:
        html = f.read()

    js_logic = """
        // Qualification Engine Logic
        document.addEventListener('DOMContentLoaded', () => {
            const radios = document.querySelectorAll('input[name="scope"]');
            const resultBox = document.getElementById('qualifierResult');
            const qTitle = document.getElementById('qTitle');
            const qDesc = document.getElementById('qDesc');
            const qBtn = resultBox.querySelector('button');

            radios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    resultBox.classList.remove('hidden');
                    if(e.target.value === 'idea') {
                        qTitle.innerText = 'Phase 1: Discovery & Viability';
                        qDesc.innerText = 'You require a comprehensive feasibility audit and SRS documentation before heavy capital expenditure.';
                        qBtn.innerText = 'Convert to Phase 1 Discovery';
                        qBtn.onclick = () => alert('Retainer Invoice Generated. Lead moved to Phase 1.');
                    } else if (e.target.value === 'spec') {
                        qTitle.innerText = 'Phase 2: Architecture & Analysis';
                        qDesc.innerText = 'Client possesses partial documentation. Proceed to formal Systems Analysis and Database Modeling.';
                        qBtn.innerText = 'Convert to Phase 2 Analysis';
                        qBtn.onclick = () => alert('Retainer Invoice Generated. Lead moved to Phase 2.');
                    }
                });
            });
        });
    """

    # Inject into the script tag at the bottom
    pattern = r'(</script>\s*</body>)'
    
    if "Qualification Engine Logic" not in html:
        new_html = re.sub(pattern, js_logic + r'\1', html, flags=re.DOTALL)
        with open('admin-leads.html', 'w', encoding='utf-8') as f:
            f.write(new_html)
        print("Injected qualification logic into admin-leads.html")
    else:
        print("Already injected")

if __name__ == '__main__':
    run()
