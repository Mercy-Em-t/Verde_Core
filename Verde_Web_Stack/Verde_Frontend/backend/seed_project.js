const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://tryphene:replace-with-a-long-random-password@localhost:5433/tryphene' });

async function seed() {
  const clientId = '05d4e4c7-4fa9-4c75-8b20-f8b5a94385f2';
  const projectId = 'PRJ-9942';

  await pool.query(`INSERT INTO projects (id, client_id, name, status, stage) VALUES ($1, $2, 'Global Payment Gateway Redux', 'Active', 'Delivery') ON CONFLICT (id) DO NOTHING`, [projectId, clientId]);
  
  const phases = [
    [1, 'Feasibility', 'Completed'],
    [2, 'Requirements & Specs', 'Active'],
    [3, 'Architecture Blueprint', 'Not Started'],
    [4, 'Delivery Strategy', 'Not Started'],
    [5, 'Maintenance', 'Not Started']
  ];
  for (const p of phases) {
    await pool.query(`INSERT INTO project_phases (project_id, phase_number, name, status) VALUES ($1, $2, $3, $4) ON CONFLICT (project_id, phase_number) DO NOTHING`, [projectId, p[0], p[1], p[2]]);
  }

  await pool.query(`INSERT INTO documents (project_id, phase_number, title, url, visibility) VALUES ($1, 1, 'MSA_Signed.pdf', '/docs/msa.pdf', 'client')`, [projectId]);
  await pool.query(`INSERT INTO documents (project_id, phase_number, title, url, visibility) VALUES ($1, 1, 'Phase1_Feasibility.pdf', '/docs/p1.pdf', 'client')`, [projectId]);
  await pool.query(`INSERT INTO documents (project_id, phase_number, title, url, visibility) VALUES ($1, 2, 'Phase2_Specs.pdf', '/docs/p2.pdf', 'client')`, [projectId]);

  await pool.query(`INSERT INTO change_orders (id, project_id, title, description, status) VALUES ('CR-001', $1, 'Add Stripe Subs', 'Need Stripe subscriptions added.', 'Submitted') ON CONFLICT (id) DO NOTHING`, [projectId]);

  console.log('Seeded project');
  process.exit(0);
}
seed().catch(console.error);
