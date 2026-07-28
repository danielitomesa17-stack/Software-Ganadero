import pool from '../config/db.js';

class Aforo {
  /**
   * Lista todos los aforos de la hacienda.
   * @param {number} haciendaId - ID de la hacienda (tenant).
   */
  static async list(haciendaId) {
    const sql = haciendaId 
      ? 'SELECT * FROM aforos WHERE hacienda_id = ? ORDER BY fecha DESC, id DESC'
      : 'SELECT * FROM aforos ORDER BY fecha DESC, id DESC';
    const params = haciendaId ? [haciendaId] : [];
    const [rows] = await pool.query(sql, params);
    return rows;
  }

  static async getById(id, haciendaId) {
    const sql = haciendaId
      ? 'SELECT * FROM aforos WHERE id = ? AND hacienda_id = ?'
      : 'SELECT * FROM aforos WHERE id = ?';
    const params = haciendaId ? [id, haciendaId] : [id];
    const [rows] = await pool.query(sql, params);
    return rows[0];
  }

  /**
   * Crea un nuevo registro de aforo.
   * @param {Object} data - Datos del aforo
   */
  static async create(data) {
    const { 
      hacienda_id, nombre_potrero, fecha, 
      peso_muestra_1, peso_muestra_2, peso_muestra_3, 
      promedio_kg_m2, area_total_ha, forraje_total_kg, 
      forraje_aprovechable_kg, observaciones 
    } = data;
    
    const sql = `
      INSERT INTO aforos (
        hacienda_id, nombre_potrero, fecha, 
        peso_muestra_1, peso_muestra_2, peso_muestra_3, 
        promedio_kg_m2, area_total_ha, forraje_total_kg, 
        forraje_aprovechable_kg, observaciones
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      hacienda_id, nombre_potrero, fecha, 
      peso_muestra_1, peso_muestra_2, peso_muestra_3, 
      promedio_kg_m2, area_total_ha, forraje_total_kg, 
      forraje_aprovechable_kg, observaciones || null
    ];
    
    const [result] = await pool.query(sql, params);
    return result.insertId;
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    
    const updatableFields = [
      'nombre_potrero', 'fecha', 'peso_muestra_1', 'peso_muestra_2', 'peso_muestra_3',
      'promedio_kg_m2', 'area_total_ha', 'forraje_total_kg', 'forraje_aprovechable_kg', 'observaciones'
    ];

    updatableFields.forEach(field => {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field]);
      }
    });

    if (fields.length === 0) return true;

    const setClause = fields.join(', ');
    const sql = `UPDATE aforos SET ${setClause} WHERE id = ? AND hacienda_id = ?`;
    await pool.query(sql, [...values, id, data.hacienda_id]);
    
    return true;
  }

  static async delete(id, haciendaId) {
    const sql = 'DELETE FROM aforos WHERE id = ? AND hacienda_id = ?';
    await pool.query(sql, [id, haciendaId]);
    return true;
  }
}

export default Aforo;
