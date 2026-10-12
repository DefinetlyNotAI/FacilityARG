// Simple script to list public tables and show up to 5 sample rows each
// Usage: node scripts/read_db.js

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

function parseEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return {};
  const raw = fs.readFileSync(envPath, 'utf8');
  // strip common code fences if present
  const cleaned = raw.replace(/^```.*\n|\n```$/g, '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const out = {};
  for (const line of cleaned) {
    if (line.startsWith('#') || line.startsWith('//')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    // remove surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

(async function main() {
  try {
    const projectRoot = process.cwd();
    const env = parseEnvFile(path.join(projectRoot, '.env.local'));
    const connectionString = env.POSTGRES_URL || process.env.POSTGRES_URL;
    if (!connectionString) {
      console.error('No POSTGRES_URL found in .env.local or environment. Please provide it.');
      process.exit(2);
    }

    const caPath = path.join(projectRoot, 'certs', 'ca.pem');
    const ssl = fs.existsSync(caPath) ? { rejectUnauthorized: true, ca: fs.readFileSync(caPath).toString() } : undefined;

    const pool = new Pool({ connectionString, ssl });

    const client = await pool.connect();
    try {
      // list public tables
      const tablesRes = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;");
      const tables = tablesRes.rows.map(r => r.table_name);
      console.log(`Found ${tables.length} public tables:`, tables.join(', '));

      for (const table of tables) {
        try {
          const countRes = await client.query(`SELECT COUNT(*)::int AS cnt FROM ${table};`);
          const cnt = countRes.rows[0].cnt;
          console.log('\nTABLE:', table, '- rows:', cnt);

          if (cnt === 0) continue;

          // fetch up to 5 sample rows
          const sampleRes = await client.query(`SELECT * FROM ${table} LIMIT 5;`);
          console.log('Sample rows:', JSON.stringify(sampleRes.rows, null, 2));
        } catch (tErr) {
          console.warn(`  (skipping table ${table} due to error: ${tErr.message})`);
        }
      }
    } finally {
      client.release();
      await pool.end();
    }
  } catch (err) {
    console.error('Error:', err && err.stack ? err.stack : String(err));
    process.exit(1);
  }
})();

