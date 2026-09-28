import pg8000.native
import json

def run():
    conn = pg8000.native.Connection(user='verde_admin', password='verde_password', host='127.0.0.1', port=5455, database='verde_db')

    # Create Table
    conn.run('''
        CREATE TABLE IF NOT EXISTS ProjectPhases (
            Id SERIAL PRIMARY KEY,
            ProjectId INT NOT NULL,
            PhaseName VARCHAR NOT NULL,
            Status VARCHAR DEFAULT 'Locked',
            Prerequisites JSONB,
            Steps JSONB,
            Deliverables JSONB,
            FOREIGN KEY (ProjectId) REFERENCES Projects(Id)
        )
    ''')

    # Seed Phase 2 for Project 2 (the test project we are using in the UI)
    prereqs = [
        {'id': 'sys_req', 'name': 'Signed System Request', 'completed': False},
        {'id': 'feasibility', 'name': 'Approved Feasibility Study', 'completed': False},
        {'id': 'workplan', 'name': 'Master Project Workplan', 'completed': False},
        {'id': 'charter', 'name': 'Project Charter and Governance', 'completed': False},
        {'id': 'gate1', 'name': 'Phase Gate 1 Acceptance Form', 'completed': False},
        {'id': 'retainer', 'name': 'Phase 2 Retainer Clearance', 'completed': False}
    ]

    steps = [
        {'id': 'strategy', 'name': 'Step 1: Development Analysis Strategy', 'completed': False},
        {'id': 'reqs', 'name': 'Step 2: Determine Requirements', 'completed': False},
        {'id': 'process', 'name': 'Step 3: Model System Process', 'completed': False},
        {'id': 'data', 'name': 'Step 4: Model Relational Data', 'completed': False}
    ]

    deliverables = [
        {'id': 'brd', 'name': 'Requirements Definition Document', 'status': 'pending'},
        {'id': 'use_cases', 'name': 'Master Use Case Suite', 'status': 'pending'},
        {'id': 'models', 'name': 'Complete Process & Logical Data Models', 'status': 'pending'},
        {'id': 'rtm', 'name': 'Requirement Traceability Matrix', 'status': 'pending'},
        {'id': 'proposal', 'name': 'System Proposal and Scope Freeze', 'status': 'pending'}
    ]

    existing = conn.run("SELECT Id FROM ProjectPhases WHERE ProjectId = 2 AND PhaseName = 'Phase 2: Analysis'")
    if not existing:
        conn.run('''
            INSERT INTO ProjectPhases (ProjectId, PhaseName, Status, Prerequisites, Steps, Deliverables)
            VALUES (2, 'Phase 2: Analysis', 'Locked', :p, :s, :d)
        ''', p=json.dumps(prereqs), s=json.dumps(steps), d=json.dumps(deliverables))
        print('Seeded Phase 2 for Project 2')
    else:
        print('Already seeded')

if __name__ == '__main__':
    run()
