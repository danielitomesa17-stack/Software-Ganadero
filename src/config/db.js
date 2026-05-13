import mysql from 'mysql2';

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root', 
    database: 'hacienda_danubio',
    waitForConnections: true,
    connectionLimit: 10
});

export default pool.promise(); // Usamos promise() para trabajar con async/await