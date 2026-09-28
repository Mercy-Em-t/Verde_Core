PHASE_TEMPLATES = {
    "phase_2": {
        "name": "Phase 2: Analysis",
        "prerequisites": [
            {'id': 'sys_req', 'name': 'Signed System Request', 'completed': False},
            {'id': 'feasibility', 'name': 'Approved Feasibility Study', 'completed': False},
            {'id': 'workplan', 'name': 'Master Project Workplan', 'completed': False},
            {'id': 'charter', 'name': 'Project Charter and Governance', 'completed': False},
            {'id': 'gate1', 'name': 'Phase Gate 1 Acceptance Form', 'completed': False},
            {'id': 'retainer', 'name': 'Phase 2 Retainer Clearance', 'completed': False}
        ],
        "steps": [
            {'id': 'strategy', 'name': 'Step 1: Development Analysis Strategy', 'completed': False},
            {'id': 'reqs', 'name': 'Step 2: Determine Requirements', 'completed': False},
            {'id': 'process', 'name': 'Step 3: Model System Process', 'completed': False},
            {'id': 'data', 'name': 'Step 4: Model Relational Data', 'completed': False}
        ],
        "deliverables": [
            {'id': 'brd', 'name': 'Requirements Definition Document', 'status': 'pending'},
            {'id': 'use_cases', 'name': 'Master Use Case Suite', 'status': 'pending'},
            {'id': 'models', 'name': 'Complete Process & Logical Data Models', 'status': 'pending'},
            {'id': 'rtm', 'name': 'Requirement Traceability Matrix', 'status': 'pending'},
            {'id': 'proposal', 'name': 'System Proposal and Scope Freeze', 'status': 'pending'}
        ]
    }
}
