import os

path = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\index.html'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

new_sections = """    <!-- TRUST METRICS -->
    <section class="w-full bg-slate-50 py-16 border-t border-slate-200">
        <div class="max-w-6xl mx-auto px-4 text-center">
            <p class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Systems engineered for high-compliance industries</p>
            <div class="flex flex-wrap justify-center items-center gap-12 text-slate-300">
                <div class="flex items-center space-x-2"><i class="fa-solid fa-building-columns text-2xl"></i><span class="font-bold text-lg">FinTech & Banking</span></div>
                <div class="flex items-center space-x-2"><i class="fa-solid fa-truck-fast text-2xl"></i><span class="font-bold text-lg">Logistics & Supply</span></div>
                <div class="flex items-center space-x-2"><i class="fa-solid fa-heart-pulse text-2xl"></i><span class="font-bold text-lg">Healthcare Data</span></div>
                <div class="flex items-center space-x-2"><i class="fa-solid fa-shield-halved text-2xl"></i><span class="font-bold text-lg">Gov Compliance</span></div>
            </div>
        </div>
    </section>

    <!-- FINAL CTA -->
    <section class="w-full bg-[#0B1325] py-24 text-center relative overflow-hidden border-t-4 border-indigo-500">
        <!-- Abstract background pattern -->
        <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(#ffffff 1px, transparent 1px); background-size: 30px 30px;"></div>
        
        <div class="max-w-3xl mx-auto px-4 relative z-10">
            <h2 class="text-4xl font-extrabold text-white mb-6 tracking-tight">Ready to architect your enterprise system?</h2>
            <p class="text-lg text-slate-400 mb-10 leading-relaxed">Stop guessing with your technical debt. Run your requirements through our diagnostic engine to define your exact scope, timeline, and budget.</p>
            <div class="flex flex-col sm:flex-row justify-center items-center gap-4">
                <a href="start-project.html" class="px-8 py-4 bg-white text-[#0B1325] font-bold rounded shadow-lg hover:bg-slate-100 transition-colors flex items-center">
                    Start Project Assessment <i class="fa-solid fa-arrow-right ml-2"></i>
                </a>
                <a href="services.html" class="px-8 py-4 bg-transparent border border-white/20 text-white font-bold rounded hover:bg-white/10 transition-colors">
                    Review SDLC Catalog
                </a>
            </div>
        </div>
    </section>

    <!-- Footer -->"""

content = content.replace('    <!-- Footer -->', new_sections)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Injected Trust Metrics and Final CTA")
