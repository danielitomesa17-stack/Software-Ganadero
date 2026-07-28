import 'dotenv/config';
import db from './config/db.js';

async function migrateAforos() {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS aforos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        hacienda_id INT NOT NULL,
        nombre_potrero VARCHAR(255) NOT NULL,
        fecha DATE NOT NULL,
        peso_muestra_1 DECIMAL(10,2) NOT NULL,
        peso_muestra_2 DECIMAL(10,2) NOT NULL,
        peso_muestra_3 DECIMAL(10,2) NOT NULL,
        promedio_kg_m2 DECIMAL(10,2) NOT NULL,
        area_total_ha DECIMAL(10,2) NOT NULL,
        forraje_total_kg DECIMAL(12,2) NOT NULL,
        forraje_aprovechable_kg DECIMAL(12,2) NOT NULL,
        observaciones TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_aforos_hacienda_id (hacienda_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    await db.query(createTableQuery);
    console.log('✅ Tabla aforos creada o ya existente');
    
  } catch (e) {
    console.error('❌ Error al migrar aforos:', e.message);
  } finally {
    process.exit();
  }
}

migrateAforos();
