import pool from '../config/db.js';

class Animal {
  /**
   * Lista todos los animales de la hacienda del usuario.
   * @param {number} tenantId - ID de la hacienda (tenant).
   */
  static async list(tenantId) {
    const sql = tenantId ? 'SELECT * FROM animales WHERE hacienda_id = ? ORDER BY id DESC' : 'SELECT * FROM animales ORDER BY id DESC';
    const params = tenantId ? [tenantId] : [];
    const [rows] = await pool.query(sql, params);
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.query('SELECT * FROM animales WHERE id = ?', [id]);
    return rows[0];
  }

  /**
   * Crea un nuevo animal asociado a la hacienda.
   * @param {Object} data - Campos del animal, incluye hacienda_id.
   */
  static async create(data) {
    const { caravana_id, peso_inicial, lote, raza, sexo, estado, hacienda_id, historial, foto } = data;
    const sql = `INSERT INTO animales (caravana_id, peso_inicial, peso_actual, lote, raza, sexo, estado, hacienda_id, historial, foto) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.query(sql, [caravana_id, peso_inicial, peso_inicial, lote, raza, sexo, estado, hacienda_id, historial, foto]);
    return result.insertId;
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    if (data.caravana_id !== undefined) { fields.push('caravana_id = ?'); values.push(data.caravana_id); }
    if (data.peso_inicial !== undefined) { fields.push('peso_inicial = ?, peso_actual = ?'); values.push(data.peso_inicial, data.peso_inicial); }
    if (data.lote !== undefined) { fields.push('lote = ?'); values.push(data.lote); }
    if (data.raza !== undefined) { fields.push('raza = ?'); values.push(data.raza); }
    if (data.sexo !== undefined) { fields.push('sexo = ?'); values.push(data.sexo); }
    if (data.estado !== undefined) { fields.push('estado = ?'); values.push(data.estado); }
    if (data.hacienda_id !== undefined) { fields.push('hacienda_id = ?'); values.push(data.hacienda_id); }
    if (data.historial !== undefined) { fields.push('historial = ?'); values.push(data.historial); }
    if (data.foto !== undefined) { fields.push('foto = ?'); values.push(data.foto); }
    if (fields.length === 0) return true;
    const setClause = fields.join(', ');
    const sql = `UPDATE animales SET ${setClause} WHERE id = ?`;
    await pool.query(sql, [...values, id]);
    return true;
  }

  static async delete(id, tenantId) {
    const sql = tenantId ? 'DELETE FROM animales WHERE id = ? AND hacienda_id = ?' : 'DELETE FROM animales WHERE id = ?';
    const params = tenantId ? [id, tenantId] : [id];
    await pool.query(sql, params);
    return true;
  }
}

export default Animal;
