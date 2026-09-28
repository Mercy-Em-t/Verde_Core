import pg8000.native

def run():
    new_services = [
        {
            "name": "Cloud Migration & Architecture",
            "desc": "Seamless transition of on-premise legacy systems to highly scalable, fault-tolerant AWS or GCP cloud environments.",
            "price": 450000.0
        },
        {
            "name": "Fractional CTO Services",
            "desc": "Strategic technical direction, engineering team mentoring, and high-level vendor management for growing startups.",
            "price": 300000.0
        },
        {
            "name": "Custom Enterprise API Development",
            "desc": "Design and implementation of robust RESTful or GraphQL APIs to unify your disconnected enterprise software tools.",
            "price": 250000.0
        },
        {
            "name": "Database Optimization & Scaling",
            "desc": "Deep analysis of query bottlenecks, index restructuring, and replication setups to dramatically speed up data access times.",
            "price": 150000.0
        },
        {
            "name": "Automated CI/CD Pipeline Setup",
            "desc": "Eliminate deployment friction and reduce bugs with fully automated testing and zero-downtime deployment pipelines.",
            "price": 180000.0
        },
        {
            "name": "High-Volume E-Commerce Engines",
            "desc": "End-to-end development of custom, highly-scalable e-commerce platforms designed for massive concurrent traffic.",
            "price": 600000.0
        },
        {
            "name": "Security & Penetration Testing",
            "desc": "Rigorous ethical hacking and vulnerability scanning to secure your applications and databases against modern cyber threats.",
            "price": 220000.0
        },
        {
            "name": "UI/UX Enterprise Redesign",
            "desc": "Complete overhaul of internal dashboards or customer-facing portals with a strict focus on accessibility and user retention.",
            "price": 350000.0
        },
        {
            "name": "Data Analytics & BI Dashboards",
            "desc": "Transform raw company data into actionable insights with real-time, interactive business intelligence dashboards.",
            "price": 280000.0
        },
        {
            "name": "AI & Machine Learning Prototyping",
            "desc": "Rapid prototyping of LLM integrations or predictive machine learning models specifically tuned to your proprietary business data.",
            "price": 500000.0
        }
    ]

    try:
        conn = pg8000.native.Connection(user='verde_admin', password='verde_password', host='127.0.0.1', port=5455, database='verde_db')
        
        for svc in new_services:
            conn.run("INSERT INTO Services (ServiceName, Description, Price) VALUES (:n, :d, :p)", 
                     n=svc["name"], d=svc["desc"], p=svc["price"])
        print("Successfully seeded 10 new professional services into the database!")
    except Exception as e:
        print("Error inserting to DB:", str(e))

if __name__ == '__main__':
    run()
