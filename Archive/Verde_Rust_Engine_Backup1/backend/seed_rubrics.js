import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://tryphene:tryphene@db:5432/tryphene'
});

const rubrics = [
  {
    phase_number: 1,
    deliverable_type: 'Feasibility & Planning',
    criteria: [
      "System Request: Must state a tangible business need (not just 'we want an app'), measurable business value, and formal project constraints.",
      "Feasibility Study (Technical): Verifiable compatibility with client infrastructure; identified technical risks.",
      "Feasibility Study (Economic): A structured Cost-Benefit Analysis including Net Present Value (NPV), ROI calculation, and a breakeven/payback graph.",
      "Feasibility Study (Organizational): Stakeholder analysis identifying user adoption barriers and risk mitigations.",
      "Workplan & WBS: Detailed down to work packages with dependencies marked; PERT and Gantt charts generated with explicit critical paths."
    ]
  },
  {
    phase_number: 2,
    deliverable_type: 'Requirements & Modeling',
    criteria: [
      "Use Cases & Scenarios: Every functional requirement must map to a primary actor, trigger, preconditions, postconditions, normal execution steps, and at least two exception handling workflows.",
      "Process Modeling (DFDs): Context diagram must strictly define the system boundary and external entities.",
      "Process Modeling (DFDs): Level 0 and Level 1 diagrams must balance data flows without black holes, miracles, or gray holes.",
      "Data Modeling (ERD): All data stores from Level 1 DFDs must map to entities. Attributes must be normalized through Third Normal Form (3NF)."
    ]
  },
  {
    phase_number: 3,
    deliverable_type: 'Architecture & Technical Design',
    criteria: [
      "Architecture Report: Clear hardware/software specs, network topology diagrams, security protocols, and integration interfaces (REST/GraphQL/webhooks).",
      "Interface Design: Clickable UI/UX wireframes, documented design style guide, interface standard definitions, and full navigation site maps.",
      "Physical Data Model: Denormalized where necessary for performance tuning, complete with primary/foreign keys, indices, storage size estimations, and data dictionary specifications.",
      "Program Design: Structure charts and pseudocode/functional specs for every complex processing module."
    ]
  },
  {
    phase_number: 4,
    deliverable_type: 'Construction, Testing, & Deployment',
    criteria: [
      "Code Quality & Version Control: Clean commits adhering to agreed style conventions, zero critical linting errors, and full API documentation.",
      "Testing Logs: Signed test plan with verified passes across Unit Tests, System Integration Tests, and Performance/Load Tests.",
      "Deployment & Migration: Production deployment runbook, business contingency/rollback plan, and verified data migration scripts.",
      "UAT Sign-Off: Written confirmation from the client testing team verifying that all acceptance test cases have passed."
    ]
  }
];

async function seed() {
  const client = await pool.connect();
  try {
    for (const r of rubrics) {
      await client.query(
        'INSERT INTO qa_rubrics (phase_number, deliverable_type, criteria) VALUES ($1, $2, $3) ON CONFLICT (phase_number, deliverable_type) DO UPDATE SET criteria = EXCLUDED.criteria',
        [r.phase_number, r.deliverable_type, JSON.stringify(r.criteria)]
      );
      console.log("Seeded rubric for Phase " + r.phase_number);
    }
  } catch(e) {
    console.error(e);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
