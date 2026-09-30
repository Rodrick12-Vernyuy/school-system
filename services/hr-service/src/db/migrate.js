const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(sql);
  console.log('[hr-service] migration applied successfully');
}

if (require.main === module) {
  migrate().then(() => process.exit(0)).catch((err) => {
    console.error('[hr-service] migration failed:', err.message);
    process.exit(1);
  });
}

module.exports = migrate;
