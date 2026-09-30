// Simple, explainable migration runner: read schema.sql and execute it.
// No migration framework is used on purpose - this keeps the SQL visible
// and easy to defend in an exam ("here is exactly what runs against the DB").
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function migrate() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  await pool.query(sql);
  console.log('[academic-service] migration applied successfully');
}

if (require.main === module) {
  migrate()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[academic-service] migration failed:', err.message);
      process.exit(1);
    });
}

module.exports = migrate;
