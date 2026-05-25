import pool from '../config/db.js'; // Correct path for ES module

class Gasto {
    // MÉTODO PARA TRAER TODO DE MYSQL
    static async findAll(filter = {}) {
    let sql = 'SELECT * FROM gastos';
    const params = [];
    if (filter.hacienda_id) {
      sql += ' WHERE hacienda_id = ?';
      params.push(filter.hacienda_id);
    }
    sql += ' ORDER BY fecha DESC';
    const [rows] = await pool.query(sql, params);
    return rows;
  }

    // MÉTODO PARA INSERTAR UN GASTO (MANUAL O DESDE FARMACIA)
    static async create(datos) {
        const { fecha, concepto, monto, categoria } = datos;
        const sql = `INSERT INTO gastos (fecha, concepto, monto, categoria, hacienda_id) 
                     VALUES (COALESCE(?, NOW()), ?, ?, ?, ?)`;
        const [result] = await pool.query(sql, [fecha, concepto, monto, categoria, datos.hacienda_id]);
        return result.insertId;
    }

    // MÉTODO PARA ACTUALIZAR (EDITAR)
    static async update(id, datos) {
        const { concepto, monto, categoria } = datos;
        const sql = `UPDATE gastos SET concepto = ?, monto = ?, categoria = ? 
                     WHERE id = ?`;
        await pool.query(sql, [concepto, monto, categoria, id]);
        return true;
    }

    // MÉTODO PARA ELIMINAR
    static async delete(id) {
        await pool.query('DELETE FROM gastos WHERE id = ?', [id]);
        return true;
    }
}

export default Gasto;