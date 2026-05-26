// run_migration.js
import 'dotenv/config';
import db from './config/db.js';

async function migrate() {
  try {
    // Check if hacienda_id column exists
    const [cols] = await db.query(
      'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
      [process.env.DB_NAME, 'sanidad', 'hacienda_id']
    );
    if (cols.length === 0) {
      await db.query('ALTER TABLE sanidad ADD COLUMN hacienda_id INT NOT NULL');
      console.log('✅ Added hacienda_id column');
    } else {
      console.log('ℹ️ hacienda_id column already exists');
    }
    // Create index (ignore duplicate error)
    try {
      await db.query('CREATE INDEX idx_sanidad_hacienda_id ON sanidad (hacienda_id)');
      console.log('✅ Index idx_sanidad_hacienda_id created');
    } catch (e) {
      if (e.code === 'ER_DUP_KEYNAME') {
        console.log('ℹ️ Index already exists');
      } else {
        throw e;
      }
    }
    console.log('✅ Migration completed');
  } catch (e) {
    console.error('❌ Migration failed:', e.message);
  } finally {
    process.exit();
  }
}

migrate();
