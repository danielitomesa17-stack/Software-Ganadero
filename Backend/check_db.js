import pool from './config/db.js';

async function check() {
  const [rows] = await pool.query('SHOW TABLES');
  console.log(rows);
  process.exit(0);
}

check();
