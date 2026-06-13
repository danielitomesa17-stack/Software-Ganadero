import 'dotenv/config';
import pool from './config/db.js';

const run = async () => {
  try {
    const [rows] = await pool.query('SELECT Hacienda_id, COUNT(*) as count FROM animales GROUP BY Hacienda_id');
    console.log("Animals by Hacienda:");
    console.table(rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
};
run();
