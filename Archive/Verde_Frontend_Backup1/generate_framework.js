const fs = require('fs');

const framework = [
  {
    phase: 1,
    phaseName: "Project Initiation & Feasibility Analysis",
    weeks: [
      {
        week: 1,
        title: "Project Initiation & Feasibility Analysis",
        focus: "Why build this system?",
        steps: [
          {
            stepId: "1.1.1",
            title: "Step 1: Identify Opportunity",
            techniques: "Project Identification",
            mechanics: "Frame the business problem as an executive business case rather than a technical feature wish list. Define project sponsor, business drivers, business value, and formal constraints.",
            template: "PROJECT SPONSOR: [Name / Title]\nBUSINESS UNIT: [Unit]\nPROJECT NAME: [Name]\nDATE SUBMITTED: [DD/MM/YYYY]\n\n1. BUSINESS NEED:\n...\n\n2. BUSINESS REQUIREMENTS (High-Level):\n...\n\n3. BUSINESS VALUE:\n...\n\n4. CONSTRAINTS & DEPENDENCIES:\n..."
          },
          {
            stepId: "1.1.2",
            title: "Step 2: Analyze Feasibility",
            techniques: "Technical Feasibility, Economic Feasibility, Organizational Feasibility",
            mechanics: "De-risk the project across technology stack fit, cost-benefit projections (NPV, ROI, Breakeven), and stakeholder cultural alignment.",
            template: "PROJECT: [Insert Project Name]\nEVALUATION DATE: [DD/MM/YYYY]\n\n1. TECHNICAL FEASIBILITY (Can we build it?)\n...\n\n2. ECONOMIC FEASIBILITY (Should we build it?)\n...\n\n3. ORGANIZATIONAL FEASIBILITY (Will they use it?)\n...\n\nFINAL FEASIBILITY RECOMMENDATION:\n[ ] PROCEED\n[ ] DEFER"
          },
          {
            stepId: "1.1.3",
            title: "Phase Gate 1 Checkpoint",
            techniques: "Executive Sign-Off",
            mechanics: "Both the System Request and Feasibility Study are signed off by the executive sponsor before moving to project scheduling.",
            template: "Checklist:\n[ ] System Request Approved\n[ ] Feasibility Study Approved"
          }
        ]
      },
      {
        week: 2,
        title: "Project Governance, Workplan & Control",
        focus: "How do we structure the project?",
        steps: [
          {
            stepId: "1.2.1",
            title: "Step 1: Develop Workplan",
            techniques: "Time Estimation, Task Identification, WBS, PERT, Gantt",
            mechanics: "Deconstruct the project into hierarchical work packages, calculate effort baselines, establish task dependencies, and mark the critical path.",
            template: "PROJECT: [Name]\nVERSION: 1.0\n\n1.0 PHASE 1: PLANNING\n...\n2.0 PHASE 2: REQUIREMENTS\n...\n\nPERT Critical Path Calculation:\n..."
          },
          {
            stepId: "1.2.2",
            title: "Step 2: Staff Project",
            techniques: "Scope Management, Project Staffing",
            mechanics: "Map technical roles, capacity allocations, and RACI governance.",
            template: "1. RESOURCE ALLOCATION ROSTER:\n...\n2. RACI GOVERNANCE MATRIX:\n..."
          },
          {
            stepId: "1.2.3",
            title: "Step 3: Control and Direct Project",
            techniques: "Project Charter, CASE Repository, Standards, Risk Management",
            mechanics: "Establish production coding/documentation standards, repository access rules, and proactive risk mitigation paths.",
            template: "1. DOCUMENTATION & MODELING STANDARDS:\n...\n2. ENGINEERING & CODE QUALITY CONVENTIONS:\n...\n\nPROJECT RISK ASSESSMENT LOG:\n..."
          },
          {
            stepId: "1.2.4",
            title: "Phase Gate 2 Checkpoint",
            techniques: "Governance Sign-Off",
            mechanics: "The Workplan, Staffing Plan, Standards List, and Risk Assessment form the baseline project governance package.",
            template: "Checklist:\n[ ] Workplan Approved\n[ ] Staffing Plan Approved\n[ ] Risk Log Approved"
          }
        ]
      }
    ]
  },
  {
    phase: 2,
    phaseName: "Requirements Analysis & Business Modeling",
    weeks: [
      {
        week: 3,
        title: "Requirements Analysis & Business Modeling Strategy",
        focus: "Who, what, where, and when for this system?",
        steps: [
          {
            stepId: "2.3.1",
            title: "Step 1: Develop Analysis Strategy",
            techniques: "BPA, BPI, BPR",
            mechanics: "Select the intervention depth for each subsystem to avoid over-engineering simple tasks or applying quick patches to broken workflows.",
            template: "1. ANALYSIS STRATEGY SELECTION BY SYSTEM DOMAIN:\n...\n2. STAKEHOLDER ENGAGEMENT ARCHITECTURE:\n..."
          },
          {
            stepId: "2.3.2",
            title: "Step 2: Determine Business Requirements",
            techniques: "Interview, Questionnaire, Document Analysis, Observation, JAD",
            mechanics: "Synthesize user feedback and operational data into clear, testable functional and non-functional requirements.",
            template: "DOCUMENT CODE: RDD-001\n\n1. FUNCTIONAL REQUIREMENTS:\n...\n2. NON-FUNCTIONAL REQUIREMENTS:\n..."
          },
          {
            stepId: "2.3.3",
            title: "Phase Gate Checkpoint: Requirements Verification",
            techniques: "Requirements Sign-Off",
            mechanics: "The Requirements Definition Document must be signed off by business leads before structural modeling starts.",
            template: "[ ] RDD Signed Off"
          }
        ]
      },
      {
        week: 4,
        title: "System Modeling (Use Cases, Processes & Data)",
        focus: "Who, what, where, and when for this system?",
        steps: [
          {
            stepId: "2.4.1",
            title: "Step 1: Create Use Cases",
            techniques: "Use Case Analysis",
            mechanics: "Document system interactions with explicit triggers, preconditions, postconditions, normal flows, and alternative exception flows.",
            template: "USE CASE ID:\nUSE CASE NAME:\nPRIMARY ACTOR:\n...\nNORMAL FLOW:\n...\nALTERNATIVE FLOWS:\n..."
          },
          {
            stepId: "2.4.2",
            title: "Step 2: Model Processes",
            techniques: "Data Flow Diagramming (Gane & Sarson)",
            mechanics: "Establish strict data boundaries. Prevent syntax anomalies: black holes, miracles, gray holes.",
            template: "1. Context Diagram:\n...\n2. Level 0 DFD:\n..."
          },
          {
            stepId: "2.4.3",
            title: "Step 3: Model Data",
            techniques: "Entity Relationship Modeling, Normalization (1NF -> 2NF -> 3NF)",
            mechanics: "Transform raw transaction attributes into fully normalized relational structures.",
            template: "FIRST NORMAL FORM:\n...\nSECOND NORMAL FORM:\n...\nTHIRD NORMAL FORM:\n..."
          },
          {
            stepId: "2.4.4",
            title: "Step 4: Synthesize System Proposal & Enforce Scope Freeze",
            techniques: "Scope Freeze",
            mechanics: "Bundle the functional requirements, use cases, DFDs, and normalized data structures into an executive package that marks the formal end of Discovery.",
            template: "MASTER SCOPE FREEZE CLAUSE:\nBy signing below, the Client approves the functional requirements...\n\nClient Sign-off: ________"
          }
        ]
      }
    ]
  },
  {
    phase: 3,
    phaseName: "Physical System & Architecture Design",
    weeks: [
      {
        week: 5,
        title: "Physical System & Architecture Design",
        focus: "How will this system work?",
        steps: [
          {
            stepId: "3.5.1",
            title: "Step 1: Design Physical System",
            techniques: "Design Strategy, Alternative Matrix",
            mechanics: "Objectively evaluate whether to build custom, buy commercial off-the-shelf (COTS), or outsource the delivery.",
            template: "EVALUATION CRITERIA SCORING:\nOption A: Custom | Option B: COTS | Option C: Turnkey\n..."
          },
          {
            stepId: "3.5.2",
            title: "Step 2: Design Architecture",
            techniques: "Architecture Design, Hardware/Software Selection",
            mechanics: "Establish physical deployment topology, security zoning, container orchestration, and exact hardware requirements.",
            template: "1. NETWORK TOPOLOGY & DEPLOYMENT ARCHITECTURE:\n...\n2. HARDWARE & SOFTWARE SPECIFICATION LIST:\n..."
          },
          {
            stepId: "3.5.3",
            title: "Phase Gate 4 Checkpoint",
            techniques: "Infrastructure Sign-Off",
            mechanics: "Lock the physical system strategy and infrastructure specifications.",
            template: "[ ] Architecture Report Approved"
          }
        ]
      },
      {
        week: 6,
        title: "Interface Design & Prototyping",
        focus: "How will the users interact?",
        steps: [
          {
            stepId: "3.6.1",
            title: "Step 1: Design Interface",
            techniques: "Use Scenario, Structure Design, Interface Standards, Prototype, Evaluation",
            mechanics: "Transform user workflows into deterministic interface states.",
            template: "1. INTERFACE USE SCENARIO:\n...\n2. DESIGN TOKENS & COLOR PALETTE:\n...\n3. USABILITY EVALUATION REPORT:\n..."
          },
          {
            stepId: "3.6.2",
            title: "Phase Gate 5 Checkpoint",
            techniques: "UI Sign-Off",
            mechanics: "The Interface Design Specification, Standards, and Evaluation complete the presentation layer.",
            template: "[ ] UI Package Approved"
          }
        ]
      },
      {
        week: 7,
        title: "Program & Module Design",
        focus: "How will the logic execute?",
        steps: [
          {
            stepId: "3.7.1",
            title: "Step 1: Design Programs",
            techniques: "DFD Translation, Structure Charts, Program Specs",
            mechanics: "Decompose Level 1 DFDs into hierarchical program modules.",
            template: "MODULE NAME: ...\nINTERFACE SPECIFICATION:\n...\nPSEUDO-CODE LOGIC:\n..."
          },
          {
            stepId: "3.7.2",
            title: "Phase Gate 6 Checkpoint",
            techniques: "Logic Sign-Off",
            mechanics: "Physical Process Models and Program Specifications explicitly defined.",
            template: "[ ] Program Specs Approved"
          }
        ]
      },
      {
        week: 8,
        title: "Database & File Design",
        focus: "How will data persist?",
        steps: [
          {
            stepId: "3.8.1",
            title: "Step 1: Select Data Format & Map Storage Types",
            techniques: "Data Format Selection",
            mechanics: "Select database engines and file serialization protocols.",
            template: "System Subsystem | Storage Mechanism | Engine | Justification\n..."
          },
          {
            stepId: "3.8.2",
            title: "Step 2: Engineer Physical Data Model & DDL Schema",
            techniques: "ER Modeling, DDL Scripting",
            mechanics: "Translate logical 3NF schema into production SQL DDL.",
            template: "CREATE TABLE ... (\n  ...\n);"
          },
          {
            stepId: "3.8.3",
            title: "Step 3: Performance Tuning & Denormalization",
            techniques: "Denormalization, Indexing",
            mechanics: "Strategically optimize data access patterns.",
            template: "1. STRATEGIC DENORMALIZATION DECISIONS:\n...\n2. COMPOSITE & COVERING INDEX DESIGN:\n..."
          },
          {
            stepId: "3.8.4",
            title: "Step 4: Physical Data Specification (Data Dictionary)",
            techniques: "Data Dictionary",
            mechanics: "Document field formats, nullability, constraints.",
            template: "TABLE NAME: ...\nField | Type | Null? | Constraints\n..."
          },
          {
            stepId: "3.8.5",
            title: "Step 5: Volumetric Sizing & Storage Capacity",
            techniques: "Size Estimation",
            mechanics: "Calculate table sizes and 3-year capacity.",
            template: "1. BASELINE METRICS:\n...\n2. STORAGE SIZING:\n..."
          },
          {
            stepId: "3.8.6",
            title: "Phase Gate 7 Checkpoint",
            techniques: "DB Sign-Off",
            mechanics: "Physical database design package is finalized.",
            template: "[ ] Database Design Approved"
          }
        ]
      }
    ]
  },
  {
    phase: 4,
    phaseName: "Construct System (Programming & Testing)",
    weeks: [
      {
        week: 9,
        title: "Programming & Code Construction",
        focus: "Building the system.",
        steps: [
          {
            stepId: "4.9.1",
            title: "Step 1: Programming & Code Construction",
            techniques: "Programming & Clean Code Architecture",
            mechanics: "Translate Week 7 Program Specs and Week 8 DDL into verified endpoints.",
            template: "Code implementation documentation."
          },
          {
            stepId: "4.9.2",
            title: "Step 2: Software Testing & Defect Management",
            techniques: "Unit, Integration, System, Acceptance Testing",
            mechanics: "Systematically validate program correctness.",
            template: "1. TEST SUITE MATRIX:\n...\n2. DEFECT SEVERITY PROTOCOL:\n..."
          },
          {
            stepId: "4.9.3",
            title: "Step 3: Performance Testing",
            techniques: "Performance & Stress Testing",
            mechanics: "Stress test the application using load injection engines.",
            template: "PERFORMANCE & LOAD TEST BENCHMARK REPORT:\n..."
          },
          {
            stepId: "4.9.4",
            title: "Step 4: Technical System Documentation Runbook",
            techniques: "System Documentation",
            mechanics: "Provide development runbook for environment configurations.",
            template: "SYSTEM DOCUMENTATION & RUNBOOK:\n..."
          },
          {
            stepId: "4.9.5",
            title: "Phase Gate 8 Checkpoint",
            techniques: "Test Readiness",
            mechanics: "Codebase is compiled, tested, and validated.",
            template: "[ ] Test Readiness Approved"
          }
        ]
      },
      {
        week: 10,
        title: "Install System (Conversion, Migration & Transition)",
        focus: "Deploying the system.",
        steps: [
          {
            stepId: "4.10.1",
            title: "Step 1: Conversion Strategy Selection",
            techniques: "Conversion Strategy",
            mechanics: "Select cutover dimensions based on risk tolerance.",
            template: "CONVERSION STRATEGY EVALUATION MATRIX:\n..."
          },
          {
            stepId: "4.10.2",
            title: "Step 2: Data Migration & ETL",
            techniques: "Data Migration Scripting",
            mechanics: "Extract legacy data, deduplicate, and commit to PostgreSQL.",
            template: "DATA MIGRATION SQL VERIFICATION SCRIPT:\n..."
          },
          {
            stepId: "4.10.3",
            title: "Step 3: Business Contingency & Rollback",
            techniques: "Business Contingency Planning",
            mechanics: "Establish rollback conditions and maximum tolerable downtime.",
            template: "1. ROLLBACK TRIGGER CONDITIONS:\n...\n2. ROLLBACK EXECUTION PROTOCOL:\n..."
          },
          {
            stepId: "4.10.4",
            title: "Step 4: User & Admin Training Plan",
            techniques: "Training Plan",
            mechanics: "Segment end-user curricula based on roles.",
            template: "USER TRAINING PLAN:\nRole Track | Delivery Channel | Session Length | Core Focus\n..."
          },
          {
            stepId: "4.10.5",
            title: "Phase Gate 9 Checkpoint",
            techniques: "Cutover Rehearsal",
            mechanics: "Cutover plan is rehearsed, migration scripts dry-run.",
            template: "[ ] Cutover Approved"
          }
        ]
      }
    ]
  },
  {
    phase: 5,
    phaseName: "System Evolution, SLAs & Continuous Maintenance",
    weeks: [
      {
        week: 12,
        title: "Maintain System & Post-Implementation Audit",
        focus: "Long-term support and SLA.",
        steps: [
          {
            stepId: "5.12.1",
            title: "Step 1: Establish System Support & Maintenance",
            techniques: "Support Selection, System Maintenance Policy",
            mechanics: "Establish boundaries to prevent warranty exploitation.",
            template: "1. TIERED SUPPORT ESCALATION MATRIX:\n...\n2. MAINTENANCE CLASSIFICATIONS:\n..."
          },
          {
            stepId: "5.12.2",
            title: "Step 2: Problem Reporting & Change Management",
            techniques: "Problem Reporting, Change Request Logging",
            mechanics: "Channel post-launch tickets through formal technical paths.",
            template: "PROBLEM REPORT RECORD:\n...\nPOST-LAUNCH CHANGE REQUEST (CR):\n..."
          },
          {
            stepId: "5.12.3",
            title: "Step 3: Post-Implementation Audit",
            techniques: "Project Assessment",
            mechanics: "Objective review 30-60 days post-cutover.",
            template: "1. OBJECTIVE vs ACTUAL METRICS:\n...\n2. SYSTEMS ENGINEERING LESSONS LEARNED:\n...\n3. FINAL CLOSE-OUT:\n..."
          }
        ]
      }
    ]
  }
];

fs.writeFileSync('backend/src/sdlc_framework.json', JSON.stringify(framework, null, 2));
console.log('Created sdlc_framework.json');
