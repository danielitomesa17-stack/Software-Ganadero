import pool from '../config/db.js'; // Correct path for ES module

class Gasto {
    // MÉTODO PARA CONTAR GASTOS CON LOS MISMOS FILTROS
    static async count(filter = {}) {
        let sql = 'SELECT COUNT(*) as total FROM gastos';
        const params = [];
        const conditions = [];
        if (filter.hacienda_id) {
            conditions.push('hacienda_id = ?');
            params.push(filter.hacienda_id);
        }
        if (filter.fechaDesde && filter.fechaHasta) {
            conditions.push('fecha BETWEEN ? AND ?');
            params.push(filter.fechaDesde, filter.fechaHasta);
        }
        if (conditions.length) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        const [rows] = await pool.query(sql, params);
        return rows[0].total;
    }

    // MÉTODO PARA TRAER TODO DE MYSQL CON OPCIONES DE PÁGINA
    static async findAll(filter = {}) {
        let sql = 'SELECT * FROM gastos';
        const params = [];
        const conditions = [];
        if (filter.hacienda_id) {
            conditions.push('hacienda_id = ?');
            params.push(filter.hacienda_id);
        }
        if (filter.fechaDesde && filter.fechaHasta) {
            conditions.push('fecha BETWEEN ? AND ?');
            params.push(filter.fechaDesde, filter.fechaHasta);
        }
        if (filter.limit) {
            // limit and offset must come after any WHERE clause
            if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
            sql += ' ORDER BY fecha DESC LIMIT ? OFFSET ?';
            params.push(parseInt(filter.limit, 10), parseInt(filter.offset || 0, 10));
        } else {
            if (conditions.length) {
                sql += ' WHERE ' + conditions.join(' AND ');
            }
            sql += ' ORDER BY fecha DESC';
        }
        const [rows] = await pool.query(sql, params);
        return rows;
    }

    // MÉTODO PARA INSERTAR UN GASTO (MANUAL O DESDE FARMACIA)
    static async create(datos) {
        console.log('🔧 Crear gasto payload:', datos);
        const { fecha, concepto, monto, categoria } = datos;
        const sql = `INSERT INTO gastos (fecha, concepto, monto, categoria, hacienda_id) 
                     VALUES (COALESCE(?, NOW()), ?, ?, ?, ?)`;
        const [result] = await pool.query(sql, [fecha, concepto, monto, categoria, datos.hacienda_id]);
        return result.insertId;
      }
    

    // MÉTODO PARA ACTUALIZAR (EDITAR)
    static async update(id, datos) {
        console.log('🔧 Actualizar gasto id:', id, 'payload:', datos);
        // Build dynamic SET clause based on provided fields to avoid undefined values
        const fields = [];
        const values = [];
        if (datos.concepto !== undefined) {
          fields.push('concepto = ?');
          values.push(datos.concepto);
        }
        if (datos.monto !== undefined) {
          fields.push('monto = ?');
          values.push(datos.monto);
        }
        if (datos.categoria !== undefined) {
          fields.push('categoria = ?');
          values.push(datos.categoria);
        }
        if (fields.length === 0) return true; // nothing to update
        const setClause = fields.join(', ');
        const sql = `UPDATE gastos SET ${setClause} WHERE id = ?`;
        await pool.query(sql, [...values, id]);
        return true;
      }

    // MÉTODO PARA ELIMINAR
    static async delete(id) {
        await pool.query('DELETE FROM gastos WHERE id = ?', [id]);
        return true;
    }
}

export default Gasto;