import os
import re

base_dir = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17'

pages_to_create = [
    {
        "filename": "labs.html",
        "title": "Emurugat Labs",
        "icon": "fa-solid fa-flask-vial",
        "desc": "Welcome to our private R&D sandbox. Here we test cutting-edge architectures before deploying them to enterprise environments.",
        "next_path": "library.html",
        "next_text": "Explore Knowledgebase",
        "search_hint": "Emurugat Labs"
    },
    {
        "filename": "breakdowns.html",
        "title": "Architecture Breakdowns",
        "icon": "fa-brands fa-youtube",
        "desc": "Deep-dive video sessions and post-mortems tearing down complex B2B architectures and scaling strategies.",
        "next_path": "services.html",
        "next_text": "View Our Services",
        "search_hint": "Architecture Breakdowns"
    },
    {
        "filename": "background.html",
        "title": "Our Background",
        "icon": "fa-solid fa-id-card-clip",
        "desc": "Founded on strict engineering principles, Tryphene Murugat Consultancy builds mission-critical systems that scale without technical debt.",
        "next_path": "portfolio.html",
        "next_text": "See the Portfolio",
        "search_hint": "Our Background"
    },
    {
        "filename": "outreach.html",
        "title": "Community Outreach",
        "icon": "fa-solid fa-people-group",
        "desc": "We believe in raising the standard of global engineering. Explore our mentorship programs and open-source contributions.",
        "next_path": "talent.html",
        "next_text": "Join as a Subcontractor",
        "search_hint": "Community Outreach"
    },
    {
        "filename": "thought-leadership.html",
        "title": "Thought Leadership",
        "icon": "fa-brands fa-linkedin",
        "desc": "Essays and technical whitepapers on navigating the complexities of enterprise software development and Phase 2 scoping.",
        "next_path": "library.html",
        "next_text": "Read the Insights",
        "search_hint": "Thought Leadership"
    }
]

template = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | Tryphene Murugat</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap');
        body {{ font-family: 'Inter', sans-serif; }}
    </style>
</head>
<body class="bg-[#F8FAFC] min-h-screen flex flex-col">
    <!-- Header -->
    <header class="w-full bg-[#0B1325] px-8 py-5 flex justify-between items-center text-white shadow-md">
        <h1 class="font-bold text-xl tracking-widest uppercase">Tryphene Murugat</h1>
        <a href="index.html" class="text-sm text-slate-300 hover:text-white transition font-semibold"><i class="fa-solid fa-arrow-left mr-2"></i>Back to Home</a>
    </header>

    <!-- Main Content -->
    <main class="flex-grow flex flex-col items-center justify-center p-8 text-center max-w-3xl mx-auto">
        <div class="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 border border-slate-100">
            <i class="{icon} text-4xl text-[#0B1325]"></i>
        </div>
        <h2 class="text-4xl font-extrabold text-slate-800 mb-4">{title}</h2>
        <p class="text-lg text-slate-600 mb-10 leading-relaxed">{desc}</p>

        <div class="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <a href="index.html" class="px-8 py-3 bg-white border border-slate-300 rounded shadow-sm text-slate-700 font-bold hover:bg-slate-50 transition-colors">
                Return to Source
            </a>
            <a href="{next_path}" class="px-8 py-3 bg-indigo-600 text-white font-bold rounded shadow-md hover:bg-indigo-700 transition-colors">
                {next_text} <i class="fa-solid fa-arrow-right ml-2"></i>
            </a>
        </div>
    </main>
</body>
</html>"""

# Generate pages
for page in pages_to_create:
    content = template.format(
        title=page["title"],
        icon=page["icon"],
        desc=page["desc"],
        next_path=page["next_path"],
        next_text=page["next_text"]
    )
    with open(os.path.join(base_dir, page["filename"]), 'w', encoding='utf-8') as f:
        f.write(content)

# Patch index.html
index_path = os.path.join(base_dir, 'index.html')
with open(index_path, 'r', encoding='utf-8') as f:
    index_html = f.read()

# Replace the specific # hrefs based on the search hint nearby
for page in pages_to_create:
    # Find a chunk of HTML that contains the search hint, back up to the nearest href="#"
    pattern = r'href="#"([^>]*>.*?{hint})'.format(hint=page["search_hint"])
    # Replace href="#" with href="filename.html"
    index_html = re.sub(pattern, f'href="{page["filename"]}"\\1', index_html, flags=re.DOTALL | re.IGNORECASE)

with open(index_path, 'w', encoding='utf-8') as f:
    f.write(index_html)

print("Generated dummy pages and patched index.html")
