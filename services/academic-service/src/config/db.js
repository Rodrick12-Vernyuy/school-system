// Single shared PostgreSQL connection pool for this service.
// Using the `pg` module directly (no ORM) so students can read plain SQL.
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    `postgresql://${process.env.POSTGRES_USER || 'erp'}:${process.env.POSTGRES_PASSWORD || 'erp_dev_password'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'academic_db'}`,
});

pool.on('error', (err) => {
  console.error('[academic-service] unexpected DB pool error', err.message);
});

module.exports = pool;
