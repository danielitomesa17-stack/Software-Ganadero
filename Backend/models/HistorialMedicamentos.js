// Backend/models/HistorialMedicamentos.js

import pool from '../config/db.js';

class HistorialMedicamentos {
  /**
   * Registra un movimiento en el historial de medicamentos.
   * @param {Object} data - { medicamento_id, hacienda_id, usuario_id, tipo_movimiento, cantidad_anterior, cantidad_nueva, cambios_otros, descripcion }
   * @returns {Promise<number>} ID del registro insertado.
   */
  static async registrar(data) {
    const {
      medicamento_id,
      hacienda_id,
      usuario_id,
      tipo_movimiento,
      cantidad_anterior,
      cantidad_nueva,
      cambios_otros,
      descripcion,
    } = data;

    const sql = `
      INSERT INTO historial_medicamentos 
      (medicamento_id, hacienda_id, usuario_id, tipo_movimiento, cantidad_anterior, cantidad_nueva, cambios_otros, descripcion)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const cambiosJson = cambios_otros ? JSON.stringify(cambios_otros) : null;

    const [result] = await pool.query(sql, [
      medicamento_id,
      hacienda_id,
      usuario_id || null,
      tipo_movimiento,
      cantidad_anterior || null,
      cantidad_nueva || null,
      cambiosJson,
      descripcion || null,
    ]);

    return result.insertId;
  }

  /**
   * Obtiene el historial de un medicamento.
   */
  static async obtenerPorMedicamento(medicamento_id, limit = 50, offset = 0) {
    const sql = `
      SELECT * FROM historial_medicamentos 
      WHERE medicamento_id = ? 
      ORDER BY fecha_movimiento DESC 
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(sql, [medicamento_id, limit, offset]);
    return rows;
  }

  /**
   * Obtiene el historial de una hacienda.
   */
  static async obtenerPorHacienda(hacienda_id, limit = 100, offset = 0) {
    const sql = `
      SELECT h.*, m.nombre as medicamento_nombre 
      FROM historial_medicamentos h
      LEFT JOIN medicamentos m ON h.medicamento_id = m.id
      WHERE h.hacienda_id = ? 
      ORDER BY h.fecha_movimiento DESC 
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(sql, [hacienda_id, limit, offset]);
    return rows;
  }

  /**
   * Obtiene el historial filtrado por tipo de movimiento.
   */
  static async obtenerPorTipo(hacienda_id, tipo_movimiento, limit = 50, offset = 0) {
    const sql = `
      SELECT h.*, m.nombre as medicamento_nombre 
      FROM historial_medicamentos h
      LEFT JOIN medicamentos m ON h.medicamento_id = m.id
      WHERE h.hacienda_id = ? AND h.tipo_movimiento = ?
      ORDER BY h.fecha_movimiento DESC 
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(sql, [hacienda_id, tipo_movimiento, limit, offset]);
    return rows;
  }

  /**
   * Obtiene resumen de movimientos en un período.
   */
  static async obtenerResumenPeriodo(hacienda_id, fechaInicio, fechaFin) {
    const sql = `
      SELECT 
        tipo_movimiento,
        COUNT(*) as cantidad,
        SUM(CASE WHEN cantidad_nueva IS NOT NULL THEN cantidad_nueva ELSE 0 END) as cantidad_total
      FROM historial_medicamentos
      WHERE hacienda_id = ? AND fecha_movimiento BETWEEN ? AND ?
      GROUP BY tipo_movimiento
    `;
    const [rows] = await pool.query(sql, [hacienda_id, fechaInicio, fechaFin]);
    return rows;
  }

  /**
   * Elimina registros antiguos del historial (archivar).
   */
  static async limpiarAnciano(dias = 365) {
    const sql = `
      DELETE FROM historial_medicamentos 
      WHERE fecha_movimiento < DATE_SUB(NOW(), INTERVAL ? DAY) 
      AND tipo_movimiento NOT IN ('crear', 'eliminar')
    `;
    const [result] = await pool.query(sql, [dias]);
    return result.affectedRows;
  }
}

export default HistorialMedicamentos;
