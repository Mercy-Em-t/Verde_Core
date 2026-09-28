import pg8000.native

def run():
    projects = [
        {
            "title": "FinTech Payment Gateway Engine",
            "client": "KeshaBank",
            "category": "Web Architecture",
            "description": "Engineered a high-throughput transaction processing engine capable of handling 10,000 TPS with zero data loss or downtime.",
            "challenges": "The existing monolithic architecture was failing under weekend load spikes, causing transaction timeouts and risking regulatory compliance.",
            "solutions": "We implemented a microservices architecture using FastAPI and a highly optimized PostgreSQL cluster, decoupled by Redis Pub/Sub.",
            "tech_stack": "Python, FastAPI, PostgreSQL, Redis",
            "timeline": "8 Weeks",
            "roi": "100% uptime achieved, 4x increase in transaction volume ceiling.",
            "image_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
        },
        {
            "title": "Smart Logistics Platform",
            "client": "EcoFreight",
            "category": "Full-Stack System",
            "description": "Built a complete supply chain tracking system with real-time GPS websocket integration.",
            "challenges": "Drivers were using disconnected WhatsApp groups to report locations, resulting in massive supply chain inefficiencies.",
            "solutions": "Deployed a custom web application with real-time geolocation mapping, secure driver portals, and automated dispatch algorithms.",
            "tech_stack": "React, Node.js, WebSockets, MongoDB",
            "timeline": "12 Weeks",
            "roi": "30% reduction in average delivery times, 15% fuel cost savings.",
            "image_url": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80"
        }
    ]

    try:
        conn = pg8000.native.Connection(user='verde_admin', password='verde_password', host='127.0.0.1', port=5455, database='verde_db')
        for p in projects:
            conn.run('''
                INSERT INTO Portfolio (Title, ClientName, Category, Description, Challenges, Solutions, TechStack, Timeline, ROI, ImageUrl)
                VALUES (:t, :c, :cat, :d, :ch, :s, :ts, :tl, :roi, :img)
            ''', t=p['title'], c=p['client'], cat=p['category'], d=p['description'], ch=p['challenges'], s=p['solutions'], ts=p['tech_stack'], tl=p['timeline'], roi=p['roi'], img=p['image_url'])
        print("Successfully seeded testing portfolio projects!")
    except Exception as e:
        print("Error inserting to DB:", str(e))

if __name__ == '__main__':
    run()
