import mysql from 'mysql2/promise';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const runMigrations = async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  });

  try {
    console.log('🔄 Conectando a la base de datos...');
    const connection = await pool.getConnection();
    console.log('✅ Conectado a la BD');

    // Leer y ejecutar cada archivo SQL en migrations/
    const migrationsDir = path.join(process.cwd(), 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      try {
        console.log(`\n📝 Ejecutando: ${file}`);
        const queries = sql.split(';').filter(q => q.trim());

        for (const query of queries) {
          if (query.trim()) {
            await connection.query(query);
          }
        }
        console.log(`✅ ${file} ejecutado correctamente`);
      } catch (err) {
        console.error(`❌ Error en ${file}:`, err.message);
        // Continuar con las siguientes migraciones
      }
    }

    connection.release();
    console.log('\n🎉 Migraciones completadas');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
    process.exit(1);
  }
};

runMigrations();
