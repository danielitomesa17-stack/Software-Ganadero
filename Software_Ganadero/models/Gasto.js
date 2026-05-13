const pool = require('../../config/db'); 

class Gasto {
    // MÉTODO PARA TRAER TODO DE MYSQL
    static async findAll() {
        const [rows] = await pool.query('SELECT * FROM gastos ORDER BY fecha DESC');
        return rows;
    }

    // MÉTODO PARA INSERTAR UN GASTO (MANUAL O DESDE FARMACIA)
    static async create(datos) {
        const { fecha, concepto, monto, categoria } = datos;
        const sql = `INSERT INTO gastos (fecha, concepto, monto, categoria) 
                     VALUES (?, ?, ?, ?)`;
        const [result] = await pool.query(sql, [fecha, concepto, monto, categoria]);
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