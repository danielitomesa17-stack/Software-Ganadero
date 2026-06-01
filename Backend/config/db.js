import mysql from 'mysql2/promise';
import 'dotenv/config';

// Crear el pool de conexiones usando promesas
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Convierte columnas BLOB/LONGBLOB a string base64 automáticamente
  typeCast: function (field, next) {
    if (
      field.type === 'BLOB' ||
      field.type === 'LONG_BLOB' ||
      field.type === 'MEDIUM_BLOB' ||
      field.type === 'TINY_BLOB'
    ) {
      const buf = field.buffer();
      return buf ? buf.toString('base64') : null;
    }
    return next();
  }
});

// Exportación por defecto para que funcione el 'import db from...' en tus controladores
export default pool;