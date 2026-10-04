TEMPLATES = {
    "Phase 1: Discovery": {
        "name": "Phase 1: Discovery & Viability Audit",
        "state": "STAGING",
        "required_inputs": [
            {"id": "client_brief", "name": "Initial Client Brief / Idea", "type": "document", "completed": False},
            {"id": "msa", "name": "Signed Master Services Agreement", "type": "document", "completed": False},
            {"id": "retainer_1", "name": "Cleared Phase 1 Retainer", "type": "financial", "completed": False}
        ],
        "steps": [
            {"id": "audit", "name": "Technical Viability Audit", "completed": False},
            {"id": "market", "name": "Market & Competitor Analysis", "completed": False},
            {"id": "budget", "name": "Initial Resource & Budget Forecasting", "completed": False}
        ],
        "expected_outputs": [
            {"id": "sys_req", "name": "Signed System Request", "type": "document", "completed": False},
            {"id": "feasibility", "name": "Approved Feasibility Study", "type": "document", "completed": False},
            {"id": "charter", "name": "Project Charter & Governance", "type": "document", "completed": False},
            {"id": "gate1", "name": "Phase Gate 1 Acceptance Form", "type": "document", "completed": False}
        ]
    },
    
    "Phase 2: Analysis": {
        "name": "Phase 2: Requirements Architecture",
        "state": "STAGING",
        "required_inputs": [
            {"id": "sys_req", "name": "Signed System Request (From Phase 1)", "type": "document", "completed": False},
            {"id": "feasibility", "name": "Approved Feasibility Study (From Phase 1)", "type": "document", "completed": False},
            {"id": "workplan", "name": "Master Project Workplan", "type": "document", "completed": False},
            {"id": "charter", "name": "Project Charter & Governance", "type": "document", "completed": False},
            {"id": "gate1", "name": "Phase Gate 1 Acceptance Form", "type": "document", "completed": False},
            {"id": "retainer_2", "name": "Cleared Phase 2 Retainer", "type": "financial", "completed": False},
            {"id": "msa_check", "name": "Master Services Agreement Active", "type": "legal", "completed": False}
        ],
        "steps": [
            {"id": "strategy", "name": "Step 1: Development Analysis Strategy", "completed": False},
            {"id": "reqs", "name": "Step 2: Determine Requirements", "completed": False},
            {"id": "process", "name": "Step 3: Model System Process", "completed": False},
            {"id": "data", "name": "Step 4: Model Relational Data", "completed": False}
        ],
        "expected_outputs": [
            {"id": "brd", "name": "Requirements Definition Document", "type": "document", "completed": False},
            {"id": "use_cases", "name": "Master Use Case Suite", "type": "document", "completed": False},
            {"id": "models", "name": "Complete Process & Logical Data Models", "type": "document", "completed": False},
            {"id": "rtm", "name": "Requirement Traceability Matrix", "type": "document", "completed": False},
            {"id": "proposal", "name": "System Proposal and Scope Freeze", "type": "document", "completed": False},
            {"id": "gate2", "name": "Phase Gate 2 Acceptance Form", "type": "document", "completed": False}
        ]
    },

    "Phase 3: Execution": {
        "name": "Phase 3: Technical Execution",
        "state": "STAGING",
        "required_inputs": [
            {"id": "proposal", "name": "System Proposal & Scope Freeze (From Phase 2)", "type": "document", "completed": False},
            {"id": "gate2", "name": "Phase Gate 2 Acceptance Form", "type": "document", "completed": False},
            {"id": "tranche_1", "name": "Cleared Phase 3 Tranche 1 Payment", "type": "financial", "completed": False}
        ],
        "steps": [
            {"id": "backend", "name": "Core Backend Implementation", "completed": False},
            {"id": "frontend", "name": "Frontend UI/UX Integration", "completed": False},
            {"id": "qa_cycle", "name": "Initial QA & Security Sweep", "completed": False}
        ],
        "expected_outputs": [
            {"id": "source", "name": "Production Source Code Archive", "type": "code", "completed": False},
            {"id": "keys", "name": "Deployment Credentials & Key Vault", "type": "security", "completed": False},
            {"id": "gate3", "name": "Phase Gate 3 Acceptance Form", "type": "document", "completed": False}
        ]
    }
}
