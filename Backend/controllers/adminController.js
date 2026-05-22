import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

// 1. Obtener Bitácora de Auditoría
export const obtenerBitacora = async (req, res) => {
    try {
        const query = `
            SELECT b.*, u.nombre as admin_nombre 
            FROM bitacora_auditoria b
            JOIN usuarios u ON b.admin_id = u.id
            ORDER BY b.fecha_registro DESC
            LIMIT 50
        `;
        const [logs] = await pool.query(query);
        res.json(logs);
    } catch (err) {
        console.error("Error al obtener la bitácora:", err);
        res.status(500).json({ error: "Error al obtener la bitácora" });
    }
};
// adminController.js
export const obtenerUsuarios = async (req, res) => {
    try {
        const query = `
            SELECT u.id, u.nombre, u.email, u.rol, u.activo,
                   COALESCE(h.nombre, 'Sin asignar') as nombre_hacienda 
            FROM usuarios u
            LEFT JOIN haciendas h ON u.hacienda_id = h.id
        `;
        const [usuarios] = await pool.query(query);
        res.json(usuarios);
    } catch (err) {
        console.error("Error al obtener usuarios:", err);
        res.status(500).json({ error: "Error al obtener usuarios" });
    }
};

// 2. Crear nueva Hacienda (con Transacción y Auditoría)
export const crearNuevaHacienda = async (req, res) => {
    const { nombreHacienda, nombreAdmin, emailAdmin, password } = req.body;
    const adminId = req.user.id; 

    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        // Crear la nueva Hacienda
        const [hacienda] = await connection.query(
            "INSERT INTO haciendas (nombre) VALUES (?)", 
            [nombreHacienda]
        );
        const haciendaId = hacienda.insertId;

        // Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Crear el Administrador
        await connection.query(
            "INSERT INTO usuarios (nombre, email, password, hacienda_id, rol) VALUES (?, ?, ?, ?, 'Administrador')",
            [nombreAdmin, emailAdmin, passwordHash, haciendaId]
        );

        // Registrar en Bitácora
        const descripcionLog = `Se creó la hacienda: ${nombreHacienda} con admin: ${emailAdmin}`;
        await connection.query(
            "INSERT INTO bitacora_auditoria (admin_id, accion, descripcion, ip_origen) VALUES (?, ?, ?, ?)",
            [adminId, 'CREAR_CLIENTE', descripcionLog, req.ip || '0.0.0.0']
        );

        await connection.commit();
        res.status(201).json({ success: true, message: "Hacienda y admin creados con éxito", haciendaId });
        
    } catch (err) {
        await connection.rollback();
        console.error("Error al crear cliente SaaS:", err);
        res.status(500).json({ success: false, error: "Error al crear la infraestructura del cliente" });
    } finally {
        connection.release();
    }
};

// 3. Listar Usuarios (útil para el panel administrativo)
export const listarUsuarios = async (req, res) => {
    try {
        const [usuarios] = await pool.query(`
            SELECT u.id, u.nombre, u.email, u.rol, u.activo, h.nombre as nombre_hacienda 
            FROM usuarios u
            LEFT JOIN haciendas h ON u.hacienda_id = h.id
        `);
        res.json(usuarios);
    } catch (err) {
        console.error("Error al listar usuarios:", err);
        res.status(500).json({ error: "Error al obtener usuarios" });
    }
};

// adminController.js
export const cambiarEstadoUsuario = async (req, res) => {
    const { id } = req.params;
    const { activo } = req.body; 

    try {
        // Asegúrate de que la columna 'activo' exista en tu tabla 'usuarios'
        await pool.query("UPDATE usuarios SET activo = ? WHERE id = ?", [activo ? 1 : 0, id]);
        res.json({ success: true, message: "Estado actualizado" });
    } catch (err) {
        console.error("Error al actualizar usuario:", err);
        res.status(500).json({ error: "Error interno en el servidor" });
    }
};