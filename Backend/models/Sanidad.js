// Backend/models/Sanidad.js

import pool from '../config/db.js';

class Sanidad {
  /**
   * Lista todos los registros de sanidad.
   * @returns {Promise<Array>} Lista de registros.
   */
  static async list() {
    const [rows] = await pool.query('SELECT * FROM sanidad');
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
    const { animal_id, chapeta, medicamento, dosis, fecha, proximaDosis, observacion } = data;
    const sql = `INSERT INTO sanidad (animal_id, chapeta, medicamento, dosis, fecha, proximaDosis, observacion) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.query(sql, [animal_id, chapeta, medicamento, dosis, fecha, proximaDosis, observacion]);
    return result.insertId;
  }

  /**
   * Elimina un registro.
   */
  static async delete(id) {
    await pool.query('DELETE FROM sanidad WHERE id = ?', [id]);
    return true;
  }
}

export default Sanidad;
