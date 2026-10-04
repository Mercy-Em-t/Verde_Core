import re

def run():
    with open('admin-project-detail.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Update the dropdown for commissioning
    old_dropdown = """<select id="phaseTemplate" class="border border-slate-300 rounded p-2 text-sm">
                                <option value="phase_2">Phase 2: Analysis</option>
                            </select>"""
    new_dropdown = """<select id="phaseTemplate" class="border border-slate-300 rounded p-2 text-sm">
                                <option value="Phase 1: Discovery">Phase 1: Discovery & Viability Audit</option>
                                <option value="Phase 2: Analysis">Phase 2: Requirements Architecture</option>
                                <option value="Phase 3: Execution">Phase 3: Technical Execution</option>
                            </select>"""
    html = html.replace(old_dropdown, new_dropdown)

    # 2. Update the rendering of phases
    old_render = """<div class="grid grid-cols-2 gap-4 mt-4">
                        <div>
                            <p class="text-xs font-bold text-slate-500 uppercase mb-2">Prerequisites</p>
                            <ul class="text-sm space-y-1">
                                ${p.prerequisites.map(req => `<li><i class="fa-solid fa-${req.completed ? 'check text-green-500' : 'xmark text-red-500'} mr-2"></i>${req.name}</li>`).join('')}
                            </ul>
                        </div>
                        <div>
                            <p class="text-xs font-bold text-slate-500 uppercase mb-2">Steps</p>
                            <ul class="text-sm space-y-1">
                                ${p.steps.map(step => `<li><i class="fa-solid fa-${step.completed ? 'check text-green-500' : 'clock text-amber-500'} mr-2"></i>${step.name}</li>`).join('')}
                            </ul>
                        </div>
                    </div>"""
    
    new_render = """
                    <div class="mt-4 bg-slate-50 border border-slate-200 rounded p-3 mb-4 flex items-center justify-between">
                        <div>
                            <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">Phase State</span>
                            <p class="font-bold text-lg ${p.state === 'STAGING' ? 'text-amber-600' : (p.state === 'ACTIVE' ? 'text-indigo-600' : 'text-emerald-600')}">
                                ${p.state || 'STAGING'}
                            </p>
                        </div>
                        ${p.state === 'STAGING' ? `<button onclick="alert('Upload functionality coming soon')" class="bg-amber-100 text-amber-700 hover:bg-amber-200 px-3 py-1.5 rounded text-xs font-bold border border-amber-300"><i class="fa-solid fa-upload mr-1"></i> Upload Prerequisite</button>` : ''}
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <!-- Inputs -->
                        <div>
                            <p class="text-xs font-bold text-slate-500 uppercase mb-3 border-b pb-1"><i class="fa-solid fa-inbox mr-1"></i> Required Inputs</p>
                            <ul class="text-sm space-y-2">
                                ${(p.required_inputs || []).map(req => `
                                    <li class="flex items-start">
                                        <i class="fa-solid fa-${req.completed ? 'check text-green-500' : (req.type === 'financial' ? 'file-invoice-dollar text-amber-500' : 'file-arrow-up text-amber-500')} mt-0.5 mr-2"></i>
                                        <span class="${req.completed ? 'text-slate-500 line-through' : 'text-slate-700 font-medium'}">${req.name}</span>
                                    </li>`).join('')}
                            </ul>
                        </div>

                        <!-- Execution Steps -->
                        <div>
                            <p class="text-xs font-bold text-slate-500 uppercase mb-3 border-b pb-1"><i class="fa-solid fa-list-check mr-1"></i> Execution Steps</p>
                            <ul class="text-sm space-y-2">
                                ${(p.steps || []).map(step => `
                                    <li class="flex items-start">
                                        <i class="fa-solid fa-${step.completed ? 'check text-green-500' : 'clock text-slate-400'} mt-0.5 mr-2"></i>
                                        <span class="${step.completed ? 'text-slate-500 line-through' : 'text-slate-700'}">${step.name}</span>
                                    </li>`).join('')}
                            </ul>
                        </div>

                        <!-- Outputs -->
                        <div>
                            <p class="text-xs font-bold text-slate-500 uppercase mb-3 border-b pb-1"><i class="fa-solid fa-box-open mr-1"></i> Expected Outputs</p>
                            <ul class="text-sm space-y-2">
                                ${(p.expected_outputs || []).map(out => `
                                    <li class="flex items-start">
                                        <i class="fa-solid fa-${out.completed ? 'check text-green-500' : 'file-export text-slate-400'} mt-0.5 mr-2"></i>
                                        <span class="${out.completed ? 'text-slate-500' : 'text-slate-700 font-medium'}">${out.name}</span>
                                    </li>`).join('')}
                            </ul>
                        </div>
                    </div>"""
    
    html = html.replace(old_render, new_render)
    
    with open('admin-project-detail.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Patched admin-project-detail.html with strict IO staging rendering.")

if __name__ == '__main__':
    run()
