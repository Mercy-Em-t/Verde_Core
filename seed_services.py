import re
import urllib.request
import json
import pg8000.native

def run():
    # 1. Read the original HTML file to extract the hardcoded services
    path = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\services.html'
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()

    titles = re.findall(r'<h3 class="font-bold text-lg">(.*?)</h3>', html)
    descs = re.findall(r'<div class="card-body text-slate-600 text-sm">\s*<p>(.*?)</p>', html)
    prices = re.findall(r'<span class="font-bold text-\[#0B1325\]">From KES (.*?)k</span>', html)
    
    # Also extract the SDLC Framework pricing
    sdlc_prices = re.findall(r'<div class="text-3xl font-bold text-\[#0B1325\] mb-4">KES (.*?)k</div>', html)
    sdlc_titles = re.findall(r'<h3 class="text-xl font-bold text-\[#0B1325\] mb-2">(.*?)</h3>', html)
    sdlc_descs = re.findall(r'<p class="text-slate-600 mb-6">(.*?)</p>', html)
    
    print(f"Extracted {len(titles)} standalone services and {len(sdlc_titles)} SDLC packages.")

    services_to_insert = []
    
    for i in range(len(titles)):
        try:
            desc = descs[i] if i < len(descs) else "Service description"
            price = float(prices[i].replace(',', '')) * 1000 if i < len(prices) else 0.0
            services_to_insert.append({"name": titles[i], "desc": desc, "price": price})
        except Exception as e:
            pass
            
    for i in range(len(sdlc_titles)):
        try:
            desc = sdlc_descs[i] if i < len(sdlc_descs) else "SDLC Package"
            price = float(sdlc_prices[i].replace(',', '')) * 1000 if i < len(sdlc_prices) else 0.0
            services_to_insert.append({"name": sdlc_titles[i], "desc": desc, "price": price})
        except Exception as e:
            pass

    # 2. Connect directly to Postgres and seed the DB
    try:
        conn = pg8000.native.Connection(user='verde_admin', password='verde_password', host='127.0.0.1', port=5455, database='verde_db')
        
        for svc in services_to_insert:
            conn.run("INSERT INTO Services (ServiceName, Description, Price) VALUES (:n, :d, :p)", 
                     n=svc["name"], d=svc["desc"], p=svc["price"])
        print("Successfully seeded the Postgres database with the extracted services!")
    except Exception as e:
        print("Error inserting to DB:", str(e))

if __name__ == '__main__':
    run()
