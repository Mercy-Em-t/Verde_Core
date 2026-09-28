import pg8000.native

def run():
    try:
        conn = pg8000.native.Connection(user='verde_admin', password='verde_password', host='127.0.0.1', port=5455, database='verde_db')
        
        # Insert a few active leads
        leads = [
            ("Alice Smith", "alice@example.com", "Acme Corp", "Looking for cloud migration.", "NEW"),
            ("Bob Jones", "bob@example.com", "Globex", "Need a CTO.", "IN_REVIEW"),
            ("Charlie Brown", "charlie@example.com", "Snoopy Inc", "Security audit requested.", "QUALIFIED")
        ]
        
        for l in leads:
            conn.run("INSERT INTO Leads (Name, Email, Organization, Message, State) VALUES (:n, :e, :o, :m, :s)",
                     n=l[0], e=l[1], o=l[2], m=l[3], s=l[4])
                     
        # Insert a few projects
        conn.run("INSERT INTO Projects (LeadId, State) VALUES (3, 'PRE_ENGAGEMENT')")
                     
        print("Successfully seeded testing leads and projects!")
    except Exception as e:
        print("Error inserting to DB:", str(e))

if __name__ == '__main__':
    run()
