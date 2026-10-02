import pg from 'pg';

const client = new pg.Client({
  connectionString: 'postgresql://postgres.yjgskbdtnyzsmuzvnrsz:tryphen100%25@aws-0-eu-west-1.pooler.supabase.com:6543/postgres'
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL!');

    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        pm VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL,
        sponsor VARCHAR(255),
        need TEXT,
        state_json JSONB
      );
    `);
    
    console.log('Projects table created successfully.');
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
