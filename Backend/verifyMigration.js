import mysql from 'mysql2/promise';
import 'dotenv/config';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});

const conn = await pool.getConnection();
const [rows] = await conn.query('DESCRIBE animales');
conn.release();

const pesoObjetivoColumn = rows.find(r => r.Field === 'peso_objetivo');

if (pesoObjetivoColumn) {
  console.log('✅ Columna peso_objetivo agregada correctamente');
  console.log('Tipo:', pesoObjetivoColumn.Type);
  console.log('Nullable:', pesoObjetivoColumn.Null);
  console.log('\n✨ Base de datos lista para usar');
} else {
  console.log('❌ Columna no encontrada');
  console.log('Columnas actuales:', rows.map(r => r.Field).join(', '));
}

process.exit(0);
