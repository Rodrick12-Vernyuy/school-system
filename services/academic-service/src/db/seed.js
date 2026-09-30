// DEVELOPMENT-ONLY seed data: creates one default account per role so the
// system can be demonstrated immediately after `docker compose up --build`
// without a manual signup step. NEVER run this against a production
// database - these are well-known, publicly documented credentials.
require('dotenv').config();
const pool = require('../config/db');
const { hashPassword } = require('../services/authService');

const DEV_PASSWORD = 'EduERP#2026';

const ACCOUNTS = [
  { email: 'superadmin@eduerp.test', role: 'super_admin', fullName: 'Default Super Admin' },
  { email: 'admin@eduerp.test', role: 'admin', fullName: 'Default Admin' },
  { email: 'staff@eduerp.test', role: 'staff', fullName: 'Default Staff' },
  { email: 'student@eduerp.test', role: 'student', fullName: 'Default Student' },
];

async function seed() {
  const passwordHash = await hashPassword(DEV_PASSWORD);
  for (const account of ACCOUNTS) {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role, full_name)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      [account.email, passwordHash, account.role, account.fullName]
    );
    if (result.rowCount === 0) {
      console.log(`[seed] ${account.email} already exists, skipped`);
      continue;
    }
    const userId = result.rows[0].id;
    if (account.role === 'student') {
      await pool.query(
        `INSERT INTO students (user_id, student_number, full_name, email, program, level)
         VALUES ($1, 'STU-DEV-0001', $2, $3, 'BSc Computer Science', '300 Level')
         ON CONFLICT DO NOTHING`,
        [userId, account.fullName, account.email]
      );
    }
    console.log(`[seed] created ${account.role} account: ${account.email}`);
  }
  console.log(`[seed] done. Default password for every seeded account: ${DEV_PASSWORD}`);
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[seed] failed:', err.message);
      process.exit(1);
    });
}

module.exports = seed;
