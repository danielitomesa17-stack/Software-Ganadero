import pool from './config/db.js';

async function checkRoles() {
    try {
        const [rows] = await pool.query('SELECT DISTINCT rol FROM usuarios');
        console.log('Roles in DB:', rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkRoles();
