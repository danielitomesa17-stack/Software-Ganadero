// Backend/models/Medicamento.js

import pool from '../config/db.js';

class Medicamento {
  /**
   * Obtiene todos los medicamentos.
   * @returns {Promise<Array>} Lista de medicamentos.
   */
  static async list(tenantId) {
    const sql = tenantId ? 'SELECT * FROM medicamentos WHERE hacienda_id = ?' : 'SELECT * FROM medicamentos';
    const params = tenantId ? [tenantId] : [];
    const [rows] = await pool.query(sql, params);
    return rows;
  }

  /**
   * Obtiene un medicamento por su id.
   */
  static async getById(id) {
    const [rows] = await pool.query('SELECT * FROM medicamentos WHERE id = ?', [id]);
    return rows[0];
  }

  /**
   * Crea un nuevo registro de medicamento.
   * @param {Object} data - { nombre, stock, unidad, precio_compra, hacienda_id }
   * @returns {Promise<number>} id insertado.
   */
  static async create(data) {
    const { nombre, stock, unidad, precio_compra, hacienda_id } = data;
    const sql = `INSERT INTO medicamentos (nombre, stock, unidad, precio_compra, hacienda_id) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await pool.query(sql, [nombre, stock, unidad, precio_compra, hacienda_id]);
    return result.insertId;
  }

  /**
   * Actualiza un medicamento existente.
   */
  static async update(id, data) {
    const fields = [];
    const values = [];
    if (data.nombre !== undefined) {
      fields.push('nombre = ?');
      values.push(data.nombre);
    }
    if (data.stock !== undefined) {
      fields.push('stock = ?');
      values.push(data.stock);
    }
    if (data.unidad !== undefined) {
      fields.push('unidad = ?');
      values.push(data.unidad);
    }
    if (data.precio_compra !== undefined) {
      fields.push('precio_compra = ?');
      values.push(data.precio_compra);
    }
    if (data.hacienda_id !== undefined) {
      fields.push('hacienda_id = ?');
      values.push(data.hacienda_id);
    }
    if (fields.length === 0) return true;
    const setClause = fields.join(', ');
    const sql = `UPDATE medicamentos SET ${setClause} WHERE id = ?`;
    await pool.query(sql, [...values, id]);
    return true;
  }

  /**
   * Elimina un medicamento.
   */
  static async delete(id) {
    await pool.query('DELETE FROM medicamentos WHERE id = ?', [id]);
    return true;
  }
}

export default Medicamento;
