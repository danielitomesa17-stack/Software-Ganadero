// Backend/models/Medicamento.js

import pool from '../config/db.js';

class Medicamento {
  /**
   * Valida datos de medicamento.
   */
  static validar(data) {
    const errores = [];

    if (!data.nombre || data.nombre.trim().length === 0) {
      errores.push('El nombre es requerido');
    }

    if (data.nombre && data.nombre.length > 150) {
      errores.push('El nombre no puede exceder 150 caracteres');
    }

    if (data.stock !== undefined) {
      const stock = parseFloat(data.stock);
      if (isNaN(stock) || stock < 0) {
        errores.push('El stock debe ser un número no negativo');
      }
    }

    if (data.stock_minimo !== undefined && data.stock_maximo !== undefined) {
      const min = parseInt(data.stock_minimo, 10);
      const max = parseInt(data.stock_maximo, 10);
      if (min >= max) {
        errores.push('Stock mínimo debe ser menor que stock máximo');
      }
    }

    if (data.precio_compra !== undefined) {
      const precio = parseFloat(data.precio_compra);
      if (isNaN(precio) || precio < 0) {
        errores.push('El precio debe ser un número no negativo');
      }
    }

    if (data.fecha_vencimiento && isNaN(Date.parse(data.fecha_vencimiento))) {
      errores.push('Fecha de vencimiento inválida');
    }

    return errores;
  }

  /**
   * Obtiene todos los medicamentos.
   * @returns {Promise<Array>} Lista de medicamentos.
   */
  static async list(tenantId) {
    const sql = tenantId
      ? 'SELECT * FROM medicamentos WHERE hacienda_id = ? AND activo = TRUE ORDER BY nombre'
      : 'SELECT * FROM medicamentos WHERE activo = TRUE ORDER BY nombre';
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
   * Búsqueda avanzada de medicamentos.
   */
  static async buscar(tenantId, filtros = {}) {
    let sql = 'SELECT * FROM medicamentos WHERE hacienda_id = ? AND activo = TRUE';
    const params = [tenantId];

    if (filtros.nombre) {
      sql += ' AND nombre LIKE ?';
      params.push(`%${filtros.nombre}%`);
    }

    if (filtros.categoria) {
      sql += ' AND categoria = ?';
      params.push(filtros.categoria);
    }

    if (filtros.stock_bajo !== undefined && filtros.stock_bajo) {
      sql += ' AND stock <= stock_minimo';
    }

    if (filtros.proximo_vencer !== undefined && filtros.proximo_vencer) {
      sql += ' AND fecha_vencimiento BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)';
    }

    if (filtros.vencido !== undefined && filtros.vencido) {
      sql += ' AND fecha_vencimiento < NOW()';
    }

    if (filtros.fabricante) {
      sql += ' AND fabricante LIKE ?';
      params.push(`%${filtros.fabricante}%`);
    }

    sql += ' ORDER BY nombre LIMIT 500';

    const [rows] = await pool.query(sql, params);
    return rows;
  }

  /**
   * Obtiene medicamentos con stock bajo.
   */
  static async obtenerStockBajo(tenantId) {
    const sql = `
      SELECT * FROM medicamentos 
      WHERE hacienda_id = ? AND activo = TRUE AND stock <= stock_minimo
      ORDER BY stock ASC
    `;
    const [rows] = await pool.query(sql, [tenantId]);
    return rows;
  }

  /**
   * Obtiene medicamentos próximos a vencer.
   */
  static async obtenerProximosVencer(tenantId, diasAntelacion = 30) {
    const sql = `
      SELECT * FROM medicamentos 
      WHERE hacienda_id = ? AND activo = TRUE 
      AND fecha_vencimiento BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL ? DAY)
      ORDER BY fecha_vencimiento ASC
    `;
    const [rows] = await pool.query(sql, [tenantId, diasAntelacion]);
    return rows;
  }

  /**
   * Obtiene medicamentos vencidos.
   */
  static async obtenerVencidos(tenantId) {
    const sql = `
      SELECT * FROM medicamentos 
      WHERE hacienda_id = ? AND activo = TRUE AND fecha_vencimiento < NOW()
      ORDER BY fecha_vencimiento DESC
    `;
    const [rows] = await pool.query(sql, [tenantId]);
    return rows;
  }

  /**
   * Crea un nuevo registro de medicamento.
   * @param {Object} data - { nombre, stock, unidad, precio_compra, hacienda_id, ... }
   * @returns {Promise<number>} id insertado.
   */
  static async create(data) {
    const {
      nombre,
      stock,
      unidad,
      precio_compra,
      hacienda_id,
      fecha_vencimiento,
      numero_lote,
      stock_minimo,
      stock_maximo,
      presentacion,
      fabricante,
      categoria,
    } = data;

    const sql = `
      INSERT INTO medicamentos 
      (nombre, stock, unidad, precio_compra, hacienda_id, fecha_vencimiento, numero_lote, stock_minimo, stock_maximo, presentacion, fabricante, categoria)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(sql, [
      nombre,
      stock || 0,
      unidad || 'ml',
      precio_compra || 0,
      hacienda_id,
      fecha_vencimiento || null,
      numero_lote || null,
      stock_minimo || 0,
      stock_maximo || 9999,
      presentacion || 'unidad',
      fabricante || null,
      categoria || 'general',
    ]);

    return result.insertId;
  }

  /**
   * Actualiza un medicamento existente.
   */
  static async update(id, data) {
    const fields = [];
    const values = [];

    const campos = [
      'nombre',
      'stock',
      'unidad',
      'precio_compra',
      'hacienda_id',
      'fecha_vencimiento',
      'numero_lote',
      'stock_minimo',
      'stock_maximo',
      'presentacion',
      'fabricante',
      'categoria',
      'activo',
    ];

    campos.forEach((campo) => {
      if (data[campo] !== undefined) {
        fields.push(`${campo} = ?`);
        values.push(data[campo]);
      }
    });

    if (fields.length === 0) return true;

    const setClause = fields.join(', ');
    const sql = `UPDATE medicamentos SET ${setClause}, fecha_actualizacion = NOW() WHERE id = ?`;
    await pool.query(sql, [...values, id]);
    return true;
  }

  /**
   * Marca un medicamento como inactivo (eliminación lógica).
   */
  static async delete(id) {
    const sql = 'UPDATE medicamentos SET activo = FALSE, fecha_actualizacion = NOW() WHERE id = ?';
    await pool.query(sql, [id]);
    return true;
  }

  /**
   * Obtiene estadísticas de inventario.
   */
  static async obtenerEstadisticas(tenantId) {
    const sql = `
      SELECT 
        COUNT(*) as total_medicamentos,
        COUNT(CASE WHEN stock <= stock_minimo THEN 1 END) as en_stock_bajo,
        COUNT(CASE WHEN fecha_vencimiento IS NOT NULL AND fecha_vencimiento < NOW() THEN 1 END) as vencidos,
        COUNT(CASE WHEN fecha_vencimiento IS NOT NULL AND fecha_vencimiento BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY) THEN 1 END) as proximo_vencer,
        SUM(stock) as cantidad_total,
        SUM(stock * precio_compra) as valor_inventario
      FROM medicamentos 
      WHERE hacienda_id = ? AND activo = TRUE
    `;
    const [rows] = await pool.query(sql, [tenantId]);
    return rows[0];
  }
}

export default Medicamento;
