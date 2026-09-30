const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    `postgresql://${process.env.POSTGRES_USER || 'erp'}:${process.env.POSTGRES_PASSWORD || 'erp_dev_password'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'finance_db'}`,
});

pool.on('error', (err) => {
  console.error('[finance-service] unexpected DB pool error', err.message);
});

module.exports = pool;
