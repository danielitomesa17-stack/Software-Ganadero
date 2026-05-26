// Backend/models/Sanidad.js

import pool from '../config/db.js';

class Sanidad {
  /**
   * Lista todos los registros de sanidad.
   * @returns {Promise<Array>} Lista de registros.
   */
  static async list() {
    const tenantId = arguments[0];
    const sql = tenantId ? 'SELECT * FROM sanidad WHERE hacienda_id = ?' : 'SELECT * FROM sanidad';
    const params = tenantId ? [tenantId] : [];
    const [rows] = await pool.query(sql, params);
    return rows;
  }

  /**
   * Obtiene un registro por su id.
   */
  static async getById(id) {
    const [rows] = await pool.query('SELECT * FROM sanidad WHERE id = ?', [id]);
    return rows[0];
  }

  /**
   * Crea un nuevo registro.
   * @param {Object} data
   */
  static async create(data) {
    const { animal_id, chapeta, medicamento, dosis, fecha, proximaDosis, observacion, hacienda_id } = data;
    const sql = `INSERT INTO sanidad (animal_id, chapeta, medicamento, dosis, fecha, proximaDosis, observacion, hacienda_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.query(sql, [animal_id, chapeta, medicamento, dosis, fecha, proximaDosis, observacion, hacienda_id]);
    return result.insertId;
  }

  /**
   * Elimina un registro.
   */
  static async delete(id, tenantId) {
    const sql = tenantId ? 'DELETE FROM sanidad WHERE id = ? AND hacienda_id = ?' : 'DELETE FROM sanidad WHERE id = ?';
    const params = tenantId ? [id, tenantId] : [id];
    await pool.query(sql, params);
    return true;
  }
}

export default Sanidad;
